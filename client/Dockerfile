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

COPY client ./client

EXPOSE 8080

# Runs `vite --host` (see root package.json's client:dev script)
CMD ["npm", "run", "client:dev"]
