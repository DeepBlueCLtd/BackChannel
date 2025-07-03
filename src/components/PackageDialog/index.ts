/**
 * Package Dialog Component - Dialog for creating new feedback packages
 * This component handles the UI for creating new feedback packages
 */

import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import './PackageDialog.css'

/**
 * BackChannel Package Dialog Web Component
 */
@customElement('bc-package-dialog')
export class BackChannelPackageDialog extends LitElement {
  /**
   * Whether the dialog is visible
   */
  static get properties() {
    return {
      visible: { type: Boolean, reflect: true },
    }
  }

  // TypeScript declarations for properties
  declare visible: boolean

  // Private state
  private _title = ''
  private _author = ''
  private _urlPrefix = ''

  constructor() {
    super()
    // Pre-fill title with current document title if available
    if (typeof document !== 'undefined' && document.title) {
      this._title = document.title
    }

    // Pre-fill URL prefix with current URL path
    if (typeof window !== 'undefined' && window.location) {
      const url = new URL(window.location.href)
      const pathParts = url.pathname.split('/')
      if (pathParts.length > 1) {
        // Use the first part of the path as the URL prefix
        this._urlPrefix = pathParts[1]
      }
    }
  }

  /**
   * Handle closing the dialog
   */
  private _handleClose() {
    this.visible = false
  }

  /**
   * Handle title input changes
   */
  private _handleTitleInput(e: Event) {
    const target = e.target as HTMLInputElement
    this._title = target.value
  }

  /**
   * Handle author input changes
   */
  private _handleAuthorInput(e: Event) {
    const target = e.target as HTMLInputElement
    this._author = target.value
  }

  /**
   * Handle URL prefix input changes
   */
  private _handleUrlPrefixInput(e: Event) {
    const target = e.target as HTMLInputElement
    this._urlPrefix = target.value
  }

  /**
   * Handle creating the package
   */
  private _handleCreatePackage() {
    if (!this._title.trim() || !this._author.trim() || !this._urlPrefix.trim()) {
      return
    }

    this.dispatchEvent(
      new CustomEvent('create-package', {
        bubbles: true,
        composed: true,
        detail: {
          title: this._title,
          author: this._author,
          urlPrefix: this._urlPrefix,
        },
      })
    )

    this.visible = false
  }

  /**
   * CSS styles for the component
   */
  static styles = css`
    :host {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }

    :host([visible]) {
      display: flex;
    }

    .dialog {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      width: 400px;
      max-width: 90%;
      padding: 24px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .dialog-title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .create-button {
      background-color: #0066cc;
      color: white;
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
      margin-top: 8px;
    }

    .create-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `

  /**
   * Render the component
   */
  render() {
    const isFormValid = this._title.trim() && this._author.trim() && this._urlPrefix.trim()

    return html`
      <div class="dialog">
        <div class="dialog-header">
          <h2 class="dialog-title">Create Feedback Package</h2>
          <button class="close-button" @click=${this._handleClose}>×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label for="title">Document Title</label>
            <input
              type="text"
              id="title"
              .value=${this._title}
              @input=${this._handleTitleInput}
              placeholder="Enter document title"
            />
          </div>
          <div class="form-group">
            <label for="author">Author</label>
            <input
              type="text"
              id="author"
              .value=${this._author}
              @input=${this._handleAuthorInput}
              placeholder="Enter your name"
            />
          </div>
          <div class="form-group">
            <label for="urlPrefix">URL Prefix</label>
            <input
              type="text"
              id="urlPrefix"
              .value=${this._urlPrefix}
              @input=${this._handleUrlPrefixInput}
              placeholder="Enter URL prefix (e.g., 'blog')"
            />
          </div>
          <button
            class="create-button"
            @click=${this._handleCreatePackage}
            ?disabled=${!isFormValid}
          >
            Create Package
          </button>
        </div>
      </div>
    `
  }
}

// Add type definition for the custom element
declare global {
  interface HTMLElementTagNameMap {
    'bc-package-dialog': BackChannelPackageDialog
  }
}
