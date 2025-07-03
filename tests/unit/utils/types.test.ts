import { describe, it, expect } from 'vitest'

import type { Comment, Package } from '../../e2e/fixtures/enabled-test/fakeData'

describe('Shared Types', () => {
  describe('Comment', () => {
    it('should create a valid Comment object', () => {
      const comment: Comment = {
        timestamp: Date.now(),
        xpath: '/html/body/div[1]/p[2]',
        elementText: 'This is the element text',
        feedback: 'This is my feedback on this element',
        pageUrl: 'https://example.com',
        documentTitle: 'Example Page Title',
      }

      expect(comment).toBeDefined()
      expect(comment.timestamp).toBeTypeOf('number')
      expect(comment.xpath).toBeTypeOf('string')
      expect(comment.elementText).toBeTypeOf('string')
      expect(comment.feedback).toBeTypeOf('string')
    })
  })

  describe('FeedbackPackage', () => {
    it('should create a valid FeedbackPackage object', () => {
      const feedbackPackage: Package = {
        rootURL: 'https://example.com',
        name: 'Example Feedback',
        author: 'John Doe',
        version: '1.0.0',
        id: '1',
      }

      expect(feedbackPackage).toBeDefined()
      expect(feedbackPackage.rootURL).toBeTypeOf('string')
      expect(feedbackPackage.name).toBeTypeOf('string')
      expect(feedbackPackage.author).toBeTypeOf('string')
    })
  })
})
