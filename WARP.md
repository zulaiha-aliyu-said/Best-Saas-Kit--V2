# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Stack: Next.js 15 (App Router) + TypeScript + Tailwind v4 + ShadCN UI
- Backend: Next.js route handlers under src/app/api, PostgreSQL (Neon) via pg
- Auth: NextAuth (Google OAuth)
- Billing: Stripe (one-time Pro plan) with webhook handling
- AI: OpenRouter API for chat completions
- Email: Resend for transactional emails

Common commands
- Install dependencies
  ```bash path=null start=null
  npm install
  ```
- Start development server (Turbopack)
  ```bash path=null start=null
  npm run dev
  ```
- Build for production
  ```bash path=null start=null
  npm run build
  ```
- Start production server (after build)
  ```bash path=null start=null
  npm run start
  ```
- Lint
  ```bash path=null start=null
  npm run lint
  ```
- Database setup (Neon PostgreSQL)
  - See sql-queries/README.md for ordered SQL execution. From psql interactive session, run each file in order:
    ```bash path=null start=null
    psql "<your-neon-connection-string>"
    \i sql-queries/01-create-users-table.sql
    \i sql-queries/02-create-indexes.sql
    \i sql-queries/03-create-functions.sql
    \i sql-queries/04-insert-sample-data.sql  # optional for dev
    ```

Testing
- No test runner is currently configured in package.json. Running a single test is not applicable until a test framework (e.g., Vitest/Jest/RTL) is added.

Environment and configuration
Minimum to boot core flows locally:
- NEXTAUTH_URL (e.g., http://localhost:3000)
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- DATABASE_URL (Neon connection string; SSL required in prod)
- OPENROUTER_API_KEY
- NEXT_PUBLIC_SITE_URL (used in Stripe checkout callbacks and email templates)
- Optional for additional features:
  - STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET (billing)
  - OPENROUTER_MODEL (defaults to qwen/qwen3-235b-a22b-2507 if unset)
  - RESEND_API_KEY, FROM_EMAIL, SUPPORT_EMAIL, NEXT_PUBLIC_SITE_NAME (emails)

High-level architecture
- App routing (Next.js App Router)
  - src/app contains the UI routes, including admin/, dashboard/, auth/, etc.
  - API endpoints live under src/app/api/* and are implemented as route handlers.

- Authentication
  - NextAuth configuration in src/lib/auth.ts wires Google provider and exposes auth(), signIn(), signOut().
  - Session shape is extended in src/types/next-auth.d.ts to include accessToken and user.id.
  - Middleware (src/middleware.ts) protects key paths (/dashboard, /api/chat, /api/usage, /api/test-ai), redirecting unauthenticated users to /auth/signin.

- Admin access model
  - src/lib/admin-config.ts declares ADMIN_EMAILS and a simple permission model (all admins currently have all permissions).
  - src/lib/admin-auth.ts provides helpers to enforce admin access in server components and API (e.g., requireAdminAccess, checkAdminAccess).

- Data access layer (PostgreSQL via pg)
  - src/lib/database.ts exports a Pool and a set of focused functions grouped by domain:
    - Users: upsertUser, getUserByGoogleId/Email/Id, delete operations, recent activity, stats, growth metrics.
    - Credits: getUserCredits, deductCredits (transactional), addCredits, setUserCredits, credit analytics.
    - Discounts: CRUD (createDiscountCode, getAllDiscountCodes, getDiscountCodeById/Code, update/delete), validation via DB function validate_discount_code, usage increment, and stats/analytics queries.
    - Subscriptions: updateUserSubscription, getUserByStripeCustomerId, subscription stats, hasActiveSubscription.
    - Analytics: users/revenue/credits aggregates for admin dashboards.

- AI chat flow
  - Client library: src/lib/openrouter.ts encapsulates OpenRouter REST calls with helpers for standard and streaming completions, defaulting model from OPENROUTER_MODEL.
  - Usage tracking: src/lib/usage-tracking.ts provides in-memory daily counters and limit checks (not persisted; replace with DB in production).
  - API route: src/app/api/chat/route.ts enforces auth, checks credits and usage limits, deducts 1 credit per message, invokes OpenRouter, tracks tokens, and returns assistant message + updated credits.

- Billing and discount flow
  - Stripe client: src/lib/stripe.ts defines STRIPE_CONFIG (Pro plan), checkout session creators (with/without discount), coupon creation/deletion, and webhook signature verification.
  - Checkout route: src/app/api/stripe/checkout/route.ts authenticates user, ensures Stripe customer exists (creates and stores stripe_customer_id if needed), validates an optional discount code (via DB), and creates a checkout session with appropriate success/cancel URLs derived from NEXT_PUBLIC_SITE_URL.
  - Webhook route: src/app/api/stripe/webhook/route.ts verifies signature, handles checkout.session.completed by upgrading the user to Pro (updateUserSubscription), granting bonus credits, recording discount usage via incrementDiscountUsage for applied coupons, and sending a subscription confirmation email.

- Emails
  - src/lib/resend.ts initializes Resend and exposes sendEmail plus HTML templates for welcome and subscription confirmation. Templates reference NEXT_PUBLIC_SITE_URL and support addresses.

- Discount system
  - DB schema and functions are defined in sql-queries/*. The runtime code expects a validate_discount_code() function and related stats helpers to exist.
  - Admin UI and endpoints enable creating codes that synchronize to Stripe coupons and are enforced at checkout.
  - User validation endpoint: src/app/api/discounts/validate/route.ts checks auth and validates codes server-side.

Where to look next
- README.md: Quick start, features, environment variables, and discount system overview.
- docs/DISCOUNT_SYSTEM.md: Deep dive into discount code lifecycle and admin/user flows.
- sql-queries/README.md: Exact DB setup order and Neon-specific notes.

Other tooling and rules
- No CLAUDE.md, Cursor rules, or Copilot instructions were detected.
- ESLint is enabled via next lint; Tailwind v4 is configured through @tailwindcss/postcss and globals.css.

Notes for future agents
- Many admin and analytics views rely on database functions and admin gating; ensure DATABASE_URL and admin emails are configured.
- Usage tracking for AI is in-memory; behavior resets on server restart.
- Tests are not yet configured; add a test runner before assuming test commands exist.
