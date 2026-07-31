# PlayBeat Digital — Full Vercel Deployment Guide

This repository is a **monorepo** with two independently deployable apps:

| App | Path | Framework | Vercel Project | Suggested Domain |
|-----|------|-----------|----------------|------------------|
| Frontend | `frontend/` | React + Vite | `playbeat-web` | `playbeat.digital` |
| Backend  | `backend/`  | Node.js + Express (serverless) | `playbeat-api` | `api.playbeat.digital` |

The frontend talks to the backend via `VITE_API_URL`. The backend stores data in MongoDB Atlas and uses Stripe for payments, Nodemailer for email, and JWT for auth.

---

## Prerequisites

- A Vercel account (free Hobby tier is enough to start)
- A MongoDB Atlas cluster (free M0 tier works)
- A Stripe account (test mode first, then live)
- (Optional) A custom domain on Namecheap / Cloudflare / etc.
- Node.js 18+ and npm installed locally

---

## Option A — Deploy via Vercel Dashboard (Recommended for first-time)

### A.1 Deploy the Backend (do this FIRST)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repo `uzzirulzz-cyber/playbeat-new-b`
3. **Configure project:**
   - **Name:** `playbeat-api`
   - **Framework Preset:** Other
   - **Root Directory:** `backend` *(click "Edit" next to Root Directory)*
   - **Build Command:** `npm install` *(backend has no build step)*
   - **Output Directory:** leave empty
   - **Install Command:** `npm install`
4. **Environment Variables** (click "Environment Variables" and add each one):

   | Key | Example Value | Required |
   |-----|---------------|----------|
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/playbeat?retryWrites=true&w=majority` | YES |
   | `JWT_SECRET` | (run `openssl rand -hex 64`) | YES |
   | `JWT_REFRESH_SECRET` | (run `openssl rand -hex 64` — different from above) | YES |
   | `JWT_EXPIRES_IN` | `7d` | YES |
   | `JWT_REFRESH_EXPIRES_IN` | `30d` | YES |
   | `NODE_ENV` | `production` | YES |
   | `CORS_ORIGIN` | `https://playbeat.digital` (or your Vercel preview URL for testing) | YES |
   | `FRONTEND_URL` | `https://playbeat.digital` | YES |
   | `ADMIN_EMAIL` | `admin@playbeat.digital` | YES |
   | `ADMIN_PASSWORD` | (strong password, 12+ chars) | YES |
   | `BCRYPT_ROUNDS` | `12` | YES |
   | `RATE_LIMIT_WINDOW_MS` | `900000` | YES |
   | `RATE_LIMIT_MAX` | `100` | YES |
   | `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | For payments |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | For webhooks |
   | `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | For frontend |
   | `SMTP_HOST` | `smtp.gmail.com` | For emails |
   | `SMTP_PORT` | `587` | For emails |
   | `SMTP_USER` | `you@gmail.com` | For emails |
   | `SMTP_PASS` | (Gmail App Password) | For emails |
   | `EMAIL_FROM` | `noreply@playbeat.digital` | For emails |

5. Click **Deploy**. Wait for the build to finish (~30–60s).
6. Note the deployment URL, e.g. `https://playbeat-api.vercel.app`. This is your API base URL.

#### Verify backend is live
Open `https://<your-api-url>/api/health` — you should see JSON like:
```json
{"success":true,"message":"PlayBeat Digital API is running","timestamp":"...","environment":"production","version":"1.0.0"}
```

#### Seed the admin user (one-time)
```bash
# From repo root
cd backend
npm install
vercel env pull .env.local   # requires Vercel CLI login
npm run seed:admin
```

---

### A.2 Deploy the Frontend

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same** GitHub repo `uzzirulzz-cyber/playbeat-new-b`
3. **Configure project:**
   - **Name:** `playbeat-web`
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` *(click "Edit")*
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)
4. **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-backend-url>/api` (e.g. `https://playbeat-api.vercel.app/api`) |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` |
   | `VITE_SITE_URL` | `https://<your-frontend-url>` |

5. Click **Deploy**. Wait for the build (~30s).
6. Visit the deployment URL. The app should load and be able to reach the backend.

---

## Option B — Deploy via Vercel CLI

```bash
# Install Vercel CLI once
npm i -g vercel

# Login
vercel login

# --- Backend ---
cd backend
vercel              # preview deploy
vercel --prod       # production deploy

# --- Frontend ---
cd ../frontend
vercel              # preview deploy
vercel --prod       # production deploy
```

When prompted, accept the auto-detected settings (Vite for frontend, Other for backend). The `vercel.json` in each folder will handle the rest.

---

## Option C — Deploy from repo root (monorepo single-project)

If you prefer to deploy from the repo root using one of the alternate config files:

```bash
# Backend from root
vercel --local-config=vercel-backend.json --prod

# Frontend from root
vercel --local-config=vercel-frontend.json --prod
```

This is useful if your CI pipeline checks out the whole repo. **Option A or B is recommended** for cleaner per-project env vars.

---

## Post-Deployment Setup

