// Try to load unicode_blocks.json in Node test environment; otherwise use embedded list
let UNICODE_BLOCKS;
if (typeof module !== 'undefined' && module.exports) {
  try {
    UNICODE_BLOCKS = require('./unicode_blocks.json');
  } catch (e) {
    // fallback to embedded list
  }
}
if (!UNICODE_BLOCKS) {
  UNICODE_BLOCKS = [
    { name: 'Basic Latin', start: 0, end: 127 },
    { name: 'Latin-1 Supplement', start: 128, end: 255 },
    { name: 'Latin Extended-A', start: 256, end: 383 },
    { name: 'Latin Extended-B', start: 384, end: 591 },
    { name: 'IPA Extensions', start: 592, end: 687 },
    { name: 'Spacing Modifier Letters', start: 688, end: 767 },
    { name: 'Combining Diacritical Marks', start: 768, end: 879 },
    { name: 'Greek', start: 880, end: 1023 },
    { name: 'Cyrillic', start: 1024, end: 1279 },
    { name: 'Armenian', start: 1328, end: 1423 },
    { name: 'Hebrew', start: 1424, end: 1535 },
    { name: 'Arabic', start: 1536, end: 1791 },
    { name: 'Syriac', start: 1792, end: 1871 },
    { name: 'Thaana', start: 1920, end: 1983 },
    { name: 'Devanagari', start: 2304, end: 2431 },
    { name: 'Bengali', start: 2432, end: 2559 },
    { name: 'Gurmukhi', start: 2560, end: 2687 },
    { name: 'Gujarati', start: 2688, end: 2815 },
    { name: 'Oriya', start: 2816, end: 2943 },
    { name: 'Tamil', start: 2944, end: 3071 },
    { name: 'Telugu', start: 3072, end: 3199 },
    { name: 'Kannada', start: 3200, end: 3327 },
    { name: 'Malayalam', start: 3328, end: 3455 },
    { name: 'Sinhala', start: 3456, end: 3583 },
    { name: 'Thai', start: 3584, end: 3711 },
    { name: 'Lao', start: 3712, end: 3839 },
    { name: 'Tibetan', start: 3840, end: 4095 },
    { name: 'Myanmar', start: 4096, end: 4255 },
    { name: 'Georgian', start: 4256, end: 4351 },
    { name: 'Hangul Jamo', start: 4352, end: 4607 },
    { name: 'Ethiopic', start: 4608, end: 4991 },
    { name: 'Cherokee', start: 5024, end: 5119 },
    { name: 'Unified Canadian Aboriginal Syllabics', start: 5120, end: 5759 },
    { name: 'Ogham', start: 5760, end: 5791 },
    { name: 'Runic', start: 5792, end: 5887 },
    { name: 'Khmer', start: 6016, end: 6143 },
    { name: 'Mongolian', start: 6144, end: 6319 },
    { name: 'Latin Extended Additional', start: 7680, end: 7935 },
    { name: 'Greek Extended', start: 7936, end: 8191 },
    { name: 'General Punctuation', start: 8192, end: 8303 },
    { name: 'Superscripts and Subscripts', start: 8304, end: 8351 },
    { name: 'Currency Symbols', start: 8352, end: 8399 },
    { name: 'Combining Marks for Symbols', start: 8400, end: 8447 },
    { name: 'Letterlike Symbols', start: 8448, end: 8527 },
    { name: 'Number Forms', start: 8528, end: 8591 },
    { name: 'Arrows', start: 8592, end: 8703 },
    { name: 'Mathematical Operators', start: 8704, end: 8959 },
    { name: 'Miscellaneous Technical', start: 8960, end: 9215 },
    { name: 'Control Pictures', start: 9216, end: 9279 },
    { name: 'Optical Character Recognition', start: 9280, end: 9311 },
    { name: 'Enclosed Alphanumerics', start: 9312, end: 9471 },
    { name: 'Box Drawing', start: 9472, end: 9599 },
    { name: 'Block Elements', start: 9600, end: 9631 },
    { name: 'Geometric Shapes', start: 9632, end: 9727 },
    { name: 'Miscellaneous Symbols', start: 9728, end: 9983 },
    { name: 'Dingbats', start: 9984, end: 10175 },
    { name: 'Braille Patterns', start: 10240, end: 10495 },
    { name: 'CJK Radicals Supplement', start: 11904, end: 12031 },
    { name: 'Kangxi Radicals', start: 12032, end: 12255 },
    { name: 'Ideographic Description Characters', start: 12272, end: 12287 },
    { name: 'CJK Symbols and Punctuation', start: 12288, end: 12351 },
    { name: 'Hiragana', start: 12352, end: 12447 },
    { name: 'Katakana', start: 12448, end: 12543 },
    { name: 'Bopomofo', start: 12544, end: 12591 },
    { name: 'Hangul Compatibility Jamo', start: 12592, end: 12687 },
    { name: 'Kanbun', start: 12688, end: 12703 },
    { name: 'Bopomofo Extended', start: 12704, end: 12735 },
    { name: 'Enclosed CJK Letters and Months', start: 12800, end: 13055 },
    { name: 'CJK Compatibility', start: 13056, end: 13311 },
    { name: 'CJK Unified Ideographs Extension A', start: 13312, end: 19893 },
    { name: 'CJK Unified Ideographs', start: 19968, end: 40959 },
    { name: 'Yi Syllables', start: 40960, end: 42127 },
    { name: 'Yi Radicals', start: 42128, end: 42191 },
    { name: 'Hangul Syllables', start: 44032, end: 55203 },
    { name: 'High Surrogates', start: 55296, end: 56191 },
    { name: 'High Private Use Surrogates', start: 56192, end: 56319 },
    { name: 'Low Surrogates', start: 56320, end: 57343 },
    { name: 'Private Use', start: 57344, end: 63743 },
    { name: 'CJK Compatibility Ideographs', start: 63744, end: 64255 },
    { name: 'Alphabetic Presentation Forms', start: 64256, end: 64335 },
    { name: 'Arabic Presentation Forms-A', start: 64336, end: 65023 },
    { name: 'Combining Half Marks', start: 65056, end: 65071 },
    { name: 'CJK Compatibility Forms', start: 65072, end: 65103 },
    { name: 'Small Form Variants', start: 65104, end: 65135 },
    { name: 'Arabic Presentation Forms-B', start: 65136, end: 65278 },
    { name: 'Specials', start: 65279, end: 65279 },
    { name: 'Halfwidth and Fullwidth Forms', start: 65280, end: 65519 },
    { name: 'Specials', start: 65520, end: 65533 }
  ];
}

