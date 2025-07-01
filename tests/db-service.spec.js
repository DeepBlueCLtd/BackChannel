// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import handler from 'serve-handler';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

test.describe('DatabaseService Tests', () => {
  // Set a longer timeout for all tests in this file
  test.setTimeout(30000);
  
  // Setup a local server for testing
  let server;
  let serverUrl;
  
  test.beforeAll(async () => {
    // Create a simple HTTP server for testing
    server = http.createServer((req, res) => {
      return handler(req, res, {
        public: rootDir
      });
    });
    
    // Start the server on a random available port
    /** @type {Promise<void>} */
    const serverPromise = new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        const port = address.port;
        serverUrl = `http://localhost:${port}`;
        // Skip logging to avoid lint errors
        resolve();
      });
    });
    await serverPromise;
  });
  
  test.afterAll(async () => {
    // Close the server after tests
    await new Promise(resolve => server.close(resolve));
  });
  
  test('should verify test page loads correctly', async ({ page }) => {
    // Load the test page from the local server
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    
    // Verify that the page title is correct
    const title = await page.title();
    expect(title).toBe('DatabaseService Test');
    
    // Verify that key elements are present
    await expect(page.locator('h1')).toContainText('DatabaseService Test');
    await expect(page.locator('#init-db')).toBeVisible();
    await expect(page.locator('#init-result')).toBeVisible();
  });
  
  test('should initialize the database', async ({ page }) => {
    // Load the test page from the local server
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    
    // Click the initialize database button
    await page.click('#init-db');
    
    // Wait for and verify the initialization result
    await page.locator('#init-result').waitFor({ state: 'visible' });
    
    // Wait for the result text to contain the expected message
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Verify the result text
    const resultText = await page.locator('#init-result').textContent();
    expect(resultText).toContain('Database initialized successfully');
  });
});
