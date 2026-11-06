# TAMPslat email verification: one-time-code setup

The preferred TAMPslat signup flow asks users to enter a one-time email code. This avoids a known email-link problem: some mailbox security scanners prefetch confirmation URLs before the recipient opens the message, which can consume a one-time link immediately. The application also accepts a Supabase confirmation link when the project email template is still configured for links.

## Production redirect URL settings

In **Authentication → URL Configuration**, use the production site address:

- **Site URL:** `https://tampslat.tampconsulting.space`
- **Additional Redirect URLs:** `https://tampslat.tampconsulting.space/**`

The Worker builds signup and password-recovery redirects from the production `APP_ORIGIN` in `wrangler.toml`. Do not leave localhost as the production Site URL or as the only allowed redirect. Keep localhost entries only if you separately need local development.

## Supabase Dashboard settings

1. Open **Authentication → Sign In / Providers → Email**.
2. Set **Email OTP Expiration** to **1800 seconds** (30 minutes).
3. Open **Authentication → Email Templates → Confirm signup**.
4. Replace the confirmation-link body with the following OTP template:

```html
<h2>Verify your TAMPslat account</h2>
<p>Use this one-time code to confirm your email address:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:8px">{{ .Token }}</p>
<p>This code expires in 30 minutes and can only be used once.</p>
<p>If you did not create a TAMPslat account, you can ignore this email.</p>
```

5. Save the template and send a new test signup to confirm that the message contains a code rather than a confirmation URL.

The OTP expiry setting also governs other email OTP and confirmation flows. Keep the duration at 1800 seconds; do not increase it to compensate for links that are being pre-fetched.

## What the application does

- Signup sends the confirmation email through Supabase Auth.
- The signup page accepts the emailed code. If Supabase sends a confirmation link instead, the existing `auth-confirmed.html` callback validates it and creates the same secure TAMPslat session.
- The Worker verifies the code with Supabase Auth, provisions the TAMPslat account, and creates a secure browser session.
- Users can request a replacement code. The page enforces a 60-second resend cooldown to match Supabase's default signup-confirmation rate limit; the Worker also limits resends to 3 per 15 minutes, and Supabase applies its own email rate limits.
- Changing OTP expiry to 1800 seconds does not by itself change a confirmation link into a code. The Confirm signup template should use `{{ .Token }}` for the code-first flow. If the template still uses `{{ .ConfirmationURL }}`, the app accepts the link as a fallback.
- Invalid, expired and already-used codes are rejected.

**Important:** the dashboard email-template change is separate from GitHub deployment. Use `{{ .Token }}` for the recommended code-first flow. The fallback link handler keeps accounts usable if the template still sends `{{ .ConfirmationURL }}`.
