/**
 * Badge Component - Displays the BackChannel icon in the UI
 * This component handles the rendering and state management of the BackChannel icon
 */

import './Badge.css'

export interface BadgeOptions {
  enabled: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  onClick?: () => void
}

/**
 * Creates and renders the BackChannel badge/icon in the UI
 * @param options Configuration options for the badge
 * @returns The created badge element
 */
export function createBadge(options: BadgeOptions): HTMLElement {
  const defaultPosition = 'bottom-right'
  const position = options.position || defaultPosition

  // Create the badge container
  const badgeContainer = document.createElement('div')
  badgeContainer.style.position = 'fixed'
  badgeContainer.style.zIndex = '9999'

  // Set position based on the option
  switch (position) {
    case 'top-right':
      badgeContainer.style.top = '20px'
      badgeContainer.style.right = '20px'
      break
    case 'top-left':
      badgeContainer.style.top = '20px'
      badgeContainer.style.left = '20px'
      break
    case 'bottom-right':
      badgeContainer.style.bottom = '20px'
      badgeContainer.style.right = '20px'
      break
    case 'bottom-left':
      badgeContainer.style.bottom = '20px'
      badgeContainer.style.left = '20px'
      break
  }

  // Create the badge element (rounded square with 'BC')
  const badge = document.createElement('div')
  badge.className = `badge ${options.enabled ? 'badge-primary' : 'badge-light'}`
  badge.style.cursor = 'pointer'
  badge.style.display = 'flex'
  badge.style.alignItems = 'center'
  badge.style.justifyContent = 'center'
  badge.style.width = '40px'
  badge.style.height = '40px'
  badge.style.borderRadius = '8px' // Square with rounded corners
  badge.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)'
  badge.style.fontWeight = 'bold'

  // Add the 'BC' text
  badge.textContent = 'BC'

  // Add click handler if provided
  if (options.onClick) {
    badge.addEventListener('click', options.onClick)
  }

  // Assemble the badge
  badgeContainer.appendChild(badge)

  return badgeContainer
}

/**
 * Updates an existing badge with new options
 * @param badgeElement The badge element to update
 * @param options New options to apply to the badge
 */
export function updateBadge(badgeElement: HTMLElement, options: Partial<BadgeOptions>): void {
  const badge = badgeElement.querySelector('.badge')

  if (!badge) return

  // Update enabled state if provided
  if (options.enabled !== undefined) {
    badge.className = badge.className.replace(
      /badge-(primary|light)/,
      `badge-${options.enabled ? 'primary' : 'light'}`
    )
  }

  // Update click handler if provided
  if (options.onClick) {
    // Remove existing click handlers
    const newBadge = badge.cloneNode(true)
    badge.parentNode?.replaceChild(newBadge, badge)

    // Add new click handler
    newBadge.addEventListener('click', options.onClick)
  }
}
