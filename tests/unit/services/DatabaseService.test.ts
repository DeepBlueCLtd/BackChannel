// Import FDBFactory for creating fake IndexedDB instances
import FDBFactory from 'fake-indexeddb/lib/FDBFactory'
import { DatabaseService } from '../../../src/services/db'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Comment, Package } from '../../../src/types'

describe('DatabaseService with in-memory IndexedDB', () => {
  let dbService: DatabaseService

  beforeEach(async () => {
    // Clear any fake databases from previous tests
    DatabaseService.clearFakeDatabases()

    // Create a fake database for testing
    const fakeIdb = new FDBFactory()
    const request = fakeIdb.open('bc-storage-test-db', 1)

    // Set up the database schema
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result

      // Create packages store
      if (!db.objectStoreNames.contains('packages')) {
        const packagesStore = db.createObjectStore('packages', { keyPath: 'id' })
        packagesStore.createIndex('name', 'name', { unique: false })
      }

      // Create comments store
      if (!db.objectStoreNames.contains('comments')) {
        const commentsStore = db.createObjectStore('comments', { keyPath: 'timestamp' })
        commentsStore.createIndex('pageUrl', 'pageUrl', { unique: false })
      }
    }

    // Wait for the database to open
    await new Promise<void>(resolve => {
      request.onsuccess = (event: any) => {
        // Add the fake database to the static array
        DatabaseService.initFakeDatabases([event.target.result])
        resolve()
      }
    })

    // Create a new DatabaseService instance
    dbService = new DatabaseService('test-db', null)
  })

  afterEach(() => {
    // Close the database connection after each test
    if (dbService) {
      dbService.close()
    }
  })

  it('creates and reads an object store entry', async () => {
    // Initialize the database
    await dbService.init()

    // Create a test comment
    const testComment: Comment = {
      timestamp: Date.now(),
      xpath: '/html/body/div[1]',
      elementText: 'Test element',
      feedback: 'Test comment',
      pageUrl: 'https://example.com',
      documentTitle: 'Test Page Title',
    }

    // Add the comment to the database
    const timestamp = await dbService.addComment(testComment)
    expect(timestamp).toBe(testComment.timestamp)

    // Retrieve the comment from the database
    const retrievedComment = await dbService.getComment(testComment.timestamp)
    expect(retrievedComment).toEqual(testComment)
  })

  it('creates and reads a package', async () => {
    // Create a test package
    const testPackage: Package = {
      id: 'test-pkg-123',
      name: 'Test Package',
      rootURL: 'https://example.com',
      author: 'Test User',
      version: '1.0.0',
    }

    // Create a fake database for the test
    const fakeIdb = new FDBFactory()
    const request = fakeIdb.open('bc-storage-test-db-pkg', 1)

    // Set up the database schema
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result

      // Create packages store
      if (!db.objectStoreNames.contains('packages')) {
        const packagesStore = db.createObjectStore('packages', { keyPath: 'id' })
        packagesStore.createIndex('name', 'name', { unique: false })
      }
    }

    // Wait for the database to open and add the package
    await new Promise<void>(resolve => {
      request.onsuccess = async (event: any) => {
        const db = event.target.result

        // Add the package to the database
        const transaction = db.transaction(['packages'], 'readwrite')
        const store = transaction.objectStore('packages')
        const addRequest = store.add(testPackage)

        addRequest.onsuccess = () => {
          // Add the fake database to the static array
          DatabaseService.initFakeDatabases([db])
          resolve()
        }
      }
    })

    // Initialize the database with the test package
    const dbServiceWithPackage = new DatabaseService('test-db-pkg', testPackage)
    await dbServiceWithPackage.init()

    // Retrieve the package from the database
    const retrievedPackage = await dbServiceWithPackage.getPackage()
    expect(retrievedPackage).toEqual(testPackage)

    // Clean up
    dbServiceWithPackage.close()
  })

  it('updates a comment', async () => {
    // Initialize the database
    await dbService.init()

    // Create a test comment
    const testComment: Comment = {
      timestamp: Date.now(),
      xpath: '/html/body/div[1]',
      elementText: 'Test element',
      feedback: 'Original comment',
      pageUrl: 'https://example.com',
      documentTitle: 'Test Page Title',
    }

    // Add the comment to the database
    await dbService.addComment(testComment)

    // Update the comment
    const updatedComment: Comment = {
      ...testComment,
      feedback: 'Updated comment',
    }

    const updateResult = await dbService.updateComment(updatedComment)
    expect(updateResult).toBe(true)

    // Retrieve the updated comment
    const retrievedComment = await dbService.getComment(testComment.timestamp)
    expect(retrievedComment).toEqual(updatedComment)
  })

  it('deletes a comment', async () => {
    // Initialize the database
    await dbService.init()

    // Create a test comment
    const testComment: Comment = {
      timestamp: Date.now(),
      xpath: '/html/body/div[1]',
      elementText: 'Test element',
      feedback: 'Comment to delete',
      pageUrl: 'https://example.com',
      documentTitle: 'Test Page Title',
    }

    // Add the comment to the database
    await dbService.addComment(testComment)

    // Delete the comment
    const deleteResult = await dbService.deleteComment(testComment.timestamp)
    expect(deleteResult).toBe(true)

    // Try to retrieve the deleted comment
    const retrievedComment = await dbService.getComment(testComment.timestamp)
    expect(retrievedComment).toBeNull()
  })
})
