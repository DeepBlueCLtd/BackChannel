/**
 * Fake database definitions for the enabled test fixture
 * This file exports an array of typed JSON objects that will be converted
 * into IDBDatabase instances using fake-indexeddb
 */

import type { FakeDbStore } from '../../../../src/types'

/**
 * Fake database definitions for the enabled test fixture
 * Each database definition includes:
 * - name: The name of the database
 * - version: The version of the database
 * - objectStores: Array of object stores with their data
 */
export const fakeData: FakeDbStore = {
  version: 1,
  databases: [
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
              documentTitle: 'BackChannel Enabled Test - Enabled Root',
              elementText: 'This is the root page of the',
              feedback: 'first para, root page',
              pageUrl: '/tests/e2e/fixtures/enabled-test/enabled/index.html',
              timestamp: 1751900748258,
              xpath: '/html/body/p',
            },
            {
              timestamp: 1751900770594,
              xpath: '/html/body/ul/li[2]',
              elementText: 'Item 2',
              feedback: 'item two',
              pageUrl: '/tests/e2e/fixtures/enabled-test/enabled/subdir/index.html',
            },
          ],
        },
      ],
    },
  ],
}

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
