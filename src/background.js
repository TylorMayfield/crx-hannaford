const COUPONS_URL = "https://www.hannaford.com/coupons";

async function getTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        resolve(null);
      } else {
        resolve(tab);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CLIP_COUPONS") {
    handleClipCouponsRequest();
    sendResponse({ ok: true });
  }
  return true;
});

async function handleClipCouponsRequest() {
  const hannafordTabs = await chrome.tabs.query({
    url: "https://www.hannaford.com/*",
  });

  if (hannafordTabs.length > 0) {
    const firstTab = hannafordTabs[0];
    await chrome.tabs.update(firstTab.id, { active: true, url: COUPONS_URL });
    if (firstTab.url !== COUPONS_URL) {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === firstTab.id && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          initiateClipping(tabId);
        }
      });
    } else {
      initiateClipping(firstTab.id);
    }
  } else {
    const newTab = await chrome.tabs.create({
      url: COUPONS_URL,
      active: true,
    });
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === newTab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        initiateClipping(tabId);
      }
    });
  }
}

function initiateClipping(tabId) {
  chrome.tabs.sendMessage(
    tabId,
    { type: "START_CLIPPING" },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending START_CLIPPING message:",
          chrome.runtime.lastError.message
        );
        chrome.runtime.sendMessage({
          type: "SHOW_ERROR",
          message: "Could not communicate with the content script.",
        });
      } else if (response && response.error) {
        chrome.runtime.sendMessage({
          type: "SHOW_ERROR",
          message: response.error,
        });
      }
    }
  );
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "CLIPPING_PROGRESS") {
    const { processed, total, clipped } = message;
    chrome.runtime.sendMessage({
      type: "SHOW_PROGRESS",
      message: `Clipped ${clipped} of ${total} coupons...`,
    });
  } else if (message.type === "CLIPPING_COMPLETE") {
    const { total, clipped } = message;
    const messageText =
      total > 0
        ? `Successfully clipped ${clipped} of ${total} coupons.`
        : "No coupons found to clip.";
    chrome.runtime.sendMessage({ type: "SHOW_SUCCESS", message: messageText });
  } else if (message.type === "NOT_LOGGED_IN") {
    chrome.runtime.sendMessage({
      type: "SHOW_LOGIN_PROMPT",
      message: "Please log in to your Hannaford account and try again.",
    });
  }
});