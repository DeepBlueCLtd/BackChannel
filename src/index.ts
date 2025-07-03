/**
 * BackChannel - Main application entry point
 * This file initializes the BackChannel application logic
 */

import { getActiveFeedbackPackage } from './services/packageService'

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
    } else {
      console.log('No active feedback package found')
      console.log('BackChannel is DISABLED for this page')
    }
  } catch (error) {
    console.error('Error checking for active feedback package:', error)
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initBackChannel()
})

// Export the initialization function for use in other modules
export { initBackChannel }
