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
  // test.setTimeout(10000)

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
    await expect(initResultElement).toContainText(
      "Database 'Test Database' initialized successfully"
    )
  })

  /**
   * Test 5: Create standard test databases
   * This test verifies that standard test databases can be created successfully
   */
  test('should create standard test databases successfully', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First clear any existing test databases
    await page.click('#clear-test-dbs')

    // introduce one second delay
    await page.waitForTimeout(200)

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

  /**
   * Test 6: Create many test databases
   * This test verifies that many test databases can be created successfully
   */
  test('should create many test databases successfully', async ({ page }) => {
    // Increase test timeout to 10 seconds as database operations can take time
    test.setTimeout(10000)
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First clear any existing test databases
    await page.click('#clear-test-dbs')

    // Wait for the clear operation to complete
    // The result element will have class 'result success' when databases are deleted
    await page.waitForSelector('#test-db-result')

    // Select the many test databases option
    await page.selectOption('#test-template', 'many')

    // Click the "Create Test Databases" button
    await page.click('#create-test-dbs')

    // Wait for the creation result to be displayed
    const testDbResultElement = page.locator('#test-db-result')
    await expect(testDbResultElement).toBeVisible()

    // Check that the result indicates successful creation
    await expect(testDbResultElement).toHaveClass('result success')
    await expect(testDbResultElement).toContainText('Created 10/10 databases')

    // Verify the databases are listed
    await page.click('#list-databases')

    // Wait for the database list to be displayed
    const dbListContainer = page.locator('#database-list-container')
    await expect(dbListContainer).toBeVisible()

    // Check that we have at least 10 rows in the database table
    const dbRows = page.locator('#database-list tr')
    await expect(dbRows).toHaveCount(10)
  })
  
  /**
   * Test 7: List all databases and verify table population
   * This test verifies that all databases can be listed and the table is populated correctly
   */
  test('should list all databases and populate table correctly', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')
    
    // First create some standard test databases to ensure we have data
    await page.selectOption('#test-template', 'standard')
    await page.click('#create-test-dbs')
    await page.waitForSelector('#test-db-result.result.success')
    
    // Click the "List Databases" button
    await page.click('#list-databases')
    
    // Wait for the list result to be displayed
    const listResultElement = page.locator('#list-db-result')
    await expect(listResultElement).toBeVisible()
    await expect(listResultElement).toHaveClass('result success')
    
    // Verify the database list container is visible
    const dbListContainer = page.locator('#database-list-container')
    await expect(dbListContainer).toBeVisible()
    
    // Check that the database table has headers
    const tableHeaders = page.locator('#database-table thead th')
    await expect(tableHeaders).toHaveCount(5) // Database Name, Package ID, Package Name, Root URL, Actions
    
    // Check that we have exactly 3 rows in the database table (from standard test databases)
    const dbRows = page.locator('#database-list tr')
    const rowCount = await dbRows.count()
    expect(rowCount).toBe(3)
    
    // Verify that the table contains expected columns
    const firstRow = page.locator('#database-list tr:nth-child(1)') // Skip header row
    await expect(firstRow.locator('td:nth-child(1)')).toBeVisible() // ID column
    await expect(firstRow.locator('td:nth-child(2)')).toBeVisible() // Name column
    await expect(firstRow.locator('td:nth-child(3)')).toBeVisible() // Version column
    await expect(firstRow.locator('td:nth-child(4)')).toBeVisible() // Actions column
  })
})
