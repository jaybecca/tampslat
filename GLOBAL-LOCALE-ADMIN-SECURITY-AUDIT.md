# TAMPslat Global Locale, Admin & Security Audit

## Audit result

This package improves the frontend, adds a Cloudflare edge locale endpoint, adds a role-gated admin overview API, documents the backend setup, and restores a GitHub Actions DevSecOps workflow. It is not a production certification and no live Cloudflare account, D1 database, provider key, browser session or deployed endpoint was available for testing.

## Admin page: NOT COMPLETE

Before this update `admin.html` was entirely sample data and a local-only provider settings preview. It had no login enforcement, no server-side role check, no real analytics, no live billing, and no saved configuration. It is now explicitly labelled as preview-only, refuses API key entry, and attempts to load live account counts from `/api/admin/overview`. That endpoint requires a valid session and `users.role='admin'`; ordinary users receive 403. The rest of the dashboard remains illustrative until wired to further admin APIs.

There is intentionally no public admin registration or browser-side role switch. Provision the first administrator out-of-band using a controlled D1 console session after verifying the account identity. Do not expose an admin-creation form publicly.

## Global language and geolocation

Supported UI languages currently declared by the project: English, French, Portuguese, Spanish and Arabic. The dictionaries are partial and page coverage is incomplete. **100% translation is not achieved and must not be advertised as such.** The current string-replacement dictionaries omit many labels, placeholders, validation/error strings, dynamic content, generated documents, tool-specific controls and accessibility labels. Full translation requires a translation inventory per route, professional review of each language, dynamic message catalog integration, and RTL testing.

The site locale client now tries same-origin `/api/locale` first rather than sending a visitor's IP to a third-party IP lookup service. Cloudflare Workers can read the coarse country code from `request.cf.country`; the endpoint maps known countries to the five supported languages and a limited currency list. This is a convenience default only: country is not language, mapping is intentionally conservative, unsupported countries default to English/USD, and a user's explicit language/currency choice takes precedence. The endpoint does not use GPS or precise location. When the static site is not routed through this Worker, browser-language fallback is used.

## Backend and secrets

- `OPENAI_API_KEY` is declared as a required Worker secret; add it through Cloudflare Worker > Settings > Variables and Secrets > Add > Secret, or `npx wrangler secret put OPENAI_API_KEY`.
- Never put provider API keys in `wrangler.toml [vars]`, HTML, JavaScript, localStorage, admin form fields, GitHub source or client-visible configuration.
- Non-secret settings such as `AI_MODEL`, `APP_ORIGIN`, credit costs and file limits may be normal variables.
- Configure D1 database ID and migrations before deployment. Replace the placeholder database ID and APP_ORIGIN.
- The new admin overview endpoint is role-gated, but admin account provisioning, user management, support tools, plan changes, billing/payment webhooks, email verification, password reset, OAuth, data export/deletion, encryption at rest, retention controls and security monitoring remain incomplete.
- Existing backend controls include PBKDF2 password hashing, hashed random session tokens, Secure/HttpOnly/SameSite cookies, origin allow-list, basic D1 rate limits, authenticated AI/CSV/OCR/work routes, credit debits/refunds and audit events. These are a foundation, not comprehensive protection.
- Rate limit storage needs cleanup/expiry and operational monitoring. Review CSRF protections for any cross-origin deployment, session revocation, login abuse/credential stuffing, content-size limits, error handling, dependency pinning, backup/restore and D1 access policy.
- The browser Smart Vault uses Web Crypto AES-GCM and PBKDF2 locally; this is distinct from server-side encryption and has no recovery if the passphrase is lost. It does not make all tools automatically secure.
- Tools that run locally in the browser are not automatically protected by API authentication. Cloud processing endpoints must enforce authentication, authorization, quotas, file validation, size/time limits and ownership checks individually. The current API does not yet expose every file transformation as a secure cloud endpoint.

## OCR enhancement

OCR remains usable without AI. The added optional section explains Design Studio (colour, hierarchy, spacing and preview) and AI Improvement Studio (proofread, summarise, organise and translation). AI calls use the authenticated backend client and credit checks; the AI result is shown as a suggestion and is not silently written over the source text. OCR is still local browser OCR by default; optional server OCR requires a configured Workers AI binding and currently supports image uploads only.

## DevSecOps

A GitHub Actions workflow is included for syntax checks, Trivy filesystem vulnerability/misconfiguration/secret scanning at HIGH/CRITICAL, and dependency review on pull requests. A workflow file is not evidence that a scan passed. Run it in GitHub and remediate any findings. Add branch protection requiring this workflow before merge. Consider CodeQL/SAST, SBOM generation, image scanning for converter containers, licence review and scheduled scans.

## Deployment checklist

1. Set real `APP_ORIGIN`, D1 `database_id`, and confirm the Worker hostname/routing.
2. Apply D1 migrations remotely.
3. Add `OPENAI_API_KEY` as a Cloudflare Secret (never a plain variable).
4. Optionally configure the Workers AI binding `AI` for server OCR.
5. Deploy only after staging tests; this package has not been deployed.
6. Verify `/api/health`, `/api/locale`, signup/login/logout, user 403 on admin overview, admin 200, AI credit debit/refund, OCR limits, CORS, cookies and D1 ownership.
7. Complete language inventory and native-speaker review before claiming 100% translated.
