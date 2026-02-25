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
- API: `DATABASE_URL`, `PORT`, `API_PREFIX`, `WEB_ORIGIN`, JWT/Google auth keys
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
- API auth base: `http://localhost:3001/api/auth`

## Authentication

Implemented auth features:

- Email/password registration and login
- Google OAuth login
- Access + refresh JWT cookies (`httpOnly`)
- Refresh token rotation with DB-backed invalidation
- `/auth/me`, `/auth/refresh`, `/auth/logout`

Frontend auth pages/flow:

- `/login` for login/register + Google sign-in
- `/forms` checks session via `/auth/me`, falls back to `/auth/refresh` on `401`

## Auth Setup (Local)

### Required API env keys

Set these in `apps/api/.env`:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `REFRESH_TOKEN_HASH_SECRET`
- `JWT_ACCESS_TTL_SECONDS` (recommended `900`)
- `JWT_REFRESH_TTL_SECONDS` (recommended `2592000`)
- `WEB_AUTH_SUCCESS_REDIRECT` (for local: `http://localhost:3000/forms`)

### Email/password auth

No external provider setup is required.

User flow:

- Open `http://localhost:3000/login`
- Register with email/password (or login with existing user)
- Session is persisted via httpOnly cookies
- Protected pages (`/forms`) restore session using `/auth/me` and `/auth/refresh`

### Google OAuth setup

1. Create/select a project in Google Cloud Console.
2. Configure OAuth consent screen.
3. Add your Gmail as a test user (if app is in testing mode).
4. Create OAuth client credentials of type `Web application`.
5. Add redirect URI: `http://localhost:3001/api/auth/google/callback`.
6. Add JS origin: `http://localhost:3000`.
7. Put these keys into `apps/api/.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback`

If Google keys are missing, API will still run, but Google endpoints return a configuration error.

### Auth endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Common auth issues

- `OAuth2Strategy requires a clientID option`:
  Google env keys are empty or not loaded.
- `redirect_uri_mismatch`:
  Callback URL in Google Console does not exactly match `GOOGLE_CALLBACK_URL`.
- `EADDRINUSE: 3001`:
  Another process is using API port `3001`.
- Repeated `401` on `/forms`:
  check `NEXT_PUBLIC_API_URL`, API cookies, and CORS origin (`WEB_ORIGIN`).

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
