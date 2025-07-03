/* global console, window, localStorage */

/**
 * Types for DatabaseService
 */

/**
 * Package data interface
 */
export interface PackageData {
  id?: string
  name?: string
  version?: string
  rootURL?: string
  [key: string]: any // Allow for additional properties
}

/**
 * Comment data interface
 */
export interface CommentData {
  timestamp: number
  xpath: string
  elementText: string
  feedback: string
  pageUrl: string
  documentTitle: string
  [key: string]: any // Allow for additional properties
}

/**
 * Database match result interface
 */
export interface DatabaseMatch {
  dbId: string
  dbName?: string
  packageData: PackageData
}

/**
 * Active feedback package result interface
 */
export interface ActiveFeedbackPackage {
  dbId: string
  packageData: PackageData
}

/**
 * DatabaseService - IndexedDB wrapper for BackChannel
 * Provides storage functionality for packages and comments
 */
export class DatabaseService {
  dbName: string
  dbVersion: number
  db: IDBDatabase | null
  isSupported: boolean
  initialPackageData: PackageData | null

  /**
   * Constructor for DatabaseService
   * @param documentTitle - Title of the document for database naming
   * @param packageData - Optional package data to initialize with
   */
  constructor(documentTitle?: string, packageData: PackageData | null = null) {
    // Generate a database ID using the last 6 digits of the timestamp if not provided
    const dbId = documentTitle || this._generateDatabaseId()
    this.dbName = `bc-storage-${this._sanitizeDbName(dbId)}`
    this.dbVersion = 1
    this.db = null
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
   * Checks if IndexedDB is supported in the current browser
   * @returns Whether IndexedDB is supported
   * @private
   */
  private _checkSupport(): boolean {
    return DatabaseService.isSupported()
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
      return databases.filter(db => db.name.startsWith('bc-storage-')).map(db => db.name)
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
  static async getActiveFeedbackPackageForUrl(currentUrl: string): Promise<ActiveFeedbackPackage | null> {
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
          const packageData = JSON.parse(cachedPackage) as PackageData & { dbId: string }
          const dbId = packageData.dbId
          delete packageData.dbId // Remove the dbId from the package data

          return {
            dbId,
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
        const request = window.indexedDB.open(this.dbName, this.dbVersion)

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

  /**
   * Adds a package to the database
   * @param packageData - Package data to add
   * @returns Added package data or null if failed
   * @private
   */
  private async _addPackage(packageData: PackageData): Promise<PackageData | null> {
    if (!this.db) {
      console.error('Database not initialized')
      return null
    }

    try {
      return new Promise<PackageData | null>(resolve => {
        const transaction = this.db!.transaction(['packages'], 'readwrite')
        const store = transaction.objectStore('packages')

        // Ensure the package has an ID
        if (!packageData.id) {
          packageData.id = this._generatePackageId()
        }

        const request = store.add(packageData)

        request.onsuccess = () => {
          resolve(packageData)
        }

        request.onerror = (event) => {
          console.error('Error adding package:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in _addPackage:', error)
      return null
    }
  }

  /**
   * Gets the package from the database
   * @returns Package data or null if not found
   */
  async getPackage(): Promise<PackageData | null> {
    if (!this.db) {
      console.error('Database not initialized')
      return null
    }

    try {
      return new Promise<PackageData | null>(resolve => {
        const transaction = this.db!.transaction(['packages'], 'readonly')
        const store = transaction.objectStore('packages')
        const request = store.getAll()

        request.onsuccess = () => {
          const packages = request.result
          if (packages && packages.length > 0) {
            resolve(packages[0])
          } else {
            resolve(null)
          }
        }

        request.onerror = (event) => {
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
   * Updates the package in the database
   * @param packageData - Updated package data
   * @returns Updated package data or null if failed
   */
  async updatePackage(packageData: PackageData): Promise<PackageData | null> {
    if (!this.db) {
      console.error('Database not initialized')
      return null
    }

    try {
      // Get the current package to ensure we have the ID
      const currentPackage = await this.getPackage()
      if (!currentPackage) {
        // If no package exists, add a new one
        return this._addPackage(packageData)
      }

      // Ensure we keep the same ID
      packageData.id = currentPackage.id

      return new Promise<PackageData | null>(resolve => {
        const transaction = this.db!.transaction(['packages'], 'readwrite')
        const store = transaction.objectStore('packages')
        const request = store.put(packageData)

        request.onsuccess = () => {
          resolve(packageData)
        }

        request.onerror = (event) => {
          console.error('Error updating package:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in updatePackage:', error)
      return null
    }
  }

  /**
   * Adds a comment to the database
   * @param commentData - Comment data to add
   * @returns Added comment data or null if failed
   */
  async addComment(commentData: CommentData): Promise<CommentData | null> {
    if (!this.db) {
      console.error('Database not initialized')
      return null
    }

    try {
      return new Promise<CommentData | null>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readwrite')
        const store = transaction.objectStore('comments')
        const request = store.add(commentData)

        request.onsuccess = () => {
          resolve(commentData)
        }

        request.onerror = (event) => {
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
   * Gets all comments from the database
   * @returns Array of comments or null if failed
   */
  async getAllComments(): Promise<CommentData[] | null> {
    if (!this.db) {
      console.error('Database not initialized')
      return null
    }

    try {
      return new Promise<CommentData[] | null>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readonly')
        const store = transaction.objectStore('comments')
        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = (event) => {
          console.error('Error getting comments:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in getAllComments:', error)
      return null
    }
  }

  /**
   * Gets comments for a specific page URL
   * @param pageUrl - URL of the page to get comments for
   * @returns Array of comments or null if failed
   */
  async getCommentsForPage(pageUrl: string): Promise<CommentData[] | null> {
    if (!this.db) {
      console.error('Database not initialized')
      return null
    }

    try {
      return new Promise<CommentData[] | null>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readonly')
        const store = transaction.objectStore('comments')
        const index = store.index('pageUrl')
        const request = index.getAll(pageUrl)

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = (event) => {
          console.error('Error getting comments for page:', (event.target as IDBRequest).error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error in getCommentsForPage:', error)
      return null
    }
  }

  /**
   * Deletes a comment from the database
   * @param timestamp - Timestamp of the comment to delete
   * @returns Whether deletion was successful
   */
  async deleteComment(timestamp: number): Promise<boolean> {
    if (!this.db) {
      console.error('Database not initialized')
      return false
    }

    try {
      return new Promise<boolean>(resolve => {
        const transaction = this.db!.transaction(['comments'], 'readwrite')
        const store = transaction.objectStore('comments')
        const request = store.delete(timestamp)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event) => {
          console.error('Error deleting comment:', (event.target as IDBRequest).error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Error in deleteComment:', error)
      return false
    }
  }

  /**
   * Deletes the database
   * @returns Whether deletion was successful
   */
  async deleteDatabase(): Promise<boolean> {
    this.close()

    try {
      return new Promise<boolean>(resolve => {
        const request = window.indexedDB.deleteDatabase(this.dbName)

        request.onsuccess = () => {
          console.log(`Database ${this.dbName} deleted successfully`)
          resolve(true)
        }

        request.onerror = (event) => {
          console.error('Error deleting database:', (event.target as IDBRequest).error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Error in deleteDatabase:', error)
      return false
    }
  }

  /**
   * Static method to delete a specific database by ID
   * @param dbId - ID of the database to delete
   * @returns Whether deletion was successful
   */
  static async deleteSpecificDatabase(dbId: string): Promise<boolean> {
    if (!DatabaseService.isSupported()) {
      throw new Error('IndexedDB is not supported in this browser')
    }

    const dbName = `bc-storage-${dbId}`

    try {
      return new Promise<boolean>(resolve => {
        const request = window.indexedDB.deleteDatabase(dbName)

        request.onsuccess = () => {
          console.log(`Database ${dbName} deleted successfully`)
          resolve(true)
        }

        request.onerror = (event) => {
          console.error('Error deleting database:', (event.target as IDBRequest).error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Error in deleteSpecificDatabase:', error)
      return false
    }
  }
}
