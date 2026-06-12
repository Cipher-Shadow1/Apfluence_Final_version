# Auth Diagrams — Documentation

## Overview
This folder contains all authentication flow diagrams for the platform.
They are organized into three categories:
- Brand Authentication Flows
- Influencer Authentication Flows  
- Unified System Diagrams (platform-wide logic)

---

## 1. Brand Authentication Flow Diagrams

These diagrams target how Brand users interact with the platform,
focusing on the custom UI forms (BrandSignInForm, BrandSignUpForm)
and their interaction with the Clerk SDK.

### brand-signin.drawio & brand_sign_in_flow.drawio
**Objective:** Illustrate the first-factor login sequence for brand managers.

**Flow:**
- User navigates to /sign-in/brand
- BrandSignInForm captures email and password
- Calls signIn.create({ identifier, password }) via Clerk SDK
- On success: session is created via setActive()
- User is redirected to the Brand Dashboard (/brand)

**Two files exist as architectural variants of the same process.**

---

### brand-signup.drawio & brand_sign_up_flow.drawio
**Objective:** Map the brand registration process and role initialization.

**Flow:**
- New brand user fills out BrandSignUpForm
- Proceeds to Email Verification step (BrandVerifyEmailForm)
- Post-verification: system calls /api/set-role route
- Role "brand" is hardcoded into the user's publicMetadata on the backend

---

## 2. Influencer Authentication Flow Diagrams

These diagrams mirror the Brand flows but are tailored entirely
to the Creator/Influencer side of the platform.

### influencer-signin.drawio & influencer_sign_in_flow.drawio
**Objective:** Map the authentication sequence for returning influencers.

**Flow:**
- Influencer visits /sign-in/influencer
- Inputs credentials into InfluencerSignInForm
- If "Missing Role" race condition is detected:
  system calls clerkClient.users.updateUserMetadata() to repair the profile
- User is granted access to /influencer dashboard

**Notable:** This diagram documents the system's fault tolerance —
automatic self-healing of corrupted user states (missing roles).

---

### influencer-signup.drawio & influencer_sign_up_flow.drawio
**Objective:** Detail the streamlined onboarding process for creators.

**Flow:**
- User completes InfluencerSignUpForm
- System calls signUp.create() via Clerk
- Backend API (/api/set-role) assigns "role": "influencer"
- Illustrates the 3-tier crossing: Client Component → Backend Route Handler → Identity Provider API

---

## 3. Unified System Diagrams (Advanced Flow Logic)

These diagrams abstract the logic into full platform-wide mechanisms,
independent of whether the user is a Brand or Influencer.

### full-signup-flow.drawio
**Objective:** A cohesive map of the platform's multi-step registration pipeline.

**Flow:**
- Abstracts Brand and Influencer forms into a unified sequence
- Registration → Email Code Dispatch → Email Code Verification → API Role Assignment → Dashboard Entry

**Use case:** Represents the general onboarding algorithm at the system architecture level.

---

### full-signin-mfa-flow.drawio
**Objective:** Detail the security protocols during login — MFA and Cookie sanitization.

**Flow:**
- clearClerkCookies() acts as a firewall against cross-browser session bugs
- Intercepts the needs_second_factor status returned by Clerk
- Triggers email_code OTP delivery
- Executes attemptSecondFactor() to complete authentication

**Notable:** Documents the cross-browser edge case (Chrome vs Edge) where
client_trust_state "new" on a different browser requires cookie clearing before login.

---

### session-route-protection.drawio
**Objective:** Illustrate the Next.js Edge Middleware networking logic.

**Flow:**
- middleware.ts acts as gatekeeper for routes like /brand/campaigns and /influencer/deals
- Checks for presence of a valid __session cookie
- "Stale JWT Recovery": if frontend token is outdated, fetches live role data
  directly from clerkClient() server-side
- Protects routes without sacrificing page load speed (Edge Runtime)

---

### auth-state-machine.drawio
**Objective:** A formal Finite State Machine (FSM) model of the authentication lifecycle.

**States defined:**
- unauthenticated
- first_factor_pending
- needs_second_factor
- authenticated (session active)
- session_expired
- signed_out

**Transitions:** Each state change is triggered by a discrete event
(user submits login, OTP validated, session timer expires, user signs out).

---

## File Index

| File | Category | Purpose |
|---|---|---|
| brand-signin.drawio | Brand | Brand first-factor login flow |
| brand_sign_in_flow.drawio | Brand | Brand first-factor login (variant) |
| brand-signup.drawio | Brand | Brand registration + role assignment |
| brand_sign_up_flow.drawio | Brand | Brand registration (variant) |
| influencer-signin.drawio | Influencer | Influencer login + missing role recovery |
| influencer_sign_in_flow.drawio | Influencer | Influencer login (variant) |
| influencer-signup.drawio | Influencer | Influencer registration + role assignment |
| influencer_sign_up_flow.drawio | Influencer | Influencer registration (variant) |
| full-signup-flow.drawio | Unified | Complete platform onboarding pipeline |
| full-signin-mfa-flow.drawio | Unified | MFA + cookie sanitization + cross-browser fix |
| session-route-protection.drawio | Unified | Middleware + JWT + route gating |
| auth-state-machine.drawio | Unified | FSM of all auth states and transitions |

---
