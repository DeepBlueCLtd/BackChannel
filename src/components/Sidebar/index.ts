/**
 * Sidebar Component - Displays the BackChannel sidebar for feedback capture and review
 * This component handles the rendering and state management of the BackChannel sidebar
 */

/// <reference lib="dom" />

/* global CustomEvent, Event, HTMLTextAreaElement */

import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import './Sidebar.css'

/**
 * BackChannel Sidebar Web Component
 */
@customElement('bc-sidebar')
export class BackChannelSidebar extends LitElement {
  /**
   * Whether the sidebar is visible
   */
  static get properties() {
    return {
      visible: { type: Boolean, reflect: true },
      captureMode: { type: Boolean, reflect: true },
      comments: { type: Array },
    }
  }

  /**
   * Lifecycle callback when properties change
   */
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('visible')) {
      if (this.visible) {
        this._showElementDecorations()
      } else {
        this._hideElementDecorations()
      }
    }
    
    // Also respond to changes in the comments array
    if (changedProperties.has('comments')) {
      if (this.visible && this.comments && this.comments.length > 0) {
        this._showElementDecorations()
      }
    }
  }

  // TypeScript declarations for properties
  declare visible: boolean
  declare captureMode: boolean
  declare comments: any[]

  constructor() {
    super()
    this.comments = []
  }

  // Private state
  private _currentFeedback = ''

  /**
   * Handle closing the sidebar
   */
  private _handleClose() {
    this.visible = false
  }

  /**
   * Handle starting the capture mode
   */
  private _handleCapture() {
    this.captureMode = true
    this.visible = false
    this.dispatchEvent(
      new CustomEvent('start-capture', {
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Handle exporting the feedback
   */
  private _handleExport() {
    this.dispatchEvent(
      new CustomEvent('export-feedback', {
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Handle feedback input changes
   */
  private _handleFeedbackInput(e: Event) {
    const target = e.target as HTMLTextAreaElement
    this._currentFeedback = target.value
  }

  /**
   * Handle saving the feedback
   */
  private _handleSaveFeedback() {
    if (!this._currentFeedback.trim()) return

    this.dispatchEvent(
      new CustomEvent('save-feedback', {
        bubbles: true,
        composed: true,
        detail: {
          feedback: this._currentFeedback,
        },
      })
    )

    this._currentFeedback = ''
  }

  /**
   * Show decorations on elements that have comments
   */
  private _showElementDecorations() {
    if (!this.comments || this.comments.length === 0) return

    // Remove any existing decorations first
    this._hideElementDecorations()
    
    // Add CSS styles for comment decorations
    const styleId = 'bc-comment-styles'
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style')
      styleEl.id = styleId
      styleEl.textContent = `
        .bc-has-comment { 
          outline: 2px solid #4285f4; 
          position: relative; 
        } 
        .bc-comment-tooltip { 
          position: absolute; 
          background: #333; 
          color: white; 
          padding: 8px 12px; 
          border-radius: 4px; 
          font-size: 14px; 
          max-width: 250px; 
          z-index: 10000; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.2); 
        }
      `
      document.head.appendChild(styleEl)
    }

    // Add decoration to each element with a comment
    this.comments.forEach(comment => {
      try {
        // Try to find the element using the stored XPath
        const element = document.evaluate(
          comment.xpath,
          document,
          null,
          window.XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue as HTMLElement

        if (element) {
          // Add decoration class
          element.classList.add('bc-has-comment')

          // Add data attribute with comment text for tooltip
          element.dataset.bcComment = comment.feedback

          // Add event listeners for hover
          element.addEventListener('mouseenter', this._showCommentTooltip.bind(this))
          element.addEventListener('mouseleave', this._hideCommentTooltip.bind(this))
        }
      } catch (error) {
        console.error('Error finding element for comment:', error)
      }
    })
  }

  /**
   * Hide all element decorations
   */
  private _hideElementDecorations() {
    // Find all elements with our decoration class
    const decoratedElements = document.querySelectorAll('.bc-has-comment')

    // Remove decoration and event listeners
    decoratedElements.forEach(element => {
      const htmlElement = element as HTMLElement
      htmlElement.classList.remove('bc-has-comment')
      delete htmlElement.dataset.bcComment
      htmlElement.removeEventListener('mouseenter', this._showCommentTooltip.bind(this))
      htmlElement.removeEventListener('mouseleave', this._hideCommentTooltip.bind(this))
    })

    // Remove any tooltips that might be visible
    const tooltips = document.querySelectorAll('.bc-comment-tooltip')
    tooltips.forEach(tooltip => {
      ;(tooltip as HTMLElement).remove()
    })
  }

  /**
   * Show tooltip with comment text on hover
   */
  private _showCommentTooltip(event: Event) {
    const element = event.currentTarget as HTMLElement
    const commentText = element.dataset.bcComment

    if (!commentText) return

    // Create tooltip element
    const tooltip = document.createElement('div')
    tooltip.className = 'bc-comment-tooltip'
    tooltip.textContent = commentText

    // Position tooltip near the element
    const rect = element.getBoundingClientRect()
    tooltip.style.top = `${rect.bottom + 5}px`
    tooltip.style.left = `${rect.left}px`

    // Add tooltip to the document
    document.body.appendChild(tooltip)
  }

  /**
   * Hide comment tooltip
   */
  private _hideCommentTooltip() {
    const tooltips = document.querySelectorAll('.bc-comment-tooltip')
    tooltips.forEach(tooltip => {
      ;(tooltip as HTMLElement).remove()
    })
  }

  /**
   * CSS styles for the component
   */
  static styles = css`
    :host {
      display: block;
      position: fixed;
      top: 0;
      right: -350px;
      width: 350px;
      height: 100%;
      background-color: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      transition: right 0.3s ease;
      z-index: 9998;
      overflow-y: auto;
    }

    /* No longer using ::after for CSS injection - using proper style element instead */

    :host([visible]) {
      right: 0;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: bold;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }

    .sidebar-content {
      padding: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .capture-button {
      background-color: #0066cc;
      color: white;
    }

    .export-button {
      background-color: #28a745;
      color: white;
    }

    .feedback-form {
      margin-bottom: 20px;
    }

    .feedback-form textarea {
      width: 100%;
      height: 100px;
      margin-bottom: 10px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }

    .save-button {
      background-color: #0066cc;
      color: white;
    }

    .comments-list {
      margin-top: 20px;
    }

    .comment-item {
      padding: 10px;
      margin-bottom: 10px;
      background-color: #f9f9f9;
      border-radius: 4px;
      border-left: 3px solid #0066cc;
    }

    .comment-text {
      margin-bottom: 5px;
    }

    .comment-meta {
      font-size: 12px;
      color: #666;
    }
  `

  /**
   * Render the component
   */
  render() {
    return html`
      <div class="sidebar-header">
        <h2 class="sidebar-title">BackChannel</h2>
        <button class="close-button" @click=${this._handleClose}>×</button>
      </div>
      <div class="sidebar-content">
        <div class="action-buttons">
          <button class="capture-button" @click=${this._handleCapture}>Capture Feedback</button>
          <button class="export-button" @click=${this._handleExport}>Export</button>
        </div>

        ${this.captureMode
          ? html`
              <div class="feedback-form">
                <textarea
                  placeholder="Enter your feedback here..."
                  .value=${this._currentFeedback}
                  @input=${this._handleFeedbackInput}
                ></textarea>
                <button class="save-button" @click=${this._handleSaveFeedback}>
                  Save Feedback
                </button>
              </div>
            `
          : ''}

        <div class="comments-list">
          <h3>Comments</h3>
          ${this.comments.length === 0
            ? html`<p>No comments yet.</p>`
            : this.comments.map(
                (comment: any) => html`
                  <div class="comment-item">
                    <div class="comment-text">${comment.feedback}</div>
                    <div class="comment-meta">
                      ${comment.elementText ? html`<div>Element: ${comment.elementText}</div>` : ''}
                      <div>Page: ${comment.pageUrl}</div>
                      <div>Time: ${new Date(comment.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                `
              )}
        </div>
      </div>
    `
  }
}

// Add type definition for the custom element
declare global {
  interface HTMLElementTagNameMap {
    'bc-sidebar': BackChannelSidebar
  }
}
