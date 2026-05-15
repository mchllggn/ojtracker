# react-vite-app

Full-stack OJT tracking workspace with a Vite React frontend and an Express + Prisma backend.

## Structure

- `packages/client` - React app
- `packages/server` - API server

## Development

Install once from the workspace root:

```bash
pnpm install
```

Run both apps in parallel:

```bash
pnpm dev
```

Build both apps:

```bash
pnpm build
```

Run only one side:

```bash
pnpm dev:client
pnpm dev:server
```

## Frontend API setup

The frontend uses relative `/api` requests in development through the Vite proxy.
If you deploy the frontend separately, set `VITE_API_URL` in `packages/client/.env` to point at the backend.

## Backend environment

Copy `packages/server/.env.example` to `packages/server/.env` and set a real `JWT_SECRET` before running the server locally.
