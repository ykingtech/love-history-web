# Love History

Privacy-focused relationship history web app deployed on GitHub Pages and Firebase's Spark plan.

## Live production

https://ykingtech.github.io/love-history-web/

## Active features

- Birthday + English full-name Love Key generation
- Firebase Email/Password Authentication using an internal synthetic address
- Browser-side PBKDF2 + AES-256-GCM encryption for full name and birthday
- Owner-only private profiles and non-listable exact-key lookup
- Mutual relationship requests and acceptance
- Active relationship state, private history, immediate separation, up to 10 final messages from the other partner, and 10-day finalization on next access
- Automatic GitHub Pages deployment from `main`

## Deploy

```bash
npm ci
npm run build
firebase deploy --only firestore:rules
```

Read [SECURITY.md](SECURITY.md) before changing identity, lookup, or Firestore logic.
