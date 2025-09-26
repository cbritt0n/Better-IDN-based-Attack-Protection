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

// Store analysis results to avoid re-analysis
let analysisResults = new Map(); // url -> {safe: boolean, reason: string, char?: string, block?: string}

// Main analysis function - runs once per page load
async function analyzeCurrentPage() {
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

  const url = window.location.href;
  const domain = extractDomain(url);
  
  // Skip if already analyzed
  if (analysisResults.has(url)) {
    return analysisResults.get(url);
  }

  // Check if it's an educational domain
  for (const eduDomain of educationalDomains) {
    if (domain.includes(eduDomain)) {
      const result = { safe: true, reason: 'educational' };
      analysisResults.set(url, result);
      return result;
    }
  }

  // Ensure Unicode blocks are loaded
  await loadUnicodeBlocks();

  const punnyDomain = punycode.ToUnicode(domain);

  // Analyze with promise-based approach to store results
  return new Promise((resolve) => {
    try {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['whitelist'], (res) => {
          let result;
          
          if (chrome.runtime.lastError) {
            // If storage access fails, do direct check without whitelist
            const { mixed, block, char } = hasMixedScripts(punnyDomain);
            if (mixed) {
              result = { safe: false, reason: 'mixed-scripts', char, block };
              // Create alert popup for vulnerable sites
              chrome.runtime.sendMessage({
                type: 'create-alert',
                url: punnyDomain,
                char,
                block
              });
            } else {
              result = { safe: true, reason: 'no-mixed-scripts' };
            }
          } else {
            const wl = (res && res.whitelist) || [];
            if (isWhitelisted(punnyDomain, wl)) {
              result = { safe: true, reason: 'whitelisted' };
            } else {
              const { mixed, block, char } = hasMixedScripts(punnyDomain);
              if (mixed) {
                result = { safe: false, reason: 'mixed-scripts', char, block };
                // Create alert popup for vulnerable sites
                chrome.runtime.sendMessage({
                  type: 'create-alert',
                  url: punnyDomain,
                  char,
                  block
                });
              } else {
                result = { safe: true, reason: 'no-mixed-scripts' };
              }
            }
          }
          
          // Store result and resolve
          analysisResults.set(url, result);
          resolve(result);
        });
      } else {
        // If chrome.storage isn't available, do direct check
        const { mixed, block, char } = hasMixedScripts(punnyDomain);
        const result = mixed 
          ? { safe: false, reason: 'mixed-scripts', char, block }
          : { safe: true, reason: 'no-mixed-scripts' };
          
        if (mixed) {
          // Create alert popup for vulnerable sites
          chrome.runtime.sendMessage({
            type: 'create-alert',
            url: punnyDomain,
            char,
            block
          });
        }
        
        analysisResults.set(url, result);
        resolve(result);
      }
    } catch (err) {
      // If chrome.storage access throws, fallback to direct check
      const { mixed, block, char } = hasMixedScripts(punnyDomain);
      const result = mixed 
        ? { safe: false, reason: 'mixed-scripts', char, block }
        : { safe: true, reason: 'no-mixed-scripts' };
        
      if (mixed) {
        // Create alert popup for vulnerable sites
        chrome.runtime.sendMessage({
          type: 'create-alert',
          url: punnyDomain,
          char,
          block
        });
      }
      
      analysisResults.set(url, result);
      resolve(result);
    }
  });
}

if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((_request, _sender, _sendResponse) => {
    try {
      if (_request && _request.type === 'analyze-url') {
        // Return stored analysis results or analyze if not done yet
        const url = _request.url || window.location.href;
        
        if (analysisResults.has(url)) {
          // Already analyzed - send stored result to popup
          const result = analysisResults.get(url);
          if (result.safe) {
            chrome.runtime.sendMessage({
              type: 'safe-notification',
              url: extractDomain(url)
            });
          } else {
            chrome.runtime.sendMessage({
              type: 'popup-alert',
              url: extractDomain(url),
              char: result.char,
              block: result.block
            });
          }
          _sendResponse({ success: true, result: result });
        } else {
          // Not analyzed yet - analyze now
          analyzeCurrentPage().then((result) => {
            if (result.safe) {
              chrome.runtime.sendMessage({
                type: 'safe-notification',
                url: extractDomain(url)
              });
            } else {
              chrome.runtime.sendMessage({
                type: 'popup-alert',
                url: extractDomain(url),
                char: result.char,
                block: result.block
              });
            }
            _sendResponse({ success: true, result: result });
          }).catch(e => {
            console.error('IDN Protection: Error checking URL:', e);
            _sendResponse({ success: false, error: e.message });
          });
        }
        return true; // Keep message channel open for async response
      }
    } catch (e) {
      // Error info suppressed in production
    }
  });
}

// Initialize content script - analyze page once on load
let initialized = false;

async function initialize() {
  if (initialized) return;
  initialized = true;
  
  try {
    // Analyze current page once (creates popup windows only for threats)
    await analyzeCurrentPage();
  } catch (e) {
    console.error('IDN Protection: Error during initialization:', e);
  }
}

// punycode is provided by `punycode.js` (bundled as a content script before this file).
// Run analysis once on page load
if (typeof document !== 'undefined') {
  // Run immediately if possible
  initialize();
  
  // Also run on DOMContentLoaded as backup (but only if not already initialized)
  document.addEventListener('DOMContentLoaded', initialize);
}
