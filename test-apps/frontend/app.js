import { map } from 'lodash'

const list = [{ name: 'joe' }, { name: 'mary' }]
const names = map(list, 'name')
console.log('just names', names)
