# Auth Flow Diagrams

Four sequence diagrams covering the complete authentication system.

## Files

| File | Flow | Entry Point |
|---|---|---|
| brand-signup.mermaid | Brand registration + email OTP | /sign-up/brand |
| brand-signin.mermaid | Brand login | /sign-in/brand |
| influencer-signup.mermaid | Influencer registration + email OTP | /sign-up/influencer |
| influencer-signin.mermaid | Influencer login | /sign-in/influencer |

## How to view these diagrams

Option 1: VS Code
Install the "Markdown Preview Mermaid Support" extension.
Open any .mermaid file and press Cmd+Shift+V (Mac) or Ctrl+Shift+V (Windows).

Option 2: Online
Go to https://mermaid.live
Paste the contents of any .mermaid file into the editor.

Option 3: GitHub
GitHub renders .mermaid files natively in markdown.
Wrap the content in a ```mermaid``` code block in any .md file.

## Key architectural decisions visible in these diagrams

1. setActive() always fires BEFORE /api/set-role is called
   Reason: the API uses auth() server-side to get userId.
   If session is not active, userId is null and role is never saved.

2. Role is set once and locked
   /api/set-role returns 409 if publicMetadata.role already exists.
   A brand cannot reassign themselves as influencer by calling the endpoint again.

3. Two-layer role enforcement
   Layer 1: middleware.ts at the edge — blocks unauthenticated access
   Layer 2: layout.tsx server components — blocks wrong-role access
   Both layers must pass for a dashboard to render.

4. Separate sign-in pages per role
   /sign-in/brand and /sign-in/influencer are independent pages.
   The landing nav directs each user type to the correct page.
   There is no shared sign-in page with a role toggle.
