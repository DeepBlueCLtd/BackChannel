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

  test('should add and retrieve a package', async ({ page }) => {
    // Load the test page and initialize the database
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Set package data
    await page.fill('#package-id', 'test-pkg-001');
    await page.fill('#package-name', 'Test Package');
    await page.fill('#package-version', '1.0.0');
    await page.fill('#package-author', 'Playwright Test');
    await page.fill('#package-description', 'Package created by automated test');
    
    // Add the package
    await page.click('#add-package');
    await expect(page.locator('#package-result')).toContainText('Package added successfully', { timeout: 5000 });
    
    // Get the package
    await page.click('#get-package');
    await expect(page.locator('#package-result')).toContainText('Package found', { timeout: 5000 });
    
    // Verify package data
    const resultText = await page.locator('#package-result').textContent();
    expect(resultText).toContain('test-pkg-001');
    expect(resultText).toContain('Test Package');
    expect(resultText).toContain('1.0.0');
    expect(resultText).toContain('Playwright Test');
    expect(resultText).toContain('Package created by automated test');
  });

  test('should update a package', async ({ page }) => {
    // Load the test page and initialize the database
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Set package data
    await page.fill('#package-id', 'test-pkg-002');
    await page.fill('#package-name', 'Package to Update');
    await page.fill('#package-version', '1.0.0');
    await page.fill('#package-author', 'Original Author');
    await page.fill('#package-description', 'Original description');
    
    // Add the package
    await page.click('#add-package');
    await expect(page.locator('#package-result')).toContainText('Package added successfully', { timeout: 5000 });
    
    // Update package data
    await page.fill('#package-name', 'Updated Package');
    await page.fill('#package-version', '1.0.1');
    await page.fill('#package-author', 'New Author');
    
    // Update the package
    await page.click('#update-package');
    await expect(page.locator('#package-result')).toContainText('Package updated successfully', { timeout: 5000 });
    
    // Get the updated package
    await page.click('#get-package');
    await expect(page.locator('#package-result')).toContainText('Package found', { timeout: 5000 });
    
    // Verify updated package data - wait for the result to contain the package ID
    await expect(page.locator('#package-result')).toContainText('test-pkg-002', { timeout: 5000 });
    const resultText = await page.locator('#package-result').textContent();
    expect(resultText).toContain('Updated Package');
    expect(resultText).toContain('1.0.1');
    expect(resultText).toContain('New Author');
    expect(resultText).toContain('Original description (Updated)');
  });

  test('should delete a package', async ({ page }) => {
    // Load the test page and initialize the database
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Set package data
    await page.fill('#package-id', 'test-pkg-003');
    await page.fill('#package-name', 'Package to Delete');
    
    // Add the package
    await page.click('#add-package');
    await expect(page.locator('#package-result')).toContainText('Package added successfully', { timeout: 5000 });
    
    // Verify package exists
    await page.click('#get-package');
    await expect(page.locator('#package-result')).toContainText('Package found', { timeout: 5000 });
    
    // Delete the package
    await page.click('#delete-package');
    await expect(page.locator('#package-result')).toContainText('deleted successfully', { timeout: 5000 });
    
    // Try to get the deleted package
    await page.click('#get-package');
    await expect(page.locator('#package-result')).toContainText('not found', { timeout: 5000 });
  });

  test('should add and retrieve a comment', async ({ page }) => {
    // Load the test page and initialize the database
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Set comment data
    const timestamp = Date.now();
    await page.fill('#comment-timestamp', timestamp.toString());
    await page.fill('#comment-xpath', '/html/body/div/p[2]');
    await page.fill('#comment-text', 'Test paragraph');
    await page.fill('#comment-feedback', 'This is a test comment from Playwright');
    await page.fill('#comment-url', '/test-document.html');
    await page.fill('#comment-title', 'Test Document Title');
    
    // Add the comment
    await page.click('#add-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment added successfully', { timeout: 5000 });
    
    // Get the comment
    await page.click('#get-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment found', { timeout: 5000 });
    
    // Verify comment data
    const resultText = await page.locator('#comment-result').textContent();
    expect(resultText).toContain('Test paragraph');
    expect(resultText).toContain('This is a test comment from Playwright');
    expect(resultText).toContain('/test-document.html');
    expect(resultText).toContain('Test Document Title');
    expect(resultText).toContain('PT');
  });

  test('should update a comment', async ({ page }) => {
    // Load the test page and initialize the database
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Set comment data
    const timestamp = Date.now();
    await page.fill('#comment-timestamp', timestamp.toString());
    await page.fill('#comment-xpath', '/html/body/div/p[3]');
    await page.fill('#comment-text', 'Original text');
    await page.fill('#comment-feedback', 'Original feedback');
    await page.fill('#comment-initials', 'OG');
    
    // Add the comment
    await page.click('#add-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment added successfully', { timeout: 5000 });
    
    // Update comment data
    await page.fill('#comment-feedback', 'Updated feedback');
    await page.fill('#comment-initials', 'UP');
    
    // Update the comment
    await page.click('#update-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment updated successfully', { timeout: 5000 });
    
    // Get the updated comment
    await page.click('#get-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment found', { timeout: 5000 });
    
    // Verify updated comment data - wait for the result to contain the element text
    await expect(page.locator('#comment-result')).toContainText('Original text', { timeout: 5000 });
    const resultText = await page.locator('#comment-result').textContent();
    expect(resultText).toContain('Updated feedback (Updated)');
    expect(resultText).toContain('UP');
  });

  test('should delete a comment', async ({ page }) => {
    // Load the test page and initialize the database
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Set comment data
    const timestamp = Date.now();
    await page.fill('#comment-timestamp', timestamp.toString());
    await page.fill('#comment-feedback', 'Comment to delete');
    
    // Add the comment
    await page.click('#add-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment added successfully', { timeout: 5000 });
    
    // Verify comment exists
    await page.click('#get-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment found', { timeout: 5000 });
    
    // Delete the comment
    await page.click('#delete-comment');
    await expect(page.locator('#comment-result')).toContainText('deleted successfully', { timeout: 5000 });
    
    // Try to get the deleted comment
    await page.click('#get-comment');
    await expect(page.locator('#comment-result')).toContainText('not found', { timeout: 5000 });
  });

  test('should get all comments', async ({ page }) => {
    // Load the test page and initialize the database
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Clear any existing comments by reinitializing the database
    await page.click('#init-db');
    await expect(page.locator('#init-result')).toContainText('Database initialized', { timeout: 5000 });
    
    // Add first comment
    const timestamp1 = Date.now();
    await page.fill('#comment-timestamp', timestamp1.toString());
    await page.fill('#comment-feedback', 'First test comment');
    await page.fill('#comment-initials', 'C1');
    await page.click('#add-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment added successfully', { timeout: 5000 });
    
    // Add second comment with a different timestamp
    const timestamp2 = Date.now() + 1000;
    await page.fill('#comment-timestamp', timestamp2.toString());
    await page.fill('#comment-feedback', 'Second test comment');
    await page.fill('#comment-initials', 'C2');
    await page.click('#add-comment');
    await expect(page.locator('#comment-result')).toContainText('Comment added successfully', { timeout: 5000 });
    
    // Get all comments
    await page.click('#get-all-comments');
    
    // Wait for the result to show comments were found
    await expect(page.locator('#comment-result')).toContainText('Found', { timeout: 5000 });
    
    // Verify both comments are returned
    const resultText = await page.locator('#comment-result').textContent();
    
    // Check that we have at least one comment
    expect(resultText).toContain('Found');
    expect(resultText).toContain('comments');
    
    // Check for the specific comment content
    expect(resultText).toContain('First test comment');
    expect(resultText).toContain('Second test comment');
    expect(resultText).toContain('C1');
    expect(resultText).toContain('C2');
  });

  test('should check browser support', async ({ page }) => {
    // Load the test page
    await page.goto(`${serverUrl}/tests/db-test.html`);
    await page.waitForLoadState('networkidle');
    
    // Check browser support
    await page.click('#check-support');
    
    // Verify support result
    await expect(page.locator('#support-result')).toContainText('IndexedDB is supported', { timeout: 5000 });
  });
});
