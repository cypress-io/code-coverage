// this file is NOT included from "index.html", so no test loads it.
// "instrumentUnloadedFiles" in cypress.config.js adds it to the report
// at 0% so it lowers the total coverage
function throwsError() {
  throw new Error('NO')
}
throwsError()
