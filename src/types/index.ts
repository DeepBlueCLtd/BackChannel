/**
 * Type definitions for BackChannel application
 */

/**
 * Represents a comment/feedback on a specific element of a webpage
 */
export interface Comment {
  timestamp: number // Timestamp when the comment was created
  xPath: string // XPath location of the element being commented on
  elementText: string // Text content of the element being commented on
  feedback: string // The actual comment/feedback text
}

/**
 * Represents metadata about a collection of feedback for a website
 */
export interface FeedbackPackage {
  rootURL: string // The base URL of the website being commented on
  name: string // Name of the feedback package
  author: string // The person who created the feedback package
}
