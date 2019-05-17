require('../../plugins')

module.exports = (on, config) => {
  on('task', require('../../task'))
}
