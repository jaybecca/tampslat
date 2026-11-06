# TAMPslat payment integration configuration

## Provider roles
- Flutterwave: regional checkout for Nigeria and other supported African markets.
- Paddle: international merchant-of-record checkout where supported.
- Checkout is created by the Cloudflare Worker. Payment success is confirmed server-side from verified provider responses/webhooks; a browser redirect alone does not activate a plan.

## Worker configuration

Set secret values with `npx wrangler secret put NAME`. Never put provider secrets in HTML, browser JavaScript, Git, or `[vars]`.

Live secret bindings:
- `flutterwave_secret_key`
- `flutterwave_webhook_secret_hash`
- `paddle_api_key`
- `paddle_webhook_secret`

Sandbox secret bindings:
- `flutterwave_secret_key_sandbox`
- `flutterwave_webhook_secret_hash_sandbox`
- `paddle_api_key_sandbox`
- `paddle_webhook_secret_sandbox`

Non-secret Worker variables:
- `PAYMENT_MODE`: `sandbox` or `live`
- `ALLOW_LIVE_PAYMENTS`: must be `true` before the Worker will create live checkout sessions; keep it `false` until explicit launch approval.

The Worker defaults to sandbox mode. Do not switch production to live mode or enable live payments without explicit approval and completed sandbox verification.

## Monthly and annual billing
- Monthly paid plans use the published monthly plan price.
- Annual paid plans receive a 20% discount and are charged as one annual payment.
- Paddle creates a recurring subscription on the selected monthly or annual billing interval.
- Flutterwave purchases are one-time payments and require manual renewal: 30 days of access for monthly purchases and 365 days for annual purchases.
- AI credit top-ups are one-time purchases and are separate from plan allowances.

The server calculates the checkout amount from its own plan catalogue. It does not trust a price supplied by the browser. Provider webhook processing is idempotent and entitlement changes are based on verified provider events.

## Database migrations
The Worker uses the D1 database configured in `wrangler.toml`. Apply pending migrations before deploying a release that depends on new tables or columns:

```bash
npx wrangler d1 migrations apply tampslat-db --remote
```

The current migration chain includes the billing tables, monthly account usage tracking, annual billing-cycle field, and per-studio usage counters/reservations. Confirm the migration status against the intended D1 database before applying it.

## Verification checklist
1. Confirm the Worker is using the intended sandbox bindings.
2. Verify monthly and annual checkout creation in each supported provider sandbox.
3. Verify successful payment, decline, cancellation, duplicate webhook, invalid signature, refund, and subscription lifecycle handling.
4. Confirm monthly plans grant 30 days and annual plans grant 365 days where the provider does not supply an authoritative subscription period.
5. Confirm account-save, CSV-check, and per-studio usage counters remain independent.
6. Do not use real payment methods or enable live mode during routine CI validation.
