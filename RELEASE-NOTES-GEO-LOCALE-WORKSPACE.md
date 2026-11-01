# TAMPslat Geo, Locale & Workspace Update

- Added shared `site-locale.js` for language selector persistence, translations on standalone Pricing and Support pages, and best-effort IP-based defaults for language and currency. A manually selected language/currency is retained rather than silently overwritten.
- Added consistent responsive workspace navigation and grid/card alignment rules to reduce scattered layouts.
- Reduced auth logo display width and removed white background/padding around the logo element.
- Payment choices use neutral visible wording; provider routing remains an internal regional selection.

## Important limitations
- IP geolocation requires network access to `ipapi.co`; browser privacy settings, blockers, or offline use may prevent detection. Browser-language fallback is used when possible.
- Translations on standalone Pricing and Support pages cover key interface copy and FAQ headings; they are not a full professional translation of every paragraph. Workspace and homepage continue using their existing dictionaries.
- Checkout provider names are hidden in the user interface, but payment is still not live until valid provider credentials/price IDs, server-side checkout creation, webhook signature verification, and entitlement handling are configured.
- Browser end-to-end tests and live deployment were not performed.
