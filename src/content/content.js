const  COUPON_SELECTOR = "button[data-test-id='coupon-clip-button'], button[data-test-id='coupon-clipped-button']";

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

function observeForCoupons(onCouponsReady) {
  let timeoutId;
  const observer = new MutationObserver(() => {
    const coupons = document.querySelectorAll(COUPON_SELECTOR);
    if (coupons.length > 0) {
      clearTimeout(timeoutId);
      observer.disconnect();
      onCouponsReady(coupons);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  timeoutId = setTimeout(() => {
    observer.disconnect();
    onCouponsReady(document.querySelectorAll(COUPON_SELECTOR));
  }, 10000); // 10-second timeout
}

async function clipCoupons() {
  if (!isLikelyLoggedIn()) {
    chrome.runtime.sendMessage({ type: "NOT_LOGGED_IN" });
    return;
  }

  observeForCoupons(async (coupons) => {
    if (coupons.length === 0) {
      chrome.runtime.sendMessage({
        type: "CLIPPING_COMPLETE",
        total: 0,
        clipped: 0,
      });
      return;
    }

    let clippedCount = 0;
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      if (coupon.getAttribute("data-test-id") === "coupon-clip-button") {
        coupon.click();
        clippedCount++;
        await new Promise((resolve) => setTimeout(resolve, 200)); // Wait for potential UI updates
      }
      chrome.runtime.sendMessage({
        type: "CLIPPING_PROGRESS",
        processed: i + 1,
        total: coupons.length,
        clipped: clippedCount,
      });
    }

    chrome.runtime.sendMessage({
      type: "CLIPPING_COMPLETE",
      total: coupons.length,
      clipped: clippedCount,
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_CLIPPING") {
    clipCoupons();
    sendResponse({ ok: true });
  }
  return true;
});