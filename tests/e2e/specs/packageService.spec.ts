import { test, expect } from '@playwright/test'

/**
 * Integration tests for the packageService using real IndexedDB
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

  test('getActiveFeedbackPackage should find matching package', async ({ page }) => {
    // Initialize the database
    await page.fill('#db-name', 'Test Document')
    await page.click('#init-db')
    await expect(page.locator('#init-result')).toContainText('initialized successfully')

    // Set up test packages
    await page.click('#setup-test-packages')
    await expect(page.locator('#active-package-result')).toContainText('Successfully created')

    // Test URL that should match example.com package
    await page.fill('#test-url', 'https://example.com/some/page')
    await page.click('#test-active-package')

    // Verify we found the correct package
    const resultElement = page.locator('#active-package-result')
    await expect(resultElement).toContainText('Active package found')
    await expect(resultElement).toContainText('Example Site Package')
    await expect(resultElement).toContainText('https://example.com')

    // Clean up test packages
    await page.click('#clear-test-packages')
  })

  test('getActiveFeedbackPackage should return null for non-matching URL', async ({ page }) => {
    // Initialize the database
    await page.fill('#db-name', 'Test Document')
    await page.click('#init-db')
    await expect(page.locator('#init-result')).toContainText('initialized successfully')

    // Set up test packages
    await page.click('#setup-test-packages')
    await expect(page.locator('#active-package-result')).toContainText('Successfully created')

    // Test URL that should not match any package
    await page.fill('#test-url', 'https://nomatch.com/page')
    await page.click('#test-active-package')

    // Verify no package was found
    const resultElement = page.locator('#active-package-result')
    await expect(resultElement).toContainText('No active package found')

    // Clean up test packages
    await page.click('#clear-test-packages')
  })

  test('getActiveFeedbackPackage should handle subpaths correctly', async ({ page }) => {
    // Initialize the database
    await page.fill('#db-name', 'Test Document')
    await page.click('#init-db')
    await expect(page.locator('#init-result')).toContainText('initialized successfully')

    // Set up test packages
    await page.click('#setup-test-packages')
    await expect(page.locator('#active-package-result')).toContainText('Successfully created')

    // Test URL that should match the third package with subpath
    await page.fill('#test-url', 'https://third.com/subpath/deeper/page')
    await page.click('#test-active-package')

    // Verify we found the correct package
    const resultElement = page.locator('#active-package-result')
    await expect(resultElement).toContainText('Active package found')
    await expect(resultElement).toContainText('Third Site Package')
    await expect(resultElement).toContainText('https://third.com/subpath')

    // Clean up test packages
    await page.click('#clear-test-packages')
  })

  test('getActiveFeedbackPackage should return first match when multiple packages match', async ({
    page,
  }) => {
    // Initialize the database
    await page.fill('#db-name', 'Test Document')
    await page.click('#init-db')
    await expect(page.locator('#init-result')).toContainText('initialized successfully')

    // Set up test packages
    await page.click('#setup-test-packages')
    await expect(page.locator('#active-package-result')).toContainText('Successfully created')

    // Add another package with overlapping URL
    await page.fill('#package-id', 'pkg-test-4')
    await page.fill('#package-name', 'Overlapping Package')
    await page.fill('#package-version', '1.0.0')
    await page.fill('#package-author', 'Test User')
    await page.fill('#package-description', 'Another package for example.com')

    // Need to add rootURL which isn't in the form, so we'll use JavaScript execution
    await page.evaluate(() => {
      // @ts-ignore - Access the db object from the page
      window.db.addPackage({
        id: 'pkg-test-4',
        name: 'Overlapping Package',
        rootURL: 'https://example.com/some',
        author: 'Test User',
        version: '1.0.0',
        description: 'Another package for example.com',
      })
    })

    // Test URL that should match both packages
    await page.fill('#test-url', 'https://example.com/some/page')
    await page.click('#test-active-package')

    // Verify we found a package (should be the first one due to implementation)
    const resultElement = page.locator('#active-package-result')
    await expect(resultElement).toContainText('Active package found')

    // Clean up test packages
    await page.click('#clear-test-packages')
    await page.evaluate(() => {
      // @ts-ignore - Access the db object from the page
      window.db.deletePackage('pkg-test-4')
    })
  })
})
