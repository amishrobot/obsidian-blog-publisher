#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
expected=".githooks"
actual="$(git -C "${repo_root}" config --get core.hooksPath || true)"

if [[ "${actual}" != "${expected}" ]]; then
  echo "[hooks:check] Hook path not configured for this clone." >&2
  echo "[hooks:check] expected: ${expected}" >&2
  echo "[hooks:check] actual:   ${actual:-<unset>}" >&2
  echo "[hooks:check] run: npm run hooks:install" >&2
  exit 1
fi

if [[ ! -x "${repo_root}/.githooks/pre-push" ]]; then
  echo "[hooks:check] Missing executable pre-push hook: .githooks/pre-push" >&2
  echo "[hooks:check] run: npm run hooks:install" >&2
  exit 1
fi

echo "[hooks:check] OK (${actual})"
