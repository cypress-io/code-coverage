../node_modules/.bin/check-coverage main.js
../node_modules/.bin/check-coverage second.js
../node_modules/.bin/check-coverage not-covered.js
../node_modules/.bin/only-covered --from coverage/coverage-final.json main.js second.js not-covered.js