const _ = require('lodash')

const list = [{ name: 'joe' }, { name: 'mary' }]
const names = _.map(list, 'name')
console.log('just names', names)
