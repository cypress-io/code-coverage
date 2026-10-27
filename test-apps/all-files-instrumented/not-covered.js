// this file is NOT included from "index.html"
// thus it is not instrumented by the app, but the plugin
// instruments it and reports its statements at 0%
function throwsError() {
  throw new Error('NO')
}
throwsError()
