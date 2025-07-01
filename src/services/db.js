/* global console, window */

/**
 * DatabaseService - IndexedDB wrapper for BackChannel
 * Provides storage functionality for packages and comments
 */

class DatabaseService {
  /**
   * Constructor for DatabaseService
   * @param {string} documentTitle - Title of the document for database naming
   * @param {Object} [packageData] - Optional package data to initialize with
   */
  constructor(documentTitle, packageData = null) {
    this.dbName = `bc-storage-${this._sanitizeDbName(documentTitle || 'default')}`;
    this.dbVersion = 1;
    this.db = null;
    this.isSupported = this._checkSupport();
    this.initialPackageData = packageData;
  }

  /**
   * Sanitizes the document title for use in database name
   * @param {string} name - Document title
   * @returns {string} - Sanitized name
   * @private
   */
  _sanitizeDbName(name) {
    // Create a short version of the name, suitable for IndexedDB
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
  }

  /**
   * Checks if IndexedDB is supported in the current browser
   * @returns {boolean} - Whether IndexedDB is supported
   * @private
   */
  _checkSupport() {
    return typeof window !== 'undefined' && window.indexedDB !== undefined && window.indexedDB !== null;
  }

  /**
   * Initializes the database connection
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async init() {
    if (!this.isSupported) {
      console.error('IndexedDB is not supported in this browser');
      return false;
    }

    try {
      return new Promise((resolve) => {
        const request = window.indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = (event) => {
          console.error('Error opening IndexedDB:', event.target.error);
          resolve(false);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Create packages store
          if (!db.objectStoreNames.contains('packages')) {
            const packagesStore = db.createObjectStore('packages', { keyPath: 'id' });
            packagesStore.createIndex('name', 'name', { unique: false });
            packagesStore.createIndex('version', 'version', { unique: false });
          }

          // Create comments store
          if (!db.objectStoreNames.contains('comments')) {
            const commentsStore = db.createObjectStore('comments', { keyPath: 'timestamp' });
            commentsStore.createIndex('pageUrl', 'pageUrl', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(true);
        };
      });
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  /**
   * Closes the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // ========== Package Store Methods ==========

  /**
   * Adds a new package to the store
   * @param {Object} packageData - Package data to add
   * @param {string} packageData.id - Unique identifier
   * @param {string} packageData.name - Package name
   * @param {string} packageData.version - Package version
   * @param {string} packageData.author - Package author
   * @param {string} packageData.description - Package description
   * @returns {Promise<string|null>} - ID of the added package or null on error
   */
  async addPackage(packageData) {
    if (!this.db) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['packages'], 'readwrite');
        const store = transaction.objectStore('packages');
        const request = store.add(packageData);

        request.onsuccess = () => {
          resolve(packageData.id);
        };

        request.onerror = (event) => {
          console.error('Error adding package:', event.target.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error in addPackage:', error);
      return null;
    }
  }

  /**
   * Gets a package by ID
   * @param {string} id - Package ID
   * @returns {Promise<Object|null>} - Package data or null if not found
   */
  async getPackage(id) {
    if (!this.db) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['packages'], 'readonly');
        const store = transaction.objectStore('packages');
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = (event) => {
          console.error('Error getting package:', event.target.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error in getPackage:', error);
      return null;
    }
  }

  /**
   * Updates an existing package
   * @param {Object} packageData - Updated package data
   * @returns {Promise<boolean>} - Whether the update was successful
   */
  async updatePackage(packageData) {
    if (!this.db || !packageData.id) {
      return false;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['packages'], 'readwrite');
        const store = transaction.objectStore('packages');
        const request = store.put(packageData);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error updating package:', event.target.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error in updatePackage:', error);
      return false;
    }
  }

  /**
   * Deletes a package by ID
   * @param {string} id - Package ID to delete
   * @returns {Promise<boolean>} - Whether the deletion was successful
   */
  async deletePackage(id) {
    if (!this.db) {
      return false;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['packages'], 'readwrite');
        const store = transaction.objectStore('packages');
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error deleting package:', event.target.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error in deletePackage:', error);
      return false;
    }
  }

  // ========== Comment Store Methods ==========

  /**
   * Adds a new comment to the store
   * @param {Object} commentData - Comment data to add
   * @param {number} commentData.timestamp - Timestamp (used as ID)
   * @param {string} commentData.xpath - XPath for the element
   * @param {string} commentData.elementText - First part of text in element
   * @param {string} commentData.feedback - Line of feedback
   * @param {string} commentData.pageUrl - Page URL relative to root
   * @param {string} commentData.documentTitle - Document title
   * @returns {Promise<number|null>} - Timestamp of the added comment or null on error
   */
  async addComment(commentData) {
    if (!this.db) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        const request = store.add(commentData);

        request.onsuccess = () => {
          resolve(commentData.timestamp);
        };

        request.onerror = (event) => {
          console.error('Error adding comment:', event.target.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error in addComment:', error);
      return null;
    }
  }

  /**
   * Gets a comment by timestamp
   * @param {number} timestamp - Comment timestamp
   * @returns {Promise<Object|null>} - Comment data or null if not found
   */
  async getComment(timestamp) {
    if (!this.db) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['comments'], 'readonly');
        const store = transaction.objectStore('comments');
        const request = store.get(timestamp);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = (event) => {
          console.error('Error getting comment:', event.target.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error in getComment:', error);
      return null;
    }
  }

  /**
   * Updates an existing comment
   * @param {Object} commentData - Updated comment data
   * @returns {Promise<boolean>} - Whether the update was successful
   */
  async updateComment(commentData) {
    if (!this.db || !commentData.timestamp) {
      return false;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        const request = store.put(commentData);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error updating comment:', event.target.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error in updateComment:', error);
      return false;
    }
  }

  /**
   * Deletes a comment by timestamp
   * @param {number} timestamp - Comment timestamp to delete
   * @returns {Promise<boolean>} - Whether the deletion was successful
   */
  async deleteComment(timestamp) {
    if (!this.db) {
      return false;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        const request = store.delete(timestamp);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error deleting comment:', event.target.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error in deleteComment:', error);
      return false;
    }
  }

  /**
   * Gets all comments from the store
   * @returns {Promise<Array|null>} - Array of comments or null on error
   */
  async getAllComments() {
    if (!this.db) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const transaction = this.db.transaction(['comments'], 'readonly');
        const store = transaction.objectStore('comments');
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = (event) => {
          console.error('Error getting all comments:', event.target.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error in getAllComments:', error);
      return null;
    }
  }
}

export { DatabaseService };
