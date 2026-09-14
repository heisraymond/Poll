#!/usr/bin/env bash
#
# Dev helper script for the Poll project.
# Usage: ./dev.sh <command>

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

setup() {
  echo "==> Installing dependencies (root, client, server workspaces)..."
  npm install

  if [ ! -f server/.env ]; then
    echo "==> Creating server/.env from server/.env.example"
    cp server/.env.example server/.env
  fi

  if [ ! -f client/.env ]; then
    echo "==> Creating client/.env from client/.env.example"
    cp client/.env.example client/.env
  fi

  echo "==> Setup complete."
}

start() {
  echo "==> Starting Redis (docker-compose), server and client..."
  npm run start
}

stop() {
  echo "==> Stopping Redis (docker-compose)..."
  npm run stop
}

test_all() {
  echo "==> Running server tests..."
  npm run test --workspace=server
  echo "==> Running client tests..."
  npm run test --workspace=client
}

lint_all() {
  echo "==> Linting server..."
  npm run lint --workspace=server
  echo "==> Linting client..."
  npm run lint --workspace=client
}

build_all() {
  echo "==> Building server..."
  npm run build --workspace=server
  echo "==> Building client..."
  npm run build --workspace=client
}

storybook() {
  echo "==> Starting Storybook..."
  npm run storybook
}

usage() {
  cat <<EOF
Usage: ./dev.sh <command>

Commands:
  setup       Install dependencies and create .env files from .env.example
  start       Start Redis (docker-compose), the NestJS server, and the React client
  stop        Stop the Redis docker-compose services
  test        Run server and client test suites
  lint        Lint server and client code
  build       Build server and client for production
  storybook   Start Storybook for the client component library
  help        Show this help message
EOF
}

case "${1:-help}" in
  setup) setup ;;
  start) start ;;
  stop) stop ;;
  test) test_all ;;
  lint) lint_all ;;
  build) build_all ;;
  storybook) storybook ;;
  help|-h|--help) usage ;;
  *)
    echo "Unknown command: $1"
    echo
    usage
    exit 1
    ;;
esac
