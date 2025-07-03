/**
 * Type definitions for BackChannel
 */

/**
 * Package data interface
 */
interface Package {
  id?: string
  name: string
  version: string
  author: string
  description: string
  rootURL?: string
}

/**
 * Comment data interface
 */
interface Comment {
  timestamp: number
  xpath: string
  elementText: string
  feedback: string
  pageUrl: string
  documentTitle: string
}

/**
 * Database match result interface
 */
interface DatabaseMatch {
  dbId: string
  dbName?: string
  packageData: Package
}
