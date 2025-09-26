// Unicode blocks loaded from unicode_blocks.json file
let UNICODE_BLOCKS = [];

// Load Unicode blocks for Node.js test environment
if (typeof module !== 'undefined' && module.exports) {
  try {
    UNICODE_BLOCKS = require('./unicode_blocks.json');
  } catch (e) {
    console.error('Failed to load unicode_blocks.json in Node.js environment:', e);
  }
}

// In browser content scripts, load unicode_blocks.json synchronously at startup
let unicodeBlocksLoaded = false;

async function loadUnicodeBlocks() {
  if (unicodeBlocksLoaded) return;

  try {
    if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      const url = chrome.runtime.getURL('src/js/unicode_blocks.json');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load unicode_blocks.json');
      const json = await response.json();
      if (Array.isArray(json) && json.length) {
        UNICODE_BLOCKS = json;
        unicodeBlocksLoaded = true;
      }
    }
  } catch (e) {
    // Failed to load unicode_blocks.json
  }
}

// Load Unicode blocks immediately
if (typeof window !== 'undefined') {
  loadUnicodeBlocks();
}

function getUnicodeBlock(char) {
  const code = char.codePointAt(0);
  for (const block of UNICODE_BLOCKS) {
    if (code >= block.start && code <= block.end) {
      return block.name;
    }
  }
  return 'Unknown';
}

function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch (e) {
    return url;
  }
}

function hasMixedScripts(domain) {
  const blocks = new Set();
  let lastChar = null;
  for (const char of domain) {
    if (char === '-' || char === '.') continue;
    const block = getUnicodeBlock(char);
    blocks.add(block);
    lastChar = char;
    if (blocks.size > 1) {
      return { mixed: true, block, char: lastChar };
    }
  }
  return { mixed: false };
}

function isWhitelisted(punnyDomain, wl) {
  if (!Array.isArray(wl)) return false;
  // Compare canonical ASCII (punycode) forms where possible.
  try {
    const targetAscii = punycode.ToASCII(punnyDomain);
    for (const w of wl) {
      try {
        const entryAscii = punycode.ToASCII(w);
        if (entryAscii === targetAscii) return true;
      } catch (e) {
        // if conversion fails, fall back to direct equality
        if (w === punnyDomain || w === targetAscii) return true;
      }
    }
  } catch (err) {
    // If ToASCII fails for the target, fall back to older checks
    if (wl.includes(punnyDomain)) return true;
    for (const w of wl) {
      try {
        const u = punycode.ToUnicode(w);
        if (u === punnyDomain) return true;
      } catch (e) {
        // ignore
      }
    }
  }
  return false;
}

// Analyze URL for popup without creating alert windows
async function analyzeUrlForPopup(url) {
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
    domain = extractDomain(url);
  } else {
    domain = url;
  }

  // Check if it's an educational domain
  for (const eduDomain of educationalDomains) {
    if (domain.includes(eduDomain)) {
      // Send safe message to popup
      chrome.runtime.sendMessage({
        type: 'safe-notification',
        url: domain
      });
      return { safe: true, reason: 'educational' };
    }
  }

  // Ensure Unicode blocks are loaded
  await loadUnicodeBlocks();

  let punnyDomain = punycode.ToUnicode(domain);

  // Check whitelist
  return new Promise((resolve) => {
    try {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['whitelist'], (res) => {
          if (chrome.runtime.lastError) {
            // If storage access fails, do direct check without whitelist
            const { mixed, block, char } = hasMixedScripts(punnyDomain);
            if (mixed) {
              chrome.runtime.sendMessage({
                type: 'popup-alert',
                url: punnyDomain,
                char,
                block
              });
              resolve({ safe: false, mixed: true, char, block });
            } else {
              chrome.runtime.sendMessage({
                type: 'safe-notification',
                url: punnyDomain
              });
              resolve({ safe: true, reason: 'no-mixed-scripts' });
            }
            return;
          }

          const wl = (res && res.whitelist) || [];
          if (isWhitelisted(punnyDomain, wl)) {
            resolve({ safe: true, reason: 'whitelisted' });
            return;
          }
          
          const { mixed, block, char } = hasMixedScripts(punnyDomain);
          if (mixed) {
            chrome.runtime.sendMessage({
              type: 'popup-alert',
              url: punnyDomain,
              char,
              block
            });
            resolve({ safe: false, mixed: true, char, block });
          } else {
            chrome.runtime.sendMessage({
              type: 'safe-notification',
              url: punnyDomain
            });
            resolve({ safe: true, reason: 'no-mixed-scripts' });
          }
        });
      } else {
        // If chrome.storage isn't available, do direct check
        const { mixed, block, char } = hasMixedScripts(punnyDomain);
        if (mixed) {
          chrome.runtime.sendMessage({
            type: 'popup-alert',
            url: punnyDomain,
            char,
            block
          });
          resolve({ safe: false, mixed: true, char, block });
        } else {
          chrome.runtime.sendMessage({
            type: 'safe-notification',
            url: punnyDomain
          });
          resolve({ safe: true, reason: 'no-mixed-scripts' });
        }
      }
    } catch (err) {
      // If chrome.storage access throws, fallback to direct check
      const { mixed, block, char } = hasMixedScripts(punnyDomain);
      if (mixed) {
        chrome.runtime.sendMessage({
          type: 'popup-alert',
          url: punnyDomain,
          char,
          block
        });
        resolve({ safe: false, mixed: true, char, block });
      } else {
        chrome.runtime.sendMessage({
          type: 'safe-notification',
          url: punnyDomain
        });
        resolve({ safe: true, reason: 'no-mixed-scripts' });
      }
    }
  });
}

