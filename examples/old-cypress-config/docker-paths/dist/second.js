function cov_oh5ama61f() {
  var path = '/var/www/test/site/app/second.js'
  var hash = 'b86d13c912cff987dc7ed851327509c7a170ff4b'
  var global = new Function('return this')()
  var gcv = '__coverage__'
  var coverageData = {
    path: '/var/www/test/site/app/second.js',
    statementMap: {
      '0': { start: { line: 3, column: 0 }, end: { line: 7, column: 13 } },
      '1': { start: { line: 4, column: 2 }, end: { line: 7, column: 13 } }
    },
    fnMap: {
      '0': {
        name: '(anonymous_0)',
        decl: { start: { line: 3, column: 17 }, end: { line: 3, column: 18 } },
        loc: { start: { line: 4, column: 2 }, end: { line: 7, column: 13 } },
        line: 4
      }
    },
    branchMap: {},
    s: { '0': 0, '1': 0 },
    f: { '0': 0 },
    b: {},
    _coverageSchema: '1a1c01bbd47fc00a2c39e90264f33305004495a9',
    hash: 'b86d13c912cff987dc7ed851327509c7a170ff4b'
  }
  var coverage = global[gcv] || (global[gcv] = {})
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData
  }
  var actualCoverage = coverage[path]
  cov_oh5ama61f = function() {
    return actualCoverage
  }
  return actualCoverage
}
cov_oh5ama61f()
cov_oh5ama61f().s[0]++ // this file should be excluded from the final coverage numbers
// using "nyc.exclude" list in package.json
window.reverse = s => {
  cov_oh5ama61f().f[0]++
  cov_oh5ama61f().s[1]++
  return s
    .split('')
    .reverse()
    .join('')
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlY29uZC5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJyZXZlcnNlIiwicyIsInNwbGl0Iiwiam9pbiJdLCJtYXBwaW5ncyI6InErQkFBQTtBQUNBO0FBQ0FBLE1BQU0sQ0FBQ0MsT0FBUCxDQUFpQkMsQ0FBQyxFQUNoQixxREFBQUEsQ0FBQUEsQ0FBQyxDQUNFQyxLQURILENBQ1MsRUFEVCxFQUVHRixPQUZILEdBR0dHLElBSEgsQ0FHUSxFQUhSLEVBR1csQ0FKYiIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRoaXMgZmlsZSBzaG91bGQgYmUgZXhjbHVkZWQgZnJvbSB0aGUgZmluYWwgY292ZXJhZ2UgbnVtYmVyc1xuLy8gdXNpbmcgXCJueWMuZXhjbHVkZVwiIGxpc3QgaW4gcGFja2FnZS5qc29uXG53aW5kb3cucmV2ZXJzZSA9IHMgPT5cbiAgc1xuICAgIC5zcGxpdCgnJylcbiAgICAucmV2ZXJzZSgpXG4gICAgLmpvaW4oJycpXG4iXX0=
