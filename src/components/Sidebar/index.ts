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

  // TypeScript declarations for properties
  declare visible: boolean
  declare captureMode: boolean
  declare comments: any[]

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
