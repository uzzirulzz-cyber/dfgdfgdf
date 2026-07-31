#!/usr/bin/env bash
# PlayBeat Digital — Vercel deployment helper
# Usage: ./deploy.sh [frontend|backend|both] [--prod]
set -euo pipefail

TARGET="${1:-both}"
PROD_FLAG=""
[[ "${2:-}" == "--prod" ]] && PROD_FLAG="--prod"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

echo "=========================================="
echo " PlayBeat Digital — Vercel Deployment"
echo " Target: $TARGET"
echo " Mode:   ${2:-preview}"
echo "=========================================="

deploy_backend() {
  echo ""
  echo "[1/2] Deploying backend..."
  cd "$REPO_ROOT/backend"
  # Make sure node_modules exist (Vercel CLI also installs but local lint needs them)
  [[ -d node_modules ]] || npm install --no-audit --no-fund
  vercel $PROD_FLAG --yes
  echo "Backend deployed."
}

deploy_frontend() {
  echo ""
  echo "[2/2] Deploying frontend..."
  cd "$REPO_ROOT/frontend"
  [[ -d node_modules ]] || npm install --no-audit --no-fund
  vercel $PROD_FLAG --yes
  echo "Frontend deployed."
}

case "$TARGET" in
  backend)  deploy_backend ;;
  frontend) deploy_frontend ;;
  both)     deploy_backend; deploy_frontend ;;
  *)
    echo "Unknown target: $TARGET"
    echo "Usage: $0 [frontend|backend|both] [--prod]"
    exit 1
    ;;
esac

echo ""
echo "Done. Visit your Vercel dashboard to see deployment URLs."
