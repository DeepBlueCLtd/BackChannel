import { test, expect } from '@playwright/test'

/**
 * Integration tests for the packageService using real IndexedDB
 * These tests focus on the URL matching functionality of the DatabaseService.searchByUrl method
 * which is used by the packageService to find the active feedback package.
 */
test.describe('packageService integration tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console log listener
    page.on('console', msg => {
      console.log(`BROWSER LOG: ${msg.type()}: ${msg.text()}`)
    })

    // Navigate to the db-test.html page using http protocol
    await page.goto('http://localhost:3000/tests/e2e/fixtures/db-test.html')
  })

  test('searchByUrl should find matching package', async ({ page }) => {
    // Initialize the database using JavaScript evaluation
    await page.evaluate(() => {
      document.getElementById('db-name').value = 'Test Document'
    })
    await page.click('#init-db')
    await expect(page.locator('#init-result')).toContainText('initialized successfully')

    // Set up test packages
    await page.click('#setup-test-packages')
    await expect(page.locator('#active-package-result')).toContainText('Successfully created')

    // Test URL that should match example.com package
    await page.evaluate(() => {
      document.getElementById('test-url').value = 'https://example.com/some/page'
    })
    await page.click('#test-active-package')

    // Verify we found the correct package
    const resultElement = page.locator('#active-package-result')
    await expect(resultElement).toContainText('Active package found')
    await expect(resultElement).toContainText('Example Site Package')
    await expect(resultElement).toContainText('https://example.com')

    // Clean up test packages
    await page.click('#clear-test-packages')
  })

  test('searchByUrl should return null for non-matching URL', async ({ page }) => {
    // Initialize the database using JavaScript evaluation
    await page.evaluate(() => {
      document.getElementById('db-name').value = 'Test Document'
    })
    await page.click('#init-db')
    await expect(page.locator('#init-result')).toContainText('initialized successfully')

    // Set up test packages
    await page.click('#setup-test-packages')
    await expect(page.locator('#active-package-result')).toContainText('Successfully created')

    // Test URL that should not match any package
    await page.evaluate(() => {
      document.getElementById('test-url').value = 'https://nomatch.com/page'
    })
    await page.click('#test-active-package')

    // Verify no package was found
    const resultElement = page.locator('#active-package-result')
    await expect(resultElement).toContainText('No active package found')

    // Clean up test packages
    await page.click('#clear-test-packages')
  })

  test('searchByUrl should handle subpaths correctly', async ({ page }) => {
    // Initialize the database using JavaScript evaluation
    await page.evaluate(() => {
      document.getElementById('db-name').value = 'Test Document'
    })
    await page.click('#init-db')
    await expect(page.locator('#init-result')).toContainText('initialized successfully')

    // Set up test packages
    await page.click('#setup-test-packages')
    await expect(page.locator('#active-package-result')).toContainText('Successfully created')

    // Test URL that should match the third package with subpath
    await page.evaluate(() => {
      document.getElementById('test-url').value = 'https://third.com/subpath/deeper/page'
    })
    await page.click('#test-active-package')

    // Verify we found the correct package
    const resultElement = page.locator('#active-package-result')
    await expect(resultElement).toContainText('Active package found')
    await expect(resultElement).toContainText('Third Site Package')
    await expect(resultElement).toContainText('https://third.com/subpath')

    // Clean up test packages
    await page.click('#clear-test-packages')
  })
})
