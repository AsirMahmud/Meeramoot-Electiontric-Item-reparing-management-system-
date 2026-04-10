# Meeramoot Electric Item Repairing Management System

This repository runs as **two separate apps**: an **Express + Prisma** API and a **Next.js** frontend. Each can be deployed on its own server. For local development they usually run on `http://localhost:4000` (API) and `http://localhost:3000` (web).

The API stores data in **PostgreSQL**. Prisma is configured with `provider = "postgresql"` and connects using **`DATABASE_URL`** (standard `postgresql://` URI). You can install PostgreSQL locally, use a cloud Postgres service, and manage databases with tools such as **pgAdmin** or Prisma Studio.

## Prerequisites

- **Node.js** (LTS recommended) and npm  
- **PostgreSQL** 12+ (server running and reachable from the API host)

## 1. Backend (API)

Path: `backend/`

### First-time setup

1. In PostgreSQL, create a database and user with permission to use it (for example database `meeramoot_electric_repair`). You can do this with `psql`, **pgAdmin**, or your host’s console.

2. Copy the environment template and edit values:

   ```bash
   cd backend
   copy .env.example .env
   ```

   On macOS or Linux use `cp .env.example .env`.

3. In `.env`, set a valid **`DATABASE_URL`** for your Postgres instance. Keep **`FRONTEND_ORIGIN`** equal to the URL where the Next.js app runs (default: `http://localhost:3000`). Adjust **`PORT`** if `4000` is already in use.

4. Install dependencies and prepare Prisma:

   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   ```

   The first migration creates tables from `prisma/schema.prisma`. If you only want to sync the schema without migration history in early prototyping, you may use `npx prisma db push` instead of `prisma:migrate` (use migrations for anything you intend to deploy).

### Run the API (development)

```bash
cd backend
npm run dev
```

The server listens on the port in `.env` (default **4000**). Check **`GET /api/health`** (for example `http://localhost:4000/api/health`).

### Run the API (production build)

```bash
cd backend
npm run build
npm start
```

Ensure `.env` (or your host’s environment) provides `DATABASE_URL` and other variables on the server.

---

## 2. Frontend (Next.js)

Path: `frontend/`

### First-time setup

1. Copy the environment example:

   ```bash
   cd frontend
   copy .env.example .env.local
   ```

   On macOS or Linux use `cp .env.example .env.local`.

2. Set **`NEXT_PUBLIC_API_URL`** to your API’s public URL (no trailing slash required). For local dev with the default backend:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Run the web app (development)

```bash
cd frontend
npm run dev
```

Open **`http://localhost:3000`**. The home page calls the API health endpoint; if the backend is down or the URL is wrong, the status panel will show an error.

### Build and run (production)

```bash
cd frontend
npm run build
npm start
```

Set **`NEXT_PUBLIC_API_URL`** on the host to the **real** API URL your users’ browsers will call.

---

## CORS and separate servers

The backend allows requests from **`FRONTEND_ORIGIN`** only. After you change the frontend URL (another port, tunnel, or production domain), update backend `.env`:

```env
FRONTEND_ORIGIN=https://your-frontend-domain.example
```

The frontend must use **`NEXT_PUBLIC_API_URL`** pointing at wherever the API is reachable from the browser.

## Typical local workflow

1. Start PostgreSQL.  
2. Start **backend**: `cd backend && npm run dev`.  
3. Start **frontend**: `cd frontend && npm run dev`.  
4. Use the site at `http://localhost:3000` and confirm the API status on the home page.

## Useful commands

| Location  | Command              | Purpose                    |
|-----------|----------------------|----------------------------|
| `backend` | `npm run prisma:studio` | Open Prisma Studio (DB UI) |
| `backend` | `npm run prisma:migrate` | Create/apply migrations   |
| `frontend`| `npm run lint`       | Run ESLint                 |
