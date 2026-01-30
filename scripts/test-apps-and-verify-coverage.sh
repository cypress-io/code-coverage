#!/bin/bash

# Run all test apps for @cypress/code-coverage
# Usage: ./run-all-test-apps.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_APPS_DIR="$SCRIPT_DIR/test-apps"

# Dynamically find test apps (directories with package.json containing a test script)
TEST_APPS=()
for dir in "$TEST_APPS_DIR"/*/; do
  if [ -f "$dir/package.json" ] && grep -q '"test"' "$dir/package.json"; then
    TEST_APPS+=("$(basename "$dir")")
  fi
done

# Sort alphabetically for consistent ordering
IFS=$'\n' TEST_APPS=($(sort <<<"${TEST_APPS[*]}")); unset IFS

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=()
FAILED=()

echo "============================================"
echo "Running ${#TEST_APPS[@]} test apps"
echo "============================================"
echo ""

for app in "${TEST_APPS[@]}"; do
  APP_DIR="$TEST_APPS_DIR/$app"
  
  if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠ Skipping $app (directory not found)${NC}"
    continue
  fi

  echo -e "${YELLOW}▶ Running: $app${NC}"
  echo "--------------------------------------------"
  
  cd "$APP_DIR"

  npm i
  
  if npm test && npm run coverage:verify && npm run coverage:check-files; then
    echo -e "${GREEN}✓ PASSED: $app${NC}"
    PASSED+=("$app")
  else
    echo -e "${RED}✗ FAILED: $app${NC}"
    FAILED+=("$app")
  fi
  
  echo ""
done

# Summary
echo "============================================"
echo "SUMMARY"
echo "============================================"
echo -e "${GREEN}Passed: ${#PASSED[@]}${NC}"
for app in "${PASSED[@]}"; do
  echo -e "  ${GREEN}✓ $app${NC}"
done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo -e "${RED}Failed: ${#FAILED[@]}${NC}"
  for app in "${FAILED[@]}"; do
    echo -e "  ${RED}✗ $app${NC}"
  done
  exit 1
else
  echo -e "${GREEN}All test apps passed!${NC}"
  exit 0
fi

