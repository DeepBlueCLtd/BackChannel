interface BackChannelConfig {
  targetSelector: string
  requireInitials: boolean
}

const BackChannel = {
  init: (config: BackChannelConfig) => {
    console.log('BackChannel initialized with config:', config)
  }
}

export default BackChannel
