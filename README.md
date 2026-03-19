# Product name 
All-in-One HR & Payroll Management Platform

# What it does 
HR Management platforms like Gusto streamline payroll processing, benefits administration, and compliance for small to
medium businesses, reducing administrative overhead from hours to minutes.

# Which tool it is an alternative to
Gusto
# PulseHR

Production-ready HR and payroll workspace built with Next.js App Router, Supabase auth/database integration, starter demo content, and Vercel-friendly deployment defaults.

## Stack

- Next.js App Router with TypeScript
- Supabase SSR auth and Postgres-backed data tables
- Responsive custom CSS UI
- SQL schema and seed files for first-run population

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Add `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

If Supabase env vars are missing, the app still boots in demo mode with populated starter data.

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](/home/shubham/Desktop/hr-and-payroll-management-system/supabase/schema.sql).
3. Either run [`supabase/seed.sql`](/home/shubham/Desktop/hr-and-payroll-management-system/supabase/seed.sql) in the SQL editor or create an admin user and run `npm run seed:supabase`.
4. Open `/login` and create a user account if you have not already.

The schema includes:

- `profiles` linked to `auth.users`
- `employees`, `payroll_runs`, `leave_requests`, and `announcements`
- row-level security policies scoped to the authenticated user's organization, including org-scoped writes for authenticated admins
- an auth trigger that auto-creates a profile for newly registered users

## Seed runner

The repo now includes a runnable seed command that uses the same public Supabase URL/key as the app:

1. Create an admin account in `/login`.
2. Add `SUPABASE_SEED_EMAIL` and `SUPABASE_SEED_PASSWORD` to `.env.local`.
3. Run `npm run seed:supabase`.

The script signs in as that admin, resolves the admin's organization from `public.profiles`, and upserts the shared starter roster, payroll runs, leave requests, and announcements into that organization.

## Deployment

Deploy to Vercel with the same environment variables from `.env.local`. The project includes:

- production scripts in `package.json`
- `output: "standalone"` in Next config
- `vercel.json` with the Next.js framework setting

Run `npm run build` before deployment to verify the production build locally.
