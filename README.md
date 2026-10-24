# Omar Ayman website

Arabic React website with a shared Supabase booking calendar for calls and consultations.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run build
npm run dev
```

The local server serves the latest `dist` build at `http://127.0.0.1:4173`. Rebuild after source changes.

```sh
npm run check
npm test
node scripts/verify-booking-api.mjs
```

The last command reads live availability and checks anonymous-admin and invalid-submission rejection. It does not create a booking.

## Deploy on Vercel

Import this GitHub repository. `vercel.json` selects no framework preset, runs `npm run build`, and publishes `dist`. No application secret is needed in Vercel: booking runs in Supabase Edge Functions.

For your final domain, set `SITE_URL` to its HTTPS origin and rebuild. Without it, a Vercel build uses `VERCEL_PROJECT_PRODUCTION_URL`; local builds retain the previous preview origin for metadata. Connect the domain in Vercel yourself.

## Supabase booking

The configured project is `xtgypzlbkmpjotvmkhrn`. The public URL/key are in `lib/booking-config.ts`; this is a publishable key, not a server credential.

The migration `supabase/migrations/20261024_personal_site_booking.sql` and the `omar-booking` Edge Function have already been applied to that project. Do not rerun the migration there. For another project, apply the migration once, deploy the function, and update the public configuration.

The new calendar uses the existing `leads`, `project_requests`, `bookings`, and `uploaded_files` tables. Additional private tables store schedule settings and idempotency receipts. Files go to the private `omar-briefs` bucket, up to 10 MiB per file. Files are not rendered as public content.

The Edge Function accepts the project's public API key for availability and submissions. It reads server credentials from Supabase's runtime environment. Never put service-role keys or secret keys in this repository or client code.

## Manage availability

Open `/booking-admin` and sign in with the existing Supabase Auth user whose `tw_members` row is active and has role `owner`. This is the application's Auth account, not necessarily your Supabase dashboard login. Admin access is checked by the Edge Function on every request. The page keeps its session token in memory and requires signing in again after a reload.

Choose working weekdays and start hours, add fully closed dates, and save. Settings live in `oa_booking_settings`. Each appointment lasts 45 minutes, starts on the hour, and uses `Africa/Cairo` time, including daylight-saving changes. Initial settings use daily 10:00–16:00 start times, 30 days ahead, with two hours' notice; edit them before inviting clients.

Calls and consultations share the same availability and booking records. A transactional database function and the existing active-slot unique index prevent duplicate bookings. Repeating the same confirmed submission returns the existing receipt. A slot lost to another client returns a conflict and the calendar refreshes its availability.

Submission saves the client's contact/business details, optional brief, chosen slot, and booking receipt. The success screen displays only after the server confirms the booking. This project does not send WhatsApp messages or create Google Calendar events automatically.
