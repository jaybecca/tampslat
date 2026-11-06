# TAMPslat email verification: one-time-code setup

The TAMPslat signup flow now asks users to enter a one-time email code. This avoids a known email-link problem: some mailbox security scanners prefetch confirmation URLs before the recipient opens the message, which can consume a one-time link immediately.

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
- Users can request a replacement code. The application applies a resend rate limit, and Supabase applies its own email rate limits.
- Invalid, expired and already-used codes are rejected.

**Important:** the dashboard email-template change is separate from GitHub deployment. Until the Confirm signup template is changed to use `{{ .Token }}`, Supabase will continue sending its existing confirmation-link email and the code-entry flow will not receive a code.
