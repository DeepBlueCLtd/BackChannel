/**
 * BackChannel - Main Entry Point
 * This file initializes the BackChannel application and handles the main app logic
 */

// Reference DOM types for CustomEvent and Event
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

/* global CustomEvent, Event */

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
import type { ActiveFeedbackPackage } from './types'

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
    // Check for fake database definitions and load them if available
    if (typeof window !== 'undefined' && (window as any).fakeData) {
      const fakeData = (window as any).fakeData as FakeDbJson[]

      try {
        // Load fake databases from JSON definitions (await to ensure they're loaded before continuing)
        const fakeDatabases = await loadFakeDatabasesFromJson(fakeData)
        // Initialize DatabaseService with fake databases
        DatabaseService.useFakeDatabases(fakeDatabases)
      } catch (error) {
        console.error('Error loading fake databases:', error)
      }
    }

    // Check if there is an active feedback package for the current URL
    const activeFeedbackPackage: ActiveFeedbackPackage | null =
      await DatabaseService.getActiveFeedbackPackageForUrl(window.location.href)

    console.log('checked for active feedback package:', !!activeFeedbackPackage)

    // Show the badge with appropriate state
    showBackChannelBadge(activeFeedbackPackage !== null)

    // Set up event listeners for component interactions
    setupComponentEventListeners()

    console.log('BackChannel initialized successfully')
    if (activeFeedbackPackage) {
      console.log('Active feedback package found:', activeFeedbackPackage.packageData)
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
    
    // Get the sidebar element and set capture mode
    const sidebar = document.querySelector('bc-sidebar') as HTMLElement & {
      visible: boolean
      captureMode: boolean
    }
    
    if (sidebar) {
      // Set capture mode to true
      sidebar.captureMode = true
      
      // Create and add a floating cancel button
      const cancelButton = document.createElement('button')
      cancelButton.id = 'bc-cancel-capture'
      cancelButton.textContent = 'Cancel Capture'
      cancelButton.style.position = 'fixed'
      cancelButton.style.bottom = '20px'
      cancelButton.style.right = '20px'
      cancelButton.style.zIndex = '10000'
      cancelButton.style.padding = '10px 16px'
      cancelButton.style.backgroundColor = '#ff4444'
      cancelButton.style.color = 'white'
      cancelButton.style.border = 'none'
      cancelButton.style.borderRadius = '4px'
      cancelButton.style.cursor = 'pointer'
      
      // Add click handler to cancel capture mode
      cancelButton.addEventListener('click', () => {
        // Exit capture mode
        exitCaptureMode()
      })
      
      document.body.appendChild(cancelButton)
      
      // Variable to store the currently highlighted element
      let highlightedElement: HTMLElement | null = null
      
      // Function to highlight an element
      const highlightElement = (element: HTMLElement) => {
        // Remove highlight from previous element
        if (highlightedElement) {
          highlightedElement.style.outline = ''
        }
        
        // Highlight the new element
        element.style.outline = '2px dashed #4285f4'
        highlightedElement = element
      }
      
      // Function to handle mouseover events
      const handleMouseOver = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (target && target !== document.body && target !== document.documentElement) {
          // Don't highlight BackChannel components
          if (!target.tagName.toLowerCase().startsWith('bc-') && 
              !target.closest('bc-sidebar') && 
              !target.closest('bc-badge') && 
              !target.closest('bc-package-dialog') &&
              target.id !== 'bc-cancel-capture') {
            highlightElement(target)
          }
        }
      }
      
      // Function to handle click events
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (target && target !== document.body && target !== document.documentElement) {
          // Don't select BackChannel components
          if (!target.tagName.toLowerCase().startsWith('bc-') && 
              !target.closest('bc-sidebar') && 
              !target.closest('bc-badge') && 
              !target.closest('bc-package-dialog') &&
              target.id !== 'bc-cancel-capture') {
            
            // Prevent default action
            event.preventDefault()
            event.stopPropagation()
            
            // Store the selected element
            const selectedElement = target
            
            // Get the XPath of the selected element
            const xpath = getXPathForElement(selectedElement)
            
            // Get the first few characters of the element's text content
            const elementText = selectedElement.textContent?.trim().substring(0, 30) || ''
            
            // Exit capture mode
            exitCaptureMode()
            
            // Show the sidebar with the feedback form
            if (sidebar) {
              // Make sure captureMode is still true when showing the sidebar
              sidebar.captureMode = true
              sidebar.visible = true
              
              // Store the selected element information for when feedback is saved
              ;(window as any).bcSelectedElement = {
                xpath,
                elementText,
                pageUrl: window.location.pathname
              }
            }
          }
        }
      }
      
      // Function to get XPath for an element
      const getXPathForElement = (element: HTMLElement): string => {
        // Use the native document.evaluate for XPath
        let node = element
        let xpath = ''
        
        // If the element has an ID, use that for the XPath
        if (node.id) {
          return `//*[@id="${node.id}"]`
        }
        
        // Otherwise, construct an XPath based on the element's position in the DOM
        while (node && node.nodeType === Node.ELEMENT_NODE) {
          let sibling = node.previousSibling
          let count = 1
          
          while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
              count++
            }
            sibling = sibling.previousSibling
          }
          
          const nodeName = node.nodeName.toLowerCase()
          const position = count > 1 ? `[${count}]` : ''
          xpath = `/${nodeName}${position}${xpath}`
          
          node = node.parentNode as HTMLElement
        }
        
        return xpath
      }
      
      // Function to exit capture mode
      const exitCaptureMode = () => {
        // Remove event listeners
        document.removeEventListener('mouseover', handleMouseOver)
        document.removeEventListener('click', handleClick)
        
        // Remove the cancel button
        const cancelButton = document.getElementById('bc-cancel-capture')
        if (cancelButton) {
          cancelButton.remove()
        }
        
        // Remove highlight from the currently highlighted element
        if (highlightedElement) {
          highlightedElement.style.outline = ''
          highlightedElement = null
        }
        
        // Reset capture mode
        if (sidebar) {
          sidebar.captureMode = false
        }
      }
      
      // Add event listeners for capture mode
      document.addEventListener('mouseover', handleMouseOver)
      document.addEventListener('click', handleClick)
    }
  })

  // Listen for the export-feedback event
  document.addEventListener('export-feedback', () => {
    console.log('Exporting feedback')
    // Export comments as JSON or other format
  })

  document.addEventListener('save-feedback', async (event: CustomEvent<{ feedback: string }>) => {
    console.log('Saving feedback', event.detail)
    
    // Get the selected element information from the window object
    const selectedElement = (window as any).bcSelectedElement
    
    if (!selectedElement) {
      console.error('No element selected for feedback')
      return
    }
    
    try {
      // Get the active feedback package
      const activeFeedbackPackage = await DatabaseService.getActiveFeedbackPackageForUrl(window.location.href)
      
      if (!activeFeedbackPackage) {
        console.error('No active feedback package found')
        return
      }
      
      // Create a comment object
      const comment = {
        timestamp: Date.now(),
        xpath: selectedElement.xpath,
        elementText: selectedElement.elementText,
        feedback: event.detail.feedback,
        pageUrl: selectedElement.pageUrl || window.location.pathname,
        documentTitle: document.title
      }
      
      // Create a database service instance for the active package
      const dbService = new DatabaseService(activeFeedbackPackage.dbId)
      await dbService.init()
      
      // Save the comment to IndexedDB
      await dbService.addComment(comment)
      
      // Get all comments
      const allComments = await dbService.getAllComments()
      
      // Filter comments for this page
      const comments = allComments?.filter(comment => 
        comment.pageUrl === window.location.pathname
      ) || []
      
      // Update the sidebar with the comments
      const sidebar = document.querySelector('bc-sidebar') as HTMLElement & {
        comments: any[]
      }
      
      if (sidebar) {
        sidebar.comments = comments
        
        // Show decorations on elements with comments
        if (sidebar.visible) {
          // Add a small delay to ensure the DOM is updated
          setTimeout(() => {
            // Find the element using the stored XPath
            try {
              const element = document.evaluate(
                selectedElement.xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue as HTMLElement
              
              if (element) {
                // Add decoration class
                element.classList.add('bc-has-comment')
                
                // Add data attribute with comment text for tooltip
                element.dataset.bcComment = event.detail.feedback
              }
            } catch (error) {
              console.error('Error finding element for comment:', error)
            }
          }, 100)
        }
      }
      
      // Clear the selected element
      delete (window as any).bcSelectedElement
      
      console.log('Feedback saved successfully')
    } catch (error) {
      console.error('Error saving feedback:', error)
    }
  })

  document.addEventListener(
    'create-package',
    async (event: CustomEvent<{ title: string; author: string; urlPrefix: string }>) => {
      console.log('Creating package', event.detail)
      
      try {
        // Extract details from the event
        const { title, author, urlPrefix } = event.detail
        
        // Construct the root URL by combining the current origin with the URL prefix
        const origin = window.location.origin
        const rootURL = `${origin}/${urlPrefix}`
        
        // Create a package object
        const packageData = {
          id: `bc-pkg-${Date.now()}`, // Add ID to package data
          name: title,
          version: '1.0.0', // Version of BackChannel library
          author,
          rootURL
        }
        
        // Generate a database ID based on the title
        const dbService = new DatabaseService(title)
        await dbService.init()
        
        // ID is already added when creating the package object
        
        // Save the package to IndexedDB
        await dbService.updatePackage(packageData)
        
        // Cache the package information in localStorage for future page loads
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('bc_root', rootURL)
          
          // Store a copy of the package data for easy retrieval
          // Use the title as the dbId since that's what we used to create the DatabaseService
          const dbId = title
          const cachePackage = { ...packageData, dbId }
          localStorage.setItem('bc_package', JSON.stringify(cachePackage))
        }
        
        // Update the badge to enabled state
        const badge = document.querySelector('bc-badge') as HTMLElement & {
          enabled: boolean
        }
        
        if (badge) {
          badge.enabled = true
        }
        
        // Close the package dialog
        const packageDialog = document.querySelector('bc-package-dialog') as HTMLElement & {
          visible: boolean
        }
        
        if (packageDialog) {
          packageDialog.visible = false
        }
        
        // Open the sidebar
        const sidebar = document.querySelector('bc-sidebar') as HTMLElement & {
          visible: boolean
          comments: any[]
        }
        
        if (sidebar) {
          // Initialize with empty comments array
          sidebar.comments = []
          sidebar.visible = true
        }
        
        console.log('Package created successfully')
      } catch (error) {
        console.error('Error creating package:', error)
      }
    }
  )
}
