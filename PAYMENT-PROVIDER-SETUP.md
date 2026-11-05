# TAMPslat payment provider configuration

TAMPslat now uses Flutterwave Standard hosted checkout for supported African markets. Nigeria is routed to NGN automatically. The old Paddle selection has been removed from the customer checkout interface.

## Implementation status

- Server-created Flutterwave checkout sessions: implemented.
- Server-side transaction verification: implemented.
- Webhook signature check using the configured Flutterwave secret hash: implemented.
- Idempotent payment state transition and audit event: implemented.
- Thirty-day plan activation after verified payment: implemented.
- AI credit top-ups after verified payment: implemented.
- Automatic recurring subscriptions, refunds and chargebacks: not implemented.

## Configure before live use

Follow [PAYMENTS-USAGE-SETUP.md](PAYMENTS-USAGE-SETUP.md). Apply the D1 migration, configure `FLW_SECRET_KEY` and `FLW_SECRET_HASH` as Worker secrets, set `APP_ORIGIN`, and register this webhook in the Flutterwave dashboard:

`https://tampslat.tampconsulting.space/api/billing/flutterwave/webhook`

The customer return URL is:

`https://tampslat.tampconsulting.space/payment-success.html`

Use Flutterwave test credentials first. A payment is not successful merely because a customer returns to the site; the Worker verifies the transaction directly with Flutterwave before changing plan entitlements or credit balances.

## Currency and price controls

Nigeria uses NGN. Other supported African markets currently fall back to USD unless NGN is explicitly selected. Confirm the final currency, amount, tax and payment methods in the merchant dashboard before enabling live credentials. Display prices outside NGN are estimates and are not live exchange-rate conversions.

Do not add secret keys to source files, client-side JavaScript, repository variables or committed configuration. Keep the secret values in Cloudflare Worker secrets.
