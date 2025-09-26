// Jest setup file for testing environment

// Mock Chrome APIs for testing
const mockChrome = {
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      // Simulate successful responses
      if (callback) {
        if (message.type === 'get-page-url' || message.type === 'get-active-tab') {
          callback({ url: 'https://example.com' });
        } else {
          callback({});
        }
      }
      return Promise.resolve();
    }),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    lastError: null,
    getURL: jest.fn((path) => `chrome-extension://test/${path}`)
  },
  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
        if (callback) callback({ whitelist: [] });
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
      })
    }
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      if (callback) callback([{ url: 'https://example.com', id: 1 }]);
    }),
    get: jest.fn((tabId, callback) => {
      if (callback) callback({ url: 'https://example.com', id: tabId });
    }),
    onActivated: {
      addListener: jest.fn()
    }
  },
  windows: {
    create: jest.fn((options, callback) => {
      if (callback) callback({ id: 1 });
    }),
    onFocusChanged: {
      addListener: jest.fn()
    },
    WINDOW_ID_NONE: -1
  },
  notifications: {
    create: jest.fn((options, callback) => {
      if (callback) callback('test-notification-id');
    })
  }
};

// Make chrome API available globally
global.chrome = mockChrome;

// Mock fetch for loading JSON files
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { name: 'Basic Latin', start: 0, end: 127 },
      { name: 'Cyrillic', start: 1024, end: 1279 },
      { name: 'Greek', start: 880, end: 1023 }
    ])
  })
);

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now())
};

// Mock URL constructor for consistent behavior
global.URL = jest.fn().mockImplementation((url) => {
  if (url === 'https://example.com/path') {
    return { hostname: 'example.com' };
  }
  if (url === 'http://sub.example.com') {
    return { hostname: 'sub.example.com' };
  }
  throw new Error('Invalid URL');
});

// Mock document and DOM APIs
global.document = {
  addEventListener: jest.fn(),
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  createElement: jest.fn()
};

global.window = {
  location: {
    search: '',
    href: 'chrome-extension://test/popup.html'
  }
};

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
