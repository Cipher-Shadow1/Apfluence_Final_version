# Remove Clerk Completely: Migration Checklist

This checklist migrates auth from Clerk to Supabase Auth with minimum risk.
You already plan to copy the project first, which is exactly right.

---

## 0) Safety First (Do Before Any Code Changes)

- [ ] Duplicate the full project folder (backup snapshot).
- [ ] Create a dedicated branch, for example: `chore/remove-clerk-auth`.
- [ ] Confirm current app works end-to-end before migration.
- [ ] Export current Clerk users (CSV) for emergency reference.
- [ ] Note current env values for Clerk and Supabase.

---

## 1) Target Auth Model (What We Are Moving To)

- **Single auth provider**: Supabase Auth only.
- **Identity source**: `auth.users.id`.
- **App role source**: your own DB table/columns (`brand` / `influencer`) in Supabase.
- **Profile claim logic**:
  - if signup email exists in `influencers` with no linked auth user -> claim row.
  - else create minimal influencer row.

---

## 2) Database Migration Tasks

### 2.1 Add new auth identity columns

- [ ] Add `auth_user_id uuid` to `brands`.
- [ ] Add `auth_user_id uuid` to `influencers`.
- [ ] Add unique indexes:
  - `unique(brands.auth_user_id)` where not null
  - `unique(influencers.auth_user_id)` where not null
- [ ] Keep old Clerk columns temporarily (`clerk_id`, `user_id`) during transition.

### 2.2 Role lookup strategy

- [ ] Decide one canonical role source:
  - Option A: add `profiles` table with `{ auth_user_id, role }`
  - Option B: infer role by existence in `brands` or `influencers` (allowed but less explicit)
- [ ] Add indexes needed for fast role checks.

### 2.3 RLS updates

- [ ] Replace Clerk-based checks with `auth.uid()` checks using `auth_user_id`.
- [ ] Update policies on all user-owned tables (brand + influencer side).
- [ ] Verify no policy still references Clerk IDs.

---

## 3) Auth Flow Implementation (Supabase)

### 3.1 Create auth service utilities

- [ ] Add helper module for:
  - sign up
  - sign in
  - sign out
  - resend OTP/email verification
  - read session user

### 3.2 Influencer signup/signin with email OTP

- [ ] Replace influencer Clerk forms with Supabase OTP flow:
  - request code by email
  - verify code
  - after verify: run claim-or-create onboarding logic
- [ ] Remove dependency on Clerk callback route for influencer auth.

### 3.3 Brand signup/signin

- [ ] Migrate brand auth forms to Supabase as well.
- [ ] Port role assignment logic currently in `/api/set-role`.
- [ ] Ensure brand onboarding still creates/links `brands` row correctly.

---

## 4) Middleware + Protected Route Guard Migration

- [ ] Replace `clerkMiddleware` in `middleware.ts` with Supabase session middleware.
- [ ] Rebuild redirect rules:
  - unauthenticated -> sign-in page
  - authenticated + wrong role -> correct dashboard
- [ ] Ensure `/brand` and `/influencer` route trees are protected using Supabase session + DB role.

---

## 5) Replace Clerk Usage Across App

Search and remove all `@clerk/*` imports and role checks that use Clerk metadata.

### High-priority files currently tied to Clerk

- `app/layout.tsx` (remove `ClerkProvider`)
- `middleware.ts` (remove `clerkMiddleware`)
- `app/(protected)/layout.tsx`
- `app/(protected)/brand/layout.tsx`
- `app/(protected)/influencer/layout.tsx`
- `components/auth/InfluencerSignInForm.tsx`
- `components/auth/InfluencerSignUpForm.tsx`
- `components/auth/BrandSignInForm.tsx`
- `components/auth/BrandSignUpForm.tsx`
- `components/auth/BrandVerifyEmailForm.tsx`
- `app/auth/auth-callback/AuthCallbackClient.tsx`
- `app/actions/get-auth-status.ts`
- `app/api/set-role/route.ts`

### Additional app files to audit

- All files using:
  - `useUser`
  - `useAuth`
  - `auth()`
  - `currentUser()`
  - `sessionClaims.publicMetadata.role`
  - `clerkClient()`

---

## 6) Environment & Dependency Cleanup

- [ ] Remove Clerk env vars from local/project env files.
- [ ] Remove Clerk dependency from `package.json`:
  - `@clerk/nextjs`
- [ ] Install/update Supabase auth dependencies as needed.
- [ ] Remove any Clerk-specific docs, comments, and dead helper code.

---

## 7) Data Migration (Existing Users)

- [ ] Build one-time script:
  - map existing accounts by email
  - set `auth_user_id` on `brands`/`influencers`
  - resolve duplicates/conflicts manually
- [ ] Mark and report unmatched users.
- [ ] Keep old Clerk ID columns until migration confidence is high.

---

## 8) Test Plan (Must Pass Before Deleting Clerk Artifacts)

### Auth tests

- [ ] New influencer signup with OTP works.
- [ ] Existing scraped influencer email claims correct row.
- [ ] Influencer sign in/out works.
- [ ] Brand signup/sign in/out works.

### Routing tests

- [ ] Unauthenticated users cannot access protected routes.
- [ ] Authenticated wrong-role user is redirected correctly.
- [ ] No auth callback loop.

### Data tests

- [ ] Influencer and brand dashboards load user data correctly.
- [ ] RLS still protects private rows.
- [ ] No query still depends on Clerk IDs.

---

## 9) Final Removal (After Green Tests)

- [ ] Delete Clerk callback route and Clerk-only APIs.
- [ ] Delete old Clerk-specific auth UI paths if replaced.
- [ ] Drop old Clerk columns (`clerk_id`, legacy `user_id` if replaced) in final DB migration.
- [ ] Merge after full QA pass.

---

## 10) Rollback Plan

If migration breaks production:

- [ ] Revert to backup copy/branch.
- [ ] Re-enable Clerk env vars and dependency.
- [ ] Revert middleware/auth form changes first.
- [ ] Keep DB additive changes (new columns) if harmless; postpone destructive drops.

---

## Recommended Execution Order (Simple)

1. Add DB columns + indexes + policies (additive only).
2. Implement Supabase influencer OTP flow first.
3. Migrate middleware guards to Supabase session.
4. Migrate brand auth.
5. Run tests and fix gaps.
6. Remove Clerk dependency/code.
7. Final cleanup migration (drop old Clerk columns).

