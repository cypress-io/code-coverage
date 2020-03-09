function cov_6k5v991cn() {
  var path = 'main.js'
  var hash = 'd384017ecd51a8d90283ba0dec593332209519de'
  var global = new Function('return this')()
  var gcv = '__coverage__'
  var coverageData = {
    path: 'main.js',
    statementMap: {
      '0': {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 1,
          column: 28
        }
      },
      '1': {
        start: {
          line: 1,
          column: 23
        },
        end: {
          line: 1,
          column: 28
        }
      },
      '2': {
        start: {
          line: 3,
          column: 0
        },
        end: {
          line: 3,
          column: 28
        }
      },
      '3': {
        start: {
          line: 3,
          column: 23
        },
        end: {
          line: 3,
          column: 28
        }
      }
    },
    fnMap: {
      '0': {
        name: '(anonymous_0)',
        decl: {
          start: {
            line: 1,
            column: 13
          },
          end: {
            line: 1,
            column: 14
          }
        },
        loc: {
          start: {
            line: 1,
            column: 23
          },
          end: {
            line: 1,
            column: 28
          }
        },
        line: 1
      },
      '1': {
        name: '(anonymous_1)',
        decl: {
          start: {
            line: 3,
            column: 13
          },
          end: {
            line: 3,
            column: 14
          }
        },
        loc: {
          start: {
            line: 3,
            column: 23
          },
          end: {
            line: 3,
            column: 28
          }
        },
        line: 3
      }
    },
    branchMap: {},
    s: {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0
    },
    f: {
      '0': 0,
      '1': 0
    },
    b: {},
    _coverageSchema: '1a1c01bbd47fc00a2c39e90264f33305004495a9',
    hash: 'd384017ecd51a8d90283ba0dec593332209519de'
  }
  var coverage = global[gcv] || (global[gcv] = {})

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData
  }

  var actualCoverage = coverage[path]

  cov_6k5v991cn = function() {
    return actualCoverage
  }

  return actualCoverage
}

cov_6k5v991cn()
cov_6k5v991cn().s[0]++

window.add = (a, b) => {
  cov_6k5v991cn().f[0]++
  cov_6k5v991cn().s[1]++
  return a + b
}

cov_6k5v991cn().s[2]++

window.sub = (a, b) => {
  cov_6k5v991cn().f[1]++
  cov_6k5v991cn().s[3]++
  return a - b
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsid2luZG93IiwiYWRkIiwiYSIsImIiLCJzdWIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLEdBQVAsR0FBYSxDQUFDQyxDQUFELEVBQUlDLENBQUosS0FBVTtBQUFBO0FBQUE7QUFBQSxTQUFBRCxDQUFDLEdBQUdDLENBQUo7QUFBSyxDQUE1Qjs7OztBQUVBSCxNQUFNLENBQUNJLEdBQVAsR0FBYSxDQUFDRixDQUFELEVBQUlDLENBQUosS0FBVTtBQUFBO0FBQUE7QUFBQSxTQUFBRCxDQUFDLEdBQUdDLENBQUo7QUFBSyxDQUE1QiIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5hZGQgPSAoYSwgYikgPT4gYSArIGJcblxud2luZG93LnN1YiA9IChhLCBiKSA9PiBhIC0gYlxuIl19
