# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page for MIMI Alfajores (Argentine premium alfajores) targeting potential distributors. Includes a lead capture form, an internal CRM, and analytics/conversion tracking.

- **Live URL**: https://www.mimialfajor.com.ar
- **Deployed on**: Railway (Nixpacks builder, PostgreSQL add-on)

## Commands

```bash
# Development
npm install --legacy-peer-deps   # Required flag for peer dep conflicts
npm run dev                       # Start dev server

# Build & Production
npm run build
npm run start
npm run lint

# Prisma / Database
npx prisma generate               # Regenerate Prisma client after schema changes
npx prisma db push                # Apply schema changes to DB (no migrations)
npx prisma studio                 # GUI for browsing the database

# Scripts
ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npm run seed:admin   # Create initial admin user
npm run optimize                  # Conversion audit
```

> **Note**: Always use `--legacy-peer-deps` when installing packages.
> **Deployment**: Railway uses `start.sh` (runs `prisma db push` then `next start`). Config in `railway.json`.

## Environment Variables

Copy `env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `RESEND_API_KEY` | Yes | Email sending via Resend |
| `EMAIL_FROM` | Yes | Sender address |
| `EMAIL_TO` | Yes | Comma-separated recipient list |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Yes | Google Ads account ID (hardcoded fallback: `AW-16869254273`) |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Yes | Conversion label |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Google Analytics 4 ID (`G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional | Meta Pixel ID |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional | Search Console verification |
| `NEXT_PUBLIC_HOTJAR_ID` | Optional | Hotjar tracking |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | WhatsApp number (default: `5491173639684`) |

## Architecture

### App Structure

```
app/
  layout.tsx                  # Root layout: GA4, Google Ads, Meta Pixel scripts, fonts
  page.tsx                    # Main landing page (single large client component)
  gracias/page.tsx            # Thank-you page after form submission
  politicas-privacidad/       # Privacy policy
  crm/
    page.tsx                  # CRM dashboard (Kanban board, ADMIN + VENDEDOR)
    login/page.tsx            # CRM login
  api/
    contact/route.ts          # POST: create lead + email; GET: list leads (ADMIN only)
    crm/route.ts              # CRM lead management (PATCH stage, notes, value)
    auth/login/route.ts       # Session-based auth
    auth/logout/route.ts
    auth/me/route.ts
    users/route.ts            # User management (ADMIN only)
    setup-db/route.ts         # DB seeding (create initial admin)
    update-db/route.ts        # Schema migration helpers
    test/route.ts             # Health check
```

### Key Libraries

```
lib/
  prisma.ts           # Singleton PrismaClient
  auth.ts             # Session management (bcryptjs + randomBytes, 7-day TTL)
  auth-constants.ts   # SESSION_COOKIE_NAME = 'crm_session'
  email-template.ts   # HTML email template for new leads
  conversion-config.ts
hooks/
  use-google-ads.ts   # trackLeadSubmission(), trackFormInteraction(), etc.
components/
  KanbanColumn.tsx    # CRM Kanban column (uses dnd-kit)
  LeadCard.tsx        # Lead card in Kanban
  MobileCRM.tsx       # Mobile-specific CRM view
  CreateLeadModal.tsx # Manual lead creation
  CreateSellerModal.tsx
  OptimizedLogo.tsx
  ui/                 # Shadcn/UI components (do not edit manually)
types/
  lead.ts             # Lead & LeadsPorEtapa interfaces
  auth.ts
```

### Database Models (Prisma + PostgreSQL)

- **`ContactForm`** (`contact_forms` table): Lead data captured from the landing form. Fields include `etapa` (original form stage), `etapaCrm` (CRM pipeline stage: `entrante → primer-llamado → seguimiento → ganado/perdido`), `esBajoVolumen` (cantidad = `menos-24`), `assignedToId`, `notas`, `valor`.
- **`CrmUser`**: Internal CRM users with `CrmRole` enum (`ADMIN` | `VENDEDOR`). Passwords hashed with bcrypt (cost 12).
- **`CrmSession`**: HTTP-only cookie sessions stored in DB.

### Lead Assignment Logic

On each new form submission (`POST /api/contact`), leads are automatically assigned to the `VENDEDOR` with the fewest leads in the last 30 days (round-robin by count). Low-volume leads (`menos-24` docenas) are flagged as `esBajoVolumen = true`.

### Auth Flow

- Cookie name: `crm_session` (httpOnly, secure in production, SameSite=lax)
- `requireAuth(request, [CrmRole.ADMIN])` used in API routes for authorization
- The CRM UI at `/crm` is accessible to both `ADMIN` and `VENDEDOR` roles

### Analytics & Tracking

Analytics scripts are injected in `app/layout.tsx`. The `useGoogleAds` hook exposes tracking functions consumed from `app/page.tsx`:
- `trackLeadSubmission(formData)` — fires GA4 `generate_lead` + Google Ads conversion + Meta Pixel `Lead`
- `trackFormInteraction(field, action)` — fires on field focus
- Lead value is estimated in ARS based on `cantidad` and `etapa`

### Shadcn/UI Configuration

`components.json` configures Shadcn. UI components live in `components/ui/` and should not be modified manually — use the Shadcn CLI to add/update components.

### No Tests

There is no test suite. `npm run lint` (ESLint) is the only automated check. The `precommit` script runs `lint` + `optimize`.
