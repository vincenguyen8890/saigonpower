# Saigon Power — giadienre.com

Vietnamese-first Texas electricity comparison platform for Houston & ERCOT market.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **i18n**: next-intl (Vietnamese default, English toggle)
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Fill in your Supabase credentials

# 3. Set up database
# Go to Supabase SQL Editor and run:
# supabase/schema.sql  (creates all tables)
# supabase/seed.sql    (inserts mock data)

# 4. Run development server
npm run dev
# → http://localhost:3000  (redirects to /vi)
```

## Project Structure

```
saigon-power/
├── app/
│   ├── [locale]/          # All localized pages
│   │   ├── page.tsx       # Homepage
│   │   ├── compare/       # Plan comparison
│   │   ├── residential/   # Residential page
│   │   ├── commercial/    # Commercial page
│   │   ├── about/
│   │   ├── faq/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── quote/         # Lead capture form
│   │   ├── thank-you/
│   │   └── dashboard/     # Customer portal
│   └── api/
│       ├── leads/         # CRM - lead creation
│       ├── quotes/        # Quote requests
│       └── plans/         # Plan listings
├── components/
│   ├── home/              # Homepage sections
│   ├── compare/           # Plan comparison UI
│   ├── layout/            # Header, Footer
│   └── ui/                # Button, Input, Card, Badge
├── data/
│   └── mock-plans.ts      # Mock plan & provider data
├── i18n/
│   ├── routing.ts         # Locale routing config
│   ├── navigation.ts      # Typed navigation
│   └── request.ts         # Server-side i18n
├── messages/
│   ├── vi.json            # Vietnamese translations
│   └── en.json            # English translations
├── lib/
│   ├── supabase/          # Client & server Supabase
│   └── utils.ts           # Helpers
├── types/
│   ├── plans.ts           # Plan/Provider types
│   └── database.ts        # Supabase DB types
└── supabase/
    ├── schema.sql         # Full database schema
    └── seed.sql           # Seed data
```

## Routes

| Path | Description |
|------|-------------|
| `/vi` or `/en` | Homepage |
| `/vi/so-sanh` | Compare plans |
| `/vi/dien-dan-cu` | Residential |
| `/vi/dien-thuong-mai` | Commercial |
| `/vi/ve-chung-toi` | About |
| `/vi/faq` | FAQ |
| `/vi/blog` | Blog |
| `/vi/lien-he` | Contact |
| `/vi/bao-gia` | Quote request |
| `/vi/cam-on` | Thank you |
| `/vi/bang-dieu-khien` | Dashboard |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/quotes` | Submit quote request |
| GET | `/api/quotes` | List quotes (admin) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads` | List leads |
| GET | `/api/plans` | Get plans with filters |

### Plans API Query Params

```
GET /api/plans?zip=77036&type=residential&provider=gexa&rateType=fixed&termMin=12&termMax=12&minRenewable=0&sortBy=lowestRate
```

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **anon key** to `.env.local`
3. Open SQL Editor → run `supabase/schema.sql`
4. Run `supabase/seed.sql` to populate mock data

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
```

## i18n Language Toggle

- Default: Vietnamese (`/vi`)
- Switch via header button (VI ↔ EN)
- Maintains current page on switch
- All content, metadata, and URLs are bilingual

## Renewal System

Contracts are tracked in `contracts` table. The `get_expiring_contracts(days)` SQL function returns all contracts expiring within N days. Dashboard shows real-time countdown with urgency alerts.

## Future Roadmap

- [ ] AI chatbot (Vietnamese-speaking)
- [ ] Automated renewal reminders (email/SMS)
- [ ] Usage-based recommendations
- [ ] Admin CMS panel
- [ ] Supabase Auth integration
- [ ] Plan API integration (PowerToChoose API)
- [ ] Google Analytics 4
- [ ] SMS via Twilio

## License

Private — Saigon Power LLC
