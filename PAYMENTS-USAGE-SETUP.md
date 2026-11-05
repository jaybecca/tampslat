# TAMPslat usage metering and Flutterwave checkout setup

This release adds monthly D1 usage counters and a server-created Flutterwave Standard checkout flow. It does not activate live billing until the D1 migration and Worker secrets are configured and the complete test transaction succeeds.

## Apply the D1 migration first

From the project root, confirm the configured database ID in `wrangler.toml`, then run:

```bash
npx wrangler d1 migrations apply tampslat-db --remote
```

Migration `0002_usage_payments.sql` adds monthly usage counters/events, payment attempts and a plan-expiry timestamp. Back up the database before applying migrations to production.

## Configure Worker secrets

Use test-mode credentials first. Never place these values in HTML, JavaScript, GitHub Actions variables or committed Wrangler configuration.

```bash
npx wrangler secret put FLW_SECRET_KEY
npx wrangler secret put FLW_SECRET_HASH
```

Set `APP_ORIGIN` to `https://tampslat.tampconsulting.space` in the Worker environment. Keep the existing OpenAI secret and D1/R2 bindings unchanged.

## Configure the Flutterwave dashboard

- Set the webhook URL to `https://tampslat.tampconsulting.space/api/billing/flutterwave/webhook`.
- Set the Flutterwave webhook secret hash to the exact value stored as `FLW_SECRET_HASH`.
- Enable successful charge notifications.
- Use Flutterwave test credentials and test payment methods before switching to live credentials.
- The return page is `https://tampslat.tampconsulting.space/payment-success.html`.

The Worker verifies the webhook hash, re-queries Flutterwave's transaction verification endpoint, and checks transaction status, reference, currency and amount before activating a plan. A successful purchase grants 30 days of access; automatic recurring subscription billing is not enabled in this release. Users renew manually until a subscription/recurring plan integration is configured.

## Plan limits and metering

Plan limits are declared in both `plans-data.js` and `backend/worker.js`. Keep the values aligned when changing a plan. AI requests also require a positive AI credit balance; AI request quotas and AI credit balances are separate. AI, OCR, CSV analysis and saved cloud work are reserved atomically against monthly D1 counters. Failed AI/OCR operations release their reservation. The generic `POST /api/usage/consume` endpoint is available to browser studios for export/action events, but local-only operations must call it explicitly to be metered.

## Smoke tests

```bash
curl -s https://tampslat.tampconsulting.space/api/health
```

Then create/sign in to a test account, open Usage & Limits, run a CSV analysis, and confirm the usage counter increments. Test checkout with a low-value test transaction. Confirm the plan changes only after server verification and that the webhook can be delivered twice without granting duplicate value.

## Important boundaries

- Do not deploy the updated Worker before applying migration 0002.
- Do not set live Flutterwave credentials until test-mode checkout, webhook verification, callback verification and plan expiry have been checked.
- The displayed non-NGN currency figures remain indicative display prices; Nigeria is routed to NGN. Confirm final commercial prices, taxes, refunds and local payment methods in the Flutterwave merchant dashboard.
- This implementation grants a 30-day plan period, not an automatic recurring subscription.
- Browser-only local file transformations are not automatically metered. The page must call `TAMPSLAT_API.consumeUsage(feature, units)` for an export/action to be included.
