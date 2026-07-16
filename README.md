# Todo App

A full-stack, Todoist-inspired task manager built to learn modern full-stack
development end-to-end — real authentication, a relational database schema,
and every core productivity feature you'd expect from a real product.

**Live app:** https://to-do-app-p379.vercel.app

## Features

- **Authentication** — email/password signup and login (Auth.js v5, JWT
  sessions, bcrypt-hashed passwords), protected app routes
- **Projects** — group tasks, with an "Inbox" for unassigned tasks
- **Tasks** — create, complete, delete; priorities (Low/Medium/High/Urgent);
  labels (create-on-the-fly, many-to-many); due dates with overdue styling
- **Subtasks** — a task can have nested subtasks (self-referential relation)
- **Search and filtering** — by title, priority, label, and due-date bucket
  (overdue / due today / no due date), all via shareable URL query params
- **Reminders** — schedule a reminder on any task; a scheduled job checks for
  due reminders and sends a real email via [Resend](https://resend.com)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| Language | TypeScript (strict mode) |
| Styling / UI | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (Base UI primitives) |
| Database | PostgreSQL |
| ORM | [Prisma](https://prisma.io) (`prisma-client` generator, `pg` driver adapter) |
| Auth | [Auth.js v5](https://authjs.dev) (Credentials provider, JWT sessions) |
| Email | [Resend](https://resend.com) |
| Unit tests | [Vitest](https://vitest.dev) |
| E2E tests | [Playwright](https://playwright.dev) |
| CI | GitHub Actions |
| Hosting | Vercel (app) + [Neon](https://neon.tech) (Postgres) |
| Reminder scheduling | [cron-job.org](https://cron-job.org) (free external scheduler calling an authenticated API route) |

## Architecture notes

A few decisions worth calling out for anyone reading the code:

- **Reminders are decoupled from Vercel's own Cron feature.** Vercel's free
  Hobby tier only allows daily cron schedules; every-5-minutes needs a paid
  plan. Instead, `/api/cron/send-reminders` is a plain authenticated API
  route (checked via an `Authorization: Bearer $CRON_SECRET` header) that a
  free external scheduler calls on a real 5-minute interval. The route
  itself doesn't care who calls it.
- **All `DateTime` columns are `@db.Timestamptz`, not Prisma's Postgres
  default (`timestamp` without time zone).** A naive timestamp column,
  combined with a database session in a non-UTC timezone, silently produces
  wrong "is this due yet" comparisons — found via a real bug while building
  reminders. The app's database role is also pinned to `timezone = 'UTC'`.
- **Task ownership checks happen inside the mutation itself**
  (`updateMany`/`deleteMany` with both `id` and `ownerId` in the `where`
  clause), not as a separate "check, then act" step — avoids a
  check-then-mutate race and means a forged ID for someone else's task
  simply matches zero rows instead of erroring in a way that leaks
  information.
- **Subtasks reuse the `Task` table** via a self-referential `parentId`
  relation, rather than a separate `Subtask` table with duplicated columns.

## Getting started locally

### Prerequisites

- Node.js 20+
- A PostgreSQL database

### Setup

```bash
npm install
cp .env.example .env   # then fill in the values, see below
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See [`.env.example`](.env.example) for the full list with explanations:
`DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`,
`REMINDER_FROM_EMAIL`.

## Testing

```bash
npm run test        # unit tests (Vitest)
npm run test:watch  # unit tests, watch mode
npm run test:e2e     # end-to-end tests (Playwright) — needs the dev DB set up
```

E2E tests spin up their own uniquely-emailed test users per test and clean
them up afterward; they don't touch your real account data.

CI (`.github/workflows/ci.yml`) runs typecheck, unit tests, a production
build, and the full e2e suite against a real Postgres service container on
every push to `main`.

## Deployment

Deployed on Vercel with a Neon Postgres database. To redeploy your own copy:

1. Import the repo into Vercel.
2. Provision a Postgres database (Neon, via Vercel's Storage tab, or your
   own) and set `DATABASE_URL`.
3. Set the remaining env vars from `.env.example` in Vercel's project
   settings (generate fresh values for `AUTH_SECRET`/`CRON_SECRET` — don't
   reuse local dev secrets).
4. Run `npx prisma migrate deploy` against the production database once.
5. Point an external scheduler (e.g. cron-job.org) at
   `https://<your-domain>/api/cron/send-reminders` every 5 minutes, with
   header `Authorization: Bearer <CRON_SECRET>`.
