
console.log('The extension loads');

function getDomain(c){
  var domain;
  if(c.charCodeAt(0) >= 0 && c.charCodeAt(0) <= 127){
    domain = "Basic Latin";
  }
  else if(c.charCodeAt(0) >= 128 && c.charCodeAt(0) <= 255){
    domain = "Latin-1 Supplement";
  }
  else if(c.charCodeAt(0) >= 256 && c.charCodeAt(0) <= 383){
    domain = "Latin Extended-A";
  }
  else if(c.charCodeAt(0) >= 384 && c.charCodeAt(0) <= 591){
    domain = "Latin Extended-B";
  }
  else if(c.charCodeAt(0) >= 592 && c.charCodeAt(0) <= 687){
    domain = "IPA Extensions";
  }
  else if(c.charCodeAt(0) >= 688 && c.charCodeAt(0) <= 767){
    domain = "Spacing Modifier Letters";
  }
  else if(c.charCodeAt(0) >= 768 && c.charCodeAt(0) <= 879){
    domain = "Combining Diacritical Marks";
  }
  else if(c.charCodeAt(0) >= 880 && c.charCodeAt(0) <= 1023){
    domain = "Greek";
  }
  else if(c.charCodeAt(0) >= 1024 && c.charCodeAt(0) <= 1279){
    domain = "Cyrillic";
  }
  else if(c.charCodeAt(0) >= 1328 && c.charCodeAt(0) <= 1423){
    domain = "Armenian";
  }
  else if(c.charCodeAt(0) >= 1424 && c.charCodeAt(0) <= 1535){
    domain = "Hebrew";
  }
  else if(c.charCodeAt(0) >= 1536 && c.charCodeAt(0) <= 1791){
    domain = "Arabic";
  }
  else if(c.charCodeAt(0) >= 1792 && c.charCodeAt(0) <= 1871){
    domain = "Syriac";
  }
  else if(c.charCodeAt(0) >= 1920 && c.charCodeAt(0) <= 1983){
    domain = "Thaana";
  }
  else if(c.charCodeAt(0) >= 2304 && c.charCodeAt(0) <= 2431){
    domain = "Devanagari";
  }
  else if(c.charCodeAt(0) >= 2432 && c.charCodeAt(0) <= 2559){
    domain = "Bengali";
  }
  else if(c.charCodeAt(0) >= 2560 && c.charCodeAt(0) <= 2687){
    domain = "Gurmukhi";
  }
  else if(c.charCodeAt(0) >= 2688 && c.charCodeAt(0) <= 2815){
    domain = "Gujarati";
  }
  else if(c.charCodeAt(0) >= 2816 && c.charCodeAt(0) <= 2943){
    domain = "Oriya";
  }
  else if(c.charCodeAt(0) >= 2944 && c.charCodeAt(0) <= 3071){
    domain = "Tamil";
  }
  else if(c.charCodeAt(0) >= 3072 && c.charCodeAt(0) <= 3199){
    domain = "Telugu";
  }
  else if(c.charCodeAt(0) >= 3200 && c.charCodeAt(0) <= 3327){
    domain = "Kannada";
  }
  else if(c.charCodeAt(0) >= 3328 && c.charCodeAt(0) <= 3455){
    domain = "Malayalam";
  }
  else if(c.charCodeAt(0) >= 3456 && c.charCodeAt(0) <= 3583){
    domain = "Sinhala";
  }
  else if(c.charCodeAt(0) >= 3584 && c.charCodeAt(0) <= 3711){
    domain = "Thai";
  }
  else if(c.charCodeAt(0) >= 3712 && c.charCodeAt(0) <= 3839){
    domain = "Lao";
  }
  else if(c.charCodeAt(0) >= 3840 && c.charCodeAt(0) <= 4095){
    domain = "Tibetan";
  }
  else if(c.charCodeAt(0) >= 4096 && c.charCodeAt(0) <= 4255){
    domain = "Myanmar";
  }
  else if(c.charCodeAt(0) >= 4256 && c.charCodeAt(0) <= 4351){
    domain = "Georgian";
  }
  else if(c.charCodeAt(0) >= 4352 && c.charCodeAt(0) <= 4607){
    domain = "Hangul Jamo";
  }
  else if(c.charCodeAt(0) >= 4608 && c.charCodeAt(0) <= 4991){
    domain = "Ethiopic";
  }
  else if(c.charCodeAt(0) >= 5024 && c.charCodeAt(0) <= 5119){
    domain = "Cherokee";
  }
  else if(c.charCodeAt(0) >= 5120 && c.charCodeAt(0) <= 5759){
    domain = "Unified Canadian Aboriginal Syllabics";
  }
  else if(c.charCodeAt(0) >= 5760 && c.charCodeAt(0) <= 5791){
    domain = "Ogham";
  }
  else if(c.charCodeAt(0) >= 5792 && c.charCodeAt(0) <= 5887){
    domain = "Runic";
  }
  else if(c.charCodeAt(0) >= 6016 && c.charCodeAt(0) <= 6143){
    domain = "Khmer";
  }
  else if(c.charCodeAt(0) >= 6144 && c.charCodeAt(0) <= 6319){
    domain = "Mongolian";
  }
  else if(c.charCodeAt(0) >= 7680 && c.charCodeAt(0) <= 7935){
    domain = "Latin Extended Additional";
  }
  else if(c.charCodeAt(0) >= 7936 && c.charCodeAt(0) <= 8191){
    domain = "Greek Extended";
  }
  else if(c.charCodeAt(0) >= 8192 && c.charCodeAt(0) <= 8303){
    domain = "General Punctuation";
  }
  else if(c.charCodeAt(0) >= 8304 && c.charCodeAt(0) <= 8351){
    domain = "Superscripts and Subscripts";
  }
  else if(c.charCodeAt(0) >= 8352 && c.charCodeAt(0) <= 8399){
    domain = "Currency Symbols";
  }
  else if(c.charCodeAt(0) >= 8400 && c.charCodeAt(0) <= 8447){
    domain = "Combining Marks for Symbols";
  }
  else if(c.charCodeAt(0) >= 8448 && c.charCodeAt(0) <= 8527){
    domain = "Letterlike Symbols";
  }
  else if(c.charCodeAt(0) >= 8528 && c.charCodeAt(0) <= 8591){
    domain = "Number Forms";
  }
  else if(c.charCodeAt(0) >= 8592 && c.charCodeAt(0) <= 8703){
    domain = "Arrows";
  }
  else if(c.charCodeAt(0) >= 8704 && c.charCodeAt(0) <= 8959){
    domain = "Mathematical Operators";
  }
  else if(c.charCodeAt(0) >= 8960 && c.charCodeAt(0) <= 9215){
    domain = "Miscellaneous Technical";
  }
  else if(c.charCodeAt(0) >= 9216 && c.charCodeAt(0) <= 9279){
    domain = "Control Pictures";
  }
  else if(c.charCodeAt(0) >= 9280 && c.charCodeAt(0) <= 9311){
    domain = "Optical Character Recognition";
  }
  else if(c.charCodeAt(0) >= 9312 && c.charCodeAt(0) <= 9471){
    domain = "Enclosed Alphanumerics";
  }
  else if(c.charCodeAt(0) >= 9472 && c.charCodeAt(0) <= 9599){
    domain = "Box Drawing";
  }
  else if(c.charCodeAt(0) >= 9600 && c.charCodeAt(0) <= 9631){
    domain = "Block Elements";
  }
  else if(c.charCodeAt(0) >= 9632 && c.charCodeAt(0) <= 9727){
    domain = "Geometric Shapes";
  }
  else if(c.charCodeAt(0) >= 9728 && c.charCodeAt(0) <= 9983){
    domain = "Miscellaneous Symbols";
  }
  else if(c.charCodeAt(0) >= 9984 && c.charCodeAt(0) <= 10175){
    domain = "Dingbats";
  }
  else if(c.charCodeAt(0) >= 10240 && c.charCodeAt(0) <= 10495){
    domain = "Braille Patterns";
  }
  else if(c.charCodeAt(0) >= 11904 && c.charCodeAt(0) <= 12031){
    domain = "CJK Radicals Supplement";
  }
  else if(c.charCodeAt(0) >= 12032 && c.charCodeAt(0) <= 12255){
    domain = "Kangxi Radicals";
  }
  else if(c.charCodeAt(0) >= 12272 && c.charCodeAt(0) <= 12287){
    domain = "Ideographic Description Characters";
  }
  else if(c.charCodeAt(0) >= 12288 && c.charCodeAt(0) <= 12351){
    domain = "CJK Symbols and Punctuation";
  }
  else if(c.charCodeAt(0) >= 12352 && c.charCodeAt(0) <= 12447){
    domain = "Hiragana";
  }
  else if(c.charCodeAt(0) >= 12448 && c.charCodeAt(0) <= 12543){
    domain = "Katakana";
  }
  else if(c.charCodeAt(0) >= 12544 && c.charCodeAt(0) <= 12591){
    domain = "Bopomofo";
  }
  else if(c.charCodeAt(0) >= 12592 && c.charCodeAt(0) <= 12687){
    domain = "Hangul Compatibility Jamo";
  }
  else if(c.charCodeAt(0) >= 12688 && c.charCodeAt(0) <= 12703){
    domain = "Kanbun";
  }
  else if(c.charCodeAt(0) >= 12704 && c.charCodeAt(0) <= 12735){
    domain = "Bopomofo Extended";
  }
  else if(c.charCodeAt(0) >= 12800 && c.charCodeAt(0) <= 13055){
    domain = "Enclosed CJK Letters and Months";
  }
  else if(c.charCodeAt(0) >= 13056 && c.charCodeAt(0) <= 13311){
    domain = "CJK Compatibility";
  }
  else if(c.charCodeAt(0) >= 13312 && c.charCodeAt(0) <= 19893){
    domain = "CJK Unified Ideographs Extension A";
  }
  else if(c.charCodeAt(0) >= 19968 && c.charCodeAt(0) <= 40959){
    domain = "CJK Unified Ideographs";
  }
  else if(c.charCodeAt(0) >= 40960 && c.charCodeAt(0) <= 42127){
    domain = "Yi Syllables";
  }
  else if(c.charCodeAt(0) >= 42128 && c.charCodeAt(0) <= 42191){
    domain = "Yi Radicals";
  }
  else if(c.charCodeAt(0) >= 44032 && c.charCodeAt(0) <= 55203){
    domain = "Hangul Syllables";
  }
  else if(c.charCodeAt(0) >= 55296 && c.charCodeAt(0) <= 56191){
    domain = "High Surrogates";
  }
  else if(c.charCodeAt(0) >= 56192 && c.charCodeAt(0) <= 56319){
    domain = "High Private Use Surrogates";
  }
  else if(c.charCodeAt(0) >= 56320 && c.charCodeAt(0) <= 57343){
    domain = "Low Surrogates";
  }
  else if(c.charCodeAt(0) >= 57344 && c.charCodeAt(0) <= 63743){
    domain = "Private Use";
  }
  else if(c.charCodeAt(0) >= 63744 && c.charCodeAt(0) <= 64255){
    domain = "CJK Compatibility Ideographs";
  }
  else if(c.charCodeAt(0) >= 64256 && c.charCodeAt(0) <= 64335){
    domain = "Alphabetic Presentation Forms";
  }
  else if(c.charCodeAt(0) >= 64336 && c.charCodeAt(0) <= 65023){
    domain = "Arabic Presentation Forms-A";
  }
  else if(c.charCodeAt(0) >= 65056 && c.charCodeAt(0) <= 65071){
    domain = "Combining Half Marks";
  }
  else if(c.charCodeAt(0) >= 65072 && c.charCodeAt(0) <= 65103){
    domain = "CJK Compatibility Forms";
  }
  else if(c.charCodeAt(0) >= 65104 && c.charCodeAt(0) <= 65135){
    domain = "Small Form Variants";
  }
  else if(c.charCodeAt(0) >= 65136 && c.charCodeAt(0) <= 65278){
    domain = "Arabic Presentation Forms-B";
  }
  else if(c.charCodeAt(0) >= 65279 && c.charCodeAt(0) <= 65279){
    domain = "Specials";
  }
  else if(c.charCodeAt(0) >= 65280 && c.charCodeAt(0) <= 65519){
    domain = "Halfwidth and Fullwidth Forms";
  }
  else if(c.charCodeAt(0) >= 65520 && c.charCodeAt(0) <= 65533){
    domain = "Specials";
  }
  else{
    domain = "NO DOMAIN";
  }
  return domain;
}

function checkURL(url){

  var punny_url;

  //look for https, else assume http
  if(url.search("https") != -1){
    punny_url = punycode.ToUnicode(url.substring(8))
    console.log("URL to Unicode: " + punny_url);
  }
  else{
    punny_url = punycode.ToUnicode(url.substring(7))
    console.log("URL to Unicode: " + punny_url);
  }

  //get domain from first char
  var domain = getDomain(punny_url.charAt(0));

  //if any chars with pos > 1 are in a different domain, warn user
  for (var i = 1; i < punny_url.length; i++){
    //console.log("Domain: " + getDomain(punny_url.charAt(i)));
    if(getDomain(punny_url.charAt(i)) != domain){
      console.log("potentially malicious URL!");
      chrome.runtime.sendMessage({type: 'create-alert', url: punny_url, char: punny_url.charAt(i)}, (response) => {});
      break;
    }
  }

}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message.url);
  checkURL(message.url);
});

function run() {
  console.log('The DOM is loaded');
  chrome.runtime.sendMessage('get-page-url', (response) => {});
}

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
