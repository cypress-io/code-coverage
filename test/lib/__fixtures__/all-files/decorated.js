const logged = (target) => target

@logged
export class Greeter {
  greet(name) {
    return `Hello, ${name}`
  }
}
