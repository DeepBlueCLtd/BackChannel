// @ts-check
import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import handler from 'serve-handler'

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Go up three levels to reach the project root (from tests/e2e/specs to project root)
const rootDir = path.join(__dirname, '../../..')

/**
 * Tests for the DatabaseService functionality using the db-test.html UI
 */
test.describe('DatabaseService', () => {
  // Set a longer timeout for all tests in this file
  test.setTimeout(2000)

  // Setup a local server for testing
  let server
  let serverUrl

  test.beforeAll(async () => {
    // Create a simple HTTP server for testing
    server = http.createServer((req, res) => {
      return handler(req, res, {
        public: rootDir,
      })
    })

    // Start the server on a random available port
    /** @type {Promise<void>} */
    const serverPromise = new Promise(resolve => {
      server.listen(0, () => {
        const address = server.address()
        const port = address.port
        serverUrl = `http://localhost:${port}`
        // Skip logging to avoid lint errors
        resolve(0)
      })
    })
    await serverPromise
  })

  test.afterAll(async () => {
    // Close the server after tests
    await new Promise(resolve => server.close(resolve))
  })

  /**
   * Test 1: Check IndexedDB browser support
   * This test verifies that the browser supports IndexedDB and the UI correctly reports this
   */
  test('should correctly detect IndexedDB browser support', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // Click the "Check Browser Support" button
    await page.click('#check-support')

    // Wait for the result to be displayed
    const resultElement = page.locator('#support-result')
    await expect(resultElement).toBeVisible()

    // Check that the result indicates support
    await expect(resultElement).toHaveClass('result success')
    await expect(resultElement).toContainText('IndexedDB is supported.')
  })

  /**
   * Test 2: Mock unsupported browser
   * This test verifies that the UI attempts to handle the case when IndexedDB is not supported
   * Note: Due to browser security restrictions, we can only verify the attempt to mock,
   * not the actual disabling of IndexedDB
   */
  test('should attempt to mock unsupported browser', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // Click the "Mock Unsupported Browser" button
    await page.click('#mock-unsupported')

    // Wait for the mock result to be displayed
    const mockResultElement = page.locator('#mock-result')
    await expect(mockResultElement).toBeVisible()
    await expect(mockResultElement).toHaveClass('result error')
    await expect(mockResultElement).toContainText('Error mocking unsupported browser')
  })

  /**
   * Test 3: Restore normal IndexedDB support
   * This test verifies that the UI can restore normal IndexedDB support after mocking
   */
  test('should restore normal IndexedDB support', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First mock unsupported browser
    await page.click('#mock-unsupported')

    // Then restore support
    await page.click('#restore-support')

    // Wait for the restore result to be displayed
    const restoreResultElement = page.locator('#mock-result')
    await expect(restoreResultElement).toBeVisible()

    // Check browser support again
    await page.click('#check-support')

    // Wait for the result to be displayed
    const resultElement = page.locator('#support-result')
    await expect(resultElement).toBeVisible()

    // Check that the result indicates support is restored
    await expect(resultElement).toHaveClass('result success')
    await expect(resultElement).toContainText('IndexedDB is supported')
  })

  /**
   * Test 4: Initialize a database
   * This test verifies that a database can be initialized successfully
   */
  test('should initialize a database successfully', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // Click the "Initialize Database" button
    await page.click('#init-db')

    // Wait for the initialization result to be displayed
    const initResultElement = page.locator('#init-result')
    await expect(initResultElement).toBeVisible()

    // Check that the result indicates successful initialization
    await expect(initResultElement).toHaveClass('result success')
    await expect(initResultElement).toContainText("Database 'Test Database' initialized successfully")
  })
  
  /**
   * Test 5: Create standard test databases
   * This test verifies that standard test databases can be created successfully
   */
  test('should create standard test databases successfully', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')
    
    // Select the standard test databases option
    await page.selectOption('#test-template', 'standard')
    
    // Click the "Create Test Databases" button
    await page.click('#create-test-dbs')
    
    // Wait for the creation result to be displayed
    const testDbResultElement = page.locator('#test-db-result')
    await expect(testDbResultElement).toBeVisible()
    
    // Check that the result indicates successful creation
    await expect(testDbResultElement).toHaveClass('result success')
    await expect(testDbResultElement).toContainText('Created 3/3 databases')
    
    // Verify the databases are listed
    await page.click('#list-databases')
    
    // Wait for the database list to be displayed
    const dbListContainer = page.locator('#database-list-container')
    await expect(dbListContainer).toBeVisible()
    
    // Check that we have at least 3 rows in the database table (plus header)
    const dbRows = page.locator('#database-list tr')
    await expect(dbRows).toHaveCount(3)
  })
})
