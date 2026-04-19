#!/bin/sh

# This script validates commit messages against the required convention:
# <type>: <COMMIT MESSAGE>
# Example: fix: correct login validation bug

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Regex for allowed types
TYPES="feat|fix|chore|docs|style|refactor|perf|test|deps|bug/hotfix"

# Regex for the full commit message
REGEX="^($TYPES): .{1,70}$"

if ! echo "$COMMIT_MSG" | grep -Eq "$REGEX"; then
  echo "\n❌ Commit message does not follow the required convention!"
  echo "Format: <type>: <COMMIT MESSAGE>"
  echo "Example: fix: correct login validation bug"
  echo "Allowed types: $TYPES"
  echo "Message should be concise (recommended ≤ 70 chars)."
  exit 1
fi

echo "\n✅ Commit message is valid. Proceeding."
