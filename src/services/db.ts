/**
 * DatabaseService - IndexedDB wrapper for BackChannel
 * Provides storage functionality for packages and comments
 */

// Reference DOM types for IndexedDB
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Use any type for IndexedDB interfaces to avoid linter issues
type IDBDatabase = any
type IDBRequest = any
type IDBVersionChangeEvent = any
type IDBFactory = any

import type { Package, Comment, DatabaseMatch, ActiveFeedbackPackage } from '../types'

// Import Event type for IndexedDB event handlers
interface Event {
  target: IDBRequest
}

class DatabaseService {
  private dbName: string
  private dbVersion: number
  private db: IDBDatabase | null
  private isSupported: boolean
  private initialPackageData: Package | null
  private idb: IDBFactory

  /**
   * Constructor for DatabaseService
   * @param documentTitle - Title of the document for database naming
   * @param packageData - Optional package data to initialize with
   * @param idb - Optional IndexedDB factory (e.g., fake-indexeddb for testing)
   */
  constructor(documentTitle?: string, packageData: Package | null = null, idb?: IDBFactory) {
    // Generate a database ID using the last 6 digits of the timestamp if not provided
    const dbId = documentTitle || this._generateDatabaseId()
    this.dbName = `bc-storage-${this._sanitizeDbName(dbId)}`
    this.dbVersion = 1
    this.db = null
    this.idb = idb || (typeof window !== 'undefined' ? window.indexedDB : undefined)
    this.isSupported = this._checkSupport()

    // If packageData is provided, ensure it has an ID
    if (packageData) {
      // If package doesn't have an ID, generate one
      if (!packageData.id) {
        packageData.id = this._generatePackageId()
      }
      this.initialPackageData = packageData
    } else {
      this.initialPackageData = null
    }
  }

  /**
   * Generates a database ID using the last 6 digits of the current timestamp
   * @returns Generated database ID
   * @private
   */
  private _generateDatabaseId(): string {
    // Get current timestamp and take the last 6 digits
    const timestamp = Date.now().toString()
    return timestamp.substring(timestamp.length - 6)
  }

  /**
   * Generates a package ID using a prefix and the current timestamp
   * @returns Generated package ID
   * @private
   */
  private _generatePackageId(): string {
    return `pkg-${Date.now()}`
  }

