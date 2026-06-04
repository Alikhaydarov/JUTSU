# JUTSU Payment and SMS Integration Notes

Last checked: 2026-06-05

## Payment

Recommended Korea-first flow:

1. Frontend opens Toss Payments widget or payment window with a public client/widget key.
2. Toss redirects back with `paymentKey`, `orderId`, and `amount`.
3. Django verifies the order amount from the database.
4. Django calls Toss `/v1/payments/confirm` using the server-only secret key.
5. Django stores the payment status and handles Toss webhooks for async methods.

Global card fallback:

1. Django creates a Stripe Checkout Session.
2. Frontend redirects to the Checkout Session URL.
3. Stripe webhook updates the JUTSU order status.

Never put Toss/Stripe secret keys in Next.js client code.

## SMS Verification

Korea-first option:

1. Django creates a 6-digit code and stores a hashed value with expiry.
2. Django sends SMS through NAVER Cloud SENS.
3. User enters the code.
4. Django verifies the code, rate limits attempts, and marks the phone verified.

Global fallback:

1. Use Twilio Verify to send and check the verification code.
2. Store only the final verification result in Django.

## Required Backend Tables

- `users`: email, phone, phone_verified_at, role.
- `phone_verifications`: phone, code_hash, expires_at, attempts, consumed_at.
- `orders`: user, product, amount_krw, status, payment_provider, provider_payment_key.
- `partner_accounts`: username, password_hash, business_type, business_name, city, status.
- `webhook_events`: provider, event_id, payload, processed_at.

## Sources

- Toss Payments payment widget docs: https://docs.tosspayments.com/en/integration-widget
- Toss Payments API guide: https://docs.tosspayments.com/en/api-guide
- Stripe Checkout Sessions API: https://docs.stripe.com/api/checkout/sessions
- NAVER Cloud SENS overview: https://guide.ncloud-docs.com/docs/en/sens-overview
- NAVER Cloud SENS SMS send API: https://api.ncloud-docs.com/docs/en/sens-sms-send
- Twilio Verify docs: https://www.twilio.com/docs/verify
