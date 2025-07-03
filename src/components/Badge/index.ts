/**
 * Badge Component - Displays the BackChannel icon in the UI
 * This component handles the rendering and state management of the BackChannel icon
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * BackChannel Badge Web Component
 */
@customElement('bc-badge')
export class BackChannelBadge extends LitElement {
  /**
   * Whether the badge is enabled (active)
   */
  @property({ type: Boolean, reflect: true })
  enabled = false

  /**
   * Position of the badge on the page
   */
  @property({ type: String, reflect: true })
  position = 'top-right'

  /**
   * CSS styles for the component
   */
  static styles = css`
    :host {
      display: block;
      position: fixed;
      z-index: 9999;
    }

    :host([position='top-right']) {
      top: 20px;
      right: 20px;
    }

    :host([position='top-left']) {
      top: 20px;
      left: 20px;
    }

    :host([position='bottom-right']) {
      bottom: 20px;
      right: 20px;
    }

    :host([position='bottom-left']) {
      bottom: 20px;
      left: 20px;
    }

    .badge {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      font-weight: bold;
      font-size: 20px;
      color: white;
      text-align: center;
    }

    .badge-primary {
      background-color: #ff00ff; /* Bright magenta for debugging */
    }

    .badge-light {
      background-color: #00ffff; /* Bright cyan for debugging */
      color: #000000;
      border: 2px solid #ff0000; /* Red border for visibility */
    }
  `

  /**
   * Render the component
   */
  render() {
    const bgColor = this.enabled ? '#ff00ff' : '#00ffff'
    const textColor = this.enabled ? '#ffffff' : '#000000'

    return html`
      <div
        style="
          background-color: ${bgColor};
          color: ${textColor};
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: bold;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        "
        @click=${this._handleClick}
      >
        BC
      </div>
    `
  }

  /**
   * Handle click events on the badge
   */
  private _handleClick() {
    // Toggle the enabled state for demo purposes
    this.enabled = !this.enabled

    // Log the click event
    console.log(`Badge clicked, now ${this.enabled ? 'enabled' : 'disabled'}`)

    // Create a simple click event
    const event = document.createEvent('Event')
    event.initEvent('badge-click', true, true)

    // Dispatch the event
    this.dispatchEvent(event)
  }
}

// Add type definition for the custom element
declare global {
  interface HTMLElementTagNameMap {
    'bc-badge': BackChannelBadge
  }
}