  /**
   * Sanitizes the document title for use in database name
   * @param name - Document title
   * @returns Sanitized name
   * @private
   */
  private _sanitizeDbName(name: string): string {
    // Create a short version of the name, suitable for IndexedDB
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30)
  }

  /**
   * Static method to check if IndexedDB is supported in the current browser
   * @returns Whether IndexedDB is supported
   */
  static isSupported(): boolean {
    return (
      typeof window !== 'undefined' && window.indexedDB !== undefined && window.indexedDB !== null
    )
  }

  /**
   * Instance method to check if IndexedDB is supported
   * @returns Whether IndexedDB is supported
   * @private
   */
  private _checkSupport(): boolean {
    return this.idb !== undefined && this.idb !== null
  }

  /**
   * Static method to get all BackChannel databases
   * @returns Array of BackChannel database names
   */
  static async getAllBackChannelDatabases(): Promise<string[]> {
    if (!DatabaseService.isSupported()) {
      throw new Error('IndexedDB is not supported in this browser')
    }

    try {
      // Get all available databases
      const databases = await window.indexedDB.databases()
      // Filter to only include BackChannel databases and return their names
      return databases
        .filter(db => db.name && db.name.startsWith('bc-storage-'))
        .map(db => db.name as string)
    } catch (error) {
      console.error('Error listing databases:', error)
      throw new Error('Failed to list databases')
    }
  }

  /**
   * Static method to check if a database with the given ID exists
   * @param dbId - Database ID to check
   * @returns Whether the database exists
   */
  static async databaseExists(dbId: string): Promise<boolean> {
    if (!DatabaseService.isSupported()) {
      throw new Error('IndexedDB is not supported in this browser')
    }

    try {
      const databases = await window.indexedDB.databases()
      const dbName = `bc-storage-${dbId}`
      return databases.some(db => db.name === dbName)
    } catch (error) {
      console.error('Error checking database existence:', error)
      throw new Error('Failed to check if database exists')
    }
  }

  /**
   * Handles URL normalization to account for protocol differences
   * @param url - URL to normalize
   * @returns Normalized URL
   * @private
   */
  static _normalizeUrl(url: string): string {
    if (!url) return ''

    // Remove protocol (http:// or https://) for comparison
    return url.replace(/^https?:\/\//, '')
  }

  /**
   * Static method to check if there is an active feedback package for the current URL
   * @param currentUrl - The URL of the current page
   * @returns Matching package data and database ID, or null if not found
   */
  static async getActiveFeedbackPackageForUrl(
    currentUrl: string
  ): Promise<ActiveFeedbackPackage | null> {
    if (!currentUrl) {
      console.error('Current URL is required')
      return null
    }

    if (!DatabaseService.isSupported()) {
      console.error('IndexedDB is not supported in this browser')
      return null
    }

    try {
      // Check if localStorage is available
      const hasLocalStorage = typeof localStorage !== 'undefined'

      // First check localStorage for cached package information
      const cachedRootUrl = hasLocalStorage ? localStorage.getItem('bc_root') : null
      const cachedPackage = hasLocalStorage ? localStorage.getItem('bc_package') : null

      // If we have a cached root URL and the current URL starts with it, use the cached package
      // Normalize URLs to handle protocol differences (http vs https)
      const normalizedCurrentUrl = DatabaseService._normalizeUrl(currentUrl)
      const normalizedCachedRootUrl = DatabaseService._normalizeUrl(cachedRootUrl || '')

      if (
        cachedRootUrl &&
        cachedPackage &&
        (currentUrl.startsWith(cachedRootUrl) ||
          normalizedCurrentUrl.startsWith(normalizedCachedRootUrl))
      ) {
        try {
          const packageData = JSON.parse(cachedPackage) as Package & { dbId?: string }
          const dbId = packageData.dbId
          delete packageData.dbId // Remove the dbId from the package data

          return {
            dbId: dbId as string,
            packageData,
          }
        } catch (parseError) {
          console.warn('Error parsing cached package:', parseError)
          // Continue with database search if cache is invalid
        }
      }

      // If no cache hit or cache is invalid, search all databases
      const matchingPackages = await DatabaseService.searchByUrl(currentUrl)

      if (matchingPackages.length > 0) {
        // Get the first matching package
        const match = matchingPackages[0]

        // Cache the result in localStorage for future page loads if available
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('bc_root', match.packageData.rootURL || '')

          // Store a copy of the package data with the dbId for easy retrieval
          const cachePackage = { ...match.packageData, dbId: match.dbId }
          localStorage.setItem('bc_package', JSON.stringify(cachePackage))
        }

        return {
          dbId: match.dbId,
          packageData: match.packageData,
        }
      }

      // No match found
      return null
    } catch (error) {
      console.error('Error in getActiveFeedbackPackageForUrl:', error)
      return null
    }
  }

  /**
   * Static method to search for a package by URL pattern across all databases
   * @param urlPattern - URL pattern to search for
   * @returns Array of matching packages with their database info
   */
  static async searchByUrl(urlPattern: string): Promise<DatabaseMatch[]> {
    // Normalize the URL pattern to handle protocol differences
    const normalizedUrlPattern = DatabaseService._normalizeUrl(urlPattern)
    if (!urlPattern) {
      throw new Error('URL pattern is required')
    }

    if (!DatabaseService.isSupported()) {
      throw new Error('IndexedDB is not supported in this browser')
    }

    // Get all BackChannel databases
    const allDatabases = await DatabaseService.getAllBackChannelDatabases()

    if (allDatabases.length === 0) {
      return []
    }

    // Track matching packages
    const matchingPackages: DatabaseMatch[] = []

    // Search through each database
    for (const dbName of allDatabases) {
      // Extract the database ID from the name
      const dbId = dbName.replace('bc-storage-', '')

      // Create a database service for this database
      const dbService = new DatabaseService(dbId)
      await dbService.init()

      try {
        // Get the package from this database
        const packageData = await dbService.getPackage()

        // Check if the URL starts with the package's rootURL (proper subpath matching)
        // Also handle protocol differences by normalizing URLs
        const normalizedRootUrl = DatabaseService._normalizeUrl(packageData?.rootURL || '')

        if (
          packageData &&
          packageData.rootURL &&
          (urlPattern.startsWith(packageData.rootURL) ||
            normalizedUrlPattern.startsWith(normalizedRootUrl))
        ) {
          matchingPackages.push({
            dbId,
            dbName,
            packageData,
          })
        }
      } catch (packageError) {
        console.warn(`Error getting package from database ${dbId}:`, packageError)
        // Continue with next database
      } finally {
        // Close the database connection
        dbService.close()
      }
    }

    return matchingPackages
  }

  /**
   * Initializes the database connection and optionally adds initial package data
   * @returns Whether initialization was successful
   */
  async init(): Promise<boolean> {
    if (!this.isSupported) {
      console.error('IndexedDB is not supported in this browser')
      return false
    }

    try {
      const initResult = await new Promise<boolean>(resolve => {
        const request = this.idb.open(this.dbName, this.dbVersion)

        request.onerror = (event: Event) => {
          console.error('Error opening IndexedDB:', (event.target as IDBRequest).error)
          resolve(false)
        }

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBRequest).result as IDBDatabase

          // Create packages store
          if (!db.objectStoreNames.contains('packages')) {
            const packagesStore = db.createObjectStore('packages', { keyPath: 'id' })
            packagesStore.createIndex('name', 'name', { unique: false })
            packagesStore.createIndex('version', 'version', { unique: false })

            // If we have initial package data, add it during database creation
            if (this.initialPackageData) {
              try {
                packagesStore.add(this.initialPackageData)
                console.log(
                  `Added initial package ${this.initialPackageData.id} during database creation`
                )
              } catch (err) {
                console.error('Error adding initial package data:', err)
              }
            }
          }

          // Create comments store
          if (!db.objectStoreNames.contains('comments')) {
            const commentsStore = db.createObjectStore('comments', { keyPath: 'timestamp' })
            commentsStore.createIndex('pageUrl', 'pageUrl', { unique: false })
          }
        }

        request.onsuccess = (event: Event) => {
          this.db = (event.target as IDBRequest).result as IDBDatabase
          resolve(true)
        }
      })

      // If we have initial package data but the database already existed (no upgrade needed)
      // we need to check if the packages store is empty and add the package if it is
      if (initResult && this.initialPackageData && this.db) {
        const hasPackages = await this._checkPackagesExist()
        if (!hasPackages) {
          await this._addPackage(this.initialPackageData)
        }
      }

      return initResult
    } catch (error) {
      console.error('Error initializing database:', error)
      return false
    }
  }

  /**
   * Checks if any packages exist in the database
   * @returns Whether any packages exist
   * @private
   */
  private async _checkPackagesExist(): Promise<boolean> {
    if (!this.db) {
      return false
    }

    try {
      return new Promise<boolean>(resolve => {
        const transaction = this.db!.transaction(['packages'], 'readonly')
        const store = transaction.objectStore('packages')
        const countRequest = store.count()

        countRequest.onsuccess = () => {
          resolve(countRequest.result > 0)
        }

        countRequest.onerror = () => {
          console.error('Error checking if packages exist')
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Error in _checkPackagesExist:', error)
      return false
    }
  }

  /**
   * Closes the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  // ========== Package Store Methods ==========

  /**
   * Adds a new package to the store if the store is empty
   * Private method - only used internally
   * @param packageData - Package data to add
   * @returns ID of the added package or null on error
   * @private
   */
  private async _addPackage(packageData: Package): Promise<string | null> {
    // Clear the package cache when creating a new package
    DatabaseService.clearPackageCache()
    if (!this.db) {
      return null
    }

    try {
      // First check if any packages already exist
      const hasPackages = await this._checkPackagesExist()
      if (hasPackages) {
        console.warn(
          'Cannot add new package: database already has a package. Use updatePackage instead.'
        )
        return null
      }

      // Ensure the package has an ID
      if (!packageData.id) {
        packageData.id = this._generatePackageId()
      }

      return new Promise<string | null>(resolve => {
        const transaction = this.db!.transaction(['packages'], 'readwrite')
        const store = transaction.objectStore('packages')
        const request = store.add(packageData)

        request.onsuccess = () => {
          resolve(packageData.id || null)
        }

        request.onerror = (event: Event) => {
          console.error('Error adding package:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in addPackage:', error)
      return null
    }
  }

  /**
   * Gets the package from the database
   * There should only be one package in the database
   * @returns Package data or null if not found
   * @throws {Error} - If more than one package exists in the database
   */
  async getPackage(): Promise<Package | null> {
    if (!this.db) {
      return null
    }

    try {
      return new Promise<Package | null>((resolve, reject) => {
        const transaction = this.db!.transaction(['packages'], 'readonly')
        const store = transaction.objectStore('packages')
        const request = store.getAll()

        request.onsuccess = () => {
          if (request.result && request.result.length > 1) {
            reject(
              new Error('Database integrity error: More than one package exists in the database')
            )
            return
          }
          resolve(request.result && request.result.length === 1 ? request.result[0] : null)
        }

        request.onerror = (event: Event) => {
          console.error('Error getting package:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in getPackage:', error)
      return null
    }
  }

  /**
   * Static method to clear the package cache in localStorage
   * This should be called when creating, updating, or deleting packages
   */
  static clearPackageCache(): void {
    try {
      // Only attempt to clear cache if localStorage is available
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('bc_root')
        localStorage.removeItem('bc_package')
      }
    } catch (error) {
      console.warn('Error clearing package cache:', error)
    }
  }

  /**
   * Updates an existing package
   * @param packageData - Updated package data
   * @returns Whether the update was successful
   */
  async updatePackage(packageData: Package): Promise<boolean> {
    // Clear the package cache when updating a package
    DatabaseService.clearPackageCache()

    if (!this.db || !packageData.id) {
      return false
    }

    try {
      return new Promise<boolean>(resolve => {
        const transaction = this.db!.transaction(['packages'], 'readwrite')
        const store = transaction.objectStore('packages')
        const request = store.put(packageData)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event: Event) => {
          console.error('Error updating package:', (event.target as IDBRequest).error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Error in updatePackage:', error)
      return false
    }
  }

  // ========== Comment Store Methods ==========

  /**
   * Adds a new comment to the store
   * @param commentData - Comment data to add
   * @returns Timestamp of the added comment or null on error
   */
  async addComment(commentData: Comment): Promise<number | null> {
    if (!this.db) {
      return null
    }

    try {
      return new Promise<number | null>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readwrite')
        const store = transaction.objectStore('comments')
        const request = store.add(commentData)

        request.onsuccess = () => {
          resolve(commentData.timestamp)
        }

        request.onerror = (event: Event) => {
          console.error('Error adding comment:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in addComment:', error)
      return null
    }
  }

  /**
   * Gets a comment by timestamp
   * @param timestamp - Comment timestamp
   * @returns Comment data or null if not found
   */
  async getComment(timestamp: number): Promise<Comment | null> {
    if (!this.db) {
      return null
    }

    try {
      return new Promise<Comment | null>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readonly')
        const store = transaction.objectStore('comments')
        const request = store.get(timestamp)

        request.onsuccess = () => {
          resolve(request.result || null)
        }

        request.onerror = (event: Event) => {
          console.error('Error getting comment:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in getComment:', error)
      return null
    }
  }

  /**
   * Updates an existing comment
   * @param commentData - Updated comment data
   * @returns Whether the update was successful
   */
  async updateComment(commentData: Comment): Promise<boolean> {
    if (!this.db || !commentData.timestamp) {
      return false
    }

    try {
      return new Promise<boolean>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readwrite')
        const store = transaction.objectStore('comments')
        const request = store.put(commentData)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event: Event) => {
          console.error('Error updating comment:', (event.target as IDBRequest).error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Error in updateComment:', error)
      return false
    }
  }

  /**
   * Deletes a comment by timestamp
   * @param timestamp - Comment timestamp to delete
   * @returns Whether the deletion was successful
   */
  async deleteComment(timestamp: number | string): Promise<boolean> {
    if (!this.db) {
      return false
    }

    try {
      return new Promise<boolean>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readwrite')
        const store = transaction.objectStore('comments')
        // if timestamp is a string, convert it to an integer
        if (typeof timestamp === 'string') {
          timestamp = parseInt(timestamp)
        }
        // check object with this key exists
        const getRequest = store.get(timestamp)
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            const request = store.delete(timestamp)
            request.onsuccess = () => {
              resolve(true)
            }
            request.onerror = (event: Event) => {
              console.error('Error deleting comment:', (event.target as IDBRequest).error)
              resolve(false)
            }
          } else {
            console.log('Comment not found', timestamp, typeof timestamp)
            resolve(false)
          }
        }
      })
    } catch (error) {
      console.error('Error in deleteComment:', error)
      return false
    }
  }

  /**
   * Gets all comments from the store
   * @returns Array of comments or null on error
   */
  async getAllComments(): Promise<Comment[] | null> {
    if (!this.db) {
      return null
    }

    try {
      return new Promise<Comment[] | null>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readonly')
        const store = transaction.objectStore('comments')
        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result || [])
        }

        request.onerror = (event: Event) => {
          console.error('Error getting all comments:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in getAllComments:', error)
      return null
    }
  }
}

export { DatabaseService }
