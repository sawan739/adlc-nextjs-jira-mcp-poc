#!/usr/bin/env bash
set -e
ISSUE="${1:-}"
SLUG="${2:-feature}"
if [ -z "$ISSUE" ]; then
  echo "Usage: ./scripts/start-feature.sh ADLC-3 add-task"
  exit 1
fi

git checkout staging
git pull origin staging
git checkout -b "feature/${ISSUE}-${SLUG}"
echo "Created feature/${ISSUE}-${SLUG}"
