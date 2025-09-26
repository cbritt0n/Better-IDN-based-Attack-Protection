

// Manifest V3 background service worker
// Keep a cached last non-extension active tab URL so the popup can ask for the
// previously active page even if the popup steals focus.
let lastActiveTabUrl = null;

// Track dangerous domains and their associated popup windows
let dangerousTabsWithPopups = new Map(); // tabId -> { domain, popupWindowId }
let alertPopupWindows = new Set(); // Set of popup window IDs to track

function updateLastActiveTab(url) {
  if (url && /^https?:\/\//.test(url)) lastActiveTabUrl = url;
}

// Listen to tab activation changes and capture the URL when appropriate
if (chrome.tabs && chrome.tabs.onActivated) {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    try {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError) return; // Handle errors silently
        if (tab && tab.url) {
          updateLastActiveTab(tab.url);
          // Don't close popups on tab switch - let them persist for dangerous tabs
        }
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
        if (tabs && tabs[0] && tabs[0].url) {
          updateLastActiveTab(tabs[0].url);
          // Don't close popups on window focus change - let them persist for dangerous tabs
        }
      });
    } catch (e) {
      // ignore
    }
  });
}

// Listen to tab updates (URL changes) to close popups when navigating away from dangerous domains
if (chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
      if (changeInfo.url && tab.url) {
        updateLastActiveTab(tab.url);
        // If the tab navigated to a new URL, close any associated alert popup
        if (dangerousTabsWithPopups.has(tabId)) {
          const tabInfo = dangerousTabsWithPopups.get(tabId);
          const newDomain = extractDomainFromUrl(tab.url);
          // If the domain changed, close the popup
          if (newDomain !== tabInfo.domain) {
            closePopupForTab(tabId);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  });
}

// Listen to tab removal to clean up tracking
if (chrome.tabs && chrome.tabs.onRemoved) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    try {
      closePopupForTab(tabId);
    } catch (e) {
      // ignore
    }
  });
}

// Listen to window removal to clean up tracking when user closes popup manually
if (chrome.windows && chrome.windows.onRemoved) {
  chrome.windows.onRemoved.addListener((windowId) => {
    try {
      if (alertPopupWindows.has(windowId)) {
        alertPopupWindows.delete(windowId);
        // Find and remove the tab association
        for (const [tabId, tabInfo] of dangerousTabsWithPopups.entries()) {
          if (tabInfo.popupWindowId === windowId) {
            dangerousTabsWithPopups.delete(tabId);
            break;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  });
}

// Helper function to extract domain from URL
function extractDomainFromUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch (e) {
    return url;
  }
}

// Close popup for a specific tab
function closePopupForTab(tabId) {
  if (dangerousTabsWithPopups.has(tabId)) {
    const tabInfo = dangerousTabsWithPopups.get(tabId);
    if (tabInfo.popupWindowId) {
      try {
        chrome.windows.remove(tabInfo.popupWindowId, () => {
          if (!chrome.runtime.lastError) {
            alertPopupWindows.delete(tabInfo.popupWindowId);
          }
        });
      } catch (e) {
        // ignore
      }
    }
    dangerousTabsWithPopups.delete(tabId);
  }
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
    // Get the sender tab ID to associate popup with the correct tab
    const senderTabId = sender.tab ? sender.tab.id : null;
    const alertDomain = extractDomainFromUrl(message.url);

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

    // Create popup window for dangerous domain (regardless of tab active state)
    if (senderTabId) {
      // Close any existing popup for this tab first
      closePopupForTab(senderTabId);

      try {
        const popupUrl = chrome.runtime.getURL(`src/html/popup.html?domain=${encodeURIComponent(message.url)}`);
        chrome.windows.create({
          url: popupUrl,
          type: 'popup',
          focused: true,
          width: 400,
          height: 300
        }, (popupWindow) => {
          if (chrome.runtime.lastError) {
            console.warn('Popup creation failed:', chrome.runtime.lastError.message);
          } else if (popupWindow) {
            // Track the popup window with the tab
            dangerousTabsWithPopups.set(senderTabId, {
              domain: alertDomain,
              popupWindowId: popupWindow.id
            });
            alertPopupWindows.add(popupWindow.id);
          }
        });
      } catch (e) {
        console.warn('Failed to create popup window:', e.message);
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

    // Also notify any open extension popup. Send a dedicated safe notification message
    // and repeat after a short delay to ensure the popup receives it even if it wasn't ready yet.
    const payload = { type: 'safe-notification', url: message.url, _from_bg: true };
    try {
      chrome.runtime.sendMessage(payload);
      setTimeout(() => {
        try { chrome.runtime.sendMessage(payload); } catch (e) { /* ignore */ }
      }, 300);
    } catch (e) {
      // service worker may not have any listeners; ignore
    }
  } else if (message.type === 'analyze-domain') {
    // Handle manual domain analysis request from popup
    try {
      // Get the active tab and send analysis message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
          // No active tab - still complete the analysis
          analyzeUrlDirectly(message.url || 'unknown');
          sendResponse({ success: true, method: 'direct-no-tab' });
          return;
        }

        const activeTab = tabs[0];
        if (activeTab && activeTab.id && activeTab.url) {
          // Send message to content script to analyze the URL
          chrome.tabs.sendMessage(activeTab.id, {
            type: 'analyze-url',
            url: message.url || activeTab.url
          }, (_response) => {
            if (chrome.runtime.lastError) {
              // Content script might not be loaded, directly analyze the URL
              const analysisUrl = message.url || activeTab.url;
              analyzeUrlDirectly(analysisUrl);
              sendResponse({ success: true, method: 'direct' });
            } else {
              // Content script responded - it already did the analysis
              sendResponse({ success: true, method: 'content-script' });
            }
          });
        } else {
          // Invalid tab - still complete the analysis
          analyzeUrlDirectly(message.url || 'unknown');
          sendResponse({ success: true, method: 'direct-invalid-tab' });
        }
      });
    } catch (e) {
      // Error occurred - still complete the analysis
      analyzeUrlDirectly(message.url || 'error');
      sendResponse({ success: true, method: 'direct-error', error: e.message });
    }
    return true; // Indicate async response
  }
});

