# update — Brand Content Hub: Design Spec

**Date:** 2026-07-06  
**Status:** Approved  
**Scope:** Frontend prototype with static mock data, built on top of existing `/Users/artgolubtsov/yango-play-content-hub`

---

## Overview

Evolve the existing Yango Play Content Hub into a multi-brand DAM (Digital Asset Manager) called **update**. Serves two audiences: internal team (full access) and external contractors (portal-only). Prototype uses static mock data — no backend changes.

---

## Navigation & Shell

Replace the existing top navbar with a **fixed left sidebar (~220px)**:

```
[Brand Logo + Name]
─────────────────
Overview
Assets
Collections
Guidelines
─────────────────
Admin (role-gated)
─────────────────
[Role badge]
[User name]
[Sign out]
```

Top-level entry point is a **brand selector** at `/` — 4 cards:
- Yango Play
- Yasmina
- Yango Music
- Yango Plus

Selecting a brand enters its scoped space. The sidebar updates to show the selected brand's name and accent color.

**Demo role switcher:** floating pill (bottom-right corner) with 4 options — Admin / Internal Editor / Internal Viewer / External Agency. Instantly changes visible nav items and UI affordances.

---

## Routes

| Route | Description |
|---|---|
| `/` | Brand selector homepage |
| `/brands/[brand]` | Brand overview: stats, recent assets, collections |
| `/brands/[brand]/assets` | Asset grid with filters |
| `/brands/[brand]/assets/[id]` | Asset detail: preview, metadata, versions, download |
| `/brands/[brand]/collections` | Collections list |
| `/brands/[brand]/collections/[id]` | Collection detail with asset grid |
| `/brands/[brand]/guidelines` | Brand guidelines: colors, type, logos |
| `/portal/[token]` | External portal — separate layout |
| `/admin` | Existing admin, unchanged |

Existing `/dashboard`, `/offers`, `/brand-materials` routes stay intact during prototype — no migration yet.

---

## Pages

### `/` — Brand Selector
4 large cards in a 2×2 grid. Each card shows: brand logo/wordmark, brand color, asset count (static), last updated date. Click → `/brands/[brand]`.

### `/brands/[brand]` — Brand Overview
- Stats row: total assets, collections, last upload
- Recent assets grid (6 cards, static)
- Collections row (3 cards, static)
- Quick links: Guidelines, Upload (role-gated)

### `/brands/[brand]/assets` — Asset Grid
- Filter bar: Format (Image / Video / PDF / Template), Status (All / Approved / Review / Draft / Archived), Campaign (dropdown)
- Masonry or 3-col grid of asset cards
- Each card: thumbnail, name, format badge, status badge, date
- Click → asset detail

### `/brands/[brand]/assets/[id]` — Asset Detail
- Large preview (image/video/PDF placeholder)
- Right panel: name, tags, status badge, format, dimensions, file size
- Versions list (static: v1, v2, v3)
- Download button (Admin/Internal only — disabled for External in wrong context)
- Comments section (static)
- Tracker link (if present)

### `/brands/[brand]/collections` — Collections
- Grid of collection cards: cover image (first asset), name, asset count, access type (Internal / External)
- Create button (Brand Manager role only)

### `/brands/[brand]/collections/[id]` — Collection Detail
- Header: collection name, description, access badge
- Asset grid (same as /assets but filtered)
- Share button → generates `/portal/[token]` link (static)

### `/brands/[brand]/guidelines` — Brand Guidelines
- Color swatches with hex values
- Typography specimens
- Logo downloads (SVG / PNG / Dark / Light variants)
- Usage dos/don'ts

### `/portal/[token]` — External Portal
**Completely separate layout** — no sidebar, no auth nav.
- Top: brand logo centered, portal title
- Asset grid (Approved only, static)
- Each card: thumbnail, name, download button
- Footer: "Powered by update" + contact email
- No access to other brands, no admin, no internal data visible

---

## Role-Based UI

