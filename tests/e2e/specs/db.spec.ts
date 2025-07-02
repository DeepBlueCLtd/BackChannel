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
    await page.fill('#comment-timestamp', timestamp.toString())
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

  /**
   * Test 12: Update/edit a comment in a database
   * This test verifies that comments can be edited and updated
   */
  test('should update/edit a comment in a database', async ({ page }) => {
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

    // Create a test comment first
    const testUrl = 'https://example.com/test-page.html'
    const initialFeedback = 'Initial comment for testing'
    const timestamp = Date.now().toString()

    // Fill in the comment form
    await page.fill('#comment-timestamp', timestamp.toString())
    await page.fill('#comment-xpath', '/html/body/div[1]/p')
    await page.fill('#comment-text', 'Test element text')
    await page.fill('#comment-title', 'Test Page Title')
    await page.fill('#comment-url', testUrl)
    await page.fill('#comment-feedback', initialFeedback)

    // Submit the comment form
    await page.click('#add-comment')

    // Wait for the comment result to be displayed
    await page.waitForSelector('#comment-result.result.success')

    // Now edit the comment
    // Find the edit button for the comment we just added
    const editButton = page.locator(
      '#comments-list tr:first-child td:nth-child(3) button:first-child'
    )
    await editButton.click()

    // Verify that the form is now in edit mode
    const addButton = page.locator('#add-comment')
    await expect(addButton).toHaveText('Update Comment')

    // The URL field should be pre-filled with the original URL
    await expect(page.locator('#comment-url')).toHaveValue(testUrl)

    // Update the feedback text
    const updatedFeedback = 'Updated comment for testing'
    await page.fill('#comment-feedback', updatedFeedback)

    // Submit the form to update the comment
    await page.click('#add-comment')

    // Wait for the update result to be displayed
    const updateResult = page.locator('#comment-result')
    await expect(updateResult).toBeVisible()
    await expect(updateResult).toHaveClass('result success')
    await expect(updateResult).toContainText('Comment updated successfully')

    // Verify the comment is updated in the list
    const updatedCommentRow = page.locator('#comments-list tr:first-child')
    await expect(updatedCommentRow).toBeVisible()
    await expect(updatedCommentRow.locator('td:nth-child(1)')).toContainText(testUrl)
    await expect(updatedCommentRow.locator('td:nth-child(2)')).toContainText(updatedFeedback)

    // Verify the form is reset to add mode
    await expect(addButton).toHaveText('Add Comment')
  })

  /**
   * Test 13: Delete a comment from a database
   * This test verifies that comments can be deleted from a database
   */
  test('should delete a comment from a database', async ({ page }) => {
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

    // Create a test comment first
    const testUrl = 'https://example.com/delete-test-page.html'
    const testFeedback = 'Comment to be deleted'
    // Use a numeric timestamp since IndexedDB uses numeric keys
    const timestamp = Date.now()

    // Fill in the comment form
    await page.fill('#comment-timestamp', '' + timestamp)
    await page.fill('#comment-xpath', '/html/body/div[1]/p')
    await page.fill('#comment-text', 'Test element text')
    await page.fill('#comment-title', 'Test Page Title')
    await page.fill('#comment-url', testUrl)
    await page.fill('#comment-feedback', testFeedback)

    // Submit the comment form
    await page.click('#add-comment')

    // Wait for the comment result to be displayed
    await page.waitForSelector('#comment-result.result.success')

    // Count the number of comments before deletion
    const commentRowsBefore = await page.locator('#comments-list tr').count()
    expect(commentRowsBefore).toBeGreaterThan(0)

    // Find the delete button for the comment we just added
    const deleteButton = page.locator(
      '#comments-list tr:first-child td:nth-child(3) button:nth-child(2)'
    )

    // Set up a dialog handler to accept the confirmation dialog
    page.on('dialog', dialog => dialog.accept())

    // Click the delete button
    await deleteButton.click()

    // Wait for the delete result to be displayed
    const deleteResult = page.locator('#comment-result')
    await expect(deleteResult).toBeVisible()
    await expect(deleteResult).toHaveClass('result success')
    await expect(deleteResult).toContainText('Comment deleted successfully')

    // Wait a bit to ensure the deletion is processed
    await page.waitForTimeout(500)

    // After deletion, we should reload the database to ensure we're seeing the latest state
    // This will refresh the comments list
    await page.click('#load-database')
    await page.waitForSelector('#load-db-result.result.success')

    // After reloading the database, search for our specific comment in the comments list
    // We'll use a unique identifier in our test feedback to make it easy to find
    const commentsList = await page.locator('#comments-list').textContent()

    // The comment should no longer be in the list after deletion
    expect(commentsList).not.toContain(testFeedback)

    // Also verify that the UI shows the correct number of comments
    // If there are no comments, the list might be empty
    const noCommentsMessage = page.locator('#no-comments-message')
    const commentRows = page.locator('#comments-list tr')

    // Either we should see no comments message or the list should not contain our deleted comment
    const rowCount = await commentRows.count()
    if (rowCount === 0) {
      // If no comments are left, we might see a "no comments" message
      const noCommentsVisible = await noCommentsMessage.isVisible()
      // This is optional as the UI might handle empty lists differently
      if (noCommentsVisible) {
        expect(noCommentsVisible).toBeTruthy()
      }
    } else {
      // If there are still other comments, verify none of them are our deleted comment
      for (let i = 0; i < rowCount; i++) {
        const rowText = await commentRows.nth(i).textContent()
        expect(rowText).not.toContain(testFeedback)
      }
    }
  })

  /**
   * Performance test for large packages and many comments
   * This test verifies that the DatabaseService can handle large packages and many comments efficiently
   */
  test('should handle large packages and many comments efficiently', async ({ page }) => {
    await page.goto(`${serverUrl}/tests/e2e/fixtures/db-test.html`)
    await page.waitForLoadState('networkidle')

    // First initialize the database system
    await page.click('#init-db')
    await page.waitForSelector('#init-result.result.success')

    // Create a custom test database
    await page.selectOption('#test-template', 'custom')

    // Fill in custom package details
    await page.fill('#package-name', 'Performance Test Package')
    await page.fill('#package-version', '1.0.0')
    await page.fill('#package-author', 'Playwright Performance Test')
    await page.fill('#package-description', 'A large test package for performance testing')
    await page.fill('#package-root-url', 'https://example.com/performance-test')
    // Create the test database and measure time
    const startCreateTime = Date.now()
    await page.click('#create-test-dbs')
    await page.waitForSelector('#test-db-result.result.success')
    const createTime = Date.now() - startCreateTime
    console.log(`Database creation time: ${createTime}ms`)

    // List databases to get the ID of our newly created database
    await page.click('#list-databases')
    await page.waitForSelector('#list-db-result.result.success')

    // Find the database ID from the list
    const databaseRows = page.locator('#database-list tr')
    const rowCount = await databaseRows.count()
    let foundDbId = ''

    for (let i = 0; i < rowCount; i++) {
      const rowText = await databaseRows.nth(i).textContent()
      if (rowText && rowText.includes('Performance Test Package')) {
        // Extract the database ID from the row
        const idCell = await databaseRows.nth(i).locator('td').first()
        const fullId = await idCell.textContent()
        foundDbId = fullId ? fullId.replace('bc-storage-', '') : ''
        break
      }
    }

    expect(foundDbId).not.toBe('') // Ensure we found our database

    // Now load the database to work with it
    await page.fill('#load-db-id', foundDbId)
    const startLoadTime = Date.now()
    await page.click('#load-database')
    await page.waitForSelector('#load-db-result.result.success')
    const loadTime = Date.now() - startLoadTime
    console.log(`Database load time: ${loadTime}ms`)

    // Wait for comments container to be visible
    await page.waitForSelector('#comments-container', { state: 'visible' })

    // Add many comments to the database
    const numComments = 30 // Adjust based on performance needs
    const commentAddTimes: number[] = []

    for (let i = 0; i < numComments; i++) {
      const testUrl = `https://example.com/performance-test/page-${i}.html`
      const testFeedback = `Test comment #${i} with some content. ${'Lorem ipsum '.repeat(5)}`
      const timestamp = Date.now() + i // Ensure unique timestamps

      // Fill in the comment form
      await page.fill('#comment-timestamp', timestamp.toString())
      await page.fill('#comment-xpath', `/html/body/div[${(i % 5) + 1}]/p[${(i % 3) + 1}]`)
      await page.fill('#comment-text', `Element text for comment #${i}`)
      await page.fill('#comment-title', `Test Page Title ${i}`)
      await page.fill('#comment-url', testUrl)
      await page.fill('#comment-feedback', testFeedback)

      // Submit the comment form and measure the time
      const startAddTime = Date.now()
      await page.click('#add-comment')
      await page.waitForSelector('#comment-result.result.success')
      const addTime = Date.now() - startAddTime
      commentAddTimes.push(addTime)

      // Wait a short time between adding comments to ensure they're properly saved
      // This helps prevent race conditions with IndexedDB operations
      await page.waitForTimeout(50)
    }

    // Calculate average comment add time
    const avgAddTime = commentAddTimes.reduce((sum, time) => sum + time, 0) / numComments
    console.log(`Average comment add time: ${avgAddTime}ms`)

    // Test comment listing performance
    const startListTime = Date.now()

    // Force a reload of the database to refresh comments
    // We'll try this up to 3 times to ensure all comments are loaded
    let commentCount = 0
    let attempts = 0
    const maxAttempts = 3

    while (commentCount < numComments && attempts < maxAttempts) {
      attempts++
      console.log(`Attempt ${attempts} to load all comments...`)

      // Reload the database
      await page.click('#load-database')
      await page.waitForSelector('#load-db-result.result.success')
      await page.waitForSelector('#comments-container', { state: 'visible' })

      // Wait a bit longer for all comments to be displayed
      await page.waitForTimeout(500)

      // Check the comment count
      const commentRows = page.locator('#comments-list tr')
      commentCount = await commentRows.count()
      console.log(`Found ${commentCount} comments on attempt ${attempts}`)

      if (commentCount === numComments) break
    }

    const listTime = Date.now() - startListTime
    console.log(`Comment listing time for ${commentCount} comments: ${listTime}ms`)

    // Verify that all comments were added
    // If we still don't have all comments after multiple attempts, we'll fail the test
    // but with a more descriptive message
    if (commentCount !== numComments) {
      throw new Error(
        `Expected ${numComments} comments but found ${commentCount} after ${attempts} attempts`
      )
    }
    expect(commentCount).toBe(numComments)

    // Test search performance
    const startSearchTime = Date.now()
    await page.fill('#test-url', 'https://example.com/performance-test/page-10')
    await page.click('#test-active-package')
    await page.waitForSelector('#search-result.result.success')
    const searchTime = Date.now() - startSearchTime
    console.log(`URL search time: ${searchTime}ms`)

    // Performance assertions
    // These thresholds should be adjusted based on expected performance
    expect(createTime).toBeLessThan(2000) // Database creation should be under 2 seconds
    expect(loadTime).toBeLessThan(1000) // Database loading should be under 1 second
    expect(avgAddTime).toBeLessThan(500) // Average comment add time should be under 500ms
    expect(listTime).toBeLessThan(5000) // Listing all comments should be under 5 seconds (increased due to retry mechanism)
    expect(searchTime).toBeLessThan(500) // URL search should be under 500ms
  })
})
