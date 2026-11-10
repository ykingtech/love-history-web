# Love History security baseline

## Sensitive account data

The app does not collect a national identity number. Birthday, full legal name and the generated Love Key must never be logged, placed in a URL, sent to analytics, or used as a Firestore document ID in plaintext.

The Spark-plan browser architecture derives two separate representations:

1. A deliberately expensive PBKDF2-SHA-256 value for exact-match Love Key lookup. Firestore permits authenticated `get` operations only and denies collection listing and prefix queries.
2. AES-256-GCM ciphertext using a password-derived key, a random salt, and a random 96-bit IV for birthday and full legal name.

The raw Love Key, birthday and full legal name are not stored as Firestore document IDs or plaintext fields. Because the Spark plan has no trusted server secret, the PBKDF2 lookup is weaker against determined offline enumeration than a server-side HMAC architecture.

## Authentication

- Passwords are handled by Firebase Authentication, never by Firestore.
- Firebase Authentication maintains the browser session and enforces password verification.
- Registration requires a 12–128 character password and an adult birthday.
- The generated synthetic authentication email is internal and is never rendered in the UI.

## Firestore boundary

Browser clients access only the explicitly allowed Firestore documents. Rules deny all unlisted paths, deny Love Key index listing, scope profiles to their owner, restrict relationship requests to exact hashed-key matches, and require mutual acceptance before a relationship document can be created.

## Before production

- Obtain a Sri Lankan privacy/legal review for processing birthdays, legal names and relationship history.
- Complete a data-protection impact assessment and define retention/deletion periods.
- Add abuse reporting, blocking, emergency account lock, audit review, backup restoration tests, key-rotation tests, and incident response procedures.
- Move Love Key lookup to a trusted server-side HMAC and add App Check/rate limiting before handling high-risk or large-scale traffic.
- Commission an independent penetration test. This repository is a secure baseline, not a security certification.
