/**
 * BackChannel - Main Entry Point
 * This file initializes the BackChannel application and handles the main app logic
 */

import { getActiveFeedbackPackage } from './services/packageService'
import './components/Badge'
import { loadFakeDatabasesFromJson, type FakeDbJson } from './helpers/fakeDb'
import { DatabaseService } from './services/db'

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

  // Check for fake database definitions and load them if available
  console.log('checking for fake data', typeof window !== 'undefined', (window as any).fakeData)
  if (typeof window !== 'undefined' && (window as any).fakeData) {
    const fakeData = (window as any).fakeData as FakeDbJson[]
    console.log('Fake database definitions detected:', fakeData)

    // Load fake databases from JSON definitions
    loadFakeDatabasesFromJson(fakeData)
      .then((fakeDatabases: any[]) => {
        console.log('Fake databases loaded:', fakeDatabases)
        // Initialize DatabaseService with fake databases
        DatabaseService.useFakeDatabases(fakeDatabases)
      })
      .catch((error: any) => {
        console.error('Error loading fake databases:', error)
      })
  }
}
