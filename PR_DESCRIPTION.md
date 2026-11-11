## Summary

Fixes the critical payment and student-privacy issues found in the site audit, makes paid event tickets reliable on poor connections, and adds multi-ticket orders, repeat purchases and guest (non-member) checkout.

## Security & privacy fixes
- **Production mode:** the backend forces `NODE_ENV=production` on Vercel production deployments. The live backend was reporting `environment: development`, which turned off production-only safeguards.
- **Server-side pricing:** checkout ignores the amount the browser sends and charges the event's price from the database.
- **Payment verification:** the amount paid must cover the full total and the currency must be NGN, and each reference is tied to one user and one event. Before this, one payment could be reused for any number of events.
- **Removed simulated payments:** a sandbox key or a gateway error no longer counts as a successful payment. Simulation is now opt-in for local development only.
- **Student data leak (migration 020):** removes the `students_directory_read` policy, which let any signed-in student read every student's phone, email and matric number.
- **Smaller fixes:**
  - Directory search can no longer inject database filters.
  - The webhook no longer accepts its secret in the URL, and signature checks are constant-time.

## Reliability
- **Checkouts recorded on the server** when they start, so a payment can always be recovered.
- **Webhook finishes before replying** to the gateway, and now issues the ticket. Previously its inserts were missing required columns.
- **One shared ticket-issuing routine** that's safe to run more than once, with fixed ticket numbers.
- **"Re-check payment" button** for students, plus a server endpoint (`POST /payments/:id/recheck`).

## New features
- **Multiple tickets per order** (1–10, price × quantity; migration 021). Seats are counted in tickets everywhere: receipts, emails, admin dashboard and both CSV exports.
- **Repeat purchases switch** per event (e.g. game night), with no per-student limit. Each order gets its own registration and ticket number (migration 022).
- **Guest checkout:** non-members can buy without an account at a per-event guest price, and get the ticket by email. They recover it with the payment reference and their email. Members (`@tau.edu.ng` or an existing student email) are sent to sign in instead. Admin views and CSVs mark guests.
- **Admin dashboard:** one-click switches on the Events table, plus the same settings in the Create and Edit Event forms.

## Bugs fixed along the way
- The receipt page showed ₦0 to anyone other than the payer.
- The manual-proof amount check read a column that doesn't exist, so it never ran.
- The public events page counted "spots left" from rows the database only shows for your own account.
- `events.current_attendees` was used by the app but never created by any migration.

## Deploy order (important)
Run these in the Supabase SQL Editor **before** deploying. All are safe to re-run:
1. `backend/migrations/020_close_student_pii_and_payment_replay.sql`
2. `backend/migrations/021_event_ticket_quantity.sql`
3. `backend/migrations/022_repeat_orders_and_guest_checkout.sql`

Then on the Vercel backend project: set `NODE_ENV=production`, confirm `BACHS_SECRET_KEY` is an `sk_live_` key, and redeploy.

## Testing
- 76 checks pass in a stubbed backend suite (fake database and gateway). They cover pricing, underpayment, reference reuse, simulation guards, the webhook and re-check, quantities and capacity, repeat purchases, and guest checkout.
- In the browser (local server, mocked data): the quantity picker, and the guest checkout from popup to form to ticket.
- **Not tested:**
  - a real Bachs payment;
  - the signed-in "Buy More" screen and the admin switches in a browser, which need a login.

  Please make one ₦100 test payment after deploying. It confirms two things the code assumes: Bachs returns `pricing.amount`, and the webhook's `data.id` matches the checkout ID.

## Notes for reviewers
- This branch also includes the maintainer's own commits for homepage image optimisation (`09ada4c`) and email broadcast toggles (`e727330`).
- `.claude/launch.json` (local static preview server) is included. Remove it if unwanted.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
