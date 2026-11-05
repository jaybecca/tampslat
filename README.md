# TAMPslat — Digital and Ready

TAMPslat is a browser-first productivity workspace for freelancers, consultants, teams and growing businesses. It combines document and business tools, specialist studios, reusable templates and practical business guidance in one responsive interface.

## Current product areas

- PDF and document utilities, file conversion tools and ZIP workflows.
- Spreadsheet and CSV analysis tools.
- Document & Business Operations, including career documents and professional business resources.
- Presentation, Ebook, 3D and Batch studios, where their engines and account entitlements are available.
- A 100-template editable library across business planning, marketing, finance, HR, education, creative work, customer service, project management, productivity and community programmes.
- 50 SEO-focused articles on digital tools, business workflows, AI, documents, customer experience and business growth.
- Account sign-in, saved work, AI requests and monthly usage reporting through the Worker API.
- Regional Flutterwave checkout for supported African markets; Nigeria defaults to NGN.

## Plans and usage

The Free, Starter, Pro and Business plans are described in `plans-data.js`. Monthly limits are enforced by the Worker for AI requests, OCR pages, CSV analyses and saved work. A shared studio-action allowance is reserved alongside server-backed actions. Export events can be recorded through `POST /api/usage/consume`.

AI request allowances and AI credit balances are separate. An AI request needs both an available plan allowance and sufficient credits. Local-only browser actions are not automatically metered; each studio must call `TAMPSLAT_API.consumeUsage(feature, units)` to record an export or local action.

Usage counters reset on the first day of each calendar month in UTC. Plan purchases currently grant 30 days after verified payment; recurring subscription renewal is not enabled.

## Local development

This is a static frontend with a Cloudflare Worker API.

```bash
npm install
npm run dev
```

Use the project's existing Wrangler configuration and confirm the correct Cloudflare Worker and D1 database before deploying. Do not replace production IDs or bindings with placeholders.

## Deployment sequence

1. Review the feature branch and run the repository CI/security checks.
2. Back up the D1 database.
3. Apply `backend/migrations/0002_usage_payments.sql` to the intended remote D1 database.
4. Configure Worker secrets `FLW_SECRET_KEY` and `FLW_SECRET_HASH`, and set `APP_ORIGIN`.
5. Configure the Flutterwave webhook and test checkout, webhook verification, payment return and plan activation using test credentials.
6. Deploy the Worker and static assets only after the migration and environment configuration are confirmed.
7. Test the site on desktop and mobile, including account usage, all studio entry points, theme contrast, payment flow and language switching.

Detailed steps: [PAYMENTS-USAGE-SETUP.md](PAYMENTS-USAGE-SETUP.md), [BACKEND-SETUP.md](BACKEND-SETUP.md), and [PAYMENT-PROVIDER-SETUP.md](PAYMENT-PROVIDER-SETUP.md).

## Payment and security boundaries

- Supported African customers are routed to Flutterwave hosted checkout. Nigeria defaults to NGN.
- The Worker verifies the provider transaction before granting plan access or AI credits. A browser redirect is not proof of payment.
- Flutterwave secrets must remain in Cloudflare Worker secrets. Never commit secret keys or expose them in browser JavaScript.
- Automatic recurring subscriptions, refunds and chargebacks are not implemented in this release.
- Email verification, password reset and Google OAuth require separate production configuration.
- Full R2 cloud-file-vault storage and its storage quota accounting are not enabled.
- Review converted, OCR and AI-assisted output before relying on it. Avoid uploading confidential or regulated data unless authorised.

## Product resources

- [Editable template library](templates.html)
- [TAMPslat Insights](blog.html)
- [Usage & Limits](usage.html)
- [Support](support.html)
- [Pricing](pricing.html)

© TAMPslat. Digital and Ready.
