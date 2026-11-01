# TAMPslat payment integration configuration

## Provider roles
- Flutterwave: regional checkout for Nigeria and other supported African markets.
- Paddle: international merchant-of-record checkout where supported.

The public checkout selector is a provider-selection UI only. It deliberately does not collect card details or claim a payment has succeeded. Do not enable paid-plan activation until server-side checkout creation and webhook verification are implemented and tested.

## Cloudflare Worker secrets
Set secrets through `wrangler secret put`, never in HTML, JavaScript, Git, or `[vars]`.

Flutterwave:
- `FLW_SECRET_KEY`
- `FLW_SECRET_HASH` (webhook verification secret hash)

Paddle:
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_ENV` as a non-secret environment setting (`sandbox` or `production`)

Public configuration may include only provider client-side identifiers and public price IDs, where the provider requires them. Do not expose secret keys.

## Required backend flow before launch
1. Authenticate the customer and validate plan/price IDs against a server-side allowlist.
2. Create the provider checkout session from the Worker using server-held secrets.
3. Return only the provider's hosted checkout URL or short-lived client token.
4. Verify webhook signatures using the raw request body and provider-specific signing rules.
5. Make webhook processing idempotent; store provider event IDs and reject replays.
6. Activate/renew/cancel entitlements only from verified webhook events, never from browser redirects.
7. Record payment state transitions in an append-only audit log.
8. Test success, decline, cancellation, duplicate webhook, invalid signature, refund and subscription lifecycle cases in provider sandbox environments.

## Current status
The UI offers Flutterwave and Paddle choices, but checkout is intentionally disabled pending the backend flow above. This is not a live payment integration. Configure credentials only after the server routes and webhook verification are implemented.
