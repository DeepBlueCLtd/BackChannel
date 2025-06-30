// @ts-check
/* eslint-env browser, node */
/* global console */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('BackChannel plugin integrates properly into a page', async ({ page }) => {
  // Path to the test HTML file
  const testHtmlPath = path.resolve(__dirname, '../test/plugin-test.html');
  
  // Check if the plugin file exists
  const pluginPath = path.resolve(__dirname, '../dist/backchannel.js');
  if (!fs.existsSync(pluginPath)) {
    console.warn('Plugin file not found. Run yarn build-plugin first.');
    test.skip();
    return;
  }
  
  // Load the test HTML file
  await page.goto(`file://${testHtmlPath}`);
  
  // Check if the page loaded
  const title = await page.title();
  expect(title).toBe('BackChannel Plugin Test');
  
  // Click the init button to initialize the plugin
  await page.click('#test-init');
  
  // Wait for status to update
  await page.waitForSelector('#status.success');
  
  // Check if BackChannel was initialized by looking for the launch button
  const launchButton = await page.locator('#backchannel-launch-button');
  await expect(launchButton).toBeVisible();
  
  // Verify the sidebar is not visible initially
  const sidebar = await page.locator('#backchannel-sidebar');
  await expect(sidebar).not.toBeVisible();
  
  // Verify that clicking the launch button shows the sidebar
  await launchButton.click();
  await expect(sidebar).toBeVisible();
  
  // Test basic functionality - entering select mode
  const provideFeedbackButton = await page.locator('#backchannel-provide-feedback');
  await expect(provideFeedbackButton).toBeVisible();
  await provideFeedbackButton.click();
  
  // Verify we entered select mode by checking for cancel button
  const cancelButton = await page.locator('#backchannel-cancel-select-mode');
  await expect(cancelButton).toBeVisible();
});
