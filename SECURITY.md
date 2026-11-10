# Love History security baseline

## Sensitive account data

The app does not collect a national identity number. Birthday, full legal name and the generated Love Key must never be logged, placed in a URL, sent to analytics, or used as a Firestore document ID in plaintext.

The server derives two separate representations:

1. `HMAC-SHA-256(secret, normalized Love Key)` for exact-match lookup. This prevents prefix queries and makes an offline database dump insufficient for direct enumeration without the server secret.
2. AES-256-GCM ciphertext with a random 96-bit IV and authenticated additional data for birthday and full legal name. Prefer deleting fields that are no longer required.

Encryption and HMAC keys are independent, versioned, rotated, and stored outside Firestore in the hosting platform's secret manager.

## Authentication

- Passwords are handled by Firebase Authentication, never by Firestore.
- The browser receives only a `Secure`, `HttpOnly`, `SameSite=Strict`, `__Host-` session cookie.
- Login, registration, and exact-ID searches have generic responses and server-side rate limits.
- Firebase App Check is required for API calls.
- Recovery requires a separately verified private contact method; it is never exposed in profiles or searches.

## Firestore boundary

Browser clients do not access Firestore directly. Client security rules are default-deny. Trusted server code uses the Admin SDK and performs authorization for every operation.

## Before production

- Obtain a Sri Lankan privacy/legal review for processing birthdays, legal names and relationship history.
- Complete a data-protection impact assessment and define retention/deletion periods.
- Add abuse reporting, blocking, emergency account lock, audit review, backup restoration tests, key-rotation tests, and incident response procedures.
- Commission an independent penetration test. This repository is a secure baseline, not a security certification.
