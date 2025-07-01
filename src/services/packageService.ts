/**
 * Package Service - Functions for managing feedback packages
 */

import type { FeedbackPackage } from '../types'
import { DatabaseService } from './db.js'

/**
 * Checks if there is an active feedback package for the current URL
 * @param currentUrl The URL to check for an active feedback package
 * @returns Promise resolving to the matching package or null if none found
 */
export async function getActiveFeedbackPackage(
  currentUrl: string
): Promise<FeedbackPackage | null> {
  try {
    const dbService = await getDbService()
    if (!dbService) {
      return null
    }

    // Since there's no direct method to get all packages, we need to use a cursor
    // to iterate through all packages in the store
    const packages = await getAllPackagesWithCursor(dbService)

    // If no packages or error retrieving packages
    if (!packages || packages.length === 0) {
      return null
    }

    // Loop through packages to find a match
    for (const pkg of packages) {
      // Check if the package's root URL is contained within the current URL
      if (currentUrl.includes(pkg.rootURL)) {
        // Return the first matching package
        return pkg
      }
    }

    // No matching package found
    return null
  } catch (error) {
    console.error('Error checking for active feedback package:', error)
    return null
  }
}

/**
 * Gets all packages from the database using a cursor
 * @param dbService The database service instance
 * @returns Promise resolving to an array of feedback packages or null on error
 */
async function getAllPackagesWithCursor(
  dbService: DatabaseService
): Promise<FeedbackPackage[] | null> {
  // We need to access the db property dynamically since it's not in the TypeScript type
  const db = (dbService as any).db
  if (!dbService || !db) {
    return null
  }

  try {
    return new Promise(resolve => {
      const packages: FeedbackPackage[] = []
      const transaction = db.transaction(['packages'], 'readonly')
      const store = transaction.objectStore('packages')
      const request = store.openCursor()

      request.onsuccess = (event: any) => {
        const cursor = event.target.result
        if (cursor) {
          packages.push(cursor.value)
          cursor.continue()
        } else {
          // No more entries
          resolve(packages)
        }
      }

      request.onerror = (event: any) => {
        console.error('Error iterating packages:', event)
        resolve(null)
      }
    })
  } catch (error) {
    console.error('Error getting all packages with cursor:', error)
    return null
  }
}

/**
 * Helper function to get database service instance
 * @returns Promise resolving to DatabaseService instance or null on error
 */
async function getDbService(): Promise<DatabaseService | null> {
  try {
    // Extract document title or use default
    const documentTitle = document.title || 'BackChannel Document'

    const dbService = new DatabaseService(documentTitle)

    if (!dbService.isSupported) {
      console.warn('IndexedDB is not supported in this browser.')
      return null
    }

    const success = await dbService.init()
    if (!success) {
      return null
    }

    return dbService
  } catch (error) {
    console.error('Error initializing database service:', error)
    return null
  }
}
