# TAMPslat backend — Cloudflare Workers + D1

This release adds a real server-side foundation for TAMPslat. It is not production-ready until you create the Cloudflare resources, configure secrets, set the real app origin, deploy, and test on the deployed domain.

## Implemented API

- `GET /api/health` — service and feature readiness.
- `POST /api/auth/signup` and `/api/auth/login` — password hashing with PBKDF2-SHA-256, database accounts, server-side sessions, Secure/HttpOnly/SameSite cookies, basic IP rate limits.
- `POST /api/auth/logout` and `GET /api/auth/me` — revoke/check session.
- `POST /api/ai/generate` — server-side OpenAI Responses API proxy; key is only a Worker secret; authenticated users only; prompt length/rate limits; credit debit and refund on provider failure; ledger entries.
- `POST /api/tools/csv/analyze` — authenticated CSV structure, duplicate, blank-cell and inconsistent-column analysis.
- `POST /api/tools/ocr` — optional authenticated image OCR using a Cloudflare Workers AI binding; rejects unsupported types and oversized files.
- `GET/POST /api/work`, `DELETE /api/work/:id` — account-scoped cloud work-item metadata/content persistence.
- `GET /api/billing/summary` — account plan, expiry, provider and AI credit ledger summary.\n- `POST /api/billing/checkout` — server-priced Flutterwave or Paddle checkout; provider is selected from Cloudflare country data, not browser input.\n- `GET /api/billing/verify` — verifies Flutterwave return references against the provider API before applying entitlements.\n- `POST /api/webhooks/flutterwave` and `POST /api/webhooks/paddle` — signed webhook handling, provider verification, event idempotency and paid plan/credit grants.

## 1. Create a Cloudflare D1 database

Install a current Node.js LTS version and Wrangler, then from this project folder run:

```bash
npm install --save-dev wrangler
npx wrangler login
npx wrangler d1 create tampslat-db
```

Copy the returned `database_id` into `wrangler.toml`, replacing `REPLACE_WITH_D1_DATABASE_ID`.

Apply the schema to the remote database:

```bash
npx wrangler d1 migrations apply tampslat-db --remote
```

For local development use:

```bash
npx wrangler d1 migrations apply tampslat-db --local
```

## 2. Configure secrets and settings

Edit `wrangler.toml` and replace `APP_ORIGIN` with the exact public origin, e.g. `https://your-real-tampslat-domain.com` (no trailing slash). Keep the Worker and frontend on the same origin where possible. If hosted separately, list exact origins comma-separated.

Add the AI provider key as a secret; never add it to HTML, JavaScript, Git, or this file:

```bash
npx wrangler secret put OPENAI_API_KEY
```

The default model is `gpt-4.1-mini`; change `AI_MODEL` in `wrangler.toml` only to a model available to your OpenAI project. AI usage costs money on the provider account. The Worker currently charges one internal credit per successful AI call by default; configure `AI_CREDIT_COST` and the account credit-grant/payment flow before selling credits.

Optional OCR: enable Workers AI for your Cloudflare account and add the appropriate AI binding to the Worker configuration. The selected model is `@cf/microsoft/trocr-base-printed`; verify model availability in your account/region before relying on it. Browser OCR remains available as a local fallback.

## 3. Configure sandbox payments (do not use live credentials for testing)

The payment integration is deliberately **sandbox-first**. The Worker defaults to `PAYMENT_MODE=sandbox` unless you explicitly set it to `live`. Do not switch to live until sandbox tests, webhook delivery, entitlement checks and refund/cancellation handling have been reviewed.

Add sandbox credentials as Cloudflare Worker secrets. Wrangler prompts for each value; never paste secret values into GitHub or frontend files:

```bash
npx wrangler secret put flutterwave_secret_key_sandbox
npx wrangler secret put flutterwave_webhook_secret_hash_sandbox
npx wrangler secret put paddle_api_key_sandbox
npx wrangler secret put paddle_webhook_secret_sandbox
```

Configure these webhook destinations in the provider dashboards:

- Flutterwave: `https://tampslat.tampconsulting.space/api/webhooks/flutterwave` and set the webhook secret hash to the same sandbox value stored as `flutterwave_webhook_secret_hash_sandbox`.
- Paddle sandbox: `https://tampslat.tampconsulting.space/api/webhooks/paddle`; store that notification destination's endpoint secret as `paddle_webhook_secret_sandbox`.

The backend derives prices from its own server-side catalogue. It ignores browser-supplied amounts and provider selection. Nigeria uses Flutterwave hosted checkout with card, bank transfer and USSD options where the merchant account/provider makes them available. Flutterwave plan purchases currently grant 30 days and require manual renewal so those local payment methods remain available; they are not auto-renewing subscriptions. Paddle plans use monthly recurring checkout. AI credit packs are one-time purchases.