// Direct URL analysis when content script is not available
async function analyzeUrlDirectly(url) {
  
  // This is a simplified version of the checkURL logic from app.js
  const educationalDomains = [
    'wikipedia.org',
    'mozilla.org',
    'w3.org',
    'ietf.org',
    'unicode.org',
    'owasp.org',
    'github.io',
    'github.com',
    'docs.microsoft.com',
    'developer.mozilla.org'
  ];

  let domain;
  if (url.startsWith('https://') || url.startsWith('http://')) {
    domain = extractDomainFromUrl(url);
  } else {
    domain = url;
  }

  // Check if it's an educational domain
  for (const eduDomain of educationalDomains) {
    if (domain.includes(eduDomain)) {
      // Send safe notification for educational domains
      chrome.runtime.sendMessage({
        type: 'create-safe-notification',
        url: domain
      });
      return;
    }
  }

  // For other domains, do basic mixed script detection
  // This is a simplified check without full Unicode blocks
  const hasMixed = checkForMixedScriptsBasic(domain);
  
  if (hasMixed.mixed) {
    chrome.runtime.sendMessage({
      type: 'create-alert',
      url: domain,
      char: hasMixed.char,
      block: hasMixed.block
    });
  } else {
    chrome.runtime.sendMessage({
      type: 'create-safe-notification',
      url: domain
    });
  }
}

// Basic mixed script detection for background script
function checkForMixedScriptsBasic(domain) {
  const latinPattern = /[a-zA-Z]/;
  const cyrillicPattern = /[а-яё]/i;
  const greekPattern = /[α-ωΑ-Ω]/;
  
  let hasLatin = false;
  let hasCyrillic = false;
  let hasGreek = false;
  let suspiciousChar = '';
  
  for (const char of domain) {
    if (char === '-' || char === '.') continue;
    
    if (latinPattern.test(char)) {
      hasLatin = true;
    } else if (cyrillicPattern.test(char)) {
      hasCyrillic = true;
      suspiciousChar = char;
    } else if (greekPattern.test(char)) {
      hasGreek = true;
      suspiciousChar = char;
    }
    
    // Check for mixed scripts
    const mixedCount = [hasLatin, hasCyrillic, hasGreek].filter(Boolean).length;
    if (mixedCount > 1) {
      return {
        mixed: true,
        char: suspiciousChar || char,
        block: hasCyrillic ? 'Cyrillic' : hasGreek ? 'Greek' : 'Unknown'
      };
    }
  }
  
  return { mixed: false };
}
