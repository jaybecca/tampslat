# TAMPslat Enterprise Tools Release

## ZIP Processor additions
- Create ZIP archives from selected local files.
- Extract files individually from ZIP archives.
- Merge multiple ZIP archives into one ZIP (later entries replace same-path entries).
- View ZIP entries and export an edited ZIP with renamed or removed files.
- Split a ZIP into multiple smaller ZIP packages by file count.
- Encrypt a ZIP into a TAMPslat `.tse` encrypted package using PBKDF2 + AES-GCM, and decrypt `.tse` packages back to ZIP. This is deliberately **not** advertised as a standard password-protected ZIP.
- Convert ZIP to TAR and import basic TAR archives into ZIP.

## PDF Studio additions
- Existing merge, split, rotate, protect and signature tabs remain.
- Added PDF information inspection (file size and page count) and a dedicated selected-page extraction flow.

## Pricing and authentication
- Standalone pricing now uses the same four advertised plan prices and core benefit lists as the homepage, including currency-specific price values.
- Selected display currency is remembered between homepage and pricing page.
- Login, signup, forgot-password and change-password pages now have a language selector for English, French, Portuguese, Spanish and Arabic, with RTL direction for Arabic.
- Authentication logo uses a tightly cropped asset to reduce excess white space.
- Removed the redundant “TAMPslat · Digital and Ready” tagline from the workspace sidebar. The View plans card is hidden on mobile; pricing remains accessible through the profile dropdown.

## Limitations
- Browser libraries are loaded from third-party CDNs, so an internet connection is required for ZIP/PDF libraries.
- ZIP-to-TAR/TAR-to-ZIP support targets basic, unencrypted archives; advanced archive types such as RAR, 7Z and multi-volume archives are not supported.
- `.tse` is a TAMPslat-specific encrypted container, not an interoperable encrypted ZIP standard. Keep the password safe; it cannot be recovered.
- PDF password protection availability depends on the bundled PDF library and its supported encryption features; test with representative files before relying on it.
- This release has syntax and ZIP integrity checks, but no full browser end-to-end test or production deployment was performed.


## 2026-10-28 recovery update
- Restored `tools.html` from the earlier Enterprise Workspace Release to roll back the later workspace layout changes and remove duplicated routing handlers that could trigger repeated renders.
- Kept a single hash/popstate route flow for workspace navigation.
- Added shared language translation handling for Pricing dynamic plan cards and their features. Translation coverage is broad but should still be checked by a native speaker.
- Replaced the homepage payment-provider choice buttons with a single generic secure-checkout action.
- Pricing and AI-credit actions now request `/api/billing/checkout` and redirect only if the server returns a validated HTTPS `checkoutUrl`. The current worker deliberately returns HTTP 503 until real merchant credentials, region-to-provider routing, payment verification, and webhook handling are configured. No card or bank details are collected by the frontend.
- IP geolocation remains best-effort and respects a previously saved manual language/currency choice.
