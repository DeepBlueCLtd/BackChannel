/**
 * Fake database definitions for the enabled test fixture
 * This file exports an array of typed JSON objects that will be converted
 * into IDBDatabase instances using fake-indexeddb
 */

import { Package, Comment } from '../../../../src/types'

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
        name: 'package',
        keyPath: 'id',
        data: [
          {
            id: 'pkg-1234567890',
            name: 'Enabled Test Package',
            rootURL: 'http://localhost:8080/tests/e2e/fixtures/enabled-test/enabled/',
            version: '1.0.0',
            author: 'Test Author 1',
          },
        ],
      },
      {
        name: 'comments',
        keyPath: 'id',
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
  ;(window as any).fakeData = fakeData
}
