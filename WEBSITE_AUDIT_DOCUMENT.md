# Weed Madrid - Complete Website Audit Document
> Generated: 2025-12-30 | Updated: 2026-01-08  
> Purpose: Full website structure, content, and technical audit

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Website Architecture](#website-architecture)
3. [Route Structure](#route-structure)
4. [Database Schema](#database-schema)
5. [Content Inventory](#content-inventory)
6. [Components Structure](#components-structure)
7. [Edge Functions](#edge-functions)
8. [SEO Implementation](#seo-implementation)
9. [Internationalization](#internationalization)
10. [Technical Stack](#technical-stack)
11. [Key Features](#key-features)
12. [Security & RLS Policies](#security--rls-policies)
13. [Areas for Improvement](#areas-for-improvement)

---

## Executive Summary

**Website:** www.weedmadrid.com  
**Type:** Cannabis club directory and invitation platform for Madrid, Spain  
**Languages:** 5 (English, Spanish, German, French, Italian)  
**Total Clubs:** 24 verified cannabis social clubs  
**Total Articles:** 50+ guides across all languages  
**Total FAQs:** 50+ entries across all languages  

### Key Metrics
| Metric | Value |
|--------|-------|
| Public Pages | 20+ unique routes |
| Admin Pages | 4 routes |
| Languages Supported | 5 (en, es, de, fr, it) |
| Database Tables | 6 |
| Edge Functions | 12 |
| UI Components | 50+ |

---

## Website Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite)                     │
├─────────────────────────────────────────────────────────────────┤
│  Pages          │  Components       │  Contexts/Hooks           │
│  - Index        │  - Header         │  - LanguageContext        │
│  - Clubs        │  - Footer         │  - useLanguage            │
│  - ClubDetail   │  - ClubCard       │  - useAuth                │
│  - Guides       │  - SEOHead        │  - useAdminRole           │
│  - FAQ          │  - InvitationWiz  │  - useMobile              │
│  - Districts    │  - CartDrawer     │                           │
│  - Admin/*      │  - QuickFinder    │                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE BACKEND                           │
├─────────────────────────────────────────────────────────────────┤
│  Database       │  Edge Functions         │  Auth               │
│  - clubs        │  - submit-invitation    │  - Email/Password   │
│  - articles     │  - approve-invitation   │  - Role-based       │
│  - faq          │  - reject-invitation    │                     │
│  - invitations  │  - send-reminder        │                     │
│  - submissions  │  - mark-attendance      │                     │
│  - user_roles   │  - generate-sitemap     │                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Route Structure

### Public Routes (English - Default)

| Route | Page Component | Purpose | SEO Priority |
|-------|---------------|---------|--------------|
| `/` | Index | Homepage with featured clubs | High |
| `/clubs` | Clubs | Full club directory with filters | High |
| `/club/:slug` | ClubDetail | Individual club page | High |
| `/invite/:slug` | InvitationForm | Club invitation wizard | Medium |
| `/guides` | Guides | Article listing | High |
| `/guide/:slug` | GuideDetail | Individual article | High |
| `/faq` | FAQ | Frequently asked questions | High |
| `/contact` | Contact | Contact form | Medium |
| `/legal` | Legal | Privacy policy, terms | Low |
| `/how-it-works` | HowItWorks | Process explanation | High |
| `/safety` | Safety | Safety guidelines | Medium |
| `/safety/scams` | ScamWarning | Scam warning page | Medium |
| `/about` | About | About us page | Medium |
| `/districts` | Districts | District overview | Medium |
| `/district/:district` | District | Individual district | Medium |
| `/clubs/near-me` | ClubsNearMe | Location-based finder | High |
| `/clubs/:district` | ClubsDistrict | Clubs by district | High |
| `/knowledge` | Knowledge | Knowledge hub | Medium |
| `/shop` | Shop | Merchandise store | Low |
| `/auth` | Auth | Admin login | Internal |

### Language-Prefixed Routes
All public routes support language prefixes: `/:lang/...`
- `/es/clubs` - Spanish
- `/de/clubs` - German
- `/fr/clubs` - French
- `/it/clubs` - Italian

### Admin Routes (Protected)

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/admin` | AdminDashboard | Main admin dashboard |
| `/admin/invitations` | AdminInvitations | Manage invitation requests |
| `/admin/clubs` | AdminClubs | Manage club listings |
| `/admin/guides` | AdminGuides | Manage articles/guides |

### Internal/Utility Routes

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/seed-data` | SeedData | Database seeding utility |
| `/generate-articles` | GenerateArticles | AI article generation |
| `/bulk-generate` | BulkGenerate | Bulk content generation |
| `/translate-content` | TranslateContent | Content translation tool |

---

## Database Schema

### Table: `clubs`
Primary entity for cannabis club listings.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | No | Primary key |
| slug | text | No | URL-friendly identifier |
| name | text | No | Club display name |
| short_name | text | Yes | Abbreviated name |
| description | text | No | Full description |
| summary | text | Yes | Short summary |
| district | text | No | Madrid district |
| address | text | No | Physical address |
| city | text | No | Default: "Madrid" |
| postal_code | text | Yes | Postal code |
| country | text | No | Default: "ES" |
| latitude | numeric | Yes | GPS latitude |
| longitude | numeric | Yes | GPS longitude |
| website_url | text | Yes | Website |
| instagram_url | text | Yes | Instagram profile |
| whatsapp_number | text | Yes | WhatsApp contact |
| email | text | Yes | Email contact |
| languages | text[] | Yes | Default: ['es', 'en'] |
| timetable | jsonb | Yes | Opening hours |
| rating_editorial | numeric | Yes | Editorial rating |
| rating_safety | numeric | Yes | Safety rating |
| rating_ambience | numeric | Yes | Ambience rating |
| rating_location | numeric | Yes | Location rating |
| is_tourist_friendly | boolean | Yes | Tourist friendly flag |
| is_verified | boolean | Yes | Verification status |
| is_featured | boolean | Yes | Featured listing |
| status | text | No | Default: "active" |
| main_image_url | text | Yes | Primary image |
| gallery_image_urls | text[] | Yes | Gallery images |
| seo_title | text | Yes | SEO meta title |
| seo_description | text | Yes | SEO meta description |
| google_place_id | text | Yes | Google Maps ID |
| created_at | timestamptz | No | Creation timestamp |
| updated_at | timestamptz | No | Last update |

### Table: `articles`
Content management for guides and blog posts.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | No | Primary key |
| slug | text | No | URL identifier |
| title | text | No | Article title |
| subtitle | text | Yes | Article subtitle |
| excerpt | text | Yes | Short excerpt |
| body_markdown | text | No | Full content (Markdown) |
| language | text | No | Language code |
| category | text | No | Article category |
| tags | text[] | Yes | Article tags |
| author_name | text | No | Author name |
| author_bio | text | Yes | Author biography |
| cover_image_url | text | Yes | Cover image |
| status | text | No | draft/published |
| is_featured | boolean | Yes | Featured flag |
| published_at | timestamptz | Yes | Publication date |
| seo_title | text | Yes | SEO title |
| seo_description | text | Yes | SEO description |
| canonical_url | text | Yes | Canonical URL |
| created_at | timestamptz | No | Creation date |
| updated_at | timestamptz | No | Last update |

### Table: `faq`
Frequently asked questions with categories.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | No | Primary key |
| slug | text | No | URL identifier |
| question | text | No | Question text |
| answer_markdown | text | No | Answer (Markdown) |
| category | text | Yes | FAQ category |
| language | text | No | Language code |
| priority | integer | Yes | Display order |
| created_at | timestamptz | No | Creation date |
| updated_at | timestamptz | No | Last update |

### Table: `invitation_requests`
Club invitation/membership requests.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | No | Primary key |
| club_slug | text | No | Target club |
| email | text | No | Requester email |
| phone | text | No | Phone number |
| visitor_names | text[] | No | Visitor names |
| visitor_count | integer | No | Number of visitors |
| visit_date | date | No | Planned visit date |
| notes | text | Yes | Additional notes |
| language | text | No | Preferred language |
| status | text | Yes | pending/approved/rejected/sent |
| invitation_code | text | Yes | Generated code |
| qr_code_url | text | Yes | QR code image |
| expires_at | timestamptz | Yes | Expiration date |
| email_sent_at | timestamptz | Yes | Email sent timestamp |
| attended | boolean | Yes | Attendance status |
| attendance_marked_at | timestamptz | Yes | Attendance timestamp |
| actual_attendee_count | integer | Yes | Actual attendees |
| rejection_reason | text | Yes | Rejection reason |
| ip_address | inet | Yes | Requester IP |
| user_agent | text | Yes | Browser agent |
| legal_age_confirmed | boolean | No | Age confirmation |
| legal_knowledge_confirmed | boolean | No | Legal acknowledgment |
| gdpr_consent | boolean | No | GDPR consent |
| created_at | timestamptz | Yes | Creation date |
| updated_at | timestamptz | Yes | Last update |

### Table: `submissions`
Contact form and club submissions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | No | Primary key |
| type | text | No | Submission type |
| name | text | No | Submitter name |
| email | text | No | Submitter email |
| message | text | No | Message content |
| club_name | text | Yes | Club name (if applicable) |
| club_id | bigint | Yes | Related club ID |
| status | text | No | pending/reviewed |
| created_at | timestamptz | No | Creation date |
| updated_at | timestamptz | No | Last update |

### Table: `user_roles`
Admin role management.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | Primary key |
| user_id | uuid | No | Auth user reference |
| role | app_role | No | Role enum (admin) |
| created_at | timestamptz | Yes | Creation date |

### Table: `invitation_audit_log`
Audit trail for invitation actions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | bigint | No | Primary key |
| request_id | bigint | Yes | Related request |
| action | text | No | Action type |
| admin_id | uuid | Yes | Admin user |
| admin_email | text | Yes | Admin email |
| ip_address | inet | Yes | IP address |
| metadata | jsonb | Yes | Additional data |
| timestamp | timestamptz | Yes | Action timestamp |

---

## Content Inventory

### Clubs (24 Total)

| Club Name | District | Status | Featured | Tourist Friendly | Verified |
|-----------|----------|--------|----------|------------------|----------|
| Barrio del Pilar Social Club | Centro | Active | ✅ | ✅ | ✅ |
| Bunny Social Club | Arganzuela | Active | ✅ | ✅ | ✅ |
| Cannabis Store Amsterdam Madrid | Centro | Active | ✅ | ✅ | ✅ |
| Chamberí Green House | Chamberí | Active | ✅ | ✅ | ✅ |
| Diamond Smokers Club | Centro | Active | ✅ | ✅ | ✅ |
| Salamanca Social Club | Salamanca | Active | ✅ | ✅ | ✅ |
| Vallehermoso Club Social | Chamberí | Active | ✅ | ✅ | ✅ |
| Arganzuela Green Space | Arganzuela | Active | ❌ | ✅ | ✅ |
| Atocha Leaf Society | Atocha | Active | ❌ | ✅ | ✅ |
| Chamartín Premium Club | Chamartín | Active | ❌ | ✅ | ✅ |
| Chamberí Wellness Association | Chamberí | Active | ❌ | ✅ | ✅ |
| Genetics Social Club | Chamberí | Active | ❌ | ✅ | ✅ |
| Gran Vía Green Circle | Centro | Active | ❌ | ✅ | ✅ |
| Lavapiés Cannabis Association | Centro | Active | ❌ | ✅ | ✅ |
| Lúdico Cannabis Club | Chamberí | Active | ❌ | ✅ | ✅ |
| Lunga Social Club | Chamberí | Active | ❌ | ✅ | ✅ |
| Madrid Relax Social Club | Centro | Active | ❌ | ✅ | ✅ |
| Malasaña Private Club | Malasaña | Active | ❌ | ✅ | ✅ |
| Meltz Club Social | Fuencarral-El Pardo | Active | ❌ | ✅ | ✅ |
| Mística Cannabis Club | Tetuán | Active | ❌ | ✅ | ✅ |
| Moncloa Cannabis Club | Moncloa-Aravaca | Active | ❌ | ✅ | ✅ |
| Norte Verde Association | Tetuán | Active | ❌ | ❌ | ✅ |
| Retiro Botánico Club | Retiro | Active | ❌ | ❌ | ✅ |
| Usera International Cannabis Club | Usera | Active | ❌ | ✅ | ✅ |

### Districts Covered
- Centro (6 clubs)
- Chamberí (6 clubs)
- Arganzuela (2 clubs)
- Tetuán (2 clubs)
- Salamanca (1 club)
- Retiro (1 club)
- Malasaña (1 club)
- Atocha (1 club)
- Chamartín (1 club)
- Moncloa-Aravaca (1 club)
- Fuencarral-El Pardo (1 club)
- Usera (1 club)

### Articles by Language

| Language | Count | Categories |
|----------|-------|------------|
| English (en) | 8 | Guide, Legal |
| Spanish (es) | 8 | Guide, Legal |
| German (de) | 8 | Guide, Legal |
| French (fr) | 8 | Guide, Legal |
| Italian (it) | 8 | Guide, Legal |

### Article Topics (Core)
1. Best Cannabis Clubs Madrid 2025
2. Cannabis Laws Spain 2025
3. Complete Guide to Cannabis Clubs
4. How to Join Cannabis Club Madrid
5. Cannabis Tourism Madrid Guide
6. Cannabis Club for Tourists 2025
7. Cannabis Club Near Me - District Guide
8. Best Weed Clubs Madrid Top 10

### FAQ Categories
- **basics** - What is a cannabis club, how they differ from dispensaries
- **membership** - Requirements, fees, tourist access
- **law** - Legal status, public consumption, penalties
- **safety** - Club safety, what to do if unwell
- **medical** - Medical cannabis, medication interactions

---

## Components Structure

### Core Components

```
src/components/
├── admin/
│   ├── ClubFormDialog.tsx      # Club CRUD form
│   └── GuideFormDialog.tsx     # Article CRUD form
├── invitation/
│   ├── InvitationWizard.tsx    # Main wizard container
│   ├── StepIndicator.tsx       # Progress indicator
│   ├── SuccessCelebration.tsx  # Completion animation
│   └── steps/
│       ├── Step1DateSelection.tsx
│       ├── Step2VisitorInfo.tsx
│       ├── Step3ContactInfo.tsx
│       ├── Step4LegalConfirmation.tsx
│       └── Step5Review.tsx
├── ui/                         # Shadcn UI components (50+)
├── Analytics.tsx               # Google Analytics + Microsoft Clarity
├── CartDrawer.tsx              # Shopping cart
├── ClubCard.tsx                # Club listing card
├── FiveStepProcess.tsx         # How it works section
├── Footer.tsx                  # Site footer
├── Header.tsx                  # Site header + nav
├── LanguageSelect.tsx          # Language switcher
├── LazyImage.tsx               # Lazy-loaded images
├── NavLink.tsx                 # Navigation link
├── OrganizationSchema.tsx      # JSON-LD schema
├── QuickAnswerBox.tsx          # GEO quick answer
├── QuickClubFinder.tsx         # District-based finder
├── ScrollToTop.tsx             # Scroll restoration
└── SEOHead.tsx                 # Meta tags manager
```

### Shadcn UI Components Used
- Accordion, Alert, AlertDialog
- Avatar, Badge, Breadcrumb
- Button, Calendar, Card
- Carousel, Checkbox, Collapsible
- Command, Dialog, Drawer
- Dropdown Menu, Form, Hover Card
- Input, Label, Navigation Menu
- Popover, Progress, Radio Group
- Scroll Area, Select, Separator
- Sheet, Skeleton, Slider
- Switch, Table, Tabs
- Textarea, Toast, Toggle
- Tooltip

---

## Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `submit-invitation-request` | Process new invitation requests | HTTP POST |
| `approve-invitation` | Approve and send invitation email | HTTP POST |
| `reject-invitation` | Reject invitation with reason | HTTP POST |
| `send-reminder` | Send reminder to no-shows | HTTP POST |
| `mark-attendance` | Track invitation attendance | HTTP POST |
| `get-invitation-metrics` | Dashboard statistics | HTTP GET |
| `generate-guide-content` | AI article generation | HTTP POST |
| `bulk-content-generation` | Bulk article creation | HTTP POST |
| `translate-content` | Multi-language translation | HTTP POST |
| `generate-sitemap` | Dynamic XML sitemap | HTTP GET |
| `generate-rss` | RSS feed generation | HTTP GET |
| `seed-data` | Database seeding | HTTP POST |

---

## SEO Implementation

### Technical SEO

| Feature | Status | Implementation |
|---------|--------|----------------|
| Meta Tags | ✅ | SEOHead component |
| Canonical URLs | ✅ | Dynamic generation |
| Hreflang Tags | ✅ | 5 languages x 19 variants |
| Open Graph | ✅ | Dynamic per page |
| Twitter Cards | ✅ | Dynamic per page |
| robots.txt | ✅ | Configured |
| XML Sitemap | ✅ | Dynamic generation |
| Breadcrumbs | ✅ | Schema.org markup |

### Structured Data (JSON-LD)

| Schema Type | Usage |
|-------------|-------|
| Organization | Site-wide |
| LocalBusiness | Club pages |
| FAQPage | FAQ page |
| Article/BlogPosting | Guide pages |
| BreadcrumbList | All pages |
| ItemList | Club directory |
| Place | District pages |
| WebPage | All pages |
| Speakable | Knowledge hub |

### GEO (Generative Engine Optimization)
- Quick Answer Boxes on homepage
- Declarative content structure
- FAQ schema for AI extraction
- Citation-friendly formatting
- Consistent entity naming

### Target Keywords

**Primary:**
- cannabis club madrid
- weed club madrid
- cannabis social club spain

**Secondary:**
- how to join cannabis club madrid
- cannabis clubs near me madrid
- best cannabis clubs madrid 2025
- cannabis tourism madrid

**Long-tail:**
- can tourists join cannabis clubs spain
- cannabis club membership fee madrid
- cannabis clubs near puerta del sol

---

## Internationalization

### Supported Languages

| Code | Language | Status |
|------|----------|--------|
| en | English | ✅ Primary |
| es | Spanish | ✅ Full |
| de | German | ✅ Full |
| fr | French | ✅ Full |
| it | Italian | ✅ Full |

### Translation Coverage

| Content Type | en | es | de | fr | it |
|--------------|----|----|----|----|---- |
| UI Strings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Articles | ✅ | ✅ | ✅ | ✅ | ✅ |
| FAQs | ✅ | ✅ | 🔄 | 🔄 | ✅ |
| Club Data | ✅ | ✅ | ✅ | ✅ | ✅ |

### URL Structure
- Default: `/clubs`, `/guides`, `/faq`
- Localized: `/es/clubs`, `/de/clubs`, `/fr/clubs`, `/it/clubs`

---

## Technical Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | Latest | Build tool |
| TypeScript | Latest | Type safety |
| Tailwind CSS | Latest | Styling |
| React Router | 6.30.1 | Routing |
| TanStack Query | 5.83.0 | Data fetching |
| Zustand | 5.0.9 | State management |

### UI Libraries
| Library | Purpose |
|---------|---------|
| Radix UI | Headless components |
| Lucide Icons | Icon set |
| Shadcn UI | Component library |
| Framer Motion | Animations (via components) |

### Backend
| Technology | Purpose |
|------------|---------|
| Supabase | Database, Auth, Edge Functions |
| PostgreSQL | Database |
| Deno | Edge Functions runtime |

### Integrations
| Service | Purpose |
|---------|---------|
| Google Analytics 4 | Web Analytics |
| Microsoft Clarity | Session Recording & Heatmaps |
| Shopify Storefront | E-commerce (Shop) |

---

## Key Features

### 1. Club Directory
- Filterable by district, tourist-friendly
- Real-time open/closed status
- Editorial ratings
- Verified badge system

### 2. Invitation System
- 5-step wizard flow
- Date selection with calendar
- Multi-visitor support
- Legal confirmations
- QR code generation
- Email notifications

### 3. Admin Dashboard
- Invitation management
- Approval/rejection workflow
- Attendance tracking
- Reminder sending
- Club CRUD
- Article CRUD

### 4. Content Management
- Markdown support
- AI content generation
- Multi-language translation
- SEO fields per article

### 5. Shop Integration
- Shopify Storefront API
- Cart functionality
- Product display

---

## Security & RLS Policies

### Row-Level Security Summary

| Table | Public Read | Auth Insert | Admin Full |
|-------|-------------|-------------|------------|
| clubs | Active only | ❌ | ✅ |
| articles | Published only | ❌ | ✅ |
| faq | ✅ All | ❌ | ❌ |
| invitation_requests | ❌ | ✅ | ✅ |
| submissions | ❌ | ✅ | ❌ |
| user_roles | Own only | ❌ | ✅ |
| invitation_audit_log | ❌ | Admin only | Admin only |

### Authentication
- Email/Password via Supabase Auth
- Role-based access control (admin role)
- Protected admin routes

---

## Areas for Improvement

### High Priority
1. **Missing German/French FAQs** - Translation incomplete
2. **Shop checkout** - Currently only cart, no checkout flow
3. **Admin mobile experience** - Dashboard not optimized for mobile
4. **Image optimization** - Some images missing WebP versions
5. **Error boundaries** - Missing React error boundaries

### Medium Priority
6. **Club search** - Add full-text search with Supabase
7. **User reviews** - Member review system
8. **Push notifications** - Invitation status updates
9. **Analytics dashboard** - Admin analytics view
10. **A/B testing** - CTA optimization

### Low Priority
11. **PWA support** - Offline capability
12. **Newsletter** - Email subscription
13. **Events calendar** - Club events
14. **Interactive map** - Mapbox/Google Maps integration
15. **Social sharing** - Enhanced share functionality

### SEO Improvements
16. **Internal linking** - Automated related content
17. **Schema enhancements** - Review schema, Event schema
18. **Core Web Vitals** - LCP optimization
19. **Image alt texts** - Audit for missing/generic alts
20. **Link equity** - Backlink monitoring

### Technical Debt
21. **Component splitting** - Some pages are large
22. **Test coverage** - No unit/integration tests
23. **Storybook** - Component documentation
24. **CI/CD** - Automated testing pipeline
25. **Logging** - Structured error logging

---

## File References

### Key Configuration Files
- `tailwind.config.ts` - Tailwind configuration
- `src/index.css` - Global styles and design tokens
- `supabase/config.toml` - Supabase configuration
- `vercel.json` - Deployment configuration
- `public/robots.txt` - SEO robots file
- `public/sitemap.xml` - Static sitemap

### Documentation Files
- `README.md` - Project readme
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `SEO_STRATEGY.md` - SEO documentation
- `MULTILINGUAL_IMPLEMENTATION.md` - i18n guide
- `SEO_IMPLEMENTATION_STATUS.md` - SEO checklist

---

## Appendix: Translation Keys

The UI supports 2976+ lines of translations across 5 languages covering:
- Navigation
- Homepage content
- Club listings
- FAQ content
- Legal pages
- Form labels
- Error messages
- Success messages
- Admin interface

See `src/lib/translations.ts` for complete translation dictionary.

---

*Document generated for website audit purposes. Last updated: 2026-01-08*
