/**
 * Type definitions for BackChannel
 */

/**
 * Package data interface
 */
export interface Package {
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
export interface Comment {
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
export interface DatabaseMatch {
  dbId: string
  dbName?: string
  packageData: Package
}

/**
 * Active feedback package result interface
 */
export interface ActiveFeedbackPackage {
  dbId: string
  packageData: Package
}
