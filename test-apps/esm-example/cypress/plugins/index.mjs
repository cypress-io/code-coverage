import codecov from '@cypress/code-coverage/plugins'

export default (on, config) => {
  return codecov(on, config)
}

