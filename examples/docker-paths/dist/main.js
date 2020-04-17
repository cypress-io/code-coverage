function cov_25n278q6qe() {
  var path = '/var/www/test/site/app/main.js'
  var hash = '8817d7301264befa6a587eeb9305a1bf2cbde8bc'
  var global = new Function('return this')()
  var gcv = '__coverage__'
  var coverageData = {
    path: '/var/www/test/site/app/main.js',
    statementMap: {
      '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } },
      '1': { start: { line: 1, column: 23 }, end: { line: 1, column: 28 } },
      '2': { start: { line: 3, column: 0 }, end: { line: 3, column: 28 } },
      '3': { start: { line: 3, column: 23 }, end: { line: 3, column: 28 } }
    },
    fnMap: {
      '0': {
        name: '(anonymous_0)',
        decl: { start: { line: 1, column: 13 }, end: { line: 1, column: 14 } },
        loc: { start: { line: 1, column: 23 }, end: { line: 1, column: 28 } },
        line: 1
      },
      '1': {
        name: '(anonymous_1)',
        decl: { start: { line: 3, column: 13 }, end: { line: 3, column: 14 } },
        loc: { start: { line: 3, column: 23 }, end: { line: 3, column: 28 } },
        line: 3
      }
    },
    branchMap: {},
    s: { '0': 0, '1': 0, '2': 0, '3': 0 },
    f: { '0': 0, '1': 0 },
    b: {},
    _coverageSchema: '1a1c01bbd47fc00a2c39e90264f33305004495a9',
    hash: '8817d7301264befa6a587eeb9305a1bf2cbde8bc'
  }
  var coverage = global[gcv] || (global[gcv] = {})
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData
  }
  var actualCoverage = coverage[path]
  cov_25n278q6qe = function() {
    return actualCoverage
  }
  return actualCoverage
}
cov_25n278q6qe()
cov_25n278q6qe().s[0]++
window.add = (a, b) => {
  cov_25n278q6qe().f[0]++
  cov_25n278q6qe().s[1]++
  return a + b
}
cov_25n278q6qe().s[2]++
window.sub = (a, b) => {
  cov_25n278q6qe().f[1]++
  cov_25n278q6qe().s[3]++
  return a - b
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsid2luZG93IiwiYWRkIiwiYSIsImIiLCJzdWIiXSwibWFwcGluZ3MiOiJtdkNBQUFBLE1BQU0sQ0FBQ0MsR0FBUCxDQUFhLENBQUNDLENBQUQsQ0FBSUMsQ0FBSixHQUFVLHVEQUFBRCxDQUFBQSxDQUFDLENBQUdDLENBQUosQ0FBSyxDQUE1QixDLHdCQUVBSCxNQUFNLENBQUNJLEdBQVAsQ0FBYSxDQUFDRixDQUFELENBQUlDLENBQUosR0FBVSx1REFBQUQsQ0FBQUEsQ0FBQyxDQUFHQyxDQUFKLENBQUssQ0FBNUIiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYWRkID0gKGEsIGIpID0+IGEgKyBiXG5cbndpbmRvdy5zdWIgPSAoYSwgYikgPT4gYSAtIGJcbiJdfQ==
