/**
 * BackChannel - Main application entry point
 * This file initializes the BackChannel application logic
 */

import { getActiveFeedbackPackage } from './services/packageService'
import { createBadge } from './components/Badge'
import type { BadgeOptions } from './components/Badge'

// Store references to UI elements
let bcBadgeElement: HTMLElement | null = null

/**
 * Handle click on the BackChannel badge
 * @param isEnabled Whether the badge is in enabled state
 */
const handleBadgeClick = (isEnabled: boolean) => {
  if (isEnabled) {
    console.log('Clicked enabled BC icon - should open feedback capture sidebar')
    // TODO: Implement opening the feedback capture sidebar
  } else {
    console.log('Clicked disabled BC icon - should open package creation dialog')
    // TODO: Implement opening the package creation dialog

    // Mock: Toggle badge from disabled to enabled when clicked
    if (bcBadgeElement) {
      // Remove the current badge from DOM
      bcBadgeElement.remove()

      // Show the badge in enabled state
      showBackChannelBadge(true)

      console.log('Mock: Badge toggled from disabled to enabled')
    }
  }
}

/**
 * Show the BackChannel badge with appropriate state
 * @param isEnabled Whether to show the badge in enabled state
 */
const showBackChannelBadge = (isEnabled: boolean): void => {
  // Create badge options
  const badgeOptions: BadgeOptions = {
    enabled: isEnabled,
    position: 'top-right',
    onClick: () => handleBadgeClick(isEnabled),
  }

  // Create and add the badge to the DOM
  bcBadgeElement = createBadge(badgeOptions)
  document.body.appendChild(bcBadgeElement)

  console.log(`BackChannel badge shown in ${isEnabled ? 'enabled' : 'disabled'} state`)
}

/**
 * Initialize the BackChannel application
 * This function sets up the necessary event listeners and UI elements
 */
const initBackChannel = async (): Promise<void> => {
  console.log('Welcome to BackChannel')

  // Get the current URL
  const currentUrl = window.location.href
  console.log('Current URL:', currentUrl)

  // Check if there's an active feedback package for this URL
  try {
    const activePackage = await getActiveFeedbackPackage(currentUrl)

    if (activePackage) {
      console.log('Active feedback package found:', activePackage.name)
      console.log('Package root URL:', activePackage.rootURL)
      console.log('BackChannel is ENABLED for this page')

      // Show enabled BC icon
      showBackChannelBadge(true)
    } else {
      console.log('No active feedback package found')
      console.log('BackChannel is DISABLED for this page')

      // Show disabled BC icon
      showBackChannelBadge(false)
    }
  } catch (error) {
    console.error('Error checking for active feedback package:', error)

    // Show disabled BC icon in case of error
    showBackChannelBadge(false)
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initBackChannel()
})

// Export the initialization function for use in other modules
export { initBackChannel }