async function checkURL(url) {
  // Skip educational and trusted domains to avoid false positives
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
    domain = extractDomain(url);
  } else {
    domain = url;
  }

  // Check if it's an educational domain
  for (const eduDomain of educationalDomains) {
    if (domain.includes(eduDomain)) {
      // Send a safe notification for educational domains since they're trusted
      try {
        chrome.runtime.sendMessage({
          type: 'create-safe-notification',
          url: punnyDomain || domain
        });
      } catch (sendErr) {
        // Debug info suppressed in production
      }
      return; // Skip further analysis for educational domains
    }
  }

  // Ensure Unicode blocks are loaded
  await loadUnicodeBlocks();

  let punnyDomain = punycode.ToUnicode(domain);

  // Check whitelist in storage
  try {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['whitelist'], (res) => {
        if (chrome.runtime.lastError) {
          // If storage access fails, do direct check without whitelist
          const { mixed, block, char } = hasMixedScripts(punnyDomain);
          if (mixed) {
            try {
              chrome.runtime.sendMessage({
                type: 'create-alert',
                url: punnyDomain,
                char,
                block
              });
            } catch (sendErr) {
              // Debug info suppressed in production
            }
          } else {
            // Domain appears to use consistent script - show safe notification
            try {
              chrome.runtime.sendMessage({
                type: 'create-safe-notification',
                url: punnyDomain
              });
            } catch (sendErr) {
              // Debug info suppressed in production
            }
          }
          return;
        }

        const wl = (res && res.whitelist) || [];
        if (isWhitelisted(punnyDomain, wl)) return; // whitelisted
        const { mixed, block, char } = hasMixedScripts(punnyDomain);
        if (mixed) {
          try {
            chrome.runtime.sendMessage({
              type: 'create-alert',
              url: punnyDomain,
              char,
              block
            });
          } catch (sendErr) {
            // Debug info suppressed in production
          }
        } else {
          // Domain appears to use consistent script - show safe notification
          try {
            chrome.runtime.sendMessage({
              type: 'create-safe-notification',
              url: punnyDomain
            });
          } catch (sendErr) {
            // Debug info suppressed in production
          }
        }
      });
    } else {
      // If chrome.storage isn't available, do direct check
      const { mixed, block, char } = hasMixedScripts(punnyDomain);
      if (mixed) {
        try {
          chrome.runtime.sendMessage({
            type: 'create-alert',
            url: punnyDomain,
            char,
            block
          });
        } catch (sendErr) {
          // Debug info suppressed in production
        }
      } else {
        // Domain appears to use consistent script - show safe notification
        try {
          chrome.runtime.sendMessage({
            type: 'create-safe-notification',
            url: punnyDomain
          });
        } catch (sendErr) {
          // Debug info suppressed in production
        }
      }
    }
  } catch (err) {
    // If chrome.storage access throws, fallback to direct check
    const { mixed, block, char } = hasMixedScripts(punnyDomain);
    if (mixed) {
      try {
        chrome.runtime.sendMessage({
          type: 'create-alert',
          url: punnyDomain,
          char,
          block
        });
      } catch (sendErr) {
        // Debug info suppressed in production
      }
    } else {
      // Domain appears to use consistent script - show safe notification
      try {
        chrome.runtime.sendMessage({
          type: 'create-safe-notification',
          url: punnyDomain
        });
      } catch (sendErr) {
        // Debug info suppressed in production
      }
    }
  }
}

if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((_request, _sender, _sendResponse) => {
    try {
      if (_request && _request.type === 'analyze-url') {
        // Handle manual analysis request from popup - do analysis but send result to popup, not create alert popups
        analyzeUrlForPopup(_request.url).then((result) => {
          _sendResponse({ success: true, result: result });
        }).catch(e => {
          console.error('IDN Protection: Error checking URL:', e);
          _sendResponse({ success: false, error: e.message });
        });
        return true; // Keep message channel open for async response
      }
    } catch (e) {
      // Error info suppressed in production
    }
  });
}

async function run() {
  try {
    
    // First try to analyze current page URL directly
    if (window.location && window.location.href) {
      await checkURL(window.location.href).catch(e => console.error('IDN Protection: Error checking current URL:', e));
    }
    
    // Also get URL from background script as fallback
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'get-page-url' }, async (response) => {
        if (chrome.runtime.lastError) {
          // Error getting page URL from background
          return;
        }
        if (response && response.url && response.url !== window.location.href) {
          await checkURL(response.url).catch(e => console.error('IDN Protection: Error checking URL:', e));
        }
      });
    }
  } catch (e) {
    // Error in run function
  }
}

// punycode is provided by `punycode.js` (bundled as a content script before this file).
// Content script is ready but only runs analysis when requested by popup
// This prevents automatic popup creation on every page load
