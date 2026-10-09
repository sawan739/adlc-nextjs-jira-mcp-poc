#!/usr/bin/env bash
set -e

git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging

echo "Created and pushed staging branch."
