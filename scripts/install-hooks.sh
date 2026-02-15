#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
git -C "${repo_root}" config core.hooksPath .githooks
chmod +x "${repo_root}/.githooks/pre-push"

echo "Installed git hooks for ${repo_root}"
echo "core.hooksPath=$(git -C "${repo_root}" config --get core.hooksPath)"
