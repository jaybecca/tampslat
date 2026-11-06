# TAMPslat email verification: one-time-code setup

The TAMPslat signup flow now asks users to enter a one-time email code. This avoids a known email-link problem: some mailbox security scanners prefetch confirmation URLs before the recipient opens the message, which can consume a one-time link immediately.

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
- The signup page accepts the emailed code.
- The Worker verifies the code with Supabase Auth, provisions the TAMPslat account, and creates a secure browser session.
- Users can request a replacement code. The page enforces a 60-second resend cooldown to match Supabase's default signup-confirmation rate limit; the Worker also limits resends to 3 per 15 minutes, and Supabase applies its own email rate limits.
- Changing OTP expiry to 1800 seconds does not by itself change a confirmation link into a code. The Confirm signup template must use `{{ .Token }}`.
- Invalid, expired and already-used codes are rejected.

**Important:** the dashboard email-template change is separate from GitHub deployment. Until the Confirm signup template is changed to use `{{ .Token }}`, Supabase will continue sending its existing confirmation-link email and the code-entry flow will not receive a code.


## Production email delivery (required)

A successful signup API response means Supabase Auth accepted the request; it does not prove that the message reached the mailbox. For reliable production delivery, configure a custom SMTP provider in **Authentication → SMTP Settings**. Use the SMTP hostname, port, username, and password supplied by the mailbox provider; use the full mailbox address as the SMTP username and a sender address on a domain you control. Save the settings and use Supabase's test-email option before testing signup again. Check spam/quarantine and the SMTP provider's delivery log if a test message is accepted but not visible.

Do not put an SMTP password in GitHub, the Worker, browser code, or wrangler.toml.

## Google sign-in setup

1. In **Authentication → Sign In / Providers → Google**, enable Google and enter the Google OAuth client ID and client secret.
2. In Google Cloud Console, register this authorized redirect URI: `https://qqfmsvepxxagszzhhjap.supabase.co/auth/v1/callback`.
3. In **Authentication → URL Configuration**, set the Site URL to `https://tampslat.tampconsulting.space` and allow `https://tampslat.tampconsulting.space/**`.
4. Save the provider settings. The app returns to `/auth-oauth.html`, verifies the Supabase access token on the Worker, and then creates the TAMPslat session.

The Google client secret belongs only in the Supabase dashboard. The browser uses the public publishable key; it must never receive the Google client secret or a Supabase service-role key.
