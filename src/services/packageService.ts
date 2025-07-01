/**
 * Package Service - Functions for managing feedback packages
 */

/* global indexedDB */

/**
 * Package data interface
 */
export interface PackageData {
  id: string
  name: string
  version: string
  author: string
  description: string
  rootURL: string
}

/**
 * Checks if there is an active feedback package for the current URL
 * @param currentUrl The URL to check for an active feedback package
 * @returns Promise resolving to the matching package or null if none found
 */
export async function getActiveFeedbackPackage(currentUrl: string): Promise<PackageData | null> {
  try {
    // Get all database names from IndexedDB
    const dbNames = await getAllDatabaseNames()
    // Filter database names to only include those with our prefix
    const feedbackDbNames = dbNames.filter(name => name.startsWith('bc-storage-'))
    // If no feedback databases found
    if (feedbackDbNames.length === 0) {
      return null
    }
    // Check each database for a matching package
    for (const dbName of feedbackDbNames) {
      const packageData = await getPackageFromDatabase(dbName, currentUrl)
      if (packageData) {
        return packageData
      }
    }
    // No matching package found in any database
    return null
  } catch (error) {
    console.error('Error checking for active feedback package:', error)
    return null
  }
}

/**
 * Gets all database names from IndexedDB
 * @returns Promise resolving to an array of database names
 */
async function getAllDatabaseNames(): Promise<string[]> {
  return new Promise(resolve => {
    try {
      // Check if indexedDB.databases() is supported
      if ('databases' in indexedDB) {
        // Modern browsers support indexedDB.databases()
        indexedDB
          .databases()
          .then(dbs => {
            resolve(dbs.map(db => db.name || ''))
          })
          .catch(() => {
            // Error getting databases
            resolve([])
          })
      } else {
        // Older browsers don't support indexedDB.databases()
        resolve([])
      }
    } catch (error) {
      console.error('Error getting database names:', error)
      resolve([])
    }
  })
}

/**
 * Gets package data from a specific database if it matches the current URL
 * @param dbName The name of the database to check
 * @param currentUrl The URL to check against the package's root URL
 * @returns Promise resolving to the package data if found and matching, null otherwise
 */
async function getPackageFromDatabase(
  dbName: string,
  currentUrl: string
): Promise<PackageData | null> {
  return new Promise(resolve => {
    try {
      const request = indexedDB.open(dbName)
      request.onerror = () => {
        resolve(null)
      }

      request.onsuccess = (event: any) => {
        const db = event.target.result
        // Check if the database has a packages store
        if (!db.objectStoreNames.contains('packages')) {
          db.close()
          resolve(null)
          return
        }

        try {
          const transaction = db.transaction(['packages'], 'readonly')
          const store = transaction.objectStore('packages')
          const getAllRequest = store.getAll()
          getAllRequest.onsuccess = () => {
            const packages = getAllRequest.result as PackageData[]

            // There should be only one package per database
            if (packages && packages.length > 0) {
              const pkg = packages[0]
              // Check if the current URL contains the package's root URL
              if (pkg.rootURL && currentUrl.includes(pkg.rootURL)) {
                resolve(pkg)
                db.close()
                return
              }
            }

            db.close()
            resolve(null)
          }
          getAllRequest.onerror = () => {
            db.close()
            resolve(null)
          }
        } catch (error) {
          console.error('Error accessing packages store:', error)
          db.close()
          resolve(null)
        }
      }
    } catch (error) {
      console.error('Error opening database:', error)
      resolve(null)
    }
  })
}
