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
- `GET /api/billing/summary` — account plan and AI credit ledger summary.

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

## 3. Run and deploy

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

## 4. Test the account and AI flow

```bash
curl -i -X POST http://127.0.0.1:8787/api/auth/signup \
  -H 'content-type: application/json' \
  -d '{"email":"test@example.com","password":"ChangeThisPassword123!"}'
```

The signup response sets an HttpOnly session cookie. Use a cookie-aware browser for the full flow. Open `signup.html`, create a test account, confirm you land in the workspace, then use the AI panel. The free account starts with the configured `FREE_AI_CREDITS` (default 5). AI requests return `401` when signed out, `402` when credits are insufficient, and a clear provider configuration error if `OPENAI_API_KEY` is missing.

## Production blockers / important limitations

- **Email verification and password reset remain outstanding.** Add a transactional email provider and expiring one-time tokens before public launch. The current recovery/change-password pages remain UI only.
- **Google OAuth remains outstanding.** Remove or label the Google buttons until OAuth credentials and callback/session validation are configured.
- **Payments:** Flutterwave Standard checkout creation, webhook hash validation, server-side transaction verification, 30-day plan activation and AI credit top-ups are implemented. Apply migration `0002_usage_payments.sql`, configure `FLW_SECRET_KEY` and `FLW_SECRET_HASH`, set `APP_ORIGIN`, and complete test-mode transactions before accepting live payments. Automatic recurring subscription billing, refunds and chargebacks are not implemented. Never grant paid access from a browser redirect alone.
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
