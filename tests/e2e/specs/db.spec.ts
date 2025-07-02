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
  test.setTimeout(5000)

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
    const firstRow = page.locator('#database-list tr:nth-child(1)') // first row
    await expect(firstRow.locator('td:nth-child(1)')).toBeVisible() // database column
    await expect(firstRow.locator('td:nth-child(2)')).toBeVisible() // package id column
    await expect(firstRow.locator('td:nth-child(3)')).toBeVisible() // package name column
    await expect(firstRow.locator('td:nth-child(4)')).toBeVisible() // root url column
    await expect(firstRow.locator('td:nth-child(5)')).toBeVisible() // actions column
  })

  /**
   * Test 8: Load a database by ID and verify package info
   * This test verifies that a database can be loaded by ID and its package info is displayed correctly
   */
  test('should load a database by ID and verify package info', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First create some standard test databases to ensure we have data
    await page.selectOption('#test-template', 'standard')
    await page.click('#create-test-dbs')
    await page.waitForSelector('#test-db-result.result.success')

    // List databases to get their IDs
    await page.click('#list-databases')
    await page.waitForSelector('#list-db-result.result.success')

    // Get the first database ID from the list
    const firstDbId = await page
      .locator('#database-list tr:nth-child(1) td:nth-child(1)')
      .textContent()
    const dbId = firstDbId ? firstDbId.replace('bc-storage-', '') : ''
    expect(dbId).not.toBe('')

    // Enter the database ID in the input field
    await page.fill('#load-db-id', dbId)

    // Click the Load Database button
    await page.click('#load-database')

    // Wait for the database to be loaded
    await page.waitForSelector('#load-db-result.result.success')

    // Verify that the loaded database container is visible
    const loadedDbContainer = page.locator('#loaded-db-container')
    await expect(loadedDbContainer).toBeVisible()

    // Verify that the loaded database name is displayed
    const loadedDbName = page.locator('#loaded-db-name')
    await expect(loadedDbName).toBeVisible()
    await expect(loadedDbName).not.toHaveText('')

    // Verify that the package details are displayed
    await expect(page.locator('#loaded-pkg-id')).toBeVisible()
    await expect(page.locator('#loaded-pkg-name')).toBeVisible()
    await expect(page.locator('#loaded-pkg-version')).toBeVisible()
    await expect(page.locator('#loaded-pkg-author')).toBeVisible()
    await expect(page.locator('#loaded-pkg-description')).toBeVisible()
  })

  /**
   * Test 9: Search for package by URL pattern and verify results
   * This test verifies that packages can be searched by URL pattern
   */
  test('should search for package by URL pattern and verify results', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First create some standard test databases to ensure we have data
    await page.selectOption('#test-template', 'standard')
    await page.click('#create-test-dbs')
    await page.waitForSelector('#test-db-result.result.success')

    // Enter a URL pattern to search for
    // The standard test databases contain packages with URLs like 'https://example.com/'
    await page.fill('#search-url', 'https://second.com')

    // Click the Search button
    await page.click('#search-packages')

    // Wait for the search result to be displayed with a timeout of 10 seconds
    await page.waitForSelector('#search-results-container', { timeout: 10000 })

    // Verify that the search result contains the expected text
    const searchResult = page.locator('#search-result')
    await expect(searchResult).toContainText('Found')
    await expect(searchResult).toContainText('package')

    // Verify that the search results container is visible
    const searchResultsContainer = page.locator('#search-results-container')
    await expect(searchResultsContainer).toBeVisible()

    // Verify that the search results table has at least one row
    const searchResultsTable = page.locator('#search-results-list tr')
    const rowCount = await searchResultsTable.count()
    expect(rowCount).toBeGreaterThan(0)

    // Verify that the table contains expected columns
    const firstRow = page.locator('#search-results-list tr:nth-child(1)')
    await expect(firstRow.locator('td:nth-child(1)')).toBeVisible() // Database ID column
    await expect(firstRow.locator('td:nth-child(2)')).toHaveText('Second Site Package') // Package name column
    await expect(firstRow.locator('td:nth-child(3)')).toHaveText('https://second.com') // Root URL column
  })

  /**
   * Test 10: Test active package for a given URL
   * This test verifies that the active package can be tested for a given URL
   */
  test('should test active package for a given URL', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First create some standard test databases to ensure we have data
    await page.selectOption('#test-template', 'standard')
    await page.click('#create-test-dbs')
    await page.waitForSelector('#test-db-result.result.success')

    // Enter a URL to test
    // The standard test databases contain packages with URLs like 'https://example.com/'
    await page.fill('#test-url', 'https://example.com/some/page.html')

    // Click the Test Active Package button
    await page.click('#test-active-package')

    // Wait for the active package result to be displayed
    const activePackageResult = page.locator('#search-result')
    await expect(activePackageResult).toBeVisible()
    await expect(activePackageResult).toHaveClass('result success')

    // Verify that the active package result contains the expected text
    await expect(activePackageResult).toContainText('Active package found')
    await expect(activePackageResult).toContainText('Example Site Package')
    await expect(activePackageResult).toContainText('https://example.com')
  })

  /**
   * Test 11: Add a comment to a database
   * This test verifies that comments can be added to a database
   */
  test('should add a comment to a database', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First create a standard test database to ensure we have data
    await page.selectOption('#test-template', 'standard')
    await page.click('#create-test-dbs')
    await page.waitForSelector('#test-db-result.result.success')

    // List databases to get their IDs
    await page.click('#list-databases')
    await page.waitForSelector('#list-db-result.result.success')

    // Get the first database ID from the list (Example Site Package)
    const firstDbId = await page
      .locator('#database-list tr:nth-child(1) td:nth-child(1)')
      .textContent()
    const dbId = firstDbId ? firstDbId.replace('bc-storage-', '') : ''
    expect(dbId).not.toBe('')

    // Enter the database ID in the input field
    await page.fill('#load-db-id', dbId)

    // Click the Load Database button
    await page.click('#load-database')

    // Wait for the database to be loaded
    await page.waitForSelector('#load-db-result.result.success')

    // Verify that the comments container is visible
    const commentsContainer = page.locator('#comments-container')
    await expect(commentsContainer).toBeVisible()

    // Create a test comment
    const testUrl = 'https://example.com/test-page.html'
    const testFeedback = 'This is a test comment for Playwright testing'
    const timestamp = Date.now().toString()

    // Fill in the comment form
    await page.fill('#comment-timestamp', timestamp)
    await page.fill('#comment-xpath', '/html/body/div[1]/p')
    await page.fill('#comment-text', 'Test element text')
    await page.fill('#comment-title', 'Test Page Title')
    await page.fill('#comment-url', testUrl)
    await page.fill('#comment-feedback', testFeedback)

    // Submit the comment form
    await page.click('#add-comment')

    // Wait for the comment result to be displayed
    const commentResult = page.locator('#comment-result')
    await expect(commentResult).toBeVisible()
    await expect(commentResult).toHaveClass('result success')
    await expect(commentResult).toContainText('Comment added successfully')

    // Verify the comment is displayed in the comments list
    const commentsList = page.locator('#comments-list-container')
    await expect(commentsList).toBeVisible()

    // Check that the comment appears in the list with the correct URL and feedback
    const commentRow = page.locator('#comments-list tr')
    await expect(commentRow).toBeVisible()
    await expect(commentRow.locator('td:nth-child(1)')).toContainText(testUrl)
    await expect(commentRow.locator('td:nth-child(2)')).toContainText(testFeedback)
  })
})
