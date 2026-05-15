# OJTracker

OJTracker is a full-stack OJT hour tracking app with authentication, duty log management, and calendar-based updates.

## What This Project Does

- Tracks OJT progress from start date to target completion hours
- Logs duty hours and computes completed vs remaining hours
- Allows updating and deleting duty logs
- Shows progress through dedicated Home, Calendar, and Duty Logs views
- Supports guest demo mode without account login
- Provides JWT-based authentication for protected routes

## Tech Stack

Frontend:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router

Backend:

- Node.js + Express 5
- TypeScript
- Prisma ORM
- SQLite
- JWT + bcryptjs

## Project Structure

```text
vite-project/
  src/                  # React app
  backend/
    controllers/        # Request handlers
    routes/             # API route definitions
    services/           # Business/data service layer
    middleware/         # Auth middleware
    prisma/             # Schema + migrations
```

## Routes

Frontend:

- / (landing page)
- /demo (guest demo mode)
- /home (protected)
- /calendar (protected)
- /duty-logs (protected)

Backend base URL: http://localhost:3000

Authentication:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile (protected)

OJT Tracking (protected):

- GET /api/ojt
- POST /api/ojt/start
- POST /api/ojt/duty
- PUT /api/ojt/duty/:id
- DELETE /api/ojt/duty/:id
- DELETE /api/ojt/reset

Health:

- GET /api/health

## Prerequisites

- Node.js 18+
- pnpm
- SQLite is bundled with Prisma, no external database server needed

## Environment Variables

Create backend/.env:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="replace-with-a-secure-secret"
PORT=3000
```

You can copy [backend/.env.example](backend/.env.example) to [backend/.env](backend/.env) and adjust the secret if needed.

Optional frontend environment:

Create .env in the project root if your API is not on localhost:3000.

```env
VITE_API_URL="http://localhost:3000"
```

## Setup

1. Install frontend dependencies:

```bash
pnpm install
```

2. Install backend dependencies:

```bash
pnpm -C backend install
```

3. Apply Prisma migrations:

```bash
pnpm -C backend prisma migrate dev
```

If you already created a MySQL database for this project, run the migration against a fresh SQLite file instead of reusing the old database.

4. Start both frontend and backend in development:

```bash
pnpm dev:all
```

You can also run each service separately:

```bash
# Frontend
pnpm dev

# Backend
pnpm -C backend dev
```

## Scripts

Root:

- pnpm dev
- pnpm dev:all
- pnpm build
- pnpm lint
- pnpm preview

Backend:

- pnpm -C backend dev
- pnpm -C backend build
- pnpm -C backend start

## Database Models

- User
- OjtTracking
- DutyLog

Schema location: backend/prisma/schema.prisma

## Notes Before Pushing

- Ensure backend/.env exists and is not committed
- Confirm frontend and backend both start successfully
- Run lint/build checks if needed:

```bash
pnpm lint
pnpm build
pnpm -C backend build
```
