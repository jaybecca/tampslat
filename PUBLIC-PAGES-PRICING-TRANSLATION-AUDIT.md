# TAMPslat public pages, pricing and language review

## Implemented in this package
- Introduced `plans-data.js` as the canonical plan catalogue consumed by both homepage and pricing page. English benefit claims and displayed prices now come from the same data source.
- Rewrote plan descriptions and benefits to distinguish Free, Starter, Pro and Business without implying that AI credits, cloud storage, payment or team entitlements are already live.
- Reworked homepage product/tool descriptions to reflect the current File Studio, PDF, Business & Document, OCR & Smart Vault, Spreadsheet and Batch capabilities.
- Added a compact light/dark theme control to the public homepage; it persists `tampslat-theme` in local storage and defaults to light.
- Expanded the Support Centre with file formats, privacy/data flow, mobile use, regional settings, currency estimates, AI availability, safe AI review, security reporting, account requests and policy navigation.
- Added translations for the additional Support Centre questions and core support guidance in French, Portuguese, Spanish and Arabic.
- Preserved existing authentication language selector and dictionaries, pricing language dictionaries, homepage language dictionaries and policy modal translations.

## Important translation status
This is **not certified 100% page-wide translation coverage**. The five languages are English, French, Portuguese, Spanish and Arabic. The existing codebase has separate translation mechanisms for the homepage, pricing, authentication and workspace. Dynamic validation, some support answers, generated previews, every tool-specific state, accessibility labels, error responses and some policy/support copy still require a systematic glossary-driven review by native speakers. The new support FAQ strings have translations, but the older support FAQ collection is not fully translated by the current `site-locale.js` dictionary. Do not advertise the product as fully translated until the coverage audit and native-language QA are complete.

## Admin/auth/policy and pricing production caveats
- Login, registration, reset-password and change-password screens retain their existing frontend language switcher. Real account flows depend on the configured auth backend and email delivery.
- Privacy, Terms, Refund, AI Use and Cookie policies remain linked from the homepage policy panel and pricing footer. Their wording must be reviewed by qualified counsel for the jurisdictions where TAMPslat will operate.
- Pricing and currency conversions remain illustrative. Do not accept payment until the payment provider, taxes, subscription lifecycle, webhook signature verification, cancellation/refund operations and server-side entitlements are implemented and tested.
- The theme toggle is a presentation preference only; it does not change security or account settings.

## Recommended next QA pass
1. Build a page inventory of every visible and dynamic string for all five locales.
2. Add stable translation keys rather than relying on matching rendered text.
3. Verify every language on desktop/mobile, including RTL Arabic layout and keyboard/screen-reader labels.
4. Test plan name, feature list, price, currency and language changes on both homepage and pricing page from one canonical data source.
5. Run staging tests for sign-in, registration, reset/change password, support contact and policy navigation.
