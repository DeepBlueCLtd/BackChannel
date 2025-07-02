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
})
