/**
 * BackChannel - Main Entry Point
 * This file initializes the BackChannel application and handles the main app logic
 */

import { getActiveFeedbackPackage } from './services/packageService'
import './components/Badge'

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log('Welcome to BackChannel')
  initBackChannel()
})

/**
 * Initialize the BackChannel application
 */
async function initBackChannel(): Promise<void> {
  // Get the current URL
  const currentUrl = window.location.href
  console.log('Current URL:', currentUrl)

  // Check if there's an active feedback package for this URL
  const activeFeedbackPackage = await getActiveFeedbackPackage(currentUrl)

  // Determine if BackChannel should be enabled for this page
  const isEnabled = !!activeFeedbackPackage
  console.log(`BackChannel is ${isEnabled ? 'ENABLED' : 'DISABLED'} for this page`)

  // Show the BackChannel badge
  showBackChannelBadge(isEnabled)
}

/**
 * Show the BackChannel badge with appropriate state
 * @param isEnabled Whether to show the badge in enabled state
 */
function showBackChannelBadge(isEnabled: boolean): void {
  // Create the badge element
  const badge = document.createElement('bc-badge') as HTMLElement

  // Set attributes
  if (isEnabled) {
    badge.setAttribute('enabled', '')
  }

  // Add click handler
  badge.addEventListener('badge-click', () => {
    // For now, just toggle based on current state
    handleBadgeClick(!isEnabled)
  })

  // Add to DOM
  document.body.appendChild(badge)

  console.log(`BackChannel badge shown in ${isEnabled ? 'enabled' : 'disabled'} state`)
}

/**
 * Handle clicks on the BackChannel badge
 * @param isEnabled Current enabled state of the badge
 */
function handleBadgeClick(isEnabled: boolean): void {
  console.log(`Badge clicked in ${isEnabled ? 'enabled' : 'disabled'} state`)

  if (isEnabled) {
    // TODO: Open feedback capture sidebar
    console.log('Opening feedback capture sidebar...')
  } else {
    // TODO: Open package creation dialog
    console.log('Opening package creation dialog...')

    // For now, just toggle the badge state for testing
    const badge = document.querySelector('bc-badge') as HTMLElement
    badge.setAttribute('enabled', '')
    console.log('Badge toggled to enabled state (mock)')
  }
}
