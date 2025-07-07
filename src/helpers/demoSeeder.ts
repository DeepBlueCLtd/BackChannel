/**
 * Demo Database Seeder
 * Utility for seeding demo IndexedDB data with version control
 */

import type { FakeDbJson, FakeDbStore } from '../types'

// Local storage key for tracking seed versions
const SEED_VERSION_KEY = 'bc-demo-seed-version'

/**
 * Seeds the demo database if the version hasn't been applied yet
 * @param seedData - The seed data containing version and database definitions
 * @param forceReseed - Optional flag to force reseeding even if version matches
 * @returns Promise resolving to whether seeding was performed
 */
export async function seedDemoDatabaseIfNeeded(
  seedData: FakeDbStore,
  forceReseed = false
): Promise<boolean> {
  // Check if localStorage is available
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage not available, cannot track seed versions')
    return false
  }

  // Handle both legacy format (just array of FakeDbJson) and new format with version
  const version = '' + seedData.version
  const databases = seedData.databases

  // Check if this version has already been seeded, converting to integer for comparison
  const currentVersion = '' + localStorage.getItem(SEED_VERSION_KEY)

  console.log(
    'Checking for demo database seed version',
    version,
    currentVersion,
    currentVersion === version
  )

  // Skip seeding if version matches and not forcing reseed
  if (currentVersion === version && !forceReseed) {
    console.log(`Demo database seed version ${version} already applied, skipping`)
    return false
  }

  // Proceed with seeding
  try {
    // Seed each database
    for (const dbDef of databases) {
      await seedDatabase(dbDef)
    }

    // Update the seed version in localStorage
    localStorage.setItem(SEED_VERSION_KEY, version)
    console.log(`Demo database seed version ${version} applied successfully`)
    return true
  } catch (error) {
    console.error('Error seeding demo database:', error)
    return false
  }
}

/**
 * Seeds a single database from its definition
 * @param dbDef - Database definition
 */
async function seedDatabase(dbDef: FakeDbJson): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Open a connection to create or update the database
      const request = window.indexedDB.open(dbDef.name, dbDef.version)

      request.onerror = (event: any) => {
        console.error(`Error opening database ${dbDef.name}:`, event.target.error)
        reject(event.target.error)
      }

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result

        // Create object stores
        for (const storeDef of dbDef.objectStores) {
          // Create the object store if it doesn't exist
          if (!db.objectStoreNames.contains(storeDef.name)) {
            db.createObjectStore(storeDef.name, { keyPath: storeDef.keyPath })
            console.log(`Created object store ${storeDef.name} in database ${dbDef.name}`)
          }
        }
      }

      request.onsuccess = async (event: any) => {
        const db = event.target.result

        // Add data to each object store
        for (const storeDef of dbDef.objectStores) {
          if (storeDef.data && Array.isArray(storeDef.data) && storeDef.data.length > 0) {
            // Start a transaction to add data
            const transaction = db.transaction(storeDef.name, 'readwrite')
            const store = transaction.objectStore(storeDef.name)

            // Add each item to the store
            for (const item of storeDef.data) {
              store.add(item)
            }

            // Wait for the transaction to complete
            await new Promise<void>((transResolve, transReject) => {
              transaction.oncomplete = () => {
                console.log(
                  `Added ${storeDef.data.length} items to ${storeDef.name} in ${dbDef.name}`
                )
                transResolve()
              }
              transaction.onerror = (event: any) => {
                console.error(`Error adding data to ${storeDef.name}:`, event.target.error)
                transReject(event.target.error)
              }
            })
          }
        }

        // Close the database connection
        db.close()
        resolve()
      }
    } catch (error) {
      console.error(`Error seeding database ${dbDef.name}:`, error)
      reject(error)
    }
  })
}
