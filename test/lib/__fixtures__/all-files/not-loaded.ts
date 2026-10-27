interface Point {
  x: number
  y: number
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = <number>a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}
