/**
 * BackChannel - Main application entry point
 * This file initializes the BackChannel application logic
 */

/**
 * Initialize the BackChannel application
 * This function sets up the necessary event listeners and UI elements
 */
const initBackChannel = (): void => {
  console.log('Welcome to BackChannel')
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initBackChannel()
})

// Export the initialization function for use in other modules
export { initBackChannel }
