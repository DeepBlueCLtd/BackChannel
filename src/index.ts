interface BackChannelConfig {
  targetSelector: string
  requireInitials: boolean
}

import { handleElementClick } from './dom'

const BackChannel = {
  init: (config: BackChannelConfig) => {
    console.log('BackChannel initialized with config:', config)

    document.addEventListener('click', (event) => {
      handleElementClick(event, config.targetSelector)
    })
  }
}

export default BackChannel
