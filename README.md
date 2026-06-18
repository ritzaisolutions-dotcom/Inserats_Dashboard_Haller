# Haller Dashboard

Internes Verwaltungssystem für die Haller Immobilienberatung GmbH.

## Setup

```bash
npm install
cp .env.local.example .env.local   # or edit .env.local
```

Set in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_N8N_BASE` (default: https://n8n.ritz-ai.solutions)

Run migration: `supabase/migrations/001_dashboard_schema.sql` in Supabase SQL Editor.

Demo HITL-Leads (Freigabe-Warteschlange): `supabase/seed_demo_hitl_leads.sql` — 4 Test-Bewerber unter `/notifications`.

Create a staff user in Supabase Auth (Email + Password).

## Dev

```bash
npm run dev   # http://localhost:3001
```

## Routes

| Route | Beschreibung |
|-------|--------------|
| `/login` | Mitarbeiter-Login |
| `/inserate` | Inserate + Besichtigungsslots |
| `/termine` | Terminübersicht |
| `/notifications` | HITL Bewerbungsprüfung |
