# Marilicht

The website for Marilicht at **marilicht.social**: one public business page and one private admin dashboard.

| Route | What | Access |
| --- | --- | --- |
| `/` | Public business page | Everyone, no login |
| `/dashboard` | Admin dashboard: profile, website, social, products, contact & hours, promotions, appearance, QR code | The administrator only |
| `/studio` | Sanity Studio (direct content access) | The administrator only, plus a Sanity login |
| `/sign-in` | Clerk sign-in (no sign-up) | — |

## Run it locally

```bash
npm install
npm run dev
```

With no environment variables the app runs in **local mode**: content is saved to `.data/site.json` (seeded with demo content on first run), uploads go to `.data/uploads/`, and `/sign-in` shows a "Continue as administrator" button instead of Clerk. Local mode is disabled whenever `NODE_ENV=production`, so it never runs on Vercel.

## Set up the administrator account (Clerk)

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com). Choose **Email** as the sign-in method (add Google if you like).
2. **Turn off public registration:** *Configure → Restrictions → Sign-up mode → **Restricted***. Nobody can create an account unless you add them.
3. **Create your account:** *Users → Create user*, enter your email and a password. Clerk marks emails added this way as verified.
4. **Make it the administrator.** Do either one; both are checked on the server:
   - **Environment variable:** set `ADMIN_EMAILS=you@example.com`. It only counts when that email is verified in Clerk.
   - **Clerk metadata:** open your user → *Metadata → Public* and set `{ "role": "admin" }`. Public metadata can only be changed from the Clerk dashboard or the backend API, never by the user.
5. Copy the keys from *API Keys* into `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
6. For production, add `marilicht.social` as a domain in Clerk (*Domains*) and use the production instance's keys on Vercel.

Anyone else who somehow signs in is sent to `/denied`. The dashboard, Studio and every save/publish/upload action verify the administrator on the server.

## Connect Sanity

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) with a `production` dataset. Put the project id in `NEXT_PUBLIC_SANITY_PROJECT_ID`.
2. *API → Tokens → Add API token* with **Editor** permissions, and put it in `SANITY_API_WRITE_TOKEN`. This token is only read on the server.
3. *API → CORS origins*: add `http://localhost:3000` and `https://marilicht.social`, both with **Allow credentials** ticked. The embedded Studio at `/studio` needs this.
4. Optional: load the demo content as a starting point:

   ```bash
   node scripts/seed-sanity.ts
   ```

5. Optional: if you'll also edit in the Studio, add a webhook under *API → Webhooks*:
   - URL `https://marilicht.social/api/revalidate`
   - Trigger on create, update and delete
   - Filter `_type == "sitePage"`
   - A secret, copied into `SANITY_REVALIDATE_SECRET`

   Publishing from the dashboard refreshes the site instantly without it.

### How content is stored

All content lives in one Sanity document of type `sitePage`. The dashboard autosaves to Sanity's draft (`drafts.sitePage`) while you edit and shows a live preview. **Publish** copies the draft to the published `sitePage`, the only version visitors see. The public page is cached and refreshed the moment you publish, with no redeploy.

## Deploy to Vercel

1. Import the repository into Vercel (the default `next build` settings are correct).
2. Add every variable from `.env.example`. The QR code address is fixed to `https://marilicht.social` in `lib/config.ts`, so no setting can change it.
3. Add the `marilicht.social` domain in Vercel, and add it to Clerk and the Sanity CORS origins.

## Code map

- `app/page.tsx`: the public page; `components/public/business-page.tsx` renders it (also used by the dashboard preview).
- `app/dashboard/*`, `components/dashboard/*`: the admin dashboard; server actions in `app/dashboard/actions.ts`.
- `lib/auth/`: who is signed in (`session.ts`) and the admin check (`guards.ts`).
- `lib/data/`: storage. `sanity-repository.ts` in production and `local-repository.ts` in development, behind one interface.
- `lib/site.ts`: section wording, default appearance, empty starter content.
- `sanity/`, `sanity.config.ts`: Sanity schema and Studio.
- `scripts/generate-demo-art.mjs`: regenerates the demo artwork in `public/demo/marilicht`.
