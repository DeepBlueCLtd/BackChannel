/**
 * BackChannel - Main Entry Point
 * This file initializes the BackChannel application and handles the main app logic
 */

import { getActiveFeedbackPackage } from './services/packageService'

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

  // Add to DOM
  document.body.appendChild(badge)

  console.log(`BackChannel badge shown in ${isEnabled ? 'enabled' : 'disabled'} state`)
}
