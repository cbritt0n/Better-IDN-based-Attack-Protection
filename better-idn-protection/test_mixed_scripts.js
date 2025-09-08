// Lightweight tests for hasMixedScripts

const UNICODE_BLOCKS = [
  { name: 'Basic Latin', start: 0, end: 127 },
  { name: 'Cyrillic', start: 1024, end: 1279 },
  { name: 'Greek', start: 880, end: 1023 },
  { name: 'Hangul Syllables', start: 44032, end: 55203 },
  { name: 'CJK Unified Ideographs', start: 19968, end: 40959 },
  // add a few more ranges used in tests
];

function getUnicodeBlock(char) {
  const code = char.codePointAt(0);
  for (const block of UNICODE_BLOCKS) {
    if (code >= block.start && code <= block.end) return block.name;
  }
  return 'Unknown';
}

function hasMixedScripts(domain) {
  const blocks = new Set();
  let lastChar = null;
  for (const char of domain) {
    if (char === '-' || char === '.') continue;
    const block = getUnicodeBlock(char);
    blocks.add(block);
    lastChar = char;
    if (blocks.size > 1) return { mixed: true, block, char: lastChar };
  }
  return { mixed: false };
}

function assertEqual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    console.error('FAIL:', msg, '\n  expected:', b, '\n  got:     ', a);
    process.exitCode = 1;
  } else {
    console.log('PASS:', msg);
  }
}

// Samples and edge cases
const latin = 'example';
const mixedGreekLatin = 'e\u03B1mple'; // contains Greek alpha (U+03B1)
const russian = '\u043F\u0440\u0438\u0432\u0435\u0442'; // 'привет' Cyrillic
const cjkLatin = 'e\u4E2D'; // 'e' + Chinese char
const dotsAndHyphens = 'e-x.a-mp\u03B1';
const onlyPunct = '-.-.---';
const longMixed = 'ex' + '\u4E2D'.repeat(10) + 'am';

assertEqual(hasMixedScripts(latin), { mixed: false }, 'pure Latin domain');
assertEqual(hasMixedScripts(russian), { mixed: false }, 'pure Cyrillic domain');
assertEqual(hasMixedScripts(mixedGreekLatin).mixed, true, 'mixed Greek/Latin');
assertEqual(hasMixedScripts(cjkLatin).mixed, true, 'mixed CJK/Latin');
assertEqual(hasMixedScripts(dotsAndHyphens).mixed, true, 'dots and hyphens with mixed Greek');
assertEqual(hasMixedScripts(onlyPunct), { mixed: false }, 'only punctuation treated as not mixed');
assertEqual(hasMixedScripts(longMixed).mixed, true, 'long mixed CJK/Latin');

console.log('Tests complete.');
