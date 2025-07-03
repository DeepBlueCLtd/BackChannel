/**
 * BackChannel - Main Entry Point
 * This file initializes the BackChannel application and handles the main app logic
 */

// Reference DOM types for CustomEvent and Event
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

/* global CustomEvent, Event */

import { getActiveFeedbackPackage } from './services/packageService'
import './components/Badge'
import './components/Sidebar'
import './components/PackageDialog'

// Define CustomEvent types for our custom events
declare global {
  interface DocumentEventMap {
    'save-feedback': CustomEvent<{ feedback: string }>
    'create-package': CustomEvent<{ title: string; author: string; urlPrefix: string }>
    'open-sidebar': Event
    'open-package-dialog': Event
    'start-capture': Event
    'export-feedback': Event
  }
}
import { loadFakeDatabasesFromJson, type FakeDbJson } from './helpers/fakeDb'
import { DatabaseService } from './services/db'

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log('Welcome to BackChannel')
  initBackChannel()
})

/**
 * Initialize BackChannel
 */
async function initBackChannel(): Promise<void> {
  console.log('Initializing BackChannel')

  try {
    // Check if there is an active feedback package for the current URL
    const activeFeedbackPackage = await getActiveFeedbackPackage(window.location.href)

    // Show the badge with appropriate state
    showBackChannelBadge(activeFeedbackPackage !== null)

    // Set up event listeners for component interactions
    setupComponentEventListeners()

    console.log('BackChannel initialized successfully')
    if (activeFeedbackPackage) {
      console.log('Active feedback package found:', activeFeedbackPackage.name)
    } else {
      console.log('No active feedback package found for this URL')
    }
  } catch (error) {
    console.error('Failed to initialize BackChannel:', error)
  }
}

/**
 * Show the BackChannel badge with appropriate state
 * @param isEnabled Whether to show the badge in enabled state
 */
function showBackChannelBadge(isEnabled: boolean): void {
  // Create the badge element
  const badge = document.createElement('bc-badge') as HTMLElement & {
    enabled: boolean
  }

  // Set enabled state
  badge.enabled = isEnabled

  // Add to DOM
  document.body.appendChild(badge)

  console.log(`BackChannel badge shown in ${isEnabled ? 'enabled' : 'disabled'} state`)

  // Create the sidebar and package dialog elements
  const sidebar = document.createElement('bc-sidebar') as HTMLElement & {
    visible: boolean
    captureMode: boolean
    comments: any[]
  }
  const packageDialog = document.createElement('bc-package-dialog') as HTMLElement & {
    visible: boolean
  }

  // Add to DOM
  document.body.appendChild(sidebar)
  document.body.appendChild(packageDialog)
}

/**
 * Set up event listeners for component interactions
 */
function setupComponentEventListeners(): void {
  // Listen for the open-sidebar event
  document.addEventListener('open-sidebar', () => {
    console.log('Opening sidebar')
    // Get the sidebar element
    const sidebar = document.querySelector('bc-sidebar') as HTMLElement & {
      visible: boolean
    }
    if (sidebar) {
      sidebar.visible = true
    }
  })

  // Listen for the open-package-dialog event
  document.addEventListener('open-package-dialog', () => {
    console.log('Opening package dialog')
    // Get the package dialog element
    const packageDialog = document.querySelector('bc-package-dialog') as HTMLElement & {
      visible: boolean
    }
    if (packageDialog) {
      packageDialog.visible = true
    }
  })

  // Listen for the start-capture event
  document.addEventListener('start-capture', () => {
    console.log('Starting capture mode')
    // Implement capture mode logic
    // Hide sidebar
    // Show floating cancel button
    // Set up element highlighting on hover
    // Set up click handler for element selection
  })

  // Listen for the export-feedback event
  document.addEventListener('export-feedback', () => {
    console.log('Exporting feedback')
    // Export comments as JSON or other format
  })

  document.addEventListener('save-feedback', (event: CustomEvent<{ feedback: string }>) => {
    console.log('Saving feedback', event.detail)
    // Implement save logic
    // Save comment to IndexedDB
    // Update sidebar comments list
    // Add comment badge to target element
  })

  document.addEventListener(
    'create-package',
    (event: CustomEvent<{ title: string; author: string; urlPrefix: string }>) => {
      console.log('Creating package', event.detail)
      // Implement package creation logic
      // Create new package in IndexedDB
      // Set badge to enabled
      // Close dialog
      // Open sidebar
    }
  )

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
