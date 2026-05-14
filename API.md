# API Documentation

All routes live under `src/app/api/`. Responses are JSON. Errors are returned with HTTP `200` and a `{ success: false, message }` envelope (no non-2xx status codes are emitted by the handlers).

---

## `POST /api/auth/sign-up`

Create a new user account.

- **Auth:** none
- **Source:** `src/app/api/auth/sign-up/route.ts`

### Request body

```json
{
  "username": "string",
  "password": "string"
}
```

### Success response

```json
{
  "success": true,
  "message": "User was successfully created."
}
```

### Error responses

| Condition              | Body                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| Username already taken | `{ "success": false, "message": "User already exists" }`            |
| Any thrown exception   | `{ "success": false, "message": "Error occured while signing up!" }`|

Password is hashed with `bcrypt` (`genSalt` + `hash`) before storage.

---

## `GET /api/auth/[...nextauth]` & `POST /api/auth/[...nextauth]`

NextAuth.js catch-all handler. Delegates to `authOptions` in `src/lib/auth.ts`.

- **Auth:** managed by NextAuth (handles sign-in, callback, session, csrf, providers, etc.)
- **Source:** `src/app/api/auth/[...nextauth]/route.ts`

Request/response shapes follow the [NextAuth.js REST contract](https://next-auth.js.org/getting-started/rest-api). Not redefined here.

---

## `POST /api/tasks`

Create a task owned by the signed-in user.

- **Auth:** required (NextAuth session via `auth()`)
- **Source:** `src/app/api/tasks/route.ts`

### Request body

Validated with Zod:

```ts
{
  title: string,
  description?: string | null,
  due?: string | null,    // ISO date string
  labelIds?: string[]     // optional, must be Label.id values owned by the session user
}
```

### Success response

```json
{
  "success": true,
  "message": "A new task was successfully created"
}
```

### Error responses

| Condition                                       | Body                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| No session                                      | `{ "success": false, "message": "Your session has expired. To use the app sign in again" }` |
| One or more `labelIds` not owned by session user| `{ "success": false, "message": "One or more labels do not exist" }`        |
| Zod parse failure / DB error / any throw        | `{ "success": false, "message": "Error occured while create a task!" }`     |

Task is persisted with `authorId = session.user.id`. Labels in `labelIds` are connected to the task.

---

## `PATCH /api/tasks/[taskId]`

Update fields on an existing task.

- **Auth:** required (NextAuth session via `auth()`)
- **Source:** `src/app/api/tasks/[taskId]/route.ts`

### Path params

| Name     | Type     | Notes                  |
| -------- | -------- | ---------------------- |
| `taskId` | `string` | Prisma task `id` (cuid)|

### Request body

```ts
{
  title: string,
  description?: string | null,
  due?: string | null,
  labelIds?: string[]   // when provided, the task's labels are *replaced* with this set (Prisma `labels.set`)
}
```

> Note: handler currently overwrites `title`, `description`, and `due` on every call — there is no partial-merge behavior. `labelIds` is treated as a full replacement when present; when omitted, existing label associations are left untouched.

### Success response

```json
{
  "success": true,
  "message": "The task was successfully updated"
}
```

### Error responses

| Condition                                       | Body                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| No session                                      | `{ "success": false, "message": "Your session has expired. To use the app sign in again" }` |
| One or more `labelIds` not owned by session user| `{ "success": false, "message": "One or more labels do not exist" }`        |
| Param/body Zod failure, DB error, or any throw  | `{ "success": false, "message": "Error occured while updating the task!" }` |

> Note: no ownership check on the task itself — any signed-in user can `PATCH` any task by id. `labelIds` *are* ownership-checked.

---

## Server actions (Label CRUD)

The label CRUD surface is implemented as `next-safe-action` server actions in `src/app/actions.ts`, not as REST endpoints. Returned data follows the action contract: success returns a domain payload; failure returns `{ failure: string }`.

### `createLabel({ name, color })`

- **Auth:** required (middleware-injected `userId`)
- **Input:**
  ```ts
  {
    name: string,   // 1..30 chars
    color: string   // hex like #aabbcc
  }
  ```
- **Success:** the created `Label` row (`id`, `name`, `color`, `createdAt`, `userId`).
- **Failure:** `{ failure: 'Error occurred while creating the label!' }` or session-expired message.

### `listLabels({})`

- **Auth:** required
- **Input:** empty object.
- **Success:** `{ labels: { id: string, name: string, color: string }[] }`, alphabetised by `name`.
- **Failure:** `{ failure: 'Error occurred while listing labels!' }` or session-expired message.

### `deleteLabel({ id })`

- **Auth:** required; ownership check via `findFirst` before delete.
- **Input:** `{ id: string }`.
- **Success:** `{ id: string }`.
- **Failure:** `{ failure: 'Label not found' }` if the label does not belong to the session user, `{ failure: 'Error occurred while deleting the label!' }` on throw, or session-expired message.

---

## Cross-cutting notes

- All handlers return HTTP `200` even on failure; clients must branch on the `success` boolean.
- Validation: `zod` for `/api/tasks*`; manual destructuring for `/api/auth/sign-up`.
- Session resolution: `auth()` exported from `src/lib/auth.ts`.
- DB access: shared Prisma client `db` from `src/lib/db.ts`.
- Missing CRUD verbs: no `GET`/`DELETE` for tasks, no `DELETE` for users. Task reads happen server-side via RSC, not via this API.
