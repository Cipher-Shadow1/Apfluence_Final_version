# Apfluence

> **AI-powered Influencer Marketing Platform**  
> Final Year Project (Projet de Fin d'Études) — [University Name] [Year]

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication System](#5-authentication-system)
6. [Complete Brand Workflow](#6-complete-brand-workflow)
   - 6.1 [Brand Registration & Sign In](#61-brand-registration--sign-in)
   - 6.2 [Influencer Discovery](#62-influencer-discovery)
   - 6.3 [Building Lists](#63-building-lists)
   - 6.4 [Selected Influencers View](#64-selected-influencers-view)
   - 6.5 [Creating a Campaign](#65-creating-a-campaign)
   - 6.6 [Campaign Management](#66-campaign-management)
   - 6.7 [Adding Influencers to a Campaign](#67-adding-influencers-to-a-campaign)
   - 6.8 [Bulk Email Outreach](#68-bulk-email-outreach)
   - 6.9 [Email Template System](#69-email-template-system)
   - 6.10 [Gmail SMTP Configuration](#610-gmail-smtp-configuration)
   - 6.11 [The Influencer Experience - Receiving the Email](#611-the-influencer-experience---receiving-the-email)
   - 6.12 [The Application Form](#612-the-application-form)
7. [Influencer Dashboard](#7-influencer-dashboard)
8. [Project Structure](#8-project-structure)
9. [Getting Started](#9-getting-started)
10. [Environment Variables](#10-environment-variables)
11. [API Reference](#11-api-reference)

---

## 1. Project Overview

Apfluence is a comprehensive **B2B SaaS influencer marketing platform** designed to automate and streamline the entire brand-creator partnership lifecycle - from initial creator discovery to campaign execution and performance tracking.

### The Problem

Traditional influencer marketing is fragmented and manual:

- Brands discover creators across multiple platforms with no unified tool
- Outreach is done via personal email with no tracking or automation
- Contract and compensation management is handled through spreadsheets
- There is no structured workflow to move from "interested in this creator" to "campaign live and tracked"

### The Solution

Apfluence provides a unified platform where:

| Phase            | What Apfluence Does                                                        |
| ---------------- | -------------------------------------------------------------------------- |
| **Discovery**    | Search and filter influencers by niche, platform, engagement, location     |
| **Organization** | Save influencers into named lists for campaign targeting                   |
| **Campaigns**    | Create structured campaigns with compensation, products, contracts         |
| **Outreach**     | Send personalized bulk emails with unique application links per influencer |
| **Application**  | Influencers respond via a branded form - accept, decline, or counter-offer |
| **Management**   | Brand tracks all responses and manages active collaborations               |

### Two User Types

**Brands** - Marketing managers and agencies who:

- Discover and vet creators
- Create and manage campaigns
- Send outreach and track responses

**Influencers/Creators** - Content creators who:

- Receive campaign offers via email
- Review offers and apply through a public form
- Manage their active collaborations through the platform

---

## 2. Tech Stack

| Layer               | Technology                 | Purpose                                                |
| ------------------- | -------------------------- | ------------------------------------------------------ |
| **Framework**       | Next.js (App Router)       | Full-stack React framework with SSR and route handlers |
| **Language**        | TypeScript                 | End-to-end type safety                                 |
| **Styling**         | Tailwind CSS 4             | Utility-first CSS framework                            |
| **Animation**       | Framer Motion              | UI transitions and micro-interactions                  |
| **Database**        | PostgreSQL (Supabase)      | Relational database with Row Level Security            |
| **Auth**            | Custom + Identity Provider | Role-based authentication for brands and influencers   |
| **Email**           | Nodemailer + Gmail SMTP    | Outreach email delivery via brand's own Gmail          |
| **Storage**         | Supabase Storage           | PDF contract uploads from influencers                  |
| **Components**      | Shadcn/UI + Lucide         | Headless UI primitives and icon system                 |
| **Package Manager** | pnpm                       | Fast, disk-efficient dependency management             |

---

## 3. System Architecture

### High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        APFLUENCE PLATFORM                      │
├────────────────────┬────────────────────┬───────────────────────┤
│   BRAND DASHBOARD  │  INFLUENCER PORTAL │   PUBLIC APPLY PAGE   │
│   /brand/*         │  /influencer/*     │   /apply/[token]      │
│   (Authenticated)  │  (Authenticated)   │   (No auth required)  │
├────────────────────┴────────────────────┴───────────────────────┤
│                        NEXT.JS APP ROUTER                      │
│                    API Routes + Server Actions                 │
├──────────────────────────────┬──────────────────────────────────┤
│         SUPABASE             │         EXTERNAL SERVICES        │
│  • PostgreSQL Database       │  • Gmail SMTP (brand's account)  │
│  • Row Level Security        │  • Supabase Storage (contracts)  │
│  • Realtime (future)         │  • Identity Provider (auth)      │
└──────────────────────────────┴──────────────────────────────────┘
```

### Request Flow

```text
User Browser
     │
     ▼
Next.js Edge Middleware ──── Auth Check ──── Redirect if not authenticated
     │
     ▼
App Router (RSC + Client Components)
     │
     ├── Server Components → Supabase Server Client
     └── Client Components → Supabase Browser Client (enforces RLS)
```

### Role-Based Access Control

| Route Pattern              | Access                      |
| -------------------------- | --------------------------- |
| `/brand/*`                 | Brand users only            |
| `/influencer/*`            | Influencer users only       |
| `/apply/[token]`           | Public - token-based access |
| `/sign-in/*`, `/sign-up/*` | Unauthenticated users       |

---

## 4. Database Schema

The database consists of core tables organized into functional groups.

### 4.1 User & Identity Tables

| Table           | Purpose                                                           |
| --------------- | ----------------------------------------------------------------- |
| `brands`        | Brand company profiles, SMTP config, commercial settings          |
| `influencers`   | Creator profiles, metrics, commercial preferences                 |
| `platform_type` | Enum for social platforms (instagram, tiktok, youtube, x, twitch) |

### 4.2 Creator Data Tables

| Table                         | Purpose                                             |
| ----------------------------- | --------------------------------------------------- |
| `influencer_platform_metrics` | Per-platform stats: followers, engagement, CPE, CPV |
| `influencer_posts`            | Individual post performance data                    |

### 4.3 List Management Tables

| Table                    | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `brand_lists`            | Named influencer lists per brand              |
| `brand_list_influencers` | Junction: which influencers are in which list |

### 4.4 Campaign Tables

| Table                  | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `campaigns`            | Campaign definitions, compensation, targeting criteria  |
| `campaign_products`    | Products offered in paid-with-product campaigns         |
| `campaign_influencers` | Per-influencer outreach status and application response |
| `campaign_activity`    | Event log for activity feed                             |
| `brand_products`       | Reusable brand product catalog                          |

### 4.5 Key Relationships

```text
brands (1) ---------------- (N) brand_lists
brands (1) ---------------- (N) campaigns

brand_lists (N) ----------- (M) influencers
                             via brand_list_influencers

campaigns (1) ------------- (N) campaign_products
campaigns (1) ------------- (N) campaign_influencers
campaigns (1) ------------- (N) campaign_activity

influencers (1) ----------- (N) influencer_platform_metrics
influencers (1) ----------- (N) influencer_posts
influencers (1) ----------- (N) campaign_influencers
```

### 4.6 The Magic Link System

The `campaign_influencers.token` column is the cornerstone of the application flow. Each row gets a unique UUID generated at insertion time.

```sql
token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid()
```

This token constructs the influencer's personal URL:

`https://apfluence.com/apply/{token}`

The token:

- Identifies the exact campaign + influencer combination
- Requires no login from the influencer
- Is unique per influencer per campaign
- Tracks lifecycle: `pending -> email_sent -> viewed -> accepted/declined/countered`

### 4.7 Row Level Security

RLS is enabled across brand and influencer scoped tables. Policies ensure each user only accesses rows owned by their profile identity.

---

## 5. Authentication System

Apfluence implements a custom role-based authentication system with two distinct roles: **brand** and **influencer**.

### 5.1 Registration Flow

Each role has a dedicated sign-up flow:

- Brands: `/sign-up/brand` -> credentials -> verification -> role assignment -> `/brand`
- Influencers: `/sign-up/influencer` -> credentials -> verification -> role assignment -> `/influencer`

Role is stored in user metadata and validated by middleware/layout guards.

### 5.2 Session & Route Protection

The route protection layer enforces role isolation:

- Brand session can only access `/brand/*`
- Influencer session can only access `/influencer/*`
- Cross-role access is redirected to the correct dashboard

### 5.3 Sign-In & Sing up Pages

![Brand sign-in page](/01-brand-signin.png)

![Brand sign-up page](/02-brand-signup.png)

---

## 6. Complete Brand Workflow

This section documents the complete end-to-end journey of a brand user on the Apfluence platform.

### 6.1 Brand Registration & Sign In

A brand manager creates an account by visiting `/sign-up/brand`. They provide email and password. After verification, their account is created and they are redirected to the brand dashboard.

![Brand sign-up form](/03-Email-send-to-the-brand.png)

![Email verification step](/04-brand-email-verify.png)

![Brand dashboard empty state](/05-brand-dashboard-empty.png)

### 6.2 Influencer Discovery

The main brand dashboard (`/brand`) is the Discovery page. This is where brands search, filter, and evaluate influencer profiles.

**Key Features**

**Token Search Bar** - Supports 3 token types:

- `@handle` - search by platform handle (example: `@zman.gridiron`)
- `#niche` - filter by niche (example: `#fashion`)
- `keyword` - full-text search across name, bio, username

Each token is created by typing and pressing Enter. Tokens are shown as pills and removable individually.

![Discovery token search](/06-discovery-search.png)

**Influencer Result Cards** show:

- Avatar, name, username, location with country flag
- Authenticity score (0-100)
- Platform badges and follower counts
- Niche tags

![Influencer result cards](/07-influencer-cards.png)

**Influencer Side Panel** includes:

- Platform metrics (engagement rate, CPE, CPV, avg likes/comments)
- Expandable platform rows with recent posts
- Gallery images
- Save to List action

![Influencer side panel overview](/08-sidepanel-overview.png)

![Side panel posts](/09-sidepanel-posts.png)

### 6.3 Building Lists

Lists let brands organize influencers into named groups for targeted campaign outreach.

**Creating a List**

From header: **My Lists -> New List**

1. Enter list name
2. Choose color
3. Click Create

![Create list modal](/10-create-list-modal.png)

**Adding Influencers to a List**

From side panel, click **Save to List**:

- Dropdown displays all brand lists
- List counts are shown
- Existing membership is checkmarked
- Click toggles add/remove with optimistic UI

![Save to list dropdown](/11-save-to-list-button.png)

**Lists Dropdown in Header**

Header always shows **My Lists** with list name, color dot, and influencer count.

![Header lists dropdown](/12-lists-header-dropdown.png)

### 6.4 Selected Influencers View

The **Selected** tab navigates to `/brand/selected`, showing saved influencers organized by list.

- Left sidebar: list picker + influencer counts
- Right panel: influencer card grid for selected list
- Includes in-list search + hover remove action

![Selected page empty](/13-selected-page-empty.png)

![Selected page with influencers](/14-selected-page-with-influencers.png)

### 6.5 Creating a Campaign

Campaigns are created from `/brand/campaigns` via **+ New Campaign**.

Wizard state is managed by `CampaignWizardContext` and submitted from final step.

**Step 1 - Campaign Type**

- Paid: fixed flat fee per influencer
- Paid with Product: influencer selects products from campaign catalog

![Wizard step 1 type](/15.1-wizard-step1-type.png)

**Step 2 - Campaign Details**

- Campaign name and description
- Campaign logo/icon and color
- Content tracking tags (hashtags and mentions)

![Wizard step 2 details](/16-wizard-step2-details.png)

**Step 3 - Compensation Setup**

- Paid campaign: flat fee input
- Paid with Product campaign:
  - Add products (name, image URL, value, description)
  - Configure max product count / total value
  - Toggle product price visibility

![Wizard step 3 paid](/17-wizard-step3-paid.png)

![Wizard step 3 product](/18-wizard-step3-product.png)

**Step 4 - Email Outreach Template**

- Subject line
- Rich text body + merge field insertion
- `{{application_link}}` highlighted and validated through magic link banner

![Wizard email step](/21-wizard-step5-email.png)

**Step 5 - Target List Selection**

Select list to import influencers into campaign at creation time.

![Wizard finalize step](/22-wizard-step6-finilaze.png)

### 6.6 Campaign Management

After creation, campaigns appear in `/brand/campaigns`.

Page includes:

- Stats row: Engaged Influencers / Emails Sent / Response Rate
- Campaign list/grid toggle
- Activity feed

Campaign cards show:

- Campaign avatar, name, date
- Status badge (Draft / Active / Paused / Completed / Cancelled)
- Type badge (Paid / Paid with Product)
- Creators / Engaged / Response metrics

![Campaigns list view](/23-campaigns-list.png)

![Campaigns grid view](/24-campaigns-Grid.png)

Campaign detail page (`/brand/campaigns/[id]`) shows:

- Pipeline stages and progress
- Contextual toolbar actions on selection
- Influencer table with status and offer fields

![Campaign detail empty state](/25-campaign-detail-empty.png)

![Campaign detail with influencers](/26-campaign-detail-with-influencers.png)

### 6.7 Adding Influencers to a Campaign

From campaign detail, click **Add creators**.

System behavior:

- Fetches `brand_list_influencers` for selected list
- Inserts `campaign_influencers` rows with `status = 'pending'`
- Generates unique token UUID per influencer
- Silently skips duplicates already in campaign

![Add creators modal](/27-add-creators-modal.png)

### 6.8 Bulk Email Outreach

With campaign influencers assigned, brand can send personalized outreach.

**Send Flow**

1. Select influencers via checkboxes
2. Click **Email** in contextual toolbar
3. Confirm in `BulkEmailPanel`
4. Click Send

**Backend Flow (`/api/email/campaign`)**

For each selected influencer:

1. Resolve template variables
2. Resolve unique `{{application_link}}`
3. Send via brand Gmail SMTP
4. Update `campaign_influencers.status = 'email_sent'` and `email_sent_at`
5. Insert event into `campaign_activity`

![Bulk email panel](/28-bulk-email-panel.png)

### 6.9 Email Template System

The template system uses merge fields replaced at send time.

| Token                  | Replaced With                         |
| ---------------------- | ------------------------------------- |
| `{{influencer_name}}`  | Influencer full name                  |
| `{{first_name}}`       | Influencer first name                 |
| `{{brand_name}}`       | Brand company name                    |
| `{{campaign_name}}`    | Campaign name                         |
| `{{application_link}}` | Unique per-influencer application URL |
| `{{promo_code}}`       | Custom promo code (if configured)     |
| `{{affiliate_link}}`   | Affiliate link (if configured)        |

The Outreach page (`/brand/outreach`) provides:

- Subject input
- Rich text body editor
- Merge fields panel
- Magic link banner for `{{application_link}}`

![Outreach merge fields](/29-outreach-merge-fields.png)

### 6.10 Gmail SMTP Configuration

Emails are sent from the brand's own Gmail identity.

**Setup Process**

1. Open Account settings
2. Go to Outreach tab
3. Enter Gmail address + Gmail App Password
4. Save and validate connection status

**Security**

- App Password stored in `brands.gmail_smtp_app_password`
- Access is policy-protected
- Secret is only consumed server-side when sending
- Brand can revoke/update credentials anytime

![SMTP settings](/30-smtp-settings.png)

### 6.11 The Influencer Experience - Receiving the Email

Influencer receives a personalized invitation email with unique URL:

`https://apfluence.com/apply/{unique-token}`

On link click:

1. Public page opens (`/apply/{token}`)
2. Token resolves campaign + influencer row
3. First open updates `email_sent -> viewed` and sets `viewed_at`
4. Brand activity feed logs open event

![Email received by influencer](/31-email-received.png)

### 6.12 The Application Form

The application form (`/apply/[token]`) is token-authenticated and does not require account login.

**Page Structure**

Fixed header + fixed footer with response actions.

**Section 1 - Campaign Hero**

- Campaign avatar/logo
- Campaign name + type badge
- Personalized influencer greeting
- Campaign description

![Apply page hero section](/32-apply-hero.png)

**Section 2 - Campaign Compensation**

- Paid: flat fee + optional counter-offer
- Paid with Product: product selector modal + detail view + selected list

![Apply flat fee section](/33-apply-flat-fee.png)

![Apply product section](/34-apply-product-section.png)

![Apply product modal list](</35-apply-product-modal-list%20(2).png>)

![Apply product detail](/36-apply-product-detail.png)

**Section 3 - Campaign Brief**

If brief PDF exists, user can open and preview embedded PDF.

![Apply brief PDF section](/38-apply-brief-pdf.png)

**Section 4 - Contract**

If contract is required:

- Review contract PDF
- Upload signed PDF
- Save URL in `campaign_influencers.signed_contract_url`

![Apply contract upload section](/39-apply-contract-upload.png)

**Section 5 - Response & Message**

- Optional message (max 500 chars)
- Optional counter-offer amount for paid campaigns

**Section 6 - Fixed Footer Actions**

| Action        | Result                                                    |
| ------------- | --------------------------------------------------------- |
| Accept offer  | `apply_status -> accepted`, `status -> accepted`          |
| Refuse        | confirm modal then `apply_status -> declined`             |
| Counter-offer | `apply_status -> countered`, saves `counter_offer_amount` |

After submit, thank-you screen replaces page:

- Green for accepted
- Neutral for declined
- Blue for countered

![Apply thank-you accepted screen](/40-apply-thankyou-accepted.png)

**Brand Side - Seeing the Response**

Campaign detail updates:

- Influencer status updated in table
- Pipeline counts updated
- Activity event logged

---

## 7. Influencer Dashboard

Influencers with platform accounts access `/influencer`.

### Tabs

| Tab              | Route                          | Content                                              |
| ---------------- | ------------------------------ | ---------------------------------------------------- |
| Home             | `/influencer`                  | Greeting, pending offers, quick stats, recent offers |
| Offers           | `/influencer/offers`           | All offers with status filters                       |
| Active Campaigns | `/influencer/active-campaigns` | Accepted campaigns and deliverables                  |
| My Profile       | `/influencer/profile`          | Read-only public profile preview                     |
| Settings         | `/influencer/settings`         | Commercial preferences                               |

### Home Tab

Time-based greeting, pending alert, summary stats, and recent offers.

### Offers Tab

Filter tabs: All / New / Accepted / Declined / Countered.  
New offers display `NEW` badge + direct **View Offer** CTA.

### Active Campaigns Tab

Shows accepted campaigns with compensation, due dates, urgency indicator, publish window, and document links.

### Profile Tab (Read-Only)

Shows public profile exactly as brands view it in discovery.

### Settings Tab

Editable preferences:

- WhatsApp/phone
- Currency
- Min/max rates
- Product gifting toggle
- Shipping regions
- Languages

---

## 8. Project Structure

```text
Apfluence
|-- app
|   |-- (auth)
|   |   |-- forgot-password
|   |   |   -- page.tsx
|   |   |-- sign-in
|   |   |   |-- brand
|   |   |   |   -- page.tsx
|   |   |   -- influencer
|   |   |       -- page.tsx
|   |   |-- sign-up
|   |   |   |-- brand
|   |   |   |   |-- verify
|   |   |   |   |   -- page.tsx
|   |   |   |   -- page.tsx
|   |   |   |-- influencer
|   |   |   |   -- page.tsx
|   |   |   -- role
|   |   -- layout.tsx
|   |-- (dev)
|   |   -- preview
|   |       -- campaigns
|   |           -- [id]
|   |               -- page.tsx
|   |-- (landing)
|   |   |-- layout.tsx
|   |   -- page.tsx
|   |-- (protected)
|   |   |-- brand
|   |   |   |-- analytics
|   |   |   |   |-- loading.tsx
|   |   |   |   -- page.tsx
|   |   |   |-- campaigns
|   |   |   |   |-- [id]
|   |   |   |   |   |-- loading.tsx
|   |   |   |   |   -- page.tsx
|   |   |   |   |-- create
|   |   |   |   |   |-- step-1
|   |   |   |   |   |   -- page.tsx
|   |   |   |   |   |-- step-2
|   |   |   |   |   |   -- page.tsx
|   |   |   |   |   |-- step-3
|   |   |   |   |   |   -- page.tsx
|   |   |   |   |   |-- step-4
|   |   |   |   |   |   -- page.tsx
|   |   |   |   |   |-- step-5
|   |   |   |   |   |   -- page.tsx
|   |   |   |   |   |-- step-6
|   |   |   |   |   |   -- page.tsx
|   |   |   |   |   -- layout.tsx
|   |   |   |   |-- CampaignsView.tsx
|   |   |   |   |-- loading.tsx
|   |   |   |   -- page.tsx
|   |   |   |-- discovery
|   |   |   |   -- page.tsx
|   |   |   |-- lists
|   |   |   |   |-- loading.tsx
|   |   |   |   -- page.tsx
|   |   |   |-- outreach
|   |   |   |   |-- loading.tsx
|   |   |   |   -- page.tsx
|   |   |   |-- payments
|   |   |   |   |-- loading.tsx
|   |   |   |   -- page.tsx
|   |   |   |-- selected
|   |   |   |   -- page.tsx
|   |   |   |-- settings
|   |   |   |   -- page.tsx
|   |   |   |-- support
|   |   |   |   |-- loading.tsx
|   |   |   |   -- page.tsx
|   |   |   |-- layout.tsx
|   |   |   -- page.tsx
|   |   |-- influencer
|   |   |   |-- active-campaigns
|   |   |   |   -- page.tsx
|   |   |   |-- deals
|   |   |   |   -- page.tsx
|   |   |   |-- offers
|   |   |   |   -- page.tsx
|   |   |   |-- profile
|   |   |   |   -- page.tsx
|   |   |   |-- settings
|   |   |   |   -- page.tsx
|   |   |   |-- layout.tsx
|   |   |   -- page.tsx
|   |   -- layout.tsx
|   |-- actions
|   |   |-- brand.ts
|   |   -- get-auth-status.ts
|   |-- api
|   |   |-- apply
|   |   |   -- [token]
|   |   |       -- route.ts
|   |   |-- auth
|   |   |   |-- brand-onboard
|   |   |   |   -- route.ts
|   |   |   -- influencer-onboard
|   |   |       -- route.ts
|   |   |-- brand-products
|   |   |   -- route.ts
|   |   |-- email
|   |   |   -- campaign
|   |   |       -- route.ts
|   |   |-- img-proxy
|   |   |   -- route.ts
|   |   |-- pdf-preview
|   |   |   -- route.ts
|   |   -- set-role
|   |       -- route.ts
|   |-- apply
|   |   -- [token]
|   |       |-- ApplyOfferContent.tsx
|   |       -- page.tsx
|   |-- auth
|   |   -- auth-callback
|   |       |-- AuthCallbackClient.tsx
|   |       -- page.tsx
|   |-- favicon.ico
|   |-- globals.css
|   |-- layout.tsx
|   -- shimmer.css
|-- components
|   |-- auth
|   |   |-- AuthInput.tsx
|   |   |-- BrandSignInForm.tsx
|   |   |-- BrandSignUpForm.tsx
|   |   |-- BrandVerifyEmailForm.tsx
|   |   |-- InfluencerSignInForm.tsx
|   |   -- InfluencerSignUpForm.tsx
|   |-- brand
|   |   |-- apply
|   |   |   -- ProductSelectionModal.tsx
|   |   |-- campaigns
|   |   |   |-- wizard
|   |   |   |   |-- CampaignWizardContext.tsx
|   |   |   |   -- TargetListSelector.tsx
|   |   |   |-- AddCreatorsModal.tsx
|   |   |   -- BulkEmailPanel.tsx
|   |   |-- coming-soon
|   |   |   |-- ComingSoonPage.tsx
|   |   |   |-- FloatingIconsLayer.tsx
|   |   |   -- index.ts
|   |   |-- lists
|   |   |   |-- CreateListModal.tsx
|   |   |   -- ListsDropdown.tsx
|   |   |-- outreach
|   |   |   |-- EmailBodyEditor.tsx
|   |   |   |-- InsertLinkModal.tsx
|   |   |   -- MergeFieldsPanel.tsx
|   |   |-- profile
|   |   |   |-- tabs
|   |   |   |   |-- CompanyTab.tsx
|   |   |   |   |-- OutreachTab.tsx
|   |   |   |   |-- ProfileTab.tsx
|   |   |   |   |-- SecurityTab.tsx
|   |   |   |   -- StatusBanner.tsx
|   |   |   |-- BrandProfileModal.tsx
|   |   |   -- types.ts
|   |   |-- shared
|   |   |   -- GmailAppPasswordModal.tsx
|   |   |-- sidepanel
|   |   |   |-- influencer-side-panel.types.ts
|   |   |   |-- influencer-side-panel.utils.tsx
|   |   |   |-- InfluencerSidePanelHeader.tsx
|   |   |   |-- InfluencerSidePanelPlatformRow.tsx
|   |   |   |-- InfluencerSidePanelStatColumn.tsx
|   |   |   |-- InfluencerSidePanelTabBar.tsx
|   |   |   |-- OutreachTab.tsx
|   |   |   |-- PlatformPostCard.tsx
|   |   |   -- SaveToListButton.tsx
|   |   |-- BrandHomeClient.tsx
|   |   |-- Header.tsx
|   |   |-- ImportSection.tsx
|   |   |-- InfluencerResultCard.tsx
|   |   |-- InfluencerResultCardSkeleton.tsx
|   |   |-- InfluencerSidePanel.tsx
|   |   |-- MobileBlocker.tsx
|   |   |-- SearchSection.tsx
|   |   |-- Sidebar.tsx
|   |   |-- TokenSearchBar.tsx
|   |   -- TrendingSearches.tsx
|   |-- influencer
|   |   |-- Header.tsx
|   |   |-- InfluencerCommercialReadOnly.tsx
|   |   |-- InfluencerHeader.tsx
|   |   -- InfluencerPublicProfileView.tsx
|   |-- landing
|   |   |-- AIMarketingSection.tsx
|   |   |-- Footer.tsx
|   |   |-- HeroSection.tsx
|   |   |-- InfluencerCard.tsx
|   |   |-- InfluencerDiscoverySection.tsx
|   |   |-- Navbar.tsx
|   |   -- NotFoundPage.tsx
|   -- ui
|       |-- alert-dialog.tsx
|       |-- alert.tsx
|       |-- AnimatedGradientCard.tsx
|       |-- aspect-ratio.tsx
|       |-- AuroraText.tsx
|       |-- avatar-circles.tsx
|       |-- avatar.tsx
|       |-- badge.tsx
|       |-- button.tsx
|       |-- calendar.tsx
|       |-- card.tsx
|       |-- checkbox.tsx
|       |-- collapsible.tsx
|       |-- dialog.tsx
|       |-- dropdown-menu.tsx
|       |-- form.tsx
|       |-- input-otp.tsx
|       |-- input.tsx
|       |-- label.tsx
|       |-- LogoCloudMarquee.tsx
|       |-- popover.tsx
|       |-- progress.tsx
|       |-- radio-group.tsx
|       |-- select.tsx
|       |-- separator.tsx
|       |-- sheet.tsx
|       |-- skeleton.tsx
|       |-- slider.tsx
|       |-- sonner.tsx
|       |-- switch.tsx
|       |-- tabs.tsx
|       |-- textarea.tsx
|       |-- toggle-group.tsx
|       |-- toggle.tsx
|       |-- tooltip.tsx
|       |-- use-mobile.ts
|       -- utils.ts
|-- docs
|   |-- auth
|   |   -- remove-clerk-migration-checklist.md
|   |-- diagrams
|   |   |-- DrawIo
|   |   |   |-- Auth
|   |   |   |   |-- auth-state-machine.drawio
|   |   |   |   |-- brand_signin_sequence_supabase.drawio
|   |   |   |   |-- brand_signup_sequence_supabase.drawio
|   |   |   |   -- README.md
|   |   |   |-- Brand
|   |   |   |   |-- add_creators_campaign_sequence.drawio
|   |   |   |   |-- brand_profile_settings_sequence.drawio
|   |   |   |   |-- bulk_email_send_sequence.drawio
|   |   |   |   |-- campaign_create_sequence.drawio
|   |   |   |   |-- campaign_detail_brand_review_sequence.drawio
|   |   |   |   |-- discovery_save_to_list_sequence.drawio
|   |   |   |   |-- influencer_application_flow_sequence.drawio
|   |   |   |   -- list_create_and_add_influencer_sequence.drawio
|   |   |   -- Database
|   |   |       -- apfluence-db-schema.drawio
|   |   |-- Mermaid
|   |   |   -- Auth diagrames
|   |   |       |-- brand-signin.mermaid
|   |   |       |-- brand-signup.mermaid
|   |   |       |-- brand_sign_in_flow.mermaid
|   |   |       |-- brand_sign_up_flow.mermaid
|   |   |       |-- influencer-signin.mermaid
|   |   |       |-- influencer-signup.mermaid
|   |   |       |-- influencer_sign_in_flow.mermaid
|   |   |       -- influencer_sign_up_flow.mermaid
|   |   -- README.md
|   |-- screenshots
|   |-- apfluence_system_reference.pdf
|   |-- Documentation.pdf
|   -- system_overview_new.pdf
|-- hooks
|   -- useDebounce.ts
|-- lib
|   |-- adapters
|   |   -- normalizeInfluencer.ts
|   |-- auth
|   |   -- useSupabaseUser.ts
|   |-- cache
|   |   -- listsCache.ts
|   |-- email
|   |   |-- resolveVariables.ts
|   |   -- signature.ts
|   |-- queries
|   |   |-- campaigns.client.ts
|   |   |-- campaigns.ts
|   |   |-- influencers.ts
|   |   |-- lists.client.ts
|   |   |-- lists.ts
|   |   |-- posts.ts
|   |   |-- products.ts
|   |   -- smtp.ts
|   |-- supabase
|   |   |-- client.ts
|   |   |-- middleware.ts
|   |   -- server.ts
|   |-- data.ts
|   |-- money.ts
|   |-- supabase-admin.ts
|   |-- supabase.ts
|   -- utils.ts
|-- MdxToPdf
|   |-- main.py
|   |-- README.md
|   -- requirements.txt
|-- public
|   |-- 01-brand-signin.png
|   |-- 02-brand-signup.png
|   |-- 03-Email-send-to-the-brand.png
|   |-- 04-brand-email-verify.png
|   |-- 05-brand-dashboard-empty.png
|   |-- 06-discovery-search.png
|   |-- 07-influencer-cards.png
|   |-- 08-sidepanel-overview.png
|   |-- 09-sidepanel-posts.png
|   |-- 10-create-list-modal.png
|   |-- 11-save-to-list-button.png
|   |-- 11.2-save-to-list-button.png
|   |-- 12-lists-header-dropdown.png
|   |-- 13-selected-page-empty.png
|   |-- 14-selected-page-with-influencers.png
|   |-- 15-camapings-dashboard.png
|   |-- 15.1-wizard-step1-type.png
|   |-- 16-wizard-step2-details.png
|   |-- 17-wizard-step3-paid.png
|   |-- 18-wizard-step3-product.png
|   |-- 18-wizard-step4-documents.png
|   |-- 19-wizard-step4-time-line-campaings.png
|   |-- 20-wizard-step4-Application form rules.png
|   |-- 21-wizard-step5-email.png
|   |-- 22-wizard-step6-finilaze.png
|   |-- 23-campaigns-list.png
|   |-- 24-campaigns-Grid.png
|   |-- 25-campaign-detail-empty.png
|   |-- 26-campaign-detail-with-influencers.png
|   |-- 27-add-creators-modal.png
|   |-- 28-bulk-email-panel.png
|   |-- 29-outreach-merge-fields.png
|   |-- 30-smtp-settings.png
|   |-- 31-email-received.png
|   |-- 32-apply-hero.png
|   |-- 33-apply-flat-fee.png
|   |-- 34-apply-product-section.png
|   |-- 35-apply-product-modal-list (2).png
|   |-- 36-apply-product-detail.png
|   |-- 38-apply-brief-pdf.png
|   |-- 39-apply-contract-upload.png
|   |-- 40-apply-thankyou-accepted.png
|   |-- campaign.png
|   |-- campaings.png
|   |-- card 1.png
|   |-- card 2.png
|   |-- card 3.png
|   |-- file.svg
|   |-- globe.svg
|   |-- hero.png
|   |-- logo blue gradient.svg
|   |-- logo.svg
|   |-- next.svg
|   |-- no-phones.png
|   |-- paid.png
|   |-- paid_with_gif.png
|   |-- vercel.svg
|   -- window.svg
|-- scripts
|-- supabase
|   |-- .temp
|   |   -- cli-latest
|   |-- migrations
|   |   |-- bootstrap
|   |   |   |-- 001_helpers.sql
|   |   |   |-- 002_platforms.sql
|   |   |   |-- 010_brands.sql
|   |   |   |-- 011_influencers.sql
|   |   |   |-- 020_influencer_metrics.sql
|   |   |   |-- 021_influencer_posts.sql
|   |   |   |-- 030_brand_lists.sql
|   |   |   |-- 040_campaigns.sql
|   |   |   |-- 050_brand_products.sql
|   |   |   |-- 090_storage_contracts.sql
|   |   |   -- 999_seed.sql
|   |   |-- 20260424120001_seed_influencers_dz.sql
|   |   -- new_schema.sql
|   |-- old_seed
|   |   |-- brand.txt
|   |   |-- brand_list_influencers.txt
|   |   |-- brand_lists.txt
|   |   |-- brand_products.txt
|   |   |-- campaign_activity.txt
|   |   |-- campaign_influencers.txt
|   |   |-- campaign_products.xtx
|   |   |-- campaigns.txt
|   |   |-- influencer_platform_metrics.txt
|   |   |-- influencer_postv.txt
|   |   |-- influencers.txt
|   |   |-- platforms.txt
|   |   -- saved_influencers.txt
|   |-- Seed
|   |   |-- new_seed.sql
|   |   |-- seed_metrics.sql
|   |   |-- seed_posts_part_001.sql
|   |   |-- seed_posts_part_002.sql
|   |   |-- seed_posts_part_003.sql
|   |   |-- seed_posts_part_004.sql
|   |   |-- seed_posts_part_005.sql
|   |   |-- seed_posts_part_006.sql
|   |   |-- seed_posts_part_007.sql
|   |   |-- seed_posts_part_008.sql
|   |   |-- seed_posts_part_009.sql
|   |   |-- seed_posts_part_010.sql
|   |   -- seed_posts_part_011.sql
|   |-- config.toml
|   |-- rls.sql
|   -- schema.sql
|-- types
|   |-- globals.d.ts
|   -- supabase.ts
|-- .env
|-- .gitignore
|-- components.json
|-- eslint.config.mjs
|-- middleware.ts
|-- next-env.d.ts
|-- next.config.ts
|-- package.json
|-- pnpm-lock.yaml
|-- postcss.config.mjs
|-- README.md
|-- tsconfig.json
-- tsconfig.tsbuildinfo
```

---

## 9. Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Supabase project (free tier works)
- A Gmail account with App Password enabled

### Installation

```bash
pnpm install
pnpm dev
```

---

## 10. Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 11. API Reference

### Public Endpoints (No Authentication)

**GET `/api/apply/[token]`**  
Fetches campaign and offer details for application form.

**POST `/api/apply/[token]`**  
Submits influencer response.

**Example body**

```json
{
  "action": "accept",
  "selected_product_ids": ["product_uuid"],
  "application_note": "Looking forward to this collaboration",
  "counter_offer_amount": null,
  "signed_contract_url": "https://storage.example.com/contracts/file.pdf"
}
```

### Protected Endpoints (Brand Authentication Required)

**POST `/api/email/campaign`**  
Sends bulk outreach emails to selected campaign influencers.

**Example body**

```json
{
  "campaignId": "campaign_uuid",
  "emails": [
    {
      "to": "influencer@example.com",
      "subject": "Collaboration opportunity",
      "body": "<p>Hello {{first_name}}</p><p>{{application_link}}</p>",
      "influencerId": "influencer_uuid",
      "campaignInfluencerId": "campaign_influencer_uuid"
    }
  ]
}
```

**POST `/api/set-role`**  
Deprecated compatibility endpoint for role assignment.

---

## Apfluence - Projet de Fin d'Études

Built with Next.js, Supabase, TypeScript and Tailwind CSS.
