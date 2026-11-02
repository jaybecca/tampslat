# TAMPslat Platform-wide Audit & UX Upgrade

## Changes in this package
- Expanded the public homepage catalogue from nine to eleven entries, adding Document Converter Studio and Ebook Studio with translations in French, Portuguese, Spanish and Arabic.
- Updated login/signup safe redirect allowlists for the two added studios.
- Added a Nigeria-first Flutterwave checkout explanation covering bank transfer, cards and USSD where supported. The checkout remains disabled until server-side merchant setup and webhook verification are complete; this package does not claim to accept payment.
- Added a compact account-menu AI credit balance meter backed by the authenticated billing summary endpoint, plus local preferences for low-credit, renewal and three-day expiry alerts. Alert delivery and renewal-date scheduling still require a production notification/billing service.
- Added support guidance for document conversion and EPUB authoring and corrected the studio count.
- File Studio module selection now scrolls the selected tool workspace into view and updates the URL hash for direct navigation.
- Added a shared language selector to login, signup and account recovery pages, with translations for the primary form labels and actions.

## Operational limits to resolve before launch
- Flutterwave/Paddle checkout is still disabled in `backend/worker.js`; do not accept payments until checkout session creation, webhook signature verification, idempotency and entitlement updates are implemented and sandbox-tested.
- Renewal and expiry dates are not currently stored/exposed by the billing API. Notification switches save preferences locally only; they do not send email or browser alerts.
- The credit bar is a compact visual balance indicator on a 0–100 credit display scale, not a plan quota or percentage of monthly allowance.
- Some specialist studios depend on local Docker engines or external CDN libraries. Check `BACKEND-SETUP.md` and `FILE-STUDIO-ENGINE-SETUP.md` before deployment.
- Policy pages remain starter policies and need jurisdiction-specific legal review, particularly privacy/data transfers, digital subscription cancellation, refunds, taxes and AI data handling.
