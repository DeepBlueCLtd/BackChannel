interface BackChannelConfig {
  targetSelector: string
  requireInitials: boolean
  storageKey: string
}

import { handleElementClick } from './dom'

const BackChannel = {
  init: (config: BackChannelConfig) => {
    console.log('BackChannel initialized with config:', config)

    // Inject CSS for hover affordance
    const style = document.createElement('style')
    style.textContent = `
      ${config.targetSelector}:hover {
        outline: 2px dashed #007bff;
        cursor: pointer;
      }
    `
    document.head.appendChild(style)

    document.addEventListener('click', (event) => {
      handleElementClick(
        event,
        config.targetSelector,
        config.requireInitials,
        config.storageKey
      )
    })
  }
}

export default BackChannel
