import { test, expect, Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

// Add DOM type reference to access IndexedDB types
/// <reference lib="dom" />

// Import IndexedDB types
type IDBRequest<T> = globalThis.IDBRequest<T>
type IDBDatabase = globalThis.IDBDatabase
type Event = globalThis.Event

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to get file URL
function getFileUrl(relativePath: string): string {
  const fixturesPath = path.resolve(__dirname, '../fixtures/enabled-test')
  const absolutePath = path.resolve(fixturesPath, relativePath)
  return `file://${absolutePath}`
}

// Helper to clear IndexedDB databases
async function clearDatabases(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Get all databases
    const databases = await window.indexedDB.databases()

    // Delete all BackChannel databases
    for (const db of databases) {
      if (db.name && db.name.startsWith('bc-storage-')) {
        await new Promise<void>((resolve, reject) => {
          const request = window.indexedDB.deleteDatabase(db.name || '')
          request.onsuccess = () => resolve()
          request.onerror = () =>
            reject(new Error(`Failed to delete database ${db.name || 'unknown'}`))
        })
      }
    }

    // Clear localStorage
    localStorage.clear()
  })
}

// Helper to check if BackChannel is enabled for the current page
async function isBackChannelEnabled(page: Page): Promise<boolean> {
  // This function simulates checking if BackChannel is enabled
  // In a real implementation, we would check the UI state of the BackChannel icon
  // For this test, we'll check if there's an active package for the current URL

  // First, check if there's a cached package in localStorage that matches the current URL
  const hasCachedPackage = await page.evaluate(() => {
    const currentUrl = window.location.href
    const cachedRoot = localStorage.getItem('bc_root')
    return cachedRoot && currentUrl.startsWith(cachedRoot)
  })

  if (hasCachedPackage) {
    return true
  }

  // If no cache hit, check if there are any databases with a matching package
  return await page.evaluate(async () => {
    try {
      // Get all databases
      const databases = await window.indexedDB.databases()
      const currentUrl = window.location.href

      // Check each database
      for (const db of databases) {
        if (db.name && db.name.startsWith('bc-storage-')) {
          try {
            // Open the database
            const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
              const request = window.indexedDB.open(db.name || '')
              request.onsuccess = (event: Event) => {
                const target = event.target as IDBRequest<IDBDatabase>
                resolve(target.result)
              }
              request.onerror = () => reject(new Error(`Failed to open database ${db.name || ''}`))
            })

            const idb = await dbPromise

            // Get the package from the database
            const packagePromise = new Promise(resolve => {
              const transaction = idb.transaction(['packages'], 'readonly')
              const store = transaction.objectStore('packages')
              const request = store.getAll()

              request.onsuccess = () => {
                resolve(request.result && request.result.length > 0 ? request.result[0] : null)
              }

              request.onerror = () => resolve(null)
            })

            const packageData = await packagePromise

            // Check if the package's rootURL matches the current URL
            if (
              packageData &&
              typeof packageData === 'object' &&
              'rootURL' in packageData &&
              packageData.rootURL &&
              currentUrl.startsWith(String(packageData.rootURL))
            ) {
              return true
            }

            // Close the database
            idb.close()
          } catch (error) {
            console.error(`Error checking database ${db.name}:`, error)
          }
        }
      }

      return false
    } catch (error) {
      console.error('Error checking if BackChannel is enabled:', error)
      return false
    }
  })
}

// Helper to create a feedback package
async function createFeedbackPackage(page: Page, rootUrl: string): Promise<string> {
  // Create a feedback package for the given root URL
  return await page.evaluate(async (rootUrl: string) => {
    try {
      // Generate a unique ID for the database
      const dbId = `test-${Date.now()}`

      // Create a new DatabaseService instance
      // @ts-ignore - DatabaseService is loaded dynamically
      const dbService = new window.DatabaseService(dbId)
      await dbService.init()

      // Add a package to the database
      const packageData = {
        name: 'Test Package',
        version: '1.0.0',
        author: 'Test Author',
        description: 'Test Description',
        rootURL: rootUrl,
      }

      await dbService._addPackage(packageData)

      return dbId
    } catch (error) {
      console.error('Error creating feedback package:', error)
      return null as unknown as string
    }
  }, rootUrl)
}

test.describe('BackChannel Enabled/Disabled State', () => {
  test.beforeEach(async ({ page }) => {
    // Load the DatabaseService script
    await page.goto(getFileUrl('index.html'))

    // Clear all BackChannel databases and localStorage
    await clearDatabases(page)
  })

  test('should correctly detect enabled/disabled state based on URL path', async ({ page }) => {
    // 1. Verify all pages are initially disabled

    // Check root page
    await page.goto(getFileUrl('index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)

    // Check enabled section pages
    await page.goto(getFileUrl('enabled/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)

    await page.goto(getFileUrl('enabled/subdir/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)

    // Check disabled section pages
    await page.goto(getFileUrl('disabled/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)

    await page.goto(getFileUrl('disabled/subdir/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)

    // 2. Create a feedback package at the root of the enabled section
    await page.goto(getFileUrl('enabled/index.html'))
    const rootUrl = page.url()
    const dbId = await createFeedbackPackage(page, rootUrl)
    expect(dbId).not.toBeNull()

    // 3. Verify pages under the enabled section are now enabled

    // Check enabled root page
    await page.goto(getFileUrl('enabled/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(true)

    // Check enabled subdirectory page
    await page.goto(getFileUrl('enabled/subdir/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(true)

    // 4. Verify pages not under the enabled section remain disabled

    // Check root page
    await page.goto(getFileUrl('index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)

    // Check disabled section pages
    await page.goto(getFileUrl('disabled/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)

    await page.goto(getFileUrl('disabled/subdir/index.html'))
    expect(await isBackChannelEnabled(page)).toBe(false)
  })
})
