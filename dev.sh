#!/usr/bin/env bash
#
# Dev helper script for the Poll project.
# Usage: ./dev.sh <command>
#
# By default everything runs inside Docker (Redis, server, client) so
# the whole team runs the exact same environment. A "native" mode is
# also available for running the server/client with your local Node
# install instead of Docker.

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Prefer the modern `docker compose` plugin, fall back to the
# standalone `docker-compose` binary if that's what's installed.
compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  else
    docker-compose "$@"
  fi
}

ensure_env_files() {
  if [ ! -f server/.env ]; then
    echo "==> Creating server/.env from server/.env.example"
    cp server/.env.example server/.env
  fi

  if [ ! -f client/.env ]; then
    echo "==> Creating client/.env from client/.env.example"
    cp client/.env.example client/.env
  fi
}

setup() {
  ensure_env_files
  echo "==> Installing dependencies (root, client, server workspaces)..."
  npm install
  echo "==> Setup complete. Run './dev.sh start' to launch everything in Docker."
}

start() {
  ensure_env_files
  echo "==> Building images (if needed) and starting Redis, server, and client in Docker..."
  compose up --build
}

stop() {
  echo "==> Stopping Docker containers..."
  compose down
}

test_all() {
  echo "==> Running server tests..."
  compose run --rm server npm run test
  echo "==> Running client tests..."
  compose run --rm client npm run test
}

lint_all() {
  echo "==> Linting server..."
  compose run --rm server npm run lint
  echo "==> Linting client..."
  compose run --rm client npm run lint
}

build_all() {
  echo "==> Building server..."
  compose run --rm server npm run build
  echo "==> Building client..."
  compose run --rm client npm run build
}

storybook() {
  echo "==> Starting Storybook on http://localhost:6006 ..."
  compose run --rm -p 6006:6006 client npm run storybook
}

start_native() {
  ensure_env_files
  echo "==> Starting Redis (docker-compose), server, and client using your local Node install..."
  npm run start
}

stop_native() {
  echo "==> Stopping Redis..."
  npm run stop
}

usage() {
  cat <<EOF
Usage: ./dev.sh <command>

Docker commands (recommended - everyone runs the same environment):
  setup       Create .env files and install local dependencies (for editor/IDE support)
  start       Build images and start Redis, server, and client in Docker
  stop        Stop and remove the Docker containers
  test        Run server and client test suites inside Docker
  lint        Lint server and client code inside Docker
  build       Build server and client for production inside Docker
  storybook   Start Storybook for the client component library inside Docker

Native commands (run directly on your machine, Redis still runs in Docker):
  start:native   Start Redis in Docker, then run the server and client with local Node/npm
  stop:native    Stop the Redis container

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
  start:native) start_native ;;
  stop:native) stop_native ;;
  help|-h|--help) usage ;;
  *)
    echo "Unknown command: $1"
    echo
    usage
    exit 1
    ;;
esac
