# PlayBeat Digital — URL Index

A complete, sorted map of every public URL across the three deployment areas.

> **Last verified:** 2026-07-31
> **Status:** All listed URLs return their expected HTTP status codes.

---

## Live Hosts At a Glance

| Area | Host | Platform | Purpose |
|------|------|----------|---------|
| Backend API (primary) | `https://dfgdfgdf-ripx.onrender.com` | Render | Long-running Express server, no function timeout |
| Backend API (secondary) | `https://playbeat-new-b-backend.vercel.app` | Vercel Serverless | Edge-deployed, 60s function timeout (Hobby = 10s) |
| Storefront | `https://dfgdfgdf-frontend.vercel.app` | Vercel Static (Vite) | Customer-facing React SPA |
| Admin Panel | `https://dfgdfgdf-frontend.vercel.app/admin/*` | Vercel Static (Vite) | Admin SPA (same bundle, gated by `AdminRoute`) |
| Database | `mongodb+srv://cluster0.75ddnhu.mongodb.net/playbeat` | MongoDB Atlas | Shared by both backends |

**Frontend currently calls:** `https://dfgdfgdf-ripx.onrender.com/api` (Render, set as `VITE_API_URL`).

---

## 1. Render Backend API

Base URL: `https://dfgdfgdf-ripx.onrender.com/api`

### 1.1 Public — No Auth Required

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Service health check (returns version, timestamp, environment) |
| `GET` | `/products` | List products (paginated, `?page=1&limit=12`) |
| `GET` | `/products/featured` | Featured products for homepage |
| `GET` | `/products/trending` | Trending products |
| `GET` | `/products/categories` | All product categories |
| `GET` | `/products/categories/:slug` | Single category by slug |
| `GET` | `/products/:slug` | Single product by slug |
| `POST` | `/products/:id/reviews` | Submit a product review (auth required) |
| `GET` | `/homepage` | Homepage section layout (drives storefront home page) |
| `GET` | `/settings` | Public site settings (name, logo, theme, contact info) |
| `POST` | `/auth/register` | Register a new customer account |
| `POST` | `/auth/login` | Login (returns JWT + refresh token) |
| `POST` | `/auth/refresh` | Refresh expired JWT |
| `POST` | `/auth/forgot-password` | Request password reset email |
| `PUT` | `/auth/reset-password/:token` | Reset password with token |

### 1.2 Customer — JWT Auth Required

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/auth/me` | Current user's profile |
| `PUT` | `/auth/profile` | Update profile |
| `PUT` | `/auth/password` | Change password |
| `POST` | `/auth/logout` | Logout (clears cookies) |
| `GET` | `/orders` | List current user's orders |
| `GET` | `/orders/:id` | Single order detail |
| `POST` | `/orders` | Create a new order (checkout) |
| `PUT` | `/orders/:id/cancel` | Cancel an order |
| `POST` | `/payments/create` | Create a Stripe payment intent |
| `GET` | `/payments/:id` | Payment status |
| `POST` | `/payments/webhook` | Stripe webhook receiver (signed) |
| `GET` | `/tickets` | List current user's support tickets |
| `GET` | `/tickets/:id` | Single ticket detail |
| `POST` | `/tickets` | Create a support ticket |
| `POST` | `/tickets/:id/reply` | Reply to a ticket |
| `PUT` | `/tickets/:id/close` | Close a ticket |
| `GET` | `/notifications` | List notifications |
| `PUT` | `/notifications/read-all` | Mark all as read |
| `PUT` | `/notifications/:id/read` | Mark one as read |
| `DELETE` | `/notifications/:id` | Delete a notification |
| `GET` | `/inventory/:productId` | Stock level for a product |

### 1.3 Admin — JWT Auth + `admin`/`super_admin`/`manager`/`support_agent` Role

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/admin/dashboard` | Dashboard KPIs (revenue, orders, customers) |
| `GET` | `/admin/analytics/sales` | Sales analytics (charts) |
| `GET` | `/admin/analytics/customers` | Customer analytics |
| `GET` | `/admin/customers` | List all customers |
| `GET` | `/admin/customers/:id` | Single customer detail |
| `GET` | `/orders/admin/all` | All orders (admin view) |
| `PUT` | `/orders/admin/:id/status` | Update order status |
| `POST` | `/products` | Create a product |
| `PUT` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |
| `POST` | `/products/categories` | Create a category |
| `PUT` | `/products/categories/:id` | Update a category |
| `DELETE` | `/products/categories/:id` | Delete a category |
| `POST` | `/inventory` | Add inventory record |
| `DELETE` | `/inventory/:id` | Delete inventory record |
| `GET` | `/inventory/admin/low-stock` | Low-stock report |
| `GET` | `/inventory/admin/export` | Export inventory CSV |
| `GET` | `/tickets/admin/all` | All support tickets |
| `POST` | `/tickets/admin/:id/reply` | Admin reply to ticket |
| `PUT` | `/tickets/admin/:id` | Update ticket status |
| `GET` | `/payments/admin/all` | All payments |
| `GET` | `/homepage/admin` | Homepage section list (admin) |
| `POST` | `/homepage/admin` | Create homepage section |
| `PUT` | `/homepage/admin/reorder` | Reorder homepage sections |
| `PUT` | `/homepage/admin/:id` | Update a section |
| `DELETE` | `/homepage/admin/:id` | Delete a section |
| `GET` | `/settings/admin` | All settings (admin) |
| `PUT` | `/settings/admin` | Update site settings |

---

## 2. Storefront (Customer-Facing Frontend)

Base URL: `https://dfgdfgdf-frontend.vercel.app`

