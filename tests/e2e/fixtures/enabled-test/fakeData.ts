/**
 * Fake database definitions for the enabled test fixture
 * This file exports an array of typed JSON objects that will be converted
 * into IDBDatabase instances using fake-indexeddb
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

export interface FakedbPackageStore {
  name: string
  keyPath: string
  data: Package[]
}

export interface FakedbCommentsStore {
  name: string
  keyPath: string
  data: Comment[]
}

export interface FakeDbJson {
  name: string
  version: number
  objectStores: [FakedbPackageStore, FakedbCommentsStore]
}

/**
 * Fake database definitions for the enabled test fixture
 * Each database definition includes:
 * - name: The name of the database
 * - version: The version of the database
 * - objectStores: Array of object stores with their data
 */
export const fakeData: FakeDbJson[] = [
  {
    name: 'bc-storage-enabled',
    version: 1,
    objectStores: [
      {
        name: 'packages',
        keyPath: 'id',
        data: [
          {
            id: 'pkg-1234567890',
            name: 'Enabled Test Package',
            rootURL: 'http://localhost:5173/tests/e2e/fixtures/enabled-test/enabled',
            version: '1.0.0',
            author: 'Test Author 1',
          },
        ],
      },
      {
        name: 'comments',
        keyPath: 'timestamp',
        data: [
          {
            feedback: 'This is a test comment for the enabled fixture',
            xpath: 'body > h1',
            elementText: 'Enabled Test Package',
            pageUrl: 'enabled/index.html',
            documentTitle: 'Enabled Page',
            timestamp: Date.now(),
          },
          {
            feedback: 'Another test comment for the enabled fixture',
            xpath: 'body > p',
            elementText: 'Enabled Test Package',
            pageUrl: 'enabled/subdir/index.html',
            documentTitle: 'Enabled Subdirectory Page',
            timestamp: Date.now() - 86400000, // 1 day ago
          },
        ],
      },
    ],
  },
]

// Make fakeData available on the window object
if (typeof window !== 'undefined') {
  // When loaded as a module, we need to explicitly declare it on the global window object
  Object.defineProperty(window, 'fakeData', {
    value: fakeData,
    writable: true,
    enumerable: true,
    configurable: true,
  })

  // Log that we've set the fake data
  console.log('fakeData has been set on window object:', (window as any).fakeData)
}
