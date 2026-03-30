# Frontier Pulse Frontend (Next.js)

## Local Run

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Default backend URL is already set to:

- `https://oracle-fp.up.railway.app`

Optional override via env:

- `ORACLE_BACKEND_URL`

Frontend API routes prioritize Railway oracle backend and automatically fallback to local computation when Railway is unavailable.

## Deploy to Vercel

1. Import `fe_frontierpulse` to Vercel.
2. (Optional) add `ORACLE_BACKEND_URL` only if you want a different backend URL.
3. Deploy.

The frontend keeps using existing `/api/*` routes, but those routes proxy to Railway when configured.
