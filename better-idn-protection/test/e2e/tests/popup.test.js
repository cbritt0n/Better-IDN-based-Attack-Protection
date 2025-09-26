// E2E tests for extension popup interface
const { test, expect } = require('@playwright/test');
const path = require('path');

// Extension path
const extensionPath = path.resolve(__dirname, '../../');

test.describe('Extension Popup Interface', () => {
  let context;
  let extensionId;

  test.beforeAll(async ({ browser }) => {
    // Load extension
    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    // Get extension ID
    const backgroundPage = await context.waitForEvent('page', page =>
      page.url().includes('chrome-extension://')
    );
    extensionId = backgroundPage.url().split('/')[2];
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('popup loads successfully', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();

    await popupPage.goto(popupUrl);

    // Check basic elements are present
    await expect(popupPage.locator('#domain')).toBeVisible();
    await expect(popupPage.locator('#add-wl')).toBeVisible();
    await expect(popupPage.locator('#remove-wl')).toBeVisible();

    await popupPage.close();
  });

  test('popup displays domain information', async () => {
    // First navigate to a test page
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');
    await testPage.waitForTimeout(500);

    // Open popup with domain parameter
    const popupUrl = `chrome-extension://${extensionId}/popup.html?domain=example.com`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    // Check that domain is displayed
    const domainElement = popupPage.locator('#domain');
    await expect(domainElement).toHaveText('example.com');

    await testPage.close();
    await popupPage.close();
  });

  test('whitelist buttons function correctly', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html?domain=test.com`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    // Wait for popup to initialize
    await popupPage.waitForTimeout(1000);

    // Initially, add button should be enabled, remove should be disabled
    await expect(popupPage.locator('#add-wl')).toBeEnabled();
    await expect(popupPage.locator('#remove-wl')).toBeDisabled();

    // Click add to whitelist
    await popupPage.click('#add-wl');
    await popupPage.waitForTimeout(500);

    // After adding, add should be disabled, remove should be enabled
    await expect(popupPage.locator('#add-wl')).toBeDisabled();
    await expect(popupPage.locator('#remove-wl')).toBeEnabled();

    // Click remove from whitelist
    await popupPage.click('#remove-wl');
    await popupPage.waitForTimeout(500);

    // Back to initial state
    await expect(popupPage.locator('#add-wl')).toBeEnabled();
    await expect(popupPage.locator('#remove-wl')).toBeDisabled();

    await popupPage.close();
  });

  test('clear whitelist button works', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html?domain=test.com`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    await popupPage.waitForTimeout(1000);

    // Add domain to whitelist first
    await popupPage.click('#add-wl');
    await popupPage.waitForTimeout(500);

    // Clear whitelist
    await popupPage.click('#clear-wl');
    await popupPage.waitForTimeout(500);

    // Add button should be enabled again
    await expect(popupPage.locator('#add-wl')).toBeEnabled();
    await expect(popupPage.locator('#remove-wl')).toBeDisabled();

    await popupPage.close();
  });

  test('whitelist display updates correctly', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html?domain=example.org`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    await popupPage.waitForTimeout(1000);

    // Add domain to whitelist
    await popupPage.click('#add-wl');
    await popupPage.waitForTimeout(500);

    // Check that whitelist list is updated
    const whitelistList = popupPage.locator('#whitelist-list');
    await expect(whitelistList).toBeVisible();

    // Should contain the added domain
    const listItems = whitelistList.locator('li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);

    await popupPage.close();
  });

  test('popup handles empty domain gracefully', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    await popupPage.waitForTimeout(1000);

    // Both buttons should be disabled when no domain
    await expect(popupPage.locator('#add-wl')).toBeDisabled();
    await expect(popupPage.locator('#remove-wl')).toBeDisabled();

    await popupPage.close();
  });

  test('popup responds to extension messages', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    // Simulate sending a message to the popup
    await popupPage.evaluate(() => {
      if (window.chrome && window.chrome.runtime) {
        chrome.runtime.sendMessage({
          type: 'popup-alert',
          url: 'https://suspicious.com',
          char: 'α',
          block: 'Greek'
        });
      }
    });

    await popupPage.waitForTimeout(500);

    // Check if domain was updated
    const domainElement = popupPage.locator('#domain');
    const domainText = await domainElement.textContent();
    expect(domainText).toContain('suspicious.com');

    await popupPage.close();
  });

  test('popup styling and layout', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html?domain=test.com`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    await popupPage.waitForTimeout(1000);

    // Check that key elements are visible and properly sized
    const body = popupPage.locator('body');
    const bodyBox = await body.boundingBox();

    // Popup should have reasonable dimensions
    expect(bodyBox.width).toBeGreaterThan(200);
    expect(bodyBox.width).toBeLessThan(600);
    expect(bodyBox.height).toBeGreaterThan(100);

    // All main elements should be visible
    await expect(popupPage.locator('h3')).toBeVisible();
    await expect(popupPage.locator('#domain')).toBeVisible();
    await expect(popupPage.locator('h4')).toBeVisible();

    await popupPage.close();
  });

  test('popup accessibility features', async () => {
    const popupUrl = `chrome-extension://${extensionId}/popup.html?domain=test.com`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    await popupPage.waitForTimeout(1000);

    // Check that buttons have proper text content
    const addButton = popupPage.locator('#add-wl');
    const removeButton = popupPage.locator('#remove-wl');
    const clearButton = popupPage.locator('#clear-wl');

    await expect(addButton).toHaveText('Add to Whitelist');
    await expect(removeButton).toHaveText('Remove from Whitelist');
    await expect(clearButton).toHaveText('Clear Whitelist');

    // Check keyboard navigation
    await addButton.focus();
    const focusedElement = await popupPage.evaluate(() => document.activeElement.id);
    expect(focusedElement).toBe('add-wl');

    await popupPage.close();
  });

  test('popup handles long domain names', async () => {
    const longDomain = 'very-long-subdomain-name-that-might-cause-layout-issues.example.com';
    const popupUrl = `chrome-extension://${extensionId}/popup.html?domain=${longDomain}`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl);

    await popupPage.waitForTimeout(1000);

    // Domain should be displayed (might be truncated but visible)
    const domainElement = popupPage.locator('#domain');
    await expect(domainElement).toBeVisible();

    const domainText = await domainElement.textContent();
    expect(domainText).toContain('example.com');

    await popupPage.close();
  });
});
