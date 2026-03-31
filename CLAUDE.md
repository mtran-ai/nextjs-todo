# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14 todo application with user authentication, task management, GitHub repo linking, and comment functionality. The project uses TypeScript, Prisma ORM, PostgreSQL, shadcn-ui, and Tailwind CSS.

## Directory Structure

The actual source code is in the `src/` directory:

- **`src/app/`** — Next.js 14 app router routes (pages, layouts, API routes)
  - `(auth)/` — Authentication pages (sign-in, sign-up)
  - `[username]/` — User's task list (dynamic route)
  - `api/` — Route handlers for API endpoints
  - `actions.ts` — Server actions for database operations
  - `layout.tsx` — Root layout
- **`src/components/`** — React components
  - `ui/` — shadcn-ui components (Button, Input, Dialog, etc.)
  - Custom components (TaskForm, Comments, TaskMenu, etc.)
- **`src/lib/`** — Utility modules
  - `auth.ts` / `auth.config.ts` — next-auth configuration
  - `db.ts` — Prisma client instance
  - `safe-action.ts` — Safe action wrapper for server actions
  - `constants.ts` / `utils.ts` — Helper functions
- **`src/prisma/`** — Prisma ORM schema
  - `schema.prisma` — Database schema (User, Task, Repo, Comment models)
- **`src/styles/`** — Global CSS
- **`src/types/`** — TypeScript type definitions
- **`src/public/`** — Static assets

All npm scripts are configured in `src/package.json`.

## Development Commands

Run these from the `src/` directory:

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Production build
npm run start        # Run production server
npm run lint         # Run ESLint
npm run prisma:gen  # Generate/regenerate Prisma client
npm run db:push     # Push schema changes to database (with .env.local)
npm run studio      # Open Prisma Studio UI for database inspection
```

To run any of these from the root directory, use `npm run <script>` (npm will find src/package.json).

## Architecture & Key Patterns

### Authentication (next-auth v5)

- **Config**: `src/lib/auth.config.ts` — Provider setup (credentials-based with username/password)
- **Setup**: `src/lib/auth.ts` — Session configuration
- **Route Handler**: `src/app/api/auth/[...nextauth]/route.ts` — NextAuth endpoint
- **Sign-up**: `src/app/api/auth/sign-up/route.ts` — Custom signup logic (hashes password with bcrypt)
- Username/password authentication stored in database as User model in Prisma

### Database (Prisma)

- **Provider**: PostgreSQL on Neon
- **Schema**: `src/prisma/schema.prisma` — 4 models:
  - **User** — username (unique), password hash
  - **Task** — title, description, due date, done state, authorId
  - **Comment** — text, senderId, taskId (linked to Task and User)
  - **Repo** — GitHub repo metadata linked to a task (one-to-one)
- **Queries**: Imported from `@prisma/client` in server components and actions
- **Client Instance**: `src/lib/db.ts` exports singleton instance

### Forms & Validation

- **react-hook-form** — Form state management
- **zod** — Schema validation for forms and API responses
- **Server Actions** — Form submissions use server actions in `src/app/actions.ts` wrapped with `next-safe-action`

### UI & Styling

- **shadcn/ui** — Component library (pre-built Radix UI + Tailwind components)
- **Tailwind CSS** — Utility-first CSS framework
- **Tailwind plugins**: `tailwindcss-animate`, `prettier-plugin-tailwindcss`
- Components configured in `src/components.json`

### TypeScript Configuration

- **Path Alias**: `~/*` resolves to `src/` (e.g., `import { Button } from '~/components/ui/button'`)
- Config in `src/tsconfig.json` with strict mode enabled

### Deployment

- Deploy target: Vercel (configured in Next.js)
- Environment variables required: `DATABASE_URL`, `DIRECT_DATABASE_URL` (for Prisma), auth secrets

## Common Development Tasks

### Add a new page/route

1. Create files in `src/app/` following Next.js app router conventions
2. Use `src/app/actions.ts` or create new server actions for data fetching
3. Use Prisma client for database queries (e.g., `prisma.task.findMany()`)

### Add a new form or component

1. Create in `src/components/` as a `.tsx` file
2. Use `react-hook-form` for form logic and `zod` for validation
3. For shadcn/ui components, import from `~/components/ui/<component>`
4. Wrap forms with server actions for submission

### Update database schema

1. Edit `src/prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run prisma:gen` to regenerate Prisma client types (usually automatic)

### Debug database

Run `npm run studio` to open Prisma Studio UI for visual inspection and manipulation of database records.

## Environment Setup

Create `src/.env.local` with:

```
DATABASE_URL=<postgres-connection-string>
DIRECT_DATABASE_URL=<same-or-pooling-url>
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=<app-url>
```

See `src/.env.example` for all required variables.

## Code Style

- **ESLint**: Uses Next.js recommended config (`eslint-config-next`)
- **Prettier**: Configured with `prettier-plugin-tailwindcss` to auto-format Tailwind classes
- Run `npm run lint` to check for issues