| Element | Admin | Brand Manager | Internal Editor | Internal Viewer | External |
|---|---|---|---|---|---|
| All brands | ✓ | ✓ | ✓ | ✓ | ✗ |
| Upload assets | ✓ | ✓ | ✓ | ✗ | ✗ |
| Approve assets | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create collections | ✓ | ✓ | ✗ | ✗ | ✗ |
| Share portal link | ✓ | ✓ | ✗ | ✗ | ✗ |
| Download assets | ✓ | ✓ | ✓ | ✓ | ✓ (Approved only) |
| Admin section | ✓ | ✗ | ✗ | ✗ | ✗ |
| Guidelines | ✓ | ✓ | ✓ | ✓ | ✓ (if in portal) |

---

## Design System

Base: existing Inter font, neutral palette, `card-shadow` utility — kept as-is.

**Brand accent colors** (used in sidebar header, active states, badges):

| Brand | Accent | Usage |
|---|---|---|
| Yango Play | `#1A1A1A` | Dark sidebar header |
| Yasmina | `#C4956A` | Warm gold accents |
| Yango Music | `#6C3FC5` | Purple accents |
| Yango Plus | `#E53935` | Red accents |

**New tokens to add:**
- `--color-accent` — current brand accent (CSS var, set per brand)
- Status badge colors: Approved=green, Review=amber, Draft=neutral, Archived=neutral-400

**Asset card:**
- Thumbnail area: fixed aspect ratio (4:3), bg-neutral-100, centered icon if no image
- Below: name (1 line truncate), format badge (xs), status badge, date

**External portal:**
- Pure white background
- Brand logo top-center
- No sidebar
- Max-width 1100px centered
- Large download buttons on cards

---

## Static Mock Data

### Assets (per brand, ~12 per brand)
```ts
type MockAsset = {
  id: string
  name: string
  format: "IMAGE" | "VIDEO" | "PDF" | "TEMPLATE"
  status: "APPROVED" | "REVIEW" | "DRAFT" | "ARCHIVED"
  campaign?: string
  tags: string[]
  versions: number
  updatedAt: string
  size: string
  dimensions?: string
}
```

### Collections (per brand, ~3)
```ts
type MockCollection = {
  id: string
  name: string
  description: string
  access: "INTERNAL" | "EXTERNAL"
  assetIds: string[]
  createdAt: string
}
```

### Guidelines (per brand)
- 5 brand colors with names + hex
- 2 typefaces with specimen text
- 4 logo variants (SVG placeholders)

---

## Files to Create / Modify

**New:**
- `app/brands/[brand]/page.tsx` — brand overview
- `app/brands/[brand]/assets/page.tsx` — asset grid
- `app/brands/[brand]/assets/[id]/page.tsx` — asset detail
- `app/brands/[brand]/collections/page.tsx`
- `app/brands/[brand]/collections/[id]/page.tsx`
- `app/brands/[brand]/guidelines/page.tsx`
- `app/portal/[token]/page.tsx` + `app/portal/[token]/layout.tsx`
- `app/page.tsx` — new brand selector (replace existing redirect)
- `components/Sidebar.tsx` — new left sidebar
- `components/AssetCard.tsx`
- `components/CollectionCard.tsx`
- `components/RoleSwitcher.tsx` — floating demo switcher
- `lib/mock-data.ts` — all static data

**Modify:**
- `app/layout.tsx` — remove full-width constraint, support sidebar layout
- `app/globals.css` — add brand accent tokens

**Keep unchanged:**
- `/dashboard`, `/offers`, `/brand-materials`, `/admin` — existing pages intact
- All auth logic, Prisma, API routes

---

## Auth Handling (prototype)

Real NextAuth login stays intact. For the demo, the role switcher overrides the displayed role in the UI — it does **not** change the session. This means: all brand pages still require login, but once logged in any user can toggle between role views via the floating switcher. This is sufficient for an internal team demo.

---

## Out of Scope (prototype)

- File upload (no Supabase Storage)
- Real download (links are static)
- Real collections sharing
- Backend role changes
- Tracker sync
- AI auto-tagging