The new `backend/migrations/0002_billing.sql` adds billing orders, subscription metadata and webhook idempotency. **Do not deploy the billing Worker or accept payments before applying the migration**:

```bash
npx wrangler d1 migrations apply tampslat-db --remote
```

For local testing, apply to the local D1 database instead:

```bash
npx wrangler d1 migrations apply tampslat-db --local
```

The payment flow is not yet approved for live charges. Test using provider sandbox cards/accounts, verify successful and failed payments, duplicate webhooks, mismatched amounts/currencies, insufficient credits and plan expiry before changing `PAYMENT_MODE` to `live`. Live mode uses the existing `flutterwave_secret_key`, `flutterwave_webhook_secret_hash`, and `paddle_api_key` secrets plus a new `paddle_webhook_secret` secret. It also requires both Worker variables `PAYMENT_MODE=live` and `ALLOW_LIVE_PAYMENTS=true`; without the explicit approval flag, the checkout endpoint refuses live payments.

## 4. Run and deploy


```bash
npx wrangler dev
```

In another terminal, or after local dev has started, test the health endpoint:

```bash
curl -s http://127.0.0.1:8787/api/health
```

Deploy:

```bash
npx wrangler deploy
```

The included frontend client calls `/api` on the same origin. If the Worker uses a separate hostname, edit `backend-client.js` and change `const base = String(window.TAMPSLAT_API_BASE || '').replace(/\/$/, '');` to use your API origin, e.g. `const base = 'https://your-api-host.example';` and configure CORS with that exact origin.

## 5. Test the account and AI flow

```bash
curl -i -X POST http://127.0.0.1:8787/api/auth/signup \
  -H 'content-type: application/json' \
  -d '{"email":"test@example.com","password":"ChangeThisPassword123!"}'
```

The signup response sets an HttpOnly session cookie. Use a cookie-aware browser for the full flow. Open `signup.html`, create a test account, confirm you land in the workspace, then use the AI panel. The free account starts with the configured `FREE_AI_CREDITS` (default 5). AI requests return `401` when signed out, `402` when credits are insufficient, and a clear provider configuration error if `OPENAI_API_KEY` is missing.

## Production blockers / important limitations

- **Email verification and password reset are not implemented yet.** Add a transactional email provider and expiring one-time tokens before public launch. The current recovery/change-password pages remain UI only.
- **Google OAuth is not implemented yet.** Remove or label the Google buttons until OAuth credentials and callback/session validation are configured.
- **Payments are sandbox-ready but not live-approved.** Flutterwave/Paddle checkout creation, server-side verification, signed webhooks and idempotent plan/credit grants are implemented. The migration and sandbox credentials/webhook destinations still need to be configured and tested. Flutterwave plans currently renew manually for 30-day access; Paddle plans use recurring monthly billing. Refund automation, provider-side subscription cancellation controls and full billing lifecycle QA remain open. Never grant value based on a browser redirect.
- **Admin role provisioning is not included.** Do not expose `admin.html` as a real admin console; its current values are demo data.
- **Data at rest:** D1 is account-scoped, but user work content currently has no application-level encryption. Do not store highly sensitive client, identity, medical, financial-account or confidential business documents until retention, deletion, backup and encryption policies are decided.
- **File processing:** PDF/ZIP transformations remain primarily browser-side. CSV analysis API accepts CSV text (up to 1.5 MB). OCR endpoint supports image files only; scanned PDF OCR and full cloud file vault are not yet implemented.
- **Security review:** add automated tests, abuse monitoring, account lockout strategy, CSRF review for deployment topology, data deletion/export, security headers on the static host, and a professional penetration test before launch. Rate limits are basic D1 counters and need operational monitoring/cleanup for scale.
- **Credits:** signup credits are promotional and not payment-backed. Payment events must be idempotent and verified server-side before any paid plan/credit changes.

## API examples

All endpoints other than `/api/health` and signup/login require a valid session cookie.

```bash
# Current session
curl -i -b cookies.txt http://127.0.0.1:8787/api/auth/me

# Live AI request
curl -i -b cookies.txt -X POST http://127.0.0.1:8787/api/ai/generate \
  -H 'content-type: application/json' \
  -d '{"task":"document","prompt":"Draft a short professional project proposal outline."}'

# Analyze CSV content
curl -i -b cookies.txt -X POST http://127.0.0.1:8787/api/tools/csv/analyze \
  -H 'content-type: application/json' \
  -d '{"filename":"sample.csv","csv":"name,amount\nAda,10\nAda,10\n"}'
```


## Connect the frontend to the API
If the static website and Worker are hosted separately, set `window.TAMPSLAT_API_BASE` to the deployed Worker origin before `backend-client.js` loads, for example `https://tampslat-api.<your-subdomain>.workers.dev`. Do not include `/api` at the end. A 405 from a static hosting origin means the request reached the website host rather than the API Worker. Configure the real Worker URL after deployment; do not put secrets in frontend code.
