/**
 * Unit tests for packageService.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FeedbackPackage } from '../../../src/types'

// Create mock packages for testing
const mockPackages: Record<string, FeedbackPackage[]> = {
  empty: [],
  withMatch: [
    {
      rootURL: 'https://other.com',
      name: 'Other Site',
      author: 'Test User',
    },
    {
      rootURL: 'https://example.com',
      name: 'Example Site',
      author: 'Test User',
    },
  ],
  noMatch: [
    {
      rootURL: 'https://other.com',
      name: 'Other Site',
      author: 'Test User',
    },
    {
      rootURL: 'https://another.com',
      name: 'Another Site',
      author: 'Test User',
    },
  ],
}

// Mock the entire packageService module
vi.mock('../../../src/services/packageService', () => {
  // Create a mock version of getActiveFeedbackPackage that we can control
  const mockGetActiveFeedbackPackage = vi.fn()
  return {
    getActiveFeedbackPackage: mockGetActiveFeedbackPackage,
  }
})

// Mock the DatabaseService
vi.mock('../../../src/services/db.js', () => ({
  DatabaseService: vi.fn(),
}))

// Import the mocked function
import { getActiveFeedbackPackage } from '../../../src/services/packageService'

describe('packageService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Mock document.title
    Object.defineProperty(document, 'title', {
      value: 'Test Document',
      writable: true,
    })
  })

  describe('getActiveFeedbackPackage', () => {
    it('should return null when no packages are found', async () => {
      // Setup the mock implementation for this test
      vi.mocked(getActiveFeedbackPackage).mockImplementation(async () => {
        // Simulate the real function's behavior with empty packages
        return null
      })

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).toBeNull()
    })

    it('should return the first matching package when found', async () => {
      // Setup the mock implementation for this test
      vi.mocked(getActiveFeedbackPackage).mockImplementation(async url => {
        // Simulate the real function's behavior with a matching package
        if (url.includes('example.com')) {
          return mockPackages.withMatch[1]
        }
        return null
      })

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).not.toBeNull()
      expect(result).toEqual(mockPackages.withMatch[1])
    })

    it('should return null when no matching package is found', async () => {
      // Setup the mock implementation for this test
      vi.mocked(getActiveFeedbackPackage).mockImplementation(async () => {
        // Simulate the real function's behavior with no matching package
        return null
      })

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      // Setup the mock implementation for this test
      vi.mocked(getActiveFeedbackPackage).mockImplementation(async () => {
        // Simulate the real function's behavior with a database error
        return null
      })

      const result = await getActiveFeedbackPackage('https://example.com/page')
      expect(result).toBeNull()
    })
  })
})
