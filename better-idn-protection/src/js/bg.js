

// Manifest V3 background service worker
// Keep a cached last non-extension active tab URL so the popup can ask for the
// previously active page even if the popup steals focus.
let lastActiveTabUrl = null;

function updateLastActiveTab(url) {
  if (url && /^https?:\/\//.test(url)) lastActiveTabUrl = url;
}

// Listen to tab activation changes and capture the URL when appropriate
if (chrome.tabs && chrome.tabs.onActivated) {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    try {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError) return; // Handle errors silently
        if (tab && tab.url) updateLastActiveTab(tab.url);
      });
    } catch (e) {
      // ignore
    }
  });
}

// Listen to window focus changes and update cached last active tab
if (chrome.windows && chrome.windows.onFocusChanged) {
  chrome.windows.onFocusChanged.addListener((windowId) => {
    try {
      if (windowId === chrome.windows.WINDOW_ID_NONE) return;
      chrome.tabs.query({ active: true, windowId }, (tabs) => {
        if (chrome.runtime.lastError) return; // Handle errors silently
        if (tabs && tabs[0] && tabs[0].url) updateLastActiveTab(tabs[0].url);
      });
    } catch (e) {
      // ignore
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-page-url') {
    // Prefer the cached lastActiveTabUrl to avoid returning extension popup URL
    if (lastActiveTabUrl) {
      sendResponse({ url: lastActiveTabUrl });
      return true;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        sendResponse({ url: null });
        return;
      }
      if (tabs && tabs[0] && tabs[0].url) {
        sendResponse({ url: tabs[0].url });
      } else {
        sendResponse({ url: null });
      }
    });
    return true; // async response
  } else if (message.type === 'get-active-tab') {
    // Return the URL of the most relevant active tab (ignore extension pages)
    if (lastActiveTabUrl) {
      sendResponse({ url: lastActiveTabUrl });
      return true;
    }
    chrome.tabs.query({ lastFocusedWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
        sendResponse({ url: null });
        return;
      }
      // find first tab in that window with http/https
      const tab = tabs.find(t => t && t.url && /^https?:\/\//.test(t.url));
      if (tab && tab.url) sendResponse({ url: tab.url });
      else sendResponse({ url: null });
    });
    return true; // indicate async sendResponse
  } else if (message.type === 'create-alert') {
    // Create notification
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/src/assets/icon32.png',
        title: 'Warning! A recently visited URL might pose a threat.',
        message:
          `The URL ${message.url} might be a malicious website.\nThe character '${message.char}' (Unicode block: ${message.block}) belongs to a different Unicode range than the previous characters.\nThis URL might be trying to produce an IDN-based phishing attack.`
      }, (_notificationId) => {
        if (chrome.runtime.lastError) {
          console.warn('Notification creation failed:', chrome.runtime.lastError.message);
        }
      });
    } catch (e) {
      console.warn('Failed to create notification:', e.message);
    }

    // Create popup window
    try {
      const popupUrl = chrome.runtime.getURL(`src/html/popup.html?domain=${encodeURIComponent(message.url)}`);
      chrome.windows.create({
        url: popupUrl,
        type: 'popup',
        focused: true,
        width: 400,
        height: 300
      }, (_window) => {
        if (chrome.runtime.lastError) {
          console.warn('Popup creation failed:', chrome.runtime.lastError.message);
          // fallback: open without query
          try {
            chrome.windows.create({
              url: chrome.runtime.getURL('src/html/popup.html'),
              type: 'popup',
              focused: true,
              width: 400,
              height: 300
            });
          } catch (fallbackError) {
            console.warn('Fallback popup creation failed:', fallbackError.message);
          }
        }
      });
    } catch (e) {
      console.warn('Failed to create popup window:', e.message);
      // fallback: open without query
      try {
        chrome.windows.create({
          url: chrome.runtime.getURL('src/html/popup.html'),
          type: 'popup',
          focused: true,
          width: 400,
          height: 300
        });
      } catch (fallbackError) {
        console.warn('Fallback popup creation failed:', fallbackError.message);
      }
    }
    // Also notify any open extension popup or other listeners. Send a dedicated popup-alert message
    // and repeat after a short delay to ensure the popup receives it even if it wasn't ready yet.
    const payload = { type: 'popup-alert', url: message.url, char: message.char, block: message.block, _from_bg: true };
    try {
      chrome.runtime.sendMessage(payload);
      setTimeout(() => {
        try { chrome.runtime.sendMessage(payload); } catch (e) { /* ignore */ }
      }, 300);
    } catch (e) {
      // service worker may not have any listeners; ignore
    }
  } else if (message.type === 'create-safe-notification') {
    // Create safe notification with liability-conscious language
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/src/assets/icon32.png',
        title: 'IDN Analysis Complete',
        message: `The domain ${message.url} appears to use consistent script characters and may be less likely to be an IDN-based attack. This is not a guarantee of safety - always verify URLs independently.`
      }, (_notificationId) => {
        if (chrome.runtime.lastError) {
          console.warn('Safe notification creation failed:', chrome.runtime.lastError.message);
        }
      });
    } catch (e) {
      console.warn('Failed to create safe notification:', e.message);
    }
  }
});