### 1. Connect custom domains

In the Vercel dashboard for each project:
- **Frontend** → Settings → Domains → Add `playbeat.digital` (and `www.playbeat.digital`)
- **Backend** → Settings → Domains → Add `api.playbeat.digital`

Vercel will give you DNS records to add at your registrar (A record, CNAME, or nameservers). Once DNS propagates (5–60 min), HTTPS is auto-provisioned.

### 2. Update env vars with final domains

After custom domains are live, update the environment variables to use the production URLs:
- Frontend: `VITE_API_URL=https://api.playbeat.digital/api`, `VITE_SITE_URL=https://playbeat.digital`
- Backend: `CORS_ORIGIN=https://playbeat.digital`, `FRONTEND_URL=https://playbeat.digital`

Redeploy both projects to pick up the new env vars.

### 3. Configure Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. Endpoint URL: `https://api.playbeat.digital/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` on the backend project.
5. Redeploy backend.

### 4. (Optional) Configure Vercel Cron Jobs

If you need scheduled tasks (e.g. cleanup abandoned carts, send notification digests), add to `vercel.json`:
```json
"crons": [
  { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }
]
```
Then secure the cron endpoint with a secret header check.

---

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Database Access** → Add a new user (NOT your Atlas login):
   - Username: `playbeat`
   - Password: strong, random
   - Role: `readWriteAnyDatabase` (or just `readWrite` on `playbeat` db)
3. **Network Access** → Add IP: `0.0.0.0/0` (allows Vercel serverless — required)
4. **Connect** → **Drivers** → Copy connection string:
   ```
   mongodb+srv://playbeat:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Append `/playbeat` before the `?` to specify the database:
   ```
   mongodb+srv://playbeat:<password>@cluster0.xxxx.mongodb.net/playbeat?retryWrites=true&w=majority
   ```
6. Paste as `MONGODB_URI` on the Vercel backend project.

---

## Environment Variable Checklist (Print This)

### Backend (`playbeat-api`)
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET` (64+ random chars — `openssl rand -hex 64`)
- [ ] `JWT_REFRESH_SECRET` (different from JWT_SECRET)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `JWT_REFRESH_EXPIRES_IN=30d`
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN=https://playbeat.digital`
- [ ] `FRONTEND_URL=https://playbeat.digital`
- [ ] `ADMIN_EMAIL=admin@playbeat.digital`
- [ ] `ADMIN_PASSWORD=<strong>`
- [ ] `BCRYPT_ROUNDS=12`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX=100`
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] `STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER=<email>`
- [ ] `SMTP_PASS=<app-password>`
- [ ] `EMAIL_FROM=noreply@playbeat.digital`

### Frontend (`playbeat-web`)
- [ ] `VITE_API_URL=https://api.playbeat.digital/api`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] `VITE_SITE_URL=https://playbeat.digital`

---

## Serverless Constraints to Know

| Limit | Hobby (Free) | Pro |
|-------|--------------|-----|
| Function timeout | 10s | 60s (default) / 300s (max fluid) |
| Memory | 1024 MB | 3008 MB |
| Cron jobs | 2 (daily only) | 40 (any schedule) |
| Bandwidth | 100 GB/mo | 1 TB/mo |
| Function invocations | 100K/mo | 1M/mo |

If your backend hits the 10s timeout (e.g. heavy report generation, large email batches), consider:
- Migrating those endpoints to a long-running host (Railway, Render, Fly.io)
- Splitting heavy work into background jobs via a queue (BullMQ + Redis)
- Using Vercel Cron for periodic batch processing

The backend already implements **Mongoose connection caching** to avoid reconnecting on every cold start, which is the standard serverless optimization.

---

## Troubleshooting

**Build fails with "Cannot find module"** → Make sure `Root Directory` is set to `frontend/` or `backend/` (not the repo root) when using Option A.

**CORS error in browser console** → `CORS_ORIGIN` on backend must EXACTLY match the frontend's protocol+domain (no trailing slash, no wildcard in production).

**`MONGODB_URI` error in logs** → Triple-check the connection string. Make sure the database name is included (`/playbeat?`). Make sure the password is URL-encoded if it contains special chars (`@`, `:`, `/`, etc.).

**Stripe webhook returns 400** → `STRIPE_WEBHOOK_SECRET` is wrong, OR the endpoint URL in Stripe dashboard doesn't match your backend URL exactly.

**404 on `/favicon.svg`** → Fixed in this repo; the favicon is now in `frontend/public/favicon.svg`.

**Frontend loads but API calls fail** → Check `VITE_API_URL` is set correctly. It must end with `/api` (no trailing slash). Open the deployed backend's `/api/health` in a browser to confirm it's reachable.

**Cold start is slow (1–3s)** → Normal for serverless. The first request after idle wakes the function. Subsequent requests within ~5 min are fast.

---

## Local Development

```bash
# From repo root
npm install              # installs workspace deps
cp .env.example .env     # then edit .env with your local values
npm run dev              # runs frontend (5173) + backend (5000) together
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000
