# Yango Play — Content Hub

Internal CMS for managing content titles, brand materials, and subscription offers for the Yango Play streaming platform.

**Production:** https://yangoplay.pro

---

## Features

- **Dashboard** — full catalogue of content titles with sorting by year, material statuses, and quick links
- **Entry cards** — per-title pages with metadata, Arabic copy, material statuses (poster, trailer, teaser, episodes), and asset links
- **Public share links** — generate a read-only link per title to share with external teams without login
- **Brand materials** — library of guides, logos, presentations, and active offers
- **Offers** — subscription offers table grouped by tariff (Basic / Premium / Crunchyroll) and country × platform matrix, with future / current / old views
- **Admin panel** — user management (create, activate/deactivate, change roles)
- **Role-based access** — `ADMIN`, `EDITOR`, `VIEWER`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | NextAuth v5 (credentials + JWT) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Validation | Zod v4 |
| Deployment | Vercel |

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start dev server
npm run dev
```

App runs at http://localhost:3000.

---

## Environment Variables

```env
# PostgreSQL connection via pgbouncer (pooled, for runtime queries)
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1

# Direct connection (for migrations)
DIRECT_URL=postgresql://...

# NextAuth
AUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

---

## Creating Users

Users are created via a script (there is no registration UI):

```bash
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();
db.user.create({
  data: {
    email: 'user@example.com',
    name: 'Name',
    passwordHash: bcrypt.hashSync('password', 10),
    role: 'EDITOR', // ADMIN | EDITOR | VIEWER
  }
}).then(u => console.log('Created:', u.email)).finally(() => db.$disconnect());
"
```

Or use the ready-made script:

```bash
npx ts-node prisma/create-user.ts
```

---

## Database Migrations

```bash
# Create and apply a new migration
npx prisma migrate dev --name description

# Apply existing migrations (production / CI)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

---

## Data Import

To bulk-update `figmaLink` / `sourceLink` from a CSV export:

```bash
npx ts-node prisma/update-from-sheets.ts /path/to/file.csv
```

CSV format expected: `mena_id`, `figma_link`, `source_link` columns.

---

## Offers Page

Offers are currently powered by mock data in `lib/offers/mock-data.ts`. Adapters in `lib/offers/adapters.ts` are stubbed with `TODO` comments marking where to plug in real API calls:

- **Future offers** → Google Sheets API
- **Current / Old offers** → DataLens API

Each offer supports EN and AR button copy fields (`buttonTextEn`, `buttonTextAr`, `disclaimerEn`, `disclaimerAr`).

---

## Project Structure

```
app/
  dashboard/        # Content catalogue
  entries/[id]/     # Entry detail page
  share/[token]/    # Public read-only share page (no auth)
  brand-materials/  # Brand asset library
  offers/           # Subscription offers
  admin/            # User management + entry editing
  api/              # REST API routes

components/         # Shared UI components
lib/
  offers/           # Offer types, mock data, adapters
prisma/
  schema.prisma     # DB schema
  migrations/       # SQL migrations
  *.ts              # Utility scripts (import, seed, create-user)
```

---

## Deployment

Pushes to `main` deploy automatically via Vercel. Environment variables are set in the Vercel project dashboard.
