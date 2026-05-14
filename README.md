# Yet another ToDo

An open source application built using [Next.js 14](https://nextjs.org/).

[Deploy link](https://nextjs-14-todo.vercel.app/)

## Features

- Authentication (using username & password) / Registration
- Task have a title, description, done state and due date field
- Users can see the list of the tasks
- Users can filter the tasks by name & description
- Users can create / modify / delete a task
- Users can share their tasks via URL
- Users can add comments to the task
- Users can link a public GitHub repo to a task. There is a route where users can view some metadata of the repo

## Technology stack

- Next.js 14 (app router, route handlers, server actions)
- Prisma
- PostgreSQL (local via Docker, or [Neon](https://neon.tech/) in production)
- UI lib shadcn-ui
- Tailwind CSS
- react-hook-form
- zod (form validation, API response validation, etc.)
- TypeScript
- next-safe-action
- deploy to Vercel

## Prerequisites

- Node.js 18+ and npm
- Docker (for the local PostgreSQL database)

## Running locally

### 1. Install dependencies

```sh
npm install
```

### 2. Start PostgreSQL with Docker

Run a local PostgreSQL container. The credentials below match the defaults in `.env.local`:

```sh
docker run --name todo-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=welkom01 \
  -e POSTGRES_DB=todo_dev \
  -p 5432:5432 \
  -d postgres:17-alpine
```

To stop / start the container later:

```sh
docker stop todo-postgres
docker start todo-postgres
```

### 3. Configure environment variables

Copy `.env.local` (already present in repo) or create your own with:

```env
DATABASE_URL=postgresql://postgres:welkom01@localhost:5432/todo_dev
DIRECT_DATABASE_URL=postgresql://postgres:welkom01@localhost:5432/todo_dev
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a `NEXTAUTH_SECRET` with:

```sh
openssl rand -base64 32
```

### 4. Push the Prisma schema to the database

```sh
npm run db:push
npm run prisma:gen
```

### 5. Start the development server

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:gen` | Regenerate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run studio` | Open Prisma Studio |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run Playwright e2e tests |

## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:5432`** — Postgres container not running. Run `docker start todo-postgres`.
- **`password authentication failed`** — Credentials in `.env.local` don't match container env vars. Recreate the container or update the env file.
- **Port 5432 already in use** — Another Postgres instance is running. Stop it, or map the container to a different host port (`-p 5433:5432`) and update `DATABASE_URL` accordingly.
