# Yango Play Content Hub — Codex Handoff

> **Workflow:** Codex implements tasks below → opens PR → Claude reviews and merges to `main` → Vercel auto-deploys to production.

**Repo:** `github.com:artgolubtsov-creator/database.git`  
**Production:** `yango-play-content-hub.vercel.app`  
**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma + Supabase · NextAuth.js · Vercel

---

## Codex implementation update for Claude

**Branch:** `feat/codex-handoff-tasks`  
**Latest commit:** `3bf2272 feat: align content hub IA`  
**PR URL:** <https://github.com/artgolubtsov-creator/database/pull/new/feat/codex-handoff-tasks>

Codex implemented Tasks 1-4 from this handoff and added one follow-up IA cleanup pass after product review.

### What changed

- **Task 1 — External portal auth prototype**
  - Added `/portal/login`.
  - Added `lib/portal-mock-auth.ts` with mock email/code access and `allowedTokens`.
  - Added `portal_session` cookie check in `app/portal/[token]/layout.tsx`.
  - Missing sessions redirect to `/portal/login?redirect=/portal/<token>`.

- **Task 2 — Yango Taxi brand**
  - Added `yango-taxi` to `BrandSlug`.
  - Added Yango Taxi config in `lib/brands.ts`.
  - Added 9 mock assets, 2 external collections, and guidelines in `lib/mock-data.ts`.

- **Task 3 — Partner portal share button**
  - Collection detail now copies a partner portal link for `EXTERNAL` collections.
  - Button label changed to `Copy partner link`.
  - Link is built from `NEXT_PUBLIC_APP_URL` when available, otherwise current origin.
  - Added brand-boundary guard so a collection cannot be opened under another brand URL.

- **Task 4 — Admin users**
  - Added `DeactivateUserToggle` client component in the users table.
  - Added `PUT /api/admin/users/[id]` while keeping existing `PATCH`.
  - Existing role selector and role badges remain wired to `lib/roles.ts`.

- **IA cleanup after team review**
  - Sidebar now follows the new sitemap direction: `Content`, `Titles`, `Brands`, `All brands`, `Admin`.
  - Microcopy changed from `External/Internal` to `Partner portal/Team only`.
  - Removed non-functional `Upload` and `New Collection` buttons from Brand Hub UI.
  - `RoleSwitcher` is hidden in production and labeled as demo preview in development.
  - Added empty states for assets, collections, brand overview, and partner portal.
  - Removed fake asset comments and fake version authors from asset detail.
  - Partner portal footer now reads as Partner Portal, not internal `update` branding.
  - Removed existing production `console.log`.
  - Made Figma cron route fail closed when `CRON_SECRET` is missing.

### Verification

- `npx tsc --noEmit` passes with zero errors.
- `rg "console\\.log" app components lib types` returns no matches.
- No new dependencies added.
- Changes are already pushed to `origin/feat/codex-handoff-tasks`.

### Claude next steps

1. Open the PR from `feat/codex-handoff-tasks` to `main`.
2. Review the diff, especially:
   - portal mock auth boundaries,
   - `CRON_SECRET` fail-closed behavior,
   - Brand Hub IA copy changes,
   - admin user toggle behavior.
3. If clean, merge to `main`.
4. Confirm Vercel production deploy completes for `yango-play-content-hub.vercel.app`.

### Important caveats

- The external portal auth is still a **prototype**, not production-grade partner auth.
- Current Brand Hub data still comes from `lib/mock-data.ts`; it has not been migrated to Prisma.
- Do not treat current portal tokens like `ext-yp-brand` as secure production grants.
- Before real partner usage, add real opaque tokens/sessions, expiry, revoke, audit logging, and server-side RBAC.
- Before large-scale manual asset operations, decide whether Brand Hub remains controlled static data or moves to Prisma tables.

---

## Architecture overview

```
app/
  dashboard/        ← Database of all entries (Prisma, real data)
  offers/           ← Offer management (Prisma, Gantt view)
  crm-maker/        ← CRM copy generation tool
  brands/[brand]/   ← Brand hub (mock data — assets, collections, guidelines)
    assets/         ← Asset library with filters
    collections/    ← Collections with INTERNAL/EXTERNAL access
    guidelines/     ← Brand colors, fonts, logo variants
  portal/[token]/   ← External partner portal (no auth, token = access)
  admin/            ← Admin panel (entries, users, offers, figma-sync, sheet-import)
  login/            ← NextAuth login page

components/
  Shell.tsx         ← Layout wrapper: sidebar + RoleSwitcher for internal pages
  AppSidebar.tsx    ← Left nav, role-filtered
  RoleSwitcher.tsx  ← Demo role picker (bottom-right overlay, dev only)

lib/
  demo-role-context.tsx  ← DemoRole state (localStorage) + permission helpers
  mock-data.ts           ← All brand/asset/collection data (no DB for brands)
  brands.ts              ← Brand config: slug, name, accent color
  roles.ts               ← Real DB roles (separate from DemoRole)
```

### Key conventions

- **Demo roles** are client-only, stored in `localStorage`, not real auth. They gate UI elements only — no server-side enforcement yet.
- **Brand section is 100% mock data** — no DB. `lib/mock-data.ts` + `lib/brands.ts`.
- **Dashboard/Offers/Admin are real DB** — Prisma + Supabase.
- **Public routes** bypass Shell: `/login`, `/portal/*` — defined in `Shell.tsx:12`.
- Server components fetch data; client components get it as props and handle interactivity.
- TypeScript strict. Run `npx tsc --noEmit` before committing. All clear on `main`.

### Demo roles and their access

