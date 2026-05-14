# Migrations

This project syncs schema via `prisma db push` (see `db:push` / `test:e2e:setup` scripts). Migration SQL files in this folder are kept as reviewable history of schema changes — they are **not** applied by `prisma migrate deploy` automatically.

To apply a change to a running database:

```bash
pnpm db:push
```

To apply against the e2e test database:

```bash
pnpm test:e2e:setup
```
