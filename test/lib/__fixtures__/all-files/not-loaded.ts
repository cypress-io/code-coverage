interface User {
  name: string
}

export const identity = <T>(value: T): T => value

export function describeUser(user: User): string {
  return user.name ? `User ${user.name}` : 'Anonymous'
}
