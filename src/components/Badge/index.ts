/**
 * Badge Component - Displays the BackChannel icon in the UI
 * This component handles the rendering and state management of the BackChannel icon
 */

import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

/**
 * BackChannel Badge Web Component
 */
@customElement('bc-badge')
export class BackChannelBadge extends LitElement {
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
