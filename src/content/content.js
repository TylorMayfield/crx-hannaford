console.log("content script loaded");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollToBottomUntilStable({ intervalMs = 250, maxSteps = 400 } = {}) {
  let previousHeight = 0;
  let stableCount = 0;
  for (let step = 0; step < maxSteps; step++) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    await delay(intervalMs);
    const currentHeight = document.body.scrollHeight;
    if (currentHeight === previousHeight) {
      stableCount += 1;
      if (stableCount >= 2) break;
    } else {
      stableCount = 0;
      previousHeight = currentHeight;
    }
  }
}

function isLikelyLoggedIn() {
  const text = document.body.innerText || "";
  const hasSignInText = /sign\s*in|log\s*in/i.test(text);
  const accountSelectors = [
    "[data-test*='account']",
    "a[href*='account']",
    "button[aria-label*='account' i]",
  ];
  const hasAccountElement = accountSelectors.some((sel) => document.querySelector(sel));
  return hasAccountElement || !hasSignInText;
}

async function clipAllCoupons() {
  if (!isLikelyLoggedIn()) {
    return { ok: false, reason: "not_logged_in" };
  }

  await scrollToBottomUntilStable({ intervalMs: 250 });

  const elements = Array.from(document.querySelectorAll(".clipTarget"));
  elements.forEach((el, index) => {
    setTimeout(() => {
      try {
        el.click();
      } catch {
        // This is noisy, but we don't care if it fails
      }
    }, index * 750);
  });

  return { ok: true, clicked: elements.length };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "CLIP_HANNAFORD_COUPONS") {
    clipAllCoupons().then(sendResponse);
    return true;
  }
});
