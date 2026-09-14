# Poll

A React &amp; NestJS based project dealing with online, ranked-choice polling. Voting sessions are coordinated in real time over Socket.IO, with poll state held in Redis.

## Tech stack

- **Client**: React, TypeScript, Vite, Tailwind CSS, Storybook
- **Server**: NestJS, TypeScript, Socket.IO, Redis (via `redislabs/rejson`)
- **Infra (local)**: Docker Compose (Redis)

## Prerequisites

- [Node.js](https://nodejs.org/) `v17.6.0` (see `.nvmrc` — run `nvm use` if you have nvm installed)
- [Docker](https://www.docker.com/) and Docker Compose (used to run Redis locally)
- npm (this repo uses npm workspaces for `client` and `server`)

## Getting started

```bash
git clone <repo-url>
cd Poll
./dev.sh setup   # installs dependencies and creates .env files
./dev.sh start   # starts Redis, the server, and the client
```

The client runs at `http://localhost:8080` and the server at `http://localhost:3000` by default.

## The `dev.sh` script

`dev.sh` wraps the common commands you'll need during development. Run `./dev.sh help` to see this list at any time.

| Command             | Description                                                        |
| -------------------- | -------------------------------------------------------------------- |
| `./dev.sh setup`     | Installs dependencies for all workspaces and creates `server/.env` / `client/.env` from their `.env.example` files (if they don't already exist) |
| `./dev.sh start`     | Starts Redis via Docker Compose, then runs the server and client in watch mode |
| `./dev.sh stop`      | Stops the Docker Compose services (Redis)                          |
| `./dev.sh test`      | Runs the server and client test suites                             |
| `./dev.sh lint`      | Lints the server and client codebases                              |
| `./dev.sh build`     | Builds the server and client for production                        |
| `./dev.sh storybook` | Starts Storybook for the client component library                  |

If you'd rather run things manually, the underlying npm scripts (defined in the root `package.json`) are:

```bash
npm install                 # install all workspace dependencies
npm run docker:compose      # start Redis in the background
npm run server:dev          # start the NestJS server in watch mode (waits for Redis)
npm run client:dev          # start the Vite dev server for the client
npm run start                 # runs docker:compose, server:dev, and client:dev together
npm run stop                 # stop the Docker Compose services
npm run storybook           # start Storybook
```

## Environment variables

Copy the example files and adjust as needed (`./dev.sh setup` does this automatically):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**

| Variable         | Description                              | Example     |
| ---------------- | ----------------------------------------- | ----------- |
| `PORT`           | Port the NestJS server listens on         | `3000`      |
| `CLIENT_PORT`    | Port the client runs on (used for CORS)   | `8080`      |
| `REDIS_HOST`     | Redis host                                | `localhost` |
| `REDIS_PORT`     | Redis port                                | `6379`      |
| `POLL_DURATION`  | Poll TTL in Redis, in seconds             | `7200`      |
| `JWT_SECRET`     | Secret used to sign poll access tokens    | -           |

**`client/.env`**

| Variable                | Description                        | Example     |
| ------------------------ | ------------------------------------ | ----------- |
| `VITE_API_HOST`          | Host of the server API              | `127.0.0.1` |
| `VITE_API_PORT`          | Port of the server API              | `3000`      |
| `VITE_POLLS_NAMESPACE`   | Socket.IO namespace for poll events | `polls`     |

## Testing API endpoints

`.http` files for exercising the server's REST controllers with [httpyac](https://httpyac.github.io/) live alongside each module, e.g. `server/src/polls/http/`. Open one in an editor with the httpyac extension (or run `npx httpyac send <file>`) with the server running to try out requests like creating, joining, and rejoining a poll.

## Project structure

```
Poll/
├── client/     # React app (Vite)
├── server/     # NestJS app
├── dev.sh      # Development helper script
└── docker-compose.yml   # Local Redis
```

## Common workflows

- **Run everything for local development**: `./dev.sh start`
- **Only work on the server**: `docker-compose up -d && npm run server:dev`
- **Only work on the client**: `npm run client:dev` (server must be running separately if you need live data)
- **Run tests before committing**: `./dev.sh test`
- **Check formatting/lint issues**: `./dev.sh lint`
