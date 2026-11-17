# GymFlow — Gym Management SaaS

React + Vite + Firebase Authentication + Firestore frontend.

## Local setup
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Fill the Firebase web app configuration values.
4. Run `npm install`.
5. Run `npm run dev`.

## Vercel deployment
- Import this GitHub repository into Vercel.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Add each `VITE_FIREBASE_*` value from `.env.example` under Vercel Project Settings → Environment Variables.
- Redeploy after adding environment variables.

## Current release
- Public marketing landing page.
- Separate sign-in routes for platform admin, gym owner and member.
- Firebase email/password sign-in.
- Role-based dashboard routing based on `users/{uid}` profile documents.
- Responsive dashboard shells.

## Important: account provisioning is not yet implemented
This frontend deliberately does not let visitors choose or self-assign privileged roles. A successful login requires a Firestore document at `users/{uid}` with a trusted `role` value:
- `superAdmin`
- `gymOwner`
- `member`

For gym owners and members, the profile should also contain the correct `gymId`. Create/assign roles only through a trusted server/Admin SDK workflow (for example, a secured Firebase Cloud Function). Do not grant clients permission to write their own role field, and do not create a public super-admin signup.

Before real users or member data are added, deploy restrictive Firestore Security Rules that enforce authentication, role, and gym-level tenant isolation. The dashboards are currently structural shells; live member CRUD, gym onboarding, membership plans, and WhatsApp reminders are the next development modules.
