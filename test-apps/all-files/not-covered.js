// this file is NOT included from "index.html"
// thus it is not instrumented and not included
// in the final code coverage numbers
function throwsError() {
  throw new Error('NO')
}
throwsError()
