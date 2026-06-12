# Apfluence — AI-Powered Influencer Marketing Platform

> **Full-Lifecycle B2B SaaS Creator Partnerships & Campaign Execution Platform**
> 
> Final Year Project (Projet de Fin d'Études) — Developed by **Cipher-Shadow1**
> 
> GitHub Repository: [https://github.com/Cipher-Shadow1/Apfluence_Final_version](https://github.com/Cipher-Shadow1/Apfluence_Final_version)

---

## 📌 Project Overview & Pitch

Apfluence is a production-ready, full-stack B2B SaaS platform designed to streamline and automate the entire brand-creator collaboration lifecycle. From automated discovery and AI-powered creator vetting to campaign pipeline tracking, in-app messaging, and localized financial wallet payments, Apfluence consolidates fragmented marketing workflows into a unified solution.

### The Problem We Solved
Influencer marketing remains broken and manual for most emerging markets:
*   **Scattered Discovery:** Vetting creators requires manually jumping across Instagram, TikTok, YouTube, and Facebook.
*   **Unverified Metrics:** Brands rely on subjective follower counts, leaving them vulnerable to follower fraud and low-quality engagement.
*   **Fragmented Tools:** Communication, contract signing, brief sharing, and payment occur across email, WhatsApp, spreadsheets, and banking apps.
*   **Payment Barriers:** International card-based platforms fail to support local payment rails (such as **CCP** and **BaridiMob** in Algerian Dinars - DZD).

**Apfluence** brings discovery, AI metrics evaluation, campaign creation, messaging, and localized payments into a single, cohesive hub.

---

## 🛠️ Project Setup & Run Instructions

Apfluence utilizes a **modular, two-layer architecture**:
1.  **Frontend (Next.js Application):** Handles user experience, auth dashboards, campaign workflows, communication, and wallet ledger management.
2.  **Backend (FastAPI Scraping & ML Engine):** Handles dynamic data collection, sentiment/credibility scoring, and Brand-Influencer matching.

Both services communicate through a shared **Supabase (PostgreSQL)** database.

---

### Layer A: Next.js Frontend Application Setup

#### 1. Prerequisites
Ensure you have the following installed:
*   **Node.js** (v18.x or higher)
*   **pnpm** (preferred package manager)
*   **Supabase Account** (with a database project initialized)

#### 2. Environment Configuration
Create a `.env.local` file in the root directory of the Next.js project:

```env
# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Credentials (Retrieved from Settings -> API in Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary Storage Settings (For contract uploads, logos, receipts, and briefs)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# Admin Access Control
# Comma-separated list of Supabase auth user UUIDs acting as finance supervisors/admin
ADMIN_USER_IDS=8a7c2b3e-4d5f-6a7b-8c9d-0e1f2a3b4c5d

# Localized Payment Details (Algerian Market)
NEXT_PUBLIC_BARIDIMOB_RECEIVER_RIP=00799999002145678912
NEXT_PUBLIC_APFLUENCE_RECEIVE_CCP="007 18492 003905672814 31"
```

#### 3. Command Lines to Run
Execute these commands in your terminal to start the development server:

```bash
# 1. Install project dependencies
pnpm install

# 2. Run Next.js and the asset optimizer concurrently
pnpm dev
```
The application will run locally at [http://localhost:3000](http://localhost:3000).

---

### Layer B: FastAPI Scraping & ML Engine Setup

#### 1. Prerequisites
Ensure you have the following installed on the backend machine:
*   **Python 3.10+**
*   **pip** and **virtualenv**

#### 2. Environment Configuration
Create a `.env` file in the root of the FastAPI backend directory:

```env
# Shared Supabase Database Connection Details
DATABASE_URL=postgresql://postgres.your-project-id:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Social Scraping Auth Credentials (Required for Instagrapi / Playwright browser sessions)
INSTAGRAM_USERNAME=your_scraping_bot_username
INSTAGRAM_PASSWORD=your_scraping_bot_password
TIKTOK_SESSION_ID=your_tiktok_session_cookie_id
```

#### 3. Command Lines to Run
Run the backend Python FastAPI server using these commands:

```bash
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install Playwright browser engines
playwright install

# 5. Start the FastAPI server using Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The API documentation will be interactive and accessible at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Database Schema & Storage Setup (Supabase Console)

1.  **Database Tables:** Create the following core relational tables in your Supabase project editor:
    *   `brands` — Stores company details, Gmail SMTP data, and DZD balances.
    *   `influencers` — Stores creator details, social handles, categories, rates, and cash balances.
    *   `influencer_platform_metrics` — Caches followers, likes, comments, and engagement rates.
    *   `influencer_posts` — Caches individual post records for side-panel preview cards.
    *   `brand_lists` / `brand_list_influencers` — Handles custom organization lists.
    *   `campaigns` / `campaign_products` — Campaign setup and product inventories.
    *   `campaign_influencers` — Primary pipeline records managing candidate status and token auth keys.
    *   `campaign_activity` — Operations log.
2.  **Storage Buckets:** Create a public bucket named **`contracts`** to support document uploads. Enable read/write access.
3.  **Gmail SMTP App Password:** Navigate to Google Account -> Security -> App Passwords to generate a 16-character App Password. Enter it under the Brand account settings to send bulk invitation templates.

---

## ⚡ What the Platform Does

### For Brands
*   **Influencer Vetting:** Deep search by `@handle`, `#niche`, platform, and location flag.
*   **Profile Analytics:** Side-panel overview containing Authenticity scores, Engagement Rates (ER), cost per engagement, and post previews.
*   **Live scan:** Initiate a live Playwright scraper to scan any public social account on the fly.
*   **6-Step Campaign Wizard:** Choose campaign type (Paid flat fee or Product-Gifting), define rules, upload PDF briefs/contracts, build customized email templates with merge tags, and select target lists.
*   **Outreach & Pipeline Tracking:** Send automated bulk emails via Gmail SMTP. A unique UUID magic link lets influencers sign, counter-offer, or decline without logging in.
*   **Algerian payment rails:** Upload bank transfers/CCP receipts to fund the system wallet.

### For Influencers
*   **Marketplace Offers:** Browse campaigns, evaluate briefs, download contracts, and upload signed documents.
*   **Secure Token Links:** Full participation in campaigns (offer response, shipping inputs, draft submission) via a token URL without requiring account registration.
*   **Earnings & Withdrawals:** Track campaign payouts and request withdrawals to an Algerian CCP account.

### For Platform Administrators
*   **Financial Validation:** Review uploaded brand CCP/BaridiMob deposit receipts.
*   **Payout Approval:** Authorize and validate milestone fund releases.
*   **Withdrawal Processing:** Process and clear influencer withdrawal requests.

---

## 🤖 The AI/ML & Scraping Engine (PFE-M2)

The intelligence layer is driven by the FastAPI service executing data-intensive operations:
*   **Multi-Platform Scraping:** Browser-based automation (Playwright) dynamically extracts metrics across dynamic web views on Instagram, TikTok, YouTube, and Facebook.
*   **Credibility Classification:** Combines metric ratios, suspicious-like patterns, and bio traits via an **XGBoost** model paired with heuristic logic to generate a credibility rating.
*   **Multilingual NLP Sentiment & Spam Analysis:** Uses a fine-tuned **XLM-RoBERTa** model trained to recognize French, Arabic, and Algerian code-switched comments. Filter flags distinguish spam/organic comments and extract general sentiment.
*   **Algeria-Tuned Niche Classification:** Lexical machine learning classifier that tags influencer categories into 15 distinct niches suited to localized content markets.
*   **Brand-Influencer Matching (BIS):** Employs a dual-engine architecture. Computes matching scores prioritizing the Python ML recommendation engine; an application-level fallback ensures continuity if the engine goes offline.
*   **Data Footprint:** Features training over ~15,000 labeled code-switched comments, a custom fraud detection suspect dataset, and a 90-profile validation corpus.

---

## 📂 Shipped Pages & Modules

*   **Public Views:** Responsive landing page, role-specific authentication, verification screens, and public token-based apply/draft submission pages.
*   **Brand Console:** Discovery index, smart lists, campaign wizard, outreach template editor, real-time collaboration pipeline table, settings, and wallet ledgers.
*   **Influencer Console:** Home tab, offer filters, active campaign checklists, real-time brand communication chat, and withdrawal systems.
*   **Admin Console:** Main operations ledger, deposit validation table, and CCP withdrawal queue checks.

---

## 📖 Dissertation Chapter 5: Implementation and Realization

### 1. Introduction

This chapter describes how our platform was built and the technologies chosen for each layer of the system. Chapter 4 defined the specifications; here we focus on realization: our application, the scraping and analysis engine, and their integration through our database (BDD).

The implementation covers the following functional areas:
*   User authentication and role-based access (brand, influencer, platform administrator)
*   Influencer discovery, lists, and live profile scanning (scraping and analysis engine)
*   Campaign wizard, marketplace, pipeline management, and Brand-Influencer Score (BIS) matching
*   Email outreach via brand-configured Gmail SMTP
*   In-app campaign chat and secure token-based application and draft links
*   Localized wallet operations (CCP, BaridiMob, DZD) with administrator validation
*   Multilingual ML scoring and credibility analysis (scraping and analysis engine)

We begin with the general architecture, then present the technology stack, and conclude with an overview of the principal user interfaces that implement the requirements defined in the previous chapter.

---

### 2. General Architecture

The architecture of our platform follows a **modular two-layer design** rather than a full microservices mesh. **Our application** handles all product workflows—authentication, discovery, campaigns, chat, email configuration, and wallet management—through its internal service layer and database access components. The **scraping and analysis engine** handles data-intensive operations: multi-platform scraping, ML scoring, and BIS matching. Both layers share our database, which keeps influencer profiles, campaign state, and financial records consistent across the system.

```mermaid
graph TD
    classDef main fill:#f9f9fb,stroke:#1a1aff,stroke-width:2px;
    classDef service fill:#eeeeff,stroke:#6666ff,stroke-dasharray: 5 5;
    classDef db fill:#e8f4fd,stroke:#3b82f6,stroke-width:2px;

    %% Presentation Layer
    subgraph Presentation ["Presentation Layer (Role Dashboards)"]
        Brand["Brand Dashboard"]
        Creator["Influencer Portal"]
        Admin["Admin Dashboard"]
        Public["Public Apply Page"]
    end
    
    %% Application Service Layer
    subgraph ServiceLayer ["Application Service Layer (Next.js Node Server)"]
        Auth["Auth & Guard Services"]:::service
        Biz["Business Logic Core"]:::service
        Mail["Mailing Service (Gmail SMTP)"]:::service
        ChatSvc["Campaign Chat Service"]:::service
        Wallet["Payment & Wallet Component"]:::service
        DAL["Data Access Layer (DAL)"]:::service
    end

    %% Scraping & ML Layer
    subgraph MLService ["Machine Learning & Collection Engine (Python Server)"]
        DataColl["Data Collection Service (Playwright/Instagrapi)"]:::service
        MLEngine["ML Service (XGBoost/Scikit-learn)"]:::service
    end
    
    %% Shared DB
    BDD[("PostgreSQL Database & Storage (Supabase)")]:::db

    %% Connections
    Brand --> Auth
    Creator --> Auth
    Admin --> Auth
    Public --> Auth

    Auth --> Biz
    Biz --> Mail
    Biz --> ChatSvc
    Biz --> Wallet
    Wallet --> DAL
    Biz --> DAL
    
    MLEngine --> BDD
    DataColl --> BDD
    DAL --> BDD
```

*   **Presentation layer:** The user-facing layer serves three roles—brand, influencer, and platform administrator—through role-specific dashboards. Brands use discovery (filters, lists, profile side panels), the six-step campaign wizard, marketplace management, email outreach configuration, campaign pipeline views, and wallet deposit flows. Influencers browse the marketplace, manage offers, submit drafts, use campaign chat, and request CCP withdrawals. The administrator validates deposits and processes withdrawal requests. Secure token-based invitation links allow unregistered creators to enter the pipeline without prior account creation.
*   **Application service layer:** Server-side services act as the integration boundary between the user interface and backend resources. They query our database, invoke the scraping and analysis engine for scraping and matching, send emails through brand-configured Gmail SMTP, and enforce role-based access. Each feature module exposes dedicated services while sharing common authentication controls.
*   **Authentication module:** User identity is managed through our authentication module with email verification for brands, session management, and role-based access policies that restrict data access by user type. Authentication is a cross-cutting concern applied at the service and database policy layers.
*   **Business Logic Component:** The BusinessLogic component represents the operational core of the platform. It is responsible for coordinating the main business processes, including campaign management, influencer interactions, payment processing, contract handling, and other activities related to the influencer marketing workflow. Centralizing these processes within a dedicated component separates business rules from infrastructure and supporting services.
*   **Machine Learning Service (scraping and analysis engine):** The scraping and analysis engine provides the intelligent capabilities of the platform. It is separate from our application but shares the same database. Its responsibilities include multi-platform scraping (Instagram, TikTok, YouTube, Facebook), computation of engagement, credibility, niche, and global scores, multilingual sentiment and spam analysis (French, Arabic, and Algerian code-switched content), and Brand-Influencer Score (BIS) matching.
    
    Brands access this layer through the profile scan function, which triggers live analysis of any public profile, and through the campaign wizard's AI recommender. Matching uses a **dual-engine design**: the analysis engine is preferred when available; an application-layer fallback in our application ensures recommendations continue if the ML service is offline.
*   **Communication Services:** Communication is handled through two channels. The **Mailing Service** sends campaign invitations and notifications through each brand's own Gmail SMTP configuration, supporting bulk outreach with merge fields and reusable templates. The **Campaign Chat Service** provides in-app real-time messaging between brands and accepted creators, complementing email for day-to-day coordination.
*   **Payment and Wallet Component:** Financial operations are adapted to the Algerian market. Brands deposit funds via CCP or BaridiMob and upload receipts; the platform administrator validates deposits and credits the brand wallet. Brands pay influencers from their wallet upon campaign milestones, and influencers request CCP withdrawals validated by the administrator. Amounts are handled in DZD throughout the application.
*   **Data Access Layer:** The DataAccess component serves as the intermediary layer between the platform's services and its storage infrastructure. Centralizing data access through database access components and server-side services maintains a clear separation between business processes and data management.
*   **Database and Storage:** Structured data—users, influencer profiles, campaigns, applications, chat messages, wallet transactions—is stored in our database with role-based access control. File uploads (briefs, contracts, receipts, draft media) use our file storage service (Supabase/Cloudinary).

---

### 3. Capabilities by Role & Deployed System Architecture

The implementation directly addresses the problems formalized in the design phase. Table 5.1 summarizes what each role can do in the deployed system and which problem each capability solves.

#### Table 5.1: Role capabilities and problems solved in implementation

| Role | What the user can do | Problem solved |
| :--- | :--- | :--- |
| **Brand** | Search influencers by platform, followers, engagement; use `@` / `#` search; build lists; trigger live profile scans; launch campaigns via wizard; invite in bulk via Gmail SMTP; publish to marketplace; review applications; negotiate counter-offers; track pipeline stages; chat with accepted creators; fund wallet via CCP/BaridiMob. | Replaces manual directory browsing, unverified metrics, and fragmented outreach with scraped data, BIS recommendations, and a unified campaign workflow. |
| **Influencer** | Browse marketplace; apply to campaigns (or via secure token link); accept/decline/counter-offer invitations; download briefs; submit drafts (authenticated or via secure token link); track collaboration status; use campaign chat; view earnings; request CCP withdrawal. | Enables participation without forcing every creator through full registration first; centralizes collaboration status. |
| **Platform Administrator** | Validate brand deposit receipts; credit brand wallets; approve campaign payouts to influencer wallets; process and mark CCP withdrawals as sent. | Provides a locally adapted payment rail unavailable on international card-based platforms. |

**Problems explicitly not solved in this implementation** include ROI analytics dashboards, predictive campaign forecasting, automated email follow-ups, lookalike discovery, escrow payments, UGC rights libraries, and multi-user brand team administration. Stating these boundaries keeps the implementation scope aligned with the actual codebase.

---

### 4. Technology Stack

#### Frontend Technologies
*   **Next.js (App Router):** Chosen for the frontend of our platform. Its routing system simplifies page management and page transition routing. It integrates with React and TypeScript, making it easy to build reusable components, use server-side rendering (SSR), and write server actions.
*   **TypeScript:** Used on the frontend to allow static typing, which detects data-exchange structure issues before code execution and helps maintain type safety across the database and frontend components.
*   **Tailwind CSS:** A utility-first CSS framework used to build pages and style interface components directly inside JSX files without maintaining large CSS files.
*   **Shadcn/UI:** A collection of accessible, customizable components built with React and Tailwind CSS that maintains consistent component patterns (buttons, inputs, dialogs, dropdowns) across pages.

#### Backend & Database Technologies
*   **RESTful API:** Facilitates structured, stateless communication between the Next.js frontend, API endpoints, and database handlers.
*   **Python:** The core language for the backend scraping and analysis engine, coordinating API requests and executing machine learning tasks.
*   **SQLAlchemy:** Follows the Object-Relational Mapping (ORM) approach, representing database tables as Python classes to organize the Python backend data layer.
*   **PostgreSQL:** Relational database management system storing user accounts, profiles, campaigns, and transaction ledgers.
*   **Supabase:** Provides PostgreSQL hosting, built-in email/credentials authentication, public/private file storage, and real-time listeners.

#### Machine Learning & Scraping Technologies
*   **XGBoost:** Decision tree machine learning algorithm used to estimate influencer credibility scores by combining metrics such as engagement rates, posting activity, and audience authenticity.
*   **Scikit-learn:** Python machine learning library supporting dataset preparation, cross-validation, and performance evaluation.
*   **Pandas & NumPy:** Core data structures and numerical utilities to clean, transform, and evaluate data before engine processing.
*   **Playwright:** An open-source browser automation framework to retrieve dynamically loaded social metrics from platform web views.
*   **Instagrapi:** Python library wrapper to fetch Instagram profile records, post stats, and metrics.

#### Deployment and Version Control
*   **GitHub:** Version control, collaboration workflow, and branch organization.
*   **Vercel:** Hosting and cloud deployment platform optimized for Next.js app builds.

---

### 5. Interface Design & Deployed Workflow Walkthrough

This section presents the primary user interfaces developed for our platform, displaying how brands and creators conduct authentication, discovery, campaigns, outreach, and payments.

#### 5.1 Landing Page
The landing page serves as the entry point of the platform, detailing core value propositions, features, and call-to-actions for brands and creators.

![Our Platform Landing Page](screenshots/Screenshot%202026-06-10%20120425.png)

---

#### 5.2 Authentication and Verification
The authentication layer secures dashboards using role-based redirection logic. Brands and influencers register through separate paths.

##### Brand Registration
Companies submit their name, email, website, and password. A confirmation page prompts the input of a one-time verification code.

![Brand Registration Interface](screenshots/Screenshot%202026-06-10%20124121.png)

##### Verification Code
A secure verification code is sent via email to confirm the brand's identity before account activation.

![Verification Code Interface](screenshots/Screenshot%202026-06-10%20141934.png)

##### Brand Sign-in
Already registered brands input their credentials to access the main brand dashboard.

![Brand Sign-In Page](screenshots/Screenshot%202026-06-10%20123027.png)

---

#### 5.3 Brand Dashboard & Discovery
Once authenticated, brand users enter the main dashboard, which hosts the discovery interfaces, token search tools, and list managers.

##### Dashboard Overview
Displays campaign metrics, wallet status, active creators, and overall performance updates.

![Brand Dashboard](screenshots/Screenshot%202026-06-10%20142340.png)

##### Influencer Discovery
Features a multi-token search bar supporting `@handle` for username searches, `#niche` for specific categorization, and plain text search terms. Influencer cards summarize key metrics.

![Influencer Discovery](screenshots/Screenshot%202026-06-10%20143016.png)

---

#### 5.4 Influencer Profile Evaluation
Clicking an influencer opens a detailed slide-over panel displaying verified cross-platform metrics, recent posts, estimated pricing ranges, and audience insights.

##### Instagram Analytics
Shows specific Instagram indicators: engagement rate, average likes, average comments, cost per engagement (CPE), and recent posts.

![View Instagram Influencer Information](screenshots/Screenshot%202026-06-10%20143901.png)

##### TikTok Analytics
Details TikTok views, shares, comments, average engagement, and platform video links.

![View TikTok Influencer Information](screenshots/Screenshot%202026-06-10%20144217.png)

##### YouTube Analytics
Presents YouTube subscriber counts, video views, and video cost-per-view (CPV) configurations.

![View YouTube Influencer Information](screenshots/Screenshot%202026-06-10%20144447.png)

---

#### 5.5 Campaign Creation Wizard
Brands create campaigns using a step-by-step wizard.

##### Step 1: Campaign Type
Select between a **Paid** campaign (monetary compensation) and a **Paid with Product** campaign (product-gifting model).

![Campaign Type Selection](screenshots/Screenshot%202026-06-10%20155031.png)

##### Step 2: Campaign Details (Part 1)
Input campaign name, description, content tracking tags (hashtags and mentions), and upload campaign icon/brand assets.

![Campaign Information - Part 1](screenshots/Screenshot%202026-06-10%20155310.png)

##### Step 3: Campaign Details (Part 2)
Configure timeline dates (campaign start, application close, draft submit, content live window) and specify target requirements.

![Campaign Information - Part 2](screenshots/Screenshot%202026-06-10%20155433.png)

##### Step 4: Compensation Setup
For paid campaigns, set the flat fee amount. For product campaigns, configure product pricing and visibility.

![Campaign Information - Part 3](screenshots/Screenshot%202026-06-10%20155528.png)

##### Step 5: Product Catalog Setup
For product campaigns, catalog items that creators can select from (naming, image URLs, valuation, description).

![Campaign Product Catalog](screenshots/Screenshot%202026-06-10%20155947.png)

##### Step 6: Brief & Contract Documentation
Upload the campaign PDF brief and contract files that influencers review and sign during application.

![Campaign Documentation - Brief & Contract](screenshots/Screenshot%202026-06-10%20163016.png)

##### Step 7: Email Outreach Template
Edit the email body template with merge fields (`{{influencer_name}}`, `{{application_link}}`) to personalize automated invites.

![Campaign Outreach Email Template Editor](screenshots/Screenshot%202026-06-10%20163115.png)

##### Step 8: Target List Selection
Select a list of curated influencers from the brand's database to import directly into the campaign.

![Select Target List for Campaign](screenshots/Screenshot%202026-06-10%20164219.png)

---

#### 5.6 Campaign Management & Pipelines
The campaign pipeline view allows brands to monitor candidate stages, coordinate active offers, and manage collaboration milestones.

##### Campaigns List View
Displays active, draft, completed, and canceled campaigns, showing creator counts and response metrics.

![Manage Campaigns & Pipeline](screenshots/Screenshot%202026-06-10%20164330.png)

##### Empty Pipeline State
The pipeline view for a newly initialized campaign, ready for candidate import.

![Empty Pipeline State](screenshots/Screenshot%202026-06-10%20164355.png)

##### Add Creators Modal
Imports saved lists of creators to initiate campaign outreach.

![Add Creators Modal](screenshots/Screenshot%202026-06-10%20164839.png)

##### Active Collaborations Tracking
Shows the full tabular campaign view, displaying creator responses, counter-offers, contracts, and deliverable status.

![Active Collaborations Tracking](screenshots/Screenshot%202026-06-10%20172243.png)

---

#### 5.7 Campaign Communication (In-App Chat)
Once a creator accepts a campaign offer, an in-app chat interface opens to allow direct message exchange, file sharing, and contract negotiation.

![Real-time Brand-Influencer Chat](screenshots/Screenshot%202026-06-10%20203351.png)

---

#### 5.8 Localized Payments & Wallet Management
Financial ledgers are adapted to the Algerian market. Brands upload CCP/BaridiMob deposit receipts to fund their wallet. Administrators validate these receipt images to credit brand accounts. Brands pay creators upon milestone completion, and influencers withdraw earnings via validated CCP bank rails.

![Wallet & Payment Operations](screenshots/Screenshot%202026-06-10%20204928.png)
