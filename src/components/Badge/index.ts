/**
 * Badge Component - Displays the BackChannel icon in the UI
 * This component handles the rendering and state management of the BackChannel icon
 */

import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

/**
 * BackChannel Badge Web Component
 */
@customElement('bc-badge')
export class BackChannelBadge extends LitElement {
  // Badge is hardcoded to top-right position as requested

  /**
   * Whether the badge is enabled (active)
   */
  static get properties() {
    return {
      enabled: { type: Boolean, reflect: true }
    }
  }

  // TypeScript declaration for the enabled property
  declare enabled: boolean

  constructor() {
    super()
    this.enabled = false
  }

  /**
   * Toggle the enabled state when clicked
   */
  private _handleClick() {
    this.enabled = !this.enabled
  }

  /**
   * CSS styles for the component
   */
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      z-index: 9999;
      top: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: #888;
      border-radius: 8px;
      transition: background-color 0.3s ease;
    }

    :host([enabled]) {
      background-color: #0066cc;
    }

    div {
      color: white;
      font-weight: bold;
      font-size: 24px;
    }
  `

  /**
   * Render the component
   */
  render() {
    return html`<div @click=${this._handleClick}>BC</div>`
  }
}

// Add type definition for the custom element
declare global {
  interface HTMLElementTagNameMap {
    'bc-badge': BackChannelBadge
  }
}
