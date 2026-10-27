import { useState } from 'react'

export function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial)

  return (
    <div>
      <p>{count === 0 ? 'Zero' : `Count: ${count}`}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
