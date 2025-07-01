/**
 * Unit tests for packageService.ts
 */

/* global setTimeout */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PackageData, getActiveFeedbackPackage } from '../../../src/services/packageService'

// Create mock packages for testing
const mockPackages: Record<string, PackageData[]> = {
  empty: [],
  withMatch: [
    {
      id: 'other-site',
      rootURL: 'https://other.com',
      name: 'Other Site',
      author: 'Test User',
      version: '1.0.0',
      description: 'Other test site'
    },
    {
      id: 'example-site',
      rootURL: 'https://example.com',
      name: 'Example Site',
      author: 'Test User',
      version: '1.0.0',
      description: 'Example test site',
    },
  ],
  noMatch: [
    {
      id: 'other-site',
      rootURL: 'https://other.com',
      name: 'Other Site',
      author: 'Test User',
      version: '1.0.0',
      description: 'Other test site'
    },
    {
      id: 'another-site',
      rootURL: 'https://another.com',
      name: 'Another Site',
      author: 'Test User',
      version: '1.0.0',
      description: 'Another test site',
    },
  ],
}

// Mock the indexedDB global object
const mockIndexedDB = {
  databases: vi.fn(),
  open: vi.fn(),
}

// Mock functions for database operations
const mockGetAll = vi.fn()
const mockObjectStore = vi.fn(() => ({
  getAll: mockGetAll,
}))
const mockTransaction = vi.fn(() => ({
  objectStore: mockObjectStore,
}))
const mockClose = vi.fn()
const mockDb = {
  transaction: mockTransaction,
  objectStoreNames: {
    contains: vi.fn(),
  },
  close: mockClose,
}

describe('packageService', () => {
  beforeEach(() => {
    // Reset all mocks
    mockIndexedDB.databases.mockReset()
    mockIndexedDB.open.mockReset()
    mockDb.objectStoreNames.contains.mockReset()
    mockGetAll.mockReset()
    // Mock indexedDB global in the test environment
    Object.defineProperty(window, 'indexedDB', {
      value: mockIndexedDB,
      writable: true
    })
  })

  describe('getActiveFeedbackPackage', () => {
    it('should return null when no databases are found', async () => {
      // Mock indexedDB.databases() to return empty array
      mockIndexedDB.databases.mockResolvedValue([])

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).toBeNull()
      expect(mockIndexedDB.databases).toHaveBeenCalled()
    })

    it('should return null when no feedback databases are found', async () => {
      // Mock indexedDB.databases() to return non-matching databases
      mockIndexedDB.databases.mockResolvedValue([{ name: 'other-db-1' }, { name: 'other-db-2' }])

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).toBeNull()
      expect(mockIndexedDB.databases).toHaveBeenCalled()
    })

    it('should return the first matching package when found', async () => {
      // Mock indexedDB.databases() to return feedback databases
      mockIndexedDB.databases.mockResolvedValue([
        { name: 'bc-storage-example' },
        { name: 'bc-storage-other' },
      ])

      // Mock database open success
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
      }
      mockIndexedDB.open.mockReturnValue(mockRequest)

      // Mock database has packages store
      mockDb.objectStoreNames.contains.mockReturnValue(true)

      // Mock getAllRequest
      const mockGetAllRequest = {
        onerror: null as any,
        onsuccess: null as any,
        result: [mockPackages.withMatch[1]], // Example.com package
      }
      mockGetAll.mockReturnValue(mockGetAllRequest)

      // Schedule async callbacks
      setTimeout(() => {
        // Trigger open success
        mockRequest.onsuccess({ target: { result: mockDb } })
        // Trigger getAll success
        setTimeout(() => {
          mockGetAllRequest.onsuccess()
        }, 0)
      }, 0)

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).not.toBeNull()
      expect(result).toEqual(mockPackages.withMatch[1])
      expect(mockIndexedDB.databases).toHaveBeenCalled()
      expect(mockIndexedDB.open).toHaveBeenCalledWith('bc-storage-example')
      expect(mockDb.objectStoreNames.contains).toHaveBeenCalledWith('packages')
      expect(mockTransaction).toHaveBeenCalledWith(['packages'], 'readonly')
      expect(mockObjectStore).toHaveBeenCalled()
      expect(mockGetAll).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })

    it('should return null when no matching package is found', async () => {
      // Mock indexedDB.databases() to return feedback databases
      mockIndexedDB.databases.mockResolvedValue([{ name: 'bc-storage-other' }])

      // Mock database open success
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
      }
      mockIndexedDB.open.mockReturnValue(mockRequest)

      // Mock database has packages store
      mockDb.objectStoreNames.contains.mockReturnValue(true)

      // Mock getAllRequest with non-matching package
      const mockGetAllRequest = {
        onerror: null as any,
        onsuccess: null as any,
        result: [mockPackages.noMatch[0]], // Other.com package
      }
      mockGetAll.mockReturnValue(mockGetAllRequest)

      // Schedule async callbacks
      setTimeout(() => {
        // Trigger open success
        mockRequest.onsuccess({ target: { result: mockDb } })
        // Trigger getAll success
        setTimeout(() => {
          mockGetAllRequest.onsuccess()
        }, 0)
      }, 0)

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      // Mock indexedDB.databases() to return feedback databases
      mockIndexedDB.databases.mockResolvedValue([{ name: 'bc-storage-example' }])

      // Mock database open error
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
      }
      mockIndexedDB.open.mockReturnValue(mockRequest)

      // Schedule async callbacks
      setTimeout(() => {
        // Trigger open error
        mockRequest.onerror()
      }, 0)

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).toBeNull()
    })
  })
})
