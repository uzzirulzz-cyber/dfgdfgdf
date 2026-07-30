# Vercel Deployment Guide

## Architecture

Deploy as **two separate Vercel projects**:

1. **Frontend Project**: React app (playbeat.digital)
2. **Backend Project**: Node.js API (api.playbeat.digital)

---

## Project 1: Frontend Deployment

### Step 1: Create Project
```bash
cd frontend
vercel
```

### Step 2: Environment Variables (Vercel Dashboard)

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.playbeat.digital/api` | Production |
| `VITE_API_URL` | `https://api-staging.playbeat.digital/api` | Preview |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Preview |

### Step 3: Build Settings
- Framework Preset: **Vite**
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/dist`
- Install Command: `npm install && cd frontend && npm install`

### Step 4: Domain
Add custom domain: `playbeat.digital`

---

## Project 2: Backend Deployment

### Step 1: Create Project
```bash
vercel --local-config=vercel-backend.json
```

### Step 2: Environment Variables (CRITICAL)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ YES |
| `JWT_SECRET` | Random 64+ character string | ✅ YES |
| `JWT_REFRESH_SECRET` | Different random string | ✅ YES |
| `JWT_EXPIRES_IN` | `7d` | ✅ YES |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | ✅ YES |
| `NODE_ENV` | `production` | ✅ YES |
| `CORS_ORIGIN` | `https://playbeat.digital` | ✅ YES |
| `FRONTEND_URL` | `https://playbeat.digital` | ✅ YES |
| `ADMIN_EMAIL` | `admin@playbeat.digital` | ✅ YES |
| `ADMIN_PASSWORD` | Strong password | ✅ YES |
| `STRIPE_SECRET_KEY` | `sk_live_...` | For payments |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | For webhooks |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | For frontend |
| `SMTP_HOST` | Email provider host | For emails |
| `SMTP_PORT` | `587` | For emails |
| `SMTP_USER` | Email username | For emails |
| `SMTP_PASS` | Email app password | For emails |
| `EMAIL_FROM` | `noreply@playbeat.digital` | For emails |
| `BCRYPT_ROUNDS` | `12` | Password hashing |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | API rate limit |
| `RATE_LIMIT_MAX` | `100` | Requests per window |

### Step 3: MongoDB Atlas Setup

1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user (NOT your Atlas login)
3. Whitelist IP: `0.0.0.0/0` (for Vercel serverless)
4. Get connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/playbeat?retryWrites=true&w=majority
```

### Step 4: Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.playbeat.digital/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Step 5: Seed Admin
```bash
vercel env pull .env
npm run seed:admin
```

---

## Environment-Specific Configs

### Production
```
NODE_ENV=production
CORS_ORIGIN=https://playbeat.digital
FRONTEND_URL=https://playbeat.digital
VITE_API_URL=https://api.playbeat.digital/api
```

### Preview/Staging
```
NODE_ENV=production
CORS_ORIGIN=https://staging.playbeat.digital
FRONTEND_URL=https://staging.playbeat.digital
VITE_API_URL=https://api-staging.playbeat.digital/api
```

### Local Development
```
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

---

## Important Notes

### Serverless Constraints
- Vercel Functions have **10s timeout** (Hobby) / **60s** (Pro)
- **No persistent filesystem** — use MongoDB for storage
- **Cold starts** — keep connections cached (already implemented)
- **Memory limit** — 1024MB (Hobby) / 3008MB (Pro)

### For Heavy Workloads
If you need background jobs, webhooks, or long-running processes:
- Use **Vercel Cron Jobs** for scheduled tasks
- Use **Stripe webhooks** for async payment processing
- Consider **Railway** or **Render** for the backend if Vercel limits are hit

### Security Checklist
- [ ] JWT secrets are 64+ random characters
- [ ] Admin password is strong (changed after first login)
- [ ] MongoDB IP whitelist is restricted if possible
- [ ] Stripe webhook secret is set
- [ ] CORS origin is exact match (no wildcards)
- [ ] Rate limiting is enabled
- [ ] HTTPS only (Vercel handles this)
