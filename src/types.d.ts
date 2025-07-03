/**
 * Type definitions for BackChannel
 */

/**
 * Package data interface
 */
export interface Package {
  id?: string // treated as unique id of package
  name: string // name of document receiving feedback
  version: string // version of BackChannel library
  author: string // author of feedback
  rootURL?: string // root url of package receiving feedback
}

/**
 * Comment data interface
 */
export interface Comment {
  timestamp: number // treated as unique id of comment
  xpath: string // the xpath of the element
  elementText: string // the first few characters of the element text
  feedback: string // the line of feedback. Plain text.
  pageUrl: string // url of document, relative to document rootURL
  documentTitle: string // human-readable version of document title, to help with review/management
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

// No need for global IndexedDB declarations as they're provided by the DOM lib
