/**
 * Helper functions for working with fake databases
 * Used to convert JSON definitions into IDBDatabase instances
 */

// Import fake-indexeddb for creating in-memory databases
import { IDBFactory } from 'fake-indexeddb'

// Define IDBDatabase type for use in our functions
type IDBDatabase = any

// Import types
export interface FakeDbObjectStore {
  name: string
  keyPath: string
  data: any[]
}

export interface FakeDbJson {
  name: string
  version: number
  objectStores: FakeDbObjectStore[]
}

/**
 * Converts JSON database definitions into populated IDBDatabase objects
 * @param jsonDefs - Array of JSON database definitions
 * @returns Array of populated IDBDatabase objects
 */
export async function loadFakeDatabasesFromJson(jsonDefs: FakeDbJson[]): Promise<IDBDatabase[]> {
  if (!jsonDefs || !Array.isArray(jsonDefs) || jsonDefs.length === 0) {
    console.warn('No fake database definitions provided')
    return []
  }

  const fakeDatabases: IDBDatabase[] = []
  const fakeIDB = new IDBFactory()

  for (const dbDef of jsonDefs) {
    try {
      // Open a connection to create the database
      const dbRequest = fakeIDB.open(dbDef.name, dbDef.version)

      // Create the database schema in onupgradeneeded
      dbRequest.onupgradeneeded = (event: any) => {
        const db = event.target.result

        // Create object stores
        for (const storeDef of dbDef.objectStores) {
          // Create the object store with the specified key path
          db.createObjectStore(storeDef.name, { keyPath: storeDef.keyPath })

          // Add data to the object store if provided
          if (storeDef.data && Array.isArray(storeDef.data)) {
            const transaction = event.target.transaction
            const store = transaction.objectStore(storeDef.name)

            for (const item of storeDef.data) {
              store.add(item)
            }
          }
        }
      }

      // Wait for the database to be created
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbRequest.onsuccess = (event: any) => {
          resolve(event.target.result)
        }

        dbRequest.onerror = (event: any) => {
          console.error(`Error creating fake database ${dbDef.name}:`, event.target.error)
          reject(event.target.error)
        }
      })

      // Add the database to our array
      fakeDatabases.push(db)
    } catch (error: any) {
      console.error(`Error creating fake database ${dbDef.name}:`, error)
    }
  }

  return fakeDatabases
}
