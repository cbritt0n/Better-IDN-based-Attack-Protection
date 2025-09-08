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
      if (wl.includes(punnyDomain)) return; // whitelisted
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

// --- Punycode implementation (unchanged) ---
//Javascript Punycode converter derived from example in RFC3492.
//This implementation is created by some@domain.name and released into public domain
var punycode = new function Punycode() {
  // This object converts to and from puny-code used in IDN
  //
  // punycode.ToASCII ( domain )
  //
  // Returns a puny coded representation of "domain".
  // It only converts the part of the domain name that
  // has non ASCII characters. I.e. it dosent matter if
  // you call it with a domain that already is in ASCII.
  //
  // punycode.ToUnicode (domain)
  //
  // Converts a puny-coded domain name to unicode.
  // It only converts the puny-coded parts of the domain name.
  // I.e. it dosent matter if you call it on a string
  // that already has been converted to unicode.
  //
  //
  this.utf16 = {
    // The utf16-class is necessary to convert from javascripts internal character representation to unicode and back.
    decode:function(input){
      var output = [], i=0, len=input.length,value,extra;
      while (i < len) {
        value = input.charCodeAt(i++);
        if ((value & 0xF800) === 0xD800) {
          extra = input.charCodeAt(i++);
          if ( ((value & 0xFC00) !== 0xD800) || ((extra & 0xFC00) !== 0xDC00) ) {
            throw new RangeError("UTF-16(decode): Illegal UTF-16 sequence");
          }
          value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
        }
        output.push(value);
      }
      return output;
    },
    encode:function(input){
      var output = [], i=0, len=input.length,value;
      while (i < len) {
        value = input[i++];
        if ( (value & 0xF800) === 0xD800 ) {
          throw new RangeError("UTF-16(encode): Illegal UTF-16 value");
        }
        if (value > 0xFFFF) {
          value -= 0x10000;
          output.push(String.fromCharCode(((value >>>10) & 0x3FF) | 0xD800));
          value = 0xDC00 | (value & 0x3FF);
        }
        output.push(String.fromCharCode(value));
      }
      return output.join("");
    }
  }

  //Default parameters
  var initial_n = 0x80;
  var initial_bias = 72;
  var delimiter = "\x2D";
  var base = 36;
  var damp = 700;
  var tmin=1;
  var tmax=26;
  var skew=38;
  var maxint = 0x7FFFFFFF;

  // decode_digit(cp) returns the numeric value of a basic code
  // point (for use in representing integers) in the range 0 to
  // base-1, or base if cp is does not represent a value.

  function decode_digit(cp) {
    return cp - 48 < 10 ? cp - 22 : cp - 65 < 26 ? cp - 65 : cp - 97 < 26 ? cp - 97 : base;
  }

  // encode_digit(d,flag) returns the basic code point whose value
  // (when used for representing integers) is d, which needs to be in
  // the range 0 to base-1. The lowercase form is used unless flag is
  // nonzero, in which case the uppercase form is used. The behavior
  // is undefined if flag is nonzero and digit d has no uppercase form.

  function encode_digit(d, flag) {
    return d + 22 + 75 * (d < 26) - ((flag != 0) << 5);
    //  0..25 map to ASCII a..z or A..Z
    // 26..35 map to ASCII 0..9
  }
  //** Bias adaptation function **
  function adapt(delta, numpoints, firsttime ) {
    var k;
    delta = firsttime ? Math.floor(delta / damp) : (delta >> 1);
    delta += Math.floor(delta / numpoints);

    for (k = 0; delta > (((base - tmin) * tmax) >> 1); k += base) {
        delta = Math.floor(delta / ( base - tmin ));
    }
    return Math.floor(k + (base - tmin + 1) * delta / (delta + skew));
  }

  // encode_basic(bcp,flag) forces a basic code point to lowercase if flag is zero,
  // uppercase if flag is nonzero, and returns the resulting code point.
  // The code point is unchanged if it is caseless.
  // The behavior is undefined if bcp is not a basic code point.

  function encode_basic(bcp, flag) {
    bcp -= (bcp - 97 < 26) << 5;
    return bcp + ((!flag && (bcp - 65 < 26)) << 5);
  }

  // Main decode
  this.decode=function(input,preserveCase) {
    // Dont use utf16
    var output=[];
    var case_flags=[];
    var input_length = input.length;

    var n, out, i, bias, basic, j, ic, oldi, w, k, digit, t, len;

    // Initialize the state:

    n = initial_n;
    i = 0;
    bias = initial_bias;

    // Handle the basic code points: Let basic be the number of input code
    // points before the last delimiter, or 0 if there is none, then
    // copy the first basic code points to the output.

    basic = input.lastIndexOf(delimiter);
    if (basic < 0) basic = 0;

    for (j = 0; j < basic; ++j) {
      if(preserveCase) case_flags[output.length] = ( input.charCodeAt(j) -65 < 26);
      if ( input.charCodeAt(j) >= 0x80) {
        throw new RangeError("Illegal input >= 0x80");
      }
      output.push( input.charCodeAt(j) );
    }

    // Main decoding loop: Start just after the last delimiter if any
    // basic code points were copied; start at the beginning otherwise.

    for (ic = basic > 0 ? basic + 1 : 0; ic < input_length; ) {

      // ic is the index of the next character to be consumed,

      // Decode a generalized variable-length integer into delta,
      // which gets added to i. The overflow checking is easier
      // if we increase i as we go, then subtract off its starting
      // value at the end to obtain delta.
      for (oldi = i, w = 1, k = base; ; k += base) {
          if (ic >= input_length) {
            throw RangeError ("punycode_bad_input(1)");
          }
          digit = decode_digit(input.charCodeAt(ic++));

          if (digit >= base) {
            throw RangeError("punycode_bad_input(2)");
          }
          if (digit > Math.floor((maxint - i) / w)) {
            throw RangeError ("punycode_overflow(1)");
          }
          i += digit * w;
          t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
          if (digit < t) { break; }
          if (w > Math.floor(maxint / (base - t))) {
            throw RangeError("punycode_overflow(2)");
          }
          w *= (base - t);
      }

      out = output.length + 1;
      bias = adapt(i - oldi, out, oldi === 0);

      // i was supposed to wrap around from out to 0,
      // incrementing n each time, so we'll fix that now:
      if ( Math.floor(i / out) > maxint - n) {
        throw RangeError("punycode_overflow(3)");
      }
      n += Math.floor( i / out ) ;
      i %= out;

      // Insert n at position i of the output:
      // Case of last character determines uppercase flag:
      if (preserveCase) { case_flags.splice(i, 0, input.charCodeAt(ic -1) -65 < 26);}

      output.splice(i, 0, n);
      i++;
    }
    if (preserveCase) {
      for (i = 0, len = output.length; i < len; i++) {
        if (case_flags[i]) {
          output[i] = (String.fromCharCode(output[i]).toUpperCase()).charCodeAt(0);
        }
      }
    }
    return this.utf16.encode(output);
  };

  //** Main encode function **

  this.encode = function (input,preserveCase) {
    //** Bias adaptation function **

    var n, delta, h, b, bias, j, m, q, k, t, ijv, case_flags;

    if (preserveCase) {
      // Preserve case, step1 of 2: Get a list of the unaltered string
      case_flags = this.utf16.decode(input);
    }
    // Converts the input in UTF-16 to Unicode
    input = this.utf16.decode(input.toLowerCase());

    var input_length = input.length; // Cache the length

    if (preserveCase) {
      // Preserve case, step2 of 2: Modify the list to true/false
      for (j=0; j < input_length; j++) {
        case_flags[j] = input[j] != case_flags[j];
      }
    }

    var output=[];


    // Initialize the state:
    n = initial_n;
    delta = 0;
    bias = initial_bias;

    // Handle the basic code points:
    for (j = 0; j < input_length; ++j) {
      if ( input[j] < 0x80) {
        output.push(
          String.fromCharCode(
            case_flags ? encode_basic(input[j], case_flags[j]) : input[j]
          )
        );
      }
    }

    h = b = output.length;

    // h is the number of code points that have been handled, b is the
    // number of basic code points

    if (b > 0) output.push(delimiter);

    // Main encoding loop:
    //
    while (h < input_length) {
      // All non-basic code points < n have been
      // handled already. Find the next larger one:

      for (m = maxint, j = 0; j < input_length; ++j) {
        ijv = input[j];
        if (ijv >= n && ijv < m) m = ijv;
      }

      // Increase delta enough to advance the decoder's
      // <n,i> state to <m,0>, but guard against overflow:

      if (m - n > Math.floor((maxint - delta) / (h + 1))) {
        throw RangeError("punycode_overflow (1)");
      }
      delta += (m - n) * (h + 1);
      n = m;

      for (j = 0; j < input_length; ++j) {
        ijv = input[j];

        if (ijv < n ) {
          if (++delta > maxint) return Error("punycode_overflow(2)");
        }

        if (ijv == n) {
          // Represent delta as a generalized variable-length integer:
          for (q = delta, k = base; ; k += base) {
            t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
            if (q < t) break;
            output.push( String.fromCharCode(encode_digit(t + (q - t) % (base - t), 0)) );
            q = Math.floor( (q - t) / (base - t) );
          }
          output.push( String.fromCharCode(encode_digit(q, preserveCase && case_flags[j] ? 1:0 )));
          bias = adapt(delta, h + 1, h == b);
          delta = 0;
          ++h;
        }
      }

      ++delta, ++n;
    }
    return output.join("");
  }

  this.ToASCII = function ( domain ) {
    var domain_array = domain.split(".");
    var out = [];
    for (var i=0; i < domain_array.length; ++i) {
      var s = domain_array[i];
      out.push(
        s.match(/[^A-Za-z0-9-]/) ?
        "xn--" + punycode.encode(s) :
        s
      );
    }
    return out.join(".");
  }
  this.ToUnicode = function ( domain ) {
    var domain_array = domain.split(".");
    var out = [];
    for (var i=0; i < domain_array.length; ++i) {
      var s = domain_array[i];
      out.push(
        s.match(/^xn--/) ?
        punycode.decode(s.slice(4)) :
        s
      );
    }
    return out.join(".");
  }
}();

document.addEventListener("DOMContentLoaded", run);
