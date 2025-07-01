import { describe, it, expect } from 'vitest'
import type { Comment, FeedbackPackage } from '../../../src/types/index'

describe('Shared Types', () => {
  describe('Comment', () => {
    it('should create a valid Comment object', () => {
      const comment: Comment = {
        timestamp: Date.now(),
        xPath: '/html/body/div[1]/p[2]',
        elementText: 'This is the element text',
        feedback: 'This is my feedback on this element',
      }

      expect(comment).toBeDefined()
      expect(comment.timestamp).toBeTypeOf('number')
      expect(comment.xPath).toBeTypeOf('string')
      expect(comment.elementText).toBeTypeOf('string')
      expect(comment.feedback).toBeTypeOf('string')
    })
  })

  describe('FeedbackPackage', () => {
    it('should create a valid FeedbackPackage object', () => {
      const feedbackPackage: FeedbackPackage = {
        rootURL: 'https://example.com',
        name: 'Example Feedback',
        author: 'John Doe',
      }

      expect(feedbackPackage).toBeDefined()
      expect(feedbackPackage.rootURL).toBeTypeOf('string')
      expect(feedbackPackage.name).toBeTypeOf('string')
      expect(feedbackPackage.author).toBeTypeOf('string')
    })
  })
})
