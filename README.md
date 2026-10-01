# Poll

A React &amp; NestJS based project dealing with online, ranked-choice polling. Voting sessions are coordinated in real time over Socket.IO, with poll state held in Redis.

## Tech stack

- **Client**: React, TypeScript, Vite, Tailwind CSS, Storybook
- **Server**: NestJS, TypeScript, Socket.IO, Redis (via `redislabs/rejson`)
- **Infra**: Docker Compose (Redis, server, client)

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose — this is the primary/recommended way to run the project, so everyone develops against the same environment regardless of what's installed locally
- [Node.js](https://nodejs.org/) `v17.6.0` (see `.nvmrc`) — only needed if you also want to run things natively, or want local `node_modules` for editor/IDE support (autocomplete, type-checking)

## Getting started

```bash
git clone <repo-url>
cd Poll
./dev.sh setup   # creates .env files (and installs local deps for your editor)
./dev.sh start   # builds images and starts Redis, the server, and the client in Docker
```

The client runs at `http://localhost:8080` and the server at `http://localhost:3000`. Source files for both `client/` and `server/` are bind-mounted into their containers, so edits on your machine trigger the same hot-reload (`vite`/`nest --watch`) you'd get running natively. `Ctrl+C` stops the stack.

## The `dev.sh` script

`dev.sh` wraps the common commands you'll need during development. Run `./dev.sh help` to see this list at any time.

### Docker commands (recommended)

| Command               | Description                                                              |
| ---------------------- | --------------------------------------------------------------------------- |
| `./dev.sh setup`       | Creates `server/.env` / `client/.env` from their `.env.example` files (if missing) and runs `npm install` locally for editor support |
| `./dev.sh start`       | Builds images (if needed) and starts Redis, the server, and the client in Docker |
| `./dev.sh stop`        | Stops and removes the Docker containers                                 |
| `./dev.sh test`        | Runs the server and client test suites inside Docker                    |
| `./dev.sh lint`        | Lints the server and client codebases inside Docker                     |
| `./dev.sh build`       | Builds the server and client for production inside Docker               |
| `./dev.sh storybook`   | Starts Storybook (`http://localhost:6006`) for the client component library inside Docker |

### Native commands

Useful if you want faster local feedback loops without Docker for the server/client (Redis still runs in Docker either way).

| Command                | Description                                                      |
| ------------------------ | -------------------------------------------------------------------- |
| `./dev.sh start:native` | Starts Redis in Docker, then runs the server and client with your local Node/npm install |
| `./dev.sh stop:native`  | Stops the Redis container                                        |

If you'd rather run things manually, the underlying commands are:

```bash
# Docker
docker compose up --build        # start Redis, server, and client
docker compose down              # stop everything
docker compose run --rm server npm run test   # run a one-off command in a service

# Native (Redis still via Docker)
npm install
npm run docker:compose           # start Redis only, in the background
npm run server:dev               # start the NestJS server in watch mode (waits for Redis)
npm run client:dev               # start the Vite dev server for the client
npm run start                    # runs the three above together
npm run stop                     # stop Redis
```

## Environment variables

`./dev.sh setup` creates these for you; to do it manually:

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
| `REDIS_PORT`     | Redis port                                | `6380`      |
| `POLL_DURATION`  | Poll TTL in Redis, in seconds             | `7200`      |
| `JWT_SECRET`     | Secret used to sign poll access tokens    | -           |

> The Redis container is published to the host on `6380` instead of the default `6379` (set in `docker-compose.yml`) to avoid clashing with any other project's Redis running on your machine. `server/.env` points at `localhost:6380`, which is what a natively-run server (`./dev.sh start:native`) and host tools (e.g. `redis-cli -p 6380`) use. When running via `docker compose`, `REDIS_HOST` and `REDIS_PORT` are overridden to `redis` and `6379` (the service name and container-to-container port) in `docker-compose.yml`, so the server container reaches Redis directly on the docker network.

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
├── client/               # React app (Vite)
│   └── Dockerfile
├── server/               # NestJS app
│   └── Dockerfile
├── dev.sh                # Development helper script
└── docker-compose.yml    # Redis, server, and client
```

## Common workflows

- **Run everything for local development**: `./dev.sh start`
- **Only work on the server**: `docker compose up redis server` (or `./dev.sh start:native` for local Node)
- **Only work on the client**: `docker compose up redis server client`, or `npm run client:dev` if the server is already running elsewhere
- **Run tests before committing**: `./dev.sh test`
- **Check formatting/lint issues**: `./dev.sh lint`
- **Rebuild images after changing a `package.json`**: `docker compose build`

## Troubleshooting

- **Hot reload isn't picking up changes in Docker (mainly on macOS/Windows)**: bind-mount file watching can occasionally miss events. Restarting the affected container (`docker compose restart server` or `client`) resolves it; if it's a recurring issue for you, ask about enabling polling-based watchers.
- **Ports already in use**: something on your machine (or a stale container) is already bound to `3000`, `8080`, or `6380`. Run `./dev.sh stop` first, or find and stop the conflicting process (`docker ps` shows what's using a port).
- **Server hangs and requests get reset (`ECONNRESET`)**: this usually means the `server` container never actually started — check `docker compose logs server`. A common cause is Redis not being reachable (e.g. a stale/orphaned Redis container left over from an interrupted `docker compose up`). Fix: `docker compose down && docker compose up -d` to force a clean recreate of all three containers.
- **Changed a dependency but the container doesn't see it**: run `docker compose build` (or `./dev.sh start` again, which rebuilds) so `npm ci` re-runs inside the image.