### 2.1 Public Pages

| Path | Page Component | Purpose |
|------|----------------|---------|
| `/` | `HomePage` | Homepage (driven by `/api/homepage` sections) |
| `/products` | `ProductsPage` | Product listing with filters/search |
| `/products/:slug` | `ProductDetailPage` | Single product detail + reviews |
| `/categories/:slug` | `CategoryPage` | Products in a category |
| `/cart` | `CartPage` | Shopping cart (Zustand store) |
| `/login` | `LoginPage` | Customer login form |
| `/register` | `RegisterPage` | Customer registration form |

### 2.2 Protected Customer Pages (redirects to `/login` if not authenticated)

| Path | Page Component | Purpose |
|------|----------------|---------|
| `/checkout` | `CheckoutPage` | Stripe checkout flow |
| `/profile` | `ProfilePage` | Account profile editor |
| `/orders` | `OrdersPage` | Order history |
| `/orders/:id` | `OrderDetailPage` | Single order detail |
| `/tickets` | `TicketsPage` | Support ticket list + create |

### 2.3 Fallback

| Path | Page Component | Purpose |
|------|----------------|---------|
| `*` (anything unmatched) | `NotFoundPage` | 404 page |

---

## 3. Admin Panel

Base URL: `https://dfgdfgdf-frontend.vercel.app/admin`

All admin routes are wrapped in `<AdminRoute>` which redirects to `/login` if not authenticated, and shows a 403 if the user lacks an admin role.

| Path | Page Component | Purpose |
|------|----------------|---------|
| `/admin` | `Dashboard` | KPI dashboard (calls `/api/admin/dashboard`) |
| `/admin/products` | `Products` | Product CRUD (calls `/api/products`) |
| `/admin/orders` | `Orders` | Order management (calls `/api/orders/admin/all`) |
| `/admin/customers` | `Customers` | Customer list (calls `/api/admin/customers`) |
| `/admin/inventory` | `Inventory` | Stock management (calls `/api/inventory/admin/*`) |
| `/admin/tickets` | `Tickets` | Support inbox (calls `/api/tickets/admin/all`) |
| `/admin/settings` | `Settings` | Site settings editor (calls `/api/settings/admin`) |
| `/admin/homepage` | `HomepageBuilder` | Drag-and-drop homepage editor (calls `/api/homepage/admin`) |

---

## 4. Admin Login Credentials

The admin user is seeded into MongoDB Atlas. Login at:

> https://dfgdfgdf-frontend.vercel.app/login

```
Email:    admin@playbeat.digital
Password: ChangeMe123!
```

After login, you'll be redirected based on your role. Admin users land on `/admin` automatically. **Change this password immediately** via Profile → Change Password (it's currently in the chat history and needs rotating).

---

## 5. Quick Reference — Where to Point Each Thing

| If you want to… | Use this URL |
|------------------|--------------|
| Visit the storefront | https://dfgdfgdf-frontend.vercel.app |
| Login as admin | https://dfgdfgdf-frontend.vercel.app/login |
| Open the admin dashboard | https://dfgdfgdf-frontend.vercel.app/admin |
| Check API health (Render) | https://dfgdfgdf-ripx.onrender.com/api/health |
| Check API health (Vercel) | https://playbeat-new-b-backend.vercel.app/api/health |
| Test public product list | https://dfgdfgdf-ripx.onrender.com/api/products |
| Configure Stripe webhook | https://dfgdfgdf-ripx.onrender.com/api/payments/webhook |
| Frontend env var to set | `VITE_API_URL=https://dfgdfgdf-ripx.onrender.com/api` |
| Backend env var to set | `CORS_ORIGIN=https://dfgdfgdf-frontend.vercel.app` |

---

## 6. URL-to-API Mapping (for the curious)

| Frontend Page | Calls Backend Endpoint(s) |
|---------------|---------------------------|
| `/` (HomePage) | `GET /api/homepage`, `GET /api/products/featured`, `GET /api/products/trending` |
| `/products` | `GET /api/products?page=N&limit=12`, `GET /api/products/categories` |
| `/products/:slug` | `GET /api/products/:slug`, `POST /api/products/:id/reviews` |
| `/categories/:slug` | `GET /api/products/categories/:slug` |
| `/cart` | (local Zustand store, no API call until checkout) |
| `/login` | `POST /api/auth/login` |
| `/register` | `POST /api/auth/register` |
| `/checkout` | `POST /api/orders`, `POST /api/payments/create` |
| `/profile` | `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/password` |
| `/orders` | `GET /api/orders` |
| `/orders/:id` | `GET /api/orders/:id` |
| `/tickets` | `GET /api/tickets`, `POST /api/tickets`, `POST /api/tickets/:id/reply` |
| `/admin` | `GET /api/admin/dashboard`, `GET /api/admin/analytics/sales` |
| `/admin/products` | `GET/POST/PUT/DELETE /api/products` |
| `/admin/orders` | `GET /api/orders/admin/all`, `PUT /api/orders/admin/:id/status` |
| `/admin/customers` | `GET /api/admin/customers` |
| `/admin/inventory` | `GET /api/inventory/admin/low-stock`, `POST /api/inventory`, `GET /api/inventory/admin/export` |
| `/admin/tickets` | `GET /api/tickets/admin/all`, `POST /api/tickets/admin/:id/reply` |
| `/admin/settings` | `GET /api/settings/admin`, `PUT /api/settings/admin` |
| `/admin/homepage` | `GET /api/homepage/admin`, `POST /api/homepage/admin`, `PUT /api/homepage/admin/reorder`, `PUT/DELETE /api/homepage/admin/:id` |
