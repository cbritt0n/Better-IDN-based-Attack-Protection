module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    webextensions: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Jest globals
    describe: 'readonly',
    test: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly',

    // Chrome Extension globals
    chrome: 'readonly',

    // Punycode library (from punycode.js)
    punycode: 'readonly',

    // App-specific globals from app.js
    getUnicodeBlock: 'readonly',
    hasMixedScripts: 'readonly',
    extractDomain: 'readonly',
    isWhitelisted: 'readonly',
    checkURL: 'readonly',
    run: 'readonly',

    // Background script globals from bg.js
    updateLastActiveTab: 'readonly',
    lastActiveTabUrl: 'writable',

    // Popup script globals from popup.js
    setStatus: 'readonly',
    currentDomain: 'writable',
    setCurrentDomain: 'readonly',
    toggleWarning: 'readonly',
    isDomainWhitelisted: 'readonly',
    updateWhitelistButtons: 'readonly',
    addToWhitelist: 'readonly',
    removeFromWhitelist: 'readonly',
    renderWhitelist: 'readonly'
  },
  rules: {
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': 'off', // Allow console statements for debugging
    'no-debugger': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'indent': ['error', 2],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error'
  },
  overrides: [
    {
      files: ['test/**/*.js', '*.test.js'],
      env: {
        jest: true
      },
      globals: {
        // Additional test-specific globals
        mockDOMRect: 'readonly',
        mockGetComputedStyle: 'readonly'
      }
    },
    {
      files: ['e2e/**/*.js'],
      env: {
        node: true
      },
      globals: {
        // Playwright globals
        page: 'readonly',
        browser: 'readonly',
        context: 'readonly'
      }
    }
  ]
};