| Role | Database | Offers | CRM Maker | Brands | Write actions |
|---|---|---|---|---|---|
| Админ | ✅ | ✅ | ✅ | ✅ | Upload, Approve, Create collection, Share, Manage users |
| Супер Едитор | ✅ | ✅ | ✅ | ✅ | Upload, Approve, Create collection, Share |
| Редактор | ✅ | ❌ | ❌ | ❌ | None |
| Маркетинг | ✅ | ✅ | ✅ | ✅ (read) | None |

Permission helpers live in `lib/demo-role-context.tsx`: `canUpload`, `canApprove`, `canCreateCollection`, `canSharePortal`, `canAccessOffers`, `canAccessBrands`, `canManageUsers`.

---

## Local setup

```bash
npm install
# Create .env.local — ask the owner for values:
# DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
# FIGMA_TOKEN, GOOGLE_SHEETS_CREDENTIALS, etc.
npm run dev   # http://localhost:3000
```

**Supabase note:** free tier suspends after inactivity — visit dashboard.supabase.com and click "Continue project" if the app returns a DB error.

---

## Pending tasks

### Task 1 — External portal: real auth page

**Context:** `/portal/[token]` shows a brand collection to external contractors (agencies, partners). Currently access = knowledge of the token URL. We need a lightweight auth gate — no NextAuth, just a PIN or email+OTP.

**What to build:**
- `/portal/login` — standalone page (no sidebar, no RoleSwitcher). A simple form: email field + access code field. No real auth library needed — this is a prototype.
- Store a hardcoded or mock list of valid `{ email, code, allowedTokens[] }` in `lib/portal-mock-auth.ts`.
- On submit: verify email+code → set a cookie `portal_session = token` (or use sessionStorage) → redirect to `/portal/[token]`.
- `/portal/[token]/layout.tsx` — check for valid session. If missing, redirect to `/portal/login?redirect=/portal/[token]`.
- The layout already exists at `app/portal/[token]/layout.tsx` — add the session check there.
- Style: minimal, on-brand. Use the brand accent color from `getBrand()` if the token is known. Otherwise neutral.

**Files to create/modify:**
- Create: `app/portal/login/page.tsx`
- Create: `lib/portal-mock-auth.ts`
- Modify: `app/portal/[token]/layout.tsx`

**Do not** use NextAuth or any auth library. This is a demo prototype — cookie + client-side check is fine.

---

### Task 2 — Add a fifth brand: Yango Taxi

**Context:** The brands section currently has 4 brands. Add a fifth.

**Spec:**
```ts
{
  slug: 'yango-taxi',
  name: 'Yango Taxi',
  accent: '#F5A623',
  accentForeground: '#000000',
  description: 'Ride-hailing service across MENA and Africa',
  emoji: '🚗',
}
```

**Files to modify:**
- `types/mock.ts` — add `'yango-taxi'` to `BrandSlug` union.
- `lib/brands.ts` — add the brand config above to `BRANDS` array.
- `lib/mock-data.ts` — add 8–10 mock assets with `brandSlug: 'yango-taxi'` and 2 collections. Follow the existing format exactly. Use realistic names (logos, banners, campaign materials). Add corresponding entries to `MOCK_COLLECTIONS` and `BRAND_GUIDELINES`.

**No DB changes needed** — brands are 100% mock data.

---

### Task 3 — Share Portal button in Collection detail

**Context:** Internal users with `canSharePortal` permission (Админ, Супер Едитор) should be able to "share" an EXTERNAL collection by copying a portal link.

**What exists:** `components/CopyLinkButton.tsx` — already built, copies text to clipboard.  
`app/brands/[brand]/collections/[id]/ShareButton.tsx` — exists but may not be wired up.  
`app/brands/[brand]/collections/[id]/page.tsx` — collection detail page.

**What to do:**
1. In the collection detail page (`app/brands/[brand]/collections/[id]/page.tsx`), check if `collection.access === "EXTERNAL"`.
2. If yes and the current user has `canSharePortal` permission — show a "Share Portal Link" button that copies `https://yango-play-content-hub.vercel.app/portal/[collection.token]` to clipboard.
3. Use `CopyLinkButton` component or the existing `ShareButton` — whichever is more appropriate after reading them.
4. The button should only appear for EXTERNAL collections. INTERNAL collections have no portal link.

**Permission check:** This page is a server component. The share button itself is a client component (needs clipboard access). Pass `collection.token` and `collection.access` as props. Gate with `canSharePortal` — import from `lib/demo-role-context.tsx`.

---

### Task 4 — Admin: User management page improvements

**Context:** `/admin/users` exists but is basic. The `canManageUsers` gate is already in place.

**What to improve:**
1. The users list should show: name, email, role, status (active/inactive), created date.
2. Add a role badge next to each user using `components/ui/Badge.tsx`.
3. The "New User" form at `/admin/users/new` should have a role selector with all real DB roles from `lib/roles.ts`.
4. Add a simple "Deactivate" toggle per user row (client component, calls existing `PUT /api/admin/users/[id]`).

Read `app/admin/users/page.tsx`, `app/admin/users/new/page.tsx`, and `app/api/admin/users/route.ts` first to understand the current state.

---

## Release process

After Codex submits a PR:
1. Claude reviews the diff for correctness and TypeScript errors.
2. If clean — merges to `main`.
3. Vercel auto-deploys. Production URL: `yango-play-content-hub.vercel.app`.

**PR checklist (Codex must verify before opening PR):**
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No `console.log` left in production code
- [ ] No new dependencies added without explicit instruction
- [ ] PR title format: `feat: <what>` / `fix: <what>` / `chore: <what>`
- [ ] PR description: what changed + which task number from this doc
