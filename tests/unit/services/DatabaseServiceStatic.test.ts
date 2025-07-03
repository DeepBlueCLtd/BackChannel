import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseService } from '../../../src/services/db'
import { IDBFactory, IDBDatabase } from 'fake-indexeddb'
import FDBFactory from 'fake-indexeddb/lib/FDBFactory'

// Helper function to create a fake database with a name and package data
async function createFakeDatabase(
  dbName: string,
  packageData: { id: string; name: string; rootURL?: string }
): Promise<IDBDatabase> {
  // Create a new instance of fake-indexeddb
  const fakeIdb = new FDBFactory()
  
  // Open the database with the specified name
  const request = fakeIdb.open(dbName, 1)
  
  return new Promise((resolve, reject) => {
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result
      
      // Create packages store
      if (!db.objectStoreNames.contains('packages')) {
        const packagesStore = db.createObjectStore('packages', { keyPath: 'id' })
        packagesStore.createIndex('name', 'name', { unique: false })
        packagesStore.createIndex('version', 'version', { unique: false })
      }
      
      // Create comments store
      if (!db.objectStoreNames.contains('comments')) {
        const commentsStore = db.createObjectStore('comments', { keyPath: 'timestamp' })
        commentsStore.createIndex('pageUrl', 'pageUrl', { unique: false })
      }
    }
    
    request.onsuccess = async (event: any) => {
      const db = event.target.result
      
      // Add the package data to the database
      const transaction = db.transaction(['packages'], 'readwrite')
      const store = transaction.objectStore('packages')
      const addRequest = store.add(packageData)
      
      addRequest.onsuccess = () => {
        resolve(db)
      }
      
      addRequest.onerror = (error: any) => {
        reject(error)
      }
    }
    
    request.onerror = (error: any) => {
      reject(error)
    }
  })
}

describe('DatabaseService Static Methods', () => {
  // Clean up after each test
  afterEach(() => {
    DatabaseService.clearFakeDatabases()
  })
  
  describe('getAllBackChannelDatabases', () => {
    it('should return all BackChannel databases from the static array', async () => {
      // Create fake databases
      const db1 = await createFakeDatabase('bc-storage-test1', { id: 'pkg1', name: 'Package 1' })
      const db2 = await createFakeDatabase('bc-storage-test2', { id: 'pkg2', name: 'Package 2' })
      const db3 = await createFakeDatabase('other-db', { id: 'pkg3', name: 'Package 3' }) // Non-BackChannel DB
      
      // Initialize the static array with the fake databases
      DatabaseService.initFakeDatabases([db1, db2, db3])
      
      // Call the method
      const databases = await DatabaseService.getAllBackChannelDatabases()
      
      // Verify results
      expect(databases).toHaveLength(2)
      expect(databases).toContain('bc-storage-test1')
      expect(databases).toContain('bc-storage-test2')
      expect(databases).not.toContain('other-db')
    })
    
    it('should return an empty array when no BackChannel databases exist', async () => {
      // Initialize with non-BackChannel databases
      const db = await createFakeDatabase('other-db', { id: 'pkg1', name: 'Package 1' })
      DatabaseService.initFakeDatabases([db])
      
      // Call the method
      const databases = await DatabaseService.getAllBackChannelDatabases()
      
      // Verify results
      expect(databases).toHaveLength(0)
    })
  })
  
  describe('databaseExists', () => {
    it('should return true when the database exists in the static array', async () => {
      // Create fake database
      const db = await createFakeDatabase('bc-storage-test123', { id: 'pkg1', name: 'Package 1' })
      
      // Initialize the static array
      DatabaseService.initFakeDatabases([db])
      
      // Call the method - note we pass just the ID part, not the full name
      const exists = await DatabaseService.databaseExists('test123')
      
      // Verify result
      expect(exists).toBe(true)
    })
    
    it('should return false when the database does not exist in the static array', async () => {
      // Create fake database with a different name
      const db = await createFakeDatabase('bc-storage-test123', { id: 'pkg1', name: 'Package 1' })
      
      // Initialize the static array
      DatabaseService.initFakeDatabases([db])
      
      // Call the method with a non-existent ID
      const exists = await DatabaseService.databaseExists('nonexistent')
      
      // Verify result
      expect(exists).toBe(false)
    })
  })
  
  describe('searchByUrl', () => {
    it('should find packages matching the URL pattern across multiple databases', async () => {
      // Create fake databases with different rootURLs
      const db1 = await createFakeDatabase('bc-storage-site1', { 
        id: 'pkg1', 
        name: 'Package 1',
        rootURL: 'https://example.com/app1'
      })
      
      const db2 = await createFakeDatabase('bc-storage-site2', { 
        id: 'pkg2', 
        name: 'Package 2',
        rootURL: 'https://example.com/app2'
      })
      
      // Initialize the static array
      DatabaseService.initFakeDatabases([db1, db2])
      
      // Call the method with a URL that should match the first package
      const matches = await DatabaseService.searchByUrl('https://example.com/app1/page')
      
      // This test will currently fail because we need to modify our implementation
      // to properly handle fake databases in searchByUrl
      // The expected behavior would be:
      expect(matches).toHaveLength(1)
      expect(matches[0].dbId).toBe('site1')
      expect(matches[0].packageData.name).toBe('Package 1')
    })
  })
})
