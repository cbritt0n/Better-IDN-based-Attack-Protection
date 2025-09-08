

// Manifest V3 background service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "get-page-url") {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0] && tabs[0].url) {
        chrome.tabs.sendMessage(tabs[0].id, { url: tabs[0].url });
      }
    });
  } else if (message.type === "create-alert") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Warning! A recently visited URL might pose a threat.",
      message:
        `The URL ${message.url} might be a malicious website.\nThe character '${message.char}' (Unicode block: ${message.block}) belongs to a different Unicode range than the previous characters.\nThis URL might be trying to produce an IDN-based phishing attack.`,
    });
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      focused: true,
      width: 400,
      height: 300
    });
    // Also notify any open extension popup or other listeners
    try {
      chrome.runtime.sendMessage({ ...message, _from_bg: true });
    } catch (e) {
      // service worker may not have any listeners; ignore
    }
  }
});
