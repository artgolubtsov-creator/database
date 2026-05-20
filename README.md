# Yango Play — Content Hub

Internal CMS for managing content titles, brand materials, and subscription offers for the Yango Play streaming platform.

**Production:** https://www.yangoplay.pro

---

## Features

### Content
- **Dashboard** — full catalogue of titles with search, filters (type, country, genre, date), pagination, and material status indicators
- **Entry cards** — per-title detail page with metadata, Arabic copy, material statuses (poster, trailer, teaser, episodes), and asset links
- **Public share links** — read-only link per title for external teams, no login required
- **Sync Figma & Source** — one-click sync of `figmaLink` and `sourceLink` from a Google Sheet (Graphics tab) matched by `mena_id → titleId`

### Offers
- **Offers page** — subscription offers filtered by country, platform, kind, and date range; Future / Current / Old views
- **Offer kinds** — Main product / Performance / Test product classification
- **Import from Sheet** — parse any tab from the offers Google Sheet, preview country rows with EN + AR button text and disclaimers, then bulk-import as offer records
- **Admin CRUD** — create, edit, delete individual offer records

### Brand Materials
- Library of guides, logos, presentations, and active offer documents

### Admin
- **Users** — create accounts, set roles, activate/deactivate
- **Collapsible sections** — each admin section collapses and remembers its state in `localStorage`

### Other
- **Instructions page** — step-by-step guide for importing offers from Google Sheets (visible to ADMIN and OFFER_MANAGER)
- **Role-based access** — five roles with granular permissions

---

## Roles

| Role | Content | Offers | Users |
|---|---|---|---|
| `ADMIN` | ✓ | ✓ | ✓ |
| `SUPER_EDITOR` | ✓ | ✓ | — |
| `CONTENT_EDITOR` | ✓ | — | — |
| `OFFER_MANAGER` | — | ✓ | — |
| `VIEWER` | read-only | read-only | — |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | NextAuth v5 (credentials + JWT) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Validation | Zod v4 |
| Google Integration | googleapis + xlsx |
| Deployment | Vercel |

---

## Local Development

```bash
npm install
cp .env.example .env   # fill in values

npx prisma generate
npx prisma migrate deploy

npm run dev
```

App runs at http://localhost:3000.

---

## Environment Variables

```env
# PostgreSQL — pooled connection (runtime)
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1

# PostgreSQL — direct connection (migrations only)
DIRECT_URL=postgresql://...

# NextAuth
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# Seed
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=

# Google Service Account (for Sheet parsers)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Offers Google Sheet ID
GOOGLE_SHEET_ID=
```

> **Note:** Migrations require a direct Supabase connection (port 5432). Run `npx prisma migrate deploy` locally — never from the Vercel build pipeline, as port 5432 is blocked there.

---

## Database Migrations

```bash
# Create migration during development
npx prisma migrate dev --name description

# Apply to production (run locally, not in CI)
npx prisma migrate deploy

# Open Prisma Studio
npm run db:studio
```

---

## Google Sheets Integration

Two parsers are built in:

### 1. Import from Sheet (Offers)
Reads any tab from the offers spreadsheet (`GOOGLE_SHEET_ID`). Expected tab structure:

| Row | Content |
|---|---|
| 1 | `"" · "Date from:" · value` |
| 2 | `"" · "Date to:" · value` |
| 4 | Platform description |
| 5 | Header: `"" · "" · "Eng" · "Arabic"` |
| 6+ | `"Button text" · Country · EN · AR` then `"Text under the button" · "" · EN · AR` |

Access via **Admin → Offers → Import from Sheet**.

### 2. Sync Figma & Source (Entries)
Reads the `Graphics` tab of the content management spreadsheet. Matches `mena_id` (col F) to `titleId` in DB, updates `figmaLink` (col R) and `sourceLink` (col U).

Access via **Admin → Entries → Sync Figma & Source**.

Both parsers use a Google service account with `drive.readonly` / `spreadsheets.readonly` scope.

---

## Project Structure

```
app/
  dashboard/          # Content catalogue
  entries/[id]/       # Entry detail page
  share/[token]/      # Public share (no auth)
  brand-materials/    # Brand asset library
  offers/             # Subscription offers view
  instructions/       # Usage guide for offer managers
  admin/
    entries/          # Entry CRUD
    offers/           # Offer CRUD
    users/            # User management
    brand-materials/  # Brand material CRUD
    sheet-import/     # Offer sheet import UI
    figma-sync/       # Figma & Source sync UI
  api/
    offers/           # Offer CRUD endpoints
    admin/
      sheet-import/   # Sheet parse + bulk create offers
      figma-sync/     # Figma/Source sync from Graphics sheet

components/           # Shared UI (Button, Badge, Select, Navbar, …)
lib/
  offers/             # Types, adapters, sheet parser
  entries/            # Figma sync logic
  roles.ts            # Role permission helpers
prisma/
  schema.prisma
  migrations/
  seed.ts
```

---

## Deployment

Deploy manually via Vercel CLI:

```bash
vercel deploy --prod
```

All environment variables are managed in the Vercel project dashboard under the **Production** environment.
