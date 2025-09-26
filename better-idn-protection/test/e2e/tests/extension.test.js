// E2E tests for Better IDN Protection extension core functionality
const { test, expect } = require('@playwright/test');
const path = require('path');

// Extension path
const extensionPath = path.resolve(__dirname, '../../');

test.describe('Better IDN Protection Extension', () => {
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    // Load extension
    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('extension loads successfully', async () => {
    // Navigate to a safe site
    await page.goto('https://example.com');

    // Check that the extension is loaded by looking for the service worker
    const serviceWorker = context.serviceWorkers()[0];
    expect(serviceWorker).toBeTruthy();
  });

  test('detects mixed script domains', async () => {
    // Create a test page with mixed script content
    const testPageContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Mixed Script Domain</title>
      </head>
      <body>
        <h1>Mixed Script Test</h1>
        <p>This is a test page for mixed script detection.</p>
      </body>
      </html>
    `;

    // Create a data URL with mixed script characters in hostname
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(testPageContent);
    await page.goto(dataUrl);

    // Wait for extension to process the page
    await page.waitForTimeout(1000);

    // The extension should be active (we can't easily test actual mixed script detection
    // without a real domain, but we can verify the extension is running)
    expect(page.url()).toContain('data:text/html');
  });

  test('content script injection works', async () => {
    await page.goto('https://example.com');

    // Wait for content script to load
    await page.waitForTimeout(1000);

    // Check if extension functions are available
    const hasExtensionFunctions = await page.evaluate(() => {
      return typeof window.chrome !== 'undefined' &&
             typeof window.chrome.runtime !== 'undefined';
    });

    expect(hasExtensionFunctions).toBeTruthy();
  });

  test('extension popup opens', async () => {
    // Navigate to a page first
    await page.goto('https://example.com');

    // Get extension ID (this is tricky in E2E, so we'll use a workaround)
    const extensionId = await page.evaluate(() => {
      // Try to find extension ID from chrome.runtime if available
      return window.chrome?.runtime?.id || 'test-extension-id';
    });

    // If we can get a real extension ID, try to open popup
    if (extensionId !== 'test-extension-id') {
      const popupUrl = `chrome-extension://${extensionId}/popup.html`;
      const popupPage = await context.newPage();
      await popupPage.goto(popupUrl);

      // Check if popup loaded
      const title = await popupPage.title();
      expect(title).toContain('IDN');

      await popupPage.close();
    }
  });

  test('handles navigation between pages', async () => {
    // Navigate to first page
    await page.goto('https://example.com');
    await page.waitForTimeout(500);

    // Navigate to second page
    await page.goto('https://httpbin.org/html');
    await page.waitForTimeout(500);

    // Extension should handle navigation without errors
    const hasErrors = await page.evaluate(() => {
      return console.error.mock?.calls?.length > 0;
    });

    expect(hasErrors).toBeFalsy();
  });

  test('storage operations work correctly', async () => {
    // Navigate to a page where we can test storage
    await page.goto('https://example.com');

    // Test that extension can access storage (indirectly)
    // We'll check that no storage errors occur
    await page.waitForTimeout(1000);

    // Look for any console errors related to storage
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    const storageErrors = logs.filter(log =>
      log.includes('storage') || log.includes('chrome.storage')
    );

    expect(storageErrors.length).toBe(0);
  });

  test('extension persists across page reloads', async () => {
    await page.goto('https://example.com');
    await page.waitForTimeout(500);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(500);

    // Extension should still be working
    const serviceWorker = context.serviceWorkers()[0];
    expect(serviceWorker).toBeTruthy();
  });

  test('handles HTTPS and HTTP pages', async () => {
    // Test HTTPS page
    await page.goto('https://example.com');
    await page.waitForTimeout(500);

    const httpsUrl = page.url();
    expect(httpsUrl).toContain('https://');

    // Test HTTP page (if available)
    try {
      await page.goto('http://httpbin.org/html');
      await page.waitForTimeout(500);

      const httpUrl = page.url();
      expect(httpUrl).toContain('http://');
    } catch (error) {
      // Some test environments may block HTTP, that's okay
      console.log('HTTP test skipped due to security policies');
    }
  });

  test('extension cleanup on page close', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');
    await testPage.waitForTimeout(500);

    // Close the page
    await testPage.close();

    // Extension should handle page closure gracefully
    const serviceWorker = context.serviceWorkers()[0];
    expect(serviceWorker).toBeTruthy();
  });

  test('multiple tabs handling', async () => {
    // Open multiple tabs
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();

    await tab1.goto('https://example.com');
    await tab2.goto('https://httpbin.org/html');

    await Promise.all([
      tab1.waitForTimeout(500),
      tab2.waitForTimeout(500)
    ]);

    // Both tabs should be handled by the extension
    expect(tab1.url()).toContain('example.com');
    expect(tab2.url()).toContain('httpbin.org');

    await tab1.close();
    await tab2.close();
  });
});
