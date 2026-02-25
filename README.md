# Formora Monorepo

Backend + frontend monorepo for Formora, built with Turborepo and pnpm workspaces.

By Azamat Altymyshev

## Tech Stack

- Backend: NestJS (`apps/api`)
- Frontend: Next.js App Router (`apps/web`)
- Database: PostgreSQL (Docker Compose)
- ORM: Prisma (`apps/api/prisma`)
- Shared contracts: `packages/shared-types`

## Project Structure

- `apps/api` NestJS API
- `apps/web` Next.js web app
- `packages/shared-types` shared DTOs/types/contracts
- `packages/tsconfig` shared TypeScript configs
- `packages/eslint-config` shared lint presets
- `docker/postgres` database-related local files

## Environment

Create local env files from examples:

- `.env.example` -> `.env`
- `apps/api/.env.example` -> `apps/api/.env`
- `apps/web/.env.example` -> `apps/web/.env`

Key variables:

- Root: Postgres credentials, `POSTGRES_PORT`, `DATABASE_URL`
- API: `DATABASE_URL`, `PORT`, `API_PREFIX`, `WEB_ORIGIN`
- Web: `NEXT_PUBLIC_API_URL`

## Run Locally

1. Install dependencies:
   - `pnpm install`
2. Start PostgreSQL:
   - `docker compose up -d postgres`
3. Run first migration:
   - `pnpm --filter @repo/api prisma:migrate --name init`
4. Start monorepo dev mode:
   - `pnpm dev`

Endpoints:

- Web: `http://localhost:3000`
- API health: `http://localhost:3001/api/health`

## Workspace Scripts

- `pnpm dev` run API + Web in watch mode
- `pnpm build` build all packages/apps with dependency order
- `pnpm lint` run lint across workspace
- `pnpm typecheck` run TypeScript checks
- `pnpm test` run tests/placeholders

## Notes

- Keep `.env.example` files in sync with real runtime requirements.
- Do not commit `.env` or secrets.
- Keep domain logic scoped by modules (`Forms`, `Responses`, etc.).
