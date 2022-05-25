import { map } from 'lodash'

const list = [{ name: 'joe' }, { name: 'mary' }]
const names = map(list, 'name')
if (true) {
  console.log('just names', names)
} else {
  console.error('never reached')
}
