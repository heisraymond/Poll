# Node version pinned to match the project's .nvmrc
FROM node:17-alpine

WORKDIR /app

# Copy just the package manifests first so `npm ci` is cached
# unless a dependency actually changes. All three manifests are
# needed because this is an npm workspaces monorepo.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json

RUN npm ci

COPY server ./server

EXPOSE 3000

# Runs `wait-on tcp:redis:6379 && nest start --watch` (see root package.json).
# Uses the "redis" service hostname since this runs inside the compose network.
CMD ["npm", "run", "server:dev:docker"]
