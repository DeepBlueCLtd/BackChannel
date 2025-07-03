/**
 * Badge Component - Displays the BackChannel icon in the UI
 * This component handles the rendering and state management of the BackChannel icon
 */

import { LitElement, html } from 'lit'
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
   * Render the component
   */
  render() {
    return html`<div>[BC]</div>`
  }
}

// Add type definition for the custom element
declare global {
  interface HTMLElementTagNameMap {
    'bc-badge': BackChannelBadge
  }
}
