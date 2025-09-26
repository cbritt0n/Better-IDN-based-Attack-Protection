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
      return; // Skip educational domains
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
    }
  }
}

if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((_request, _sender, _sendResponse) => {
    try {
      if (_request && _request.url) {
        checkURL(_request.url).catch(e => console.error('IDN Protection: Error checking URL:', e));
      }
    } catch (e) {
      // Error info suppressed in production
    }
  });
}

async function run() {
  try {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'get-page-url' }, async (response) => {
        if (chrome.runtime.lastError) {
          // Error info suppressed in production
          return;
        }
        if (response && response.url) {
          await checkURL(response.url).catch(e => console.error('IDN Protection: Error checking URL:', e));
        }
      });
    }
  } catch (e) {
    // Error info suppressed in production
  }
}

// punycode is provided by `punycode.js` (bundled as a content script before this file).
// Keep DOMContentLoaded wiring for running in page contexts where needed.
try {
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', run);
} catch (e) {
  // ignore
}