// In browser content scripts, try to load an external unicode_blocks.json for maintainability.
// If it fails, we keep the embedded UNICODE_BLOCKS.
try {
  if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    const url = chrome.runtime.getURL('unicode_blocks.json');
    fetch(url).then((r) => {
      if (!r.ok) throw new Error('no-json');
      return r.json();
    }).then((json) => {
      if (Array.isArray(json) && json.length) {
        UNICODE_BLOCKS = json;
        // console.debug('unicode_blocks.json loaded');
      }
    }).catch(() => {
      // ignore; fallback to embedded list
    });
  }
} catch (e) {
  // ignore
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

function checkURL(url) {
  let punnyDomain;
  if (url.startsWith('https://') || url.startsWith('http://')) {
    punnyDomain = punycode.ToUnicode(extractDomain(url));
  } else {
    punnyDomain = punycode.ToUnicode(url);
  }

  // Check whitelist in storage
  try {
    chrome.storage && chrome.storage.sync && chrome.storage.sync.get(['whitelist'], (res) => {
      const wl = (res && res.whitelist) || [];
      if (isWhitelisted(punnyDomain, wl)) return; // whitelisted
      const { mixed, block, char } = hasMixedScripts(punnyDomain);
      if (mixed) {
        chrome.runtime.sendMessage({
          type: 'create-alert',
          url: punnyDomain,
          char,
          block
        });
      }
    });
  } catch (err) {
    // If chrome.storage isn't available (Node tests) or threw, fallback to direct check
    const { mixed, block, char } = hasMixedScripts(punnyDomain);
    if (mixed) {
      try {
        chrome.runtime && chrome.runtime.sendMessage({ type: 'create-alert', url: punnyDomain, char, block });
      } catch (sendErr) {
        // best-effort send; nothing else to do in content script test context
        // eslint-disable-next-line no-console
        console.debug('sendMessage failed in fallback', sendErr && sendErr.message);
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.url) {
    checkURL(message.url);
  }
});

function run() {
  chrome.runtime.sendMessage('get-page-url');
}

// punycode is provided by `punycode.js` (bundled as a content script before this file).
// Keep DOMContentLoaded wiring for running in page contexts where needed.
try {
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', run);
} catch (e) {
  // ignore
}
