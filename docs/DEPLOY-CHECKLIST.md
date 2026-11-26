# Deploy Checklist

Required **server-side** Netlify environment variables for `apps/web/netlify/functions/*`.
Configure these in **Netlify Site Settings -> Environment variables** (never prefix secrets with `VITE_`).

| Variable | Required By | Purpose | Where to Obtain |
|---|---|---|---|
| `DEEPGRAM_API_KEY` | `deepgram-token.ts` | Master Deepgram API key used to mint short-lived (10s, `usage:write`) browser STT tokens | Deepgram Console -> API Keys (create Admin/Key-creator key) |
| `TWITCH_CLIENT_ID` | `twitch-token.ts` | Twitch application Client ID for app-access token exchange | Twitch Developer Console -> Applications |
| `TWITCH_CLIENT_SECRET` | `twitch-token.ts` | Twitch application Client Secret for `client_credentials` token grant | Twitch Developer Console -> Applications |
| `GEMINI_API_KEY` | `gemini-proxy.ts` | Google Gemini API key for server-side AI generation proxy | Google AI Studio -> API Keys |
| `FIREBASE_WEB_API_KEY` | `_security.ts` (`verifyFirebaseAuth`) | Verifies caller Firebase ID tokens via Identity Toolkit (`accounts:lookup`) for `deepgram-token` and `gemini-proxy` | Firebase Console -> Project Settings -> General -> Web API Key |
| `ALLOWED_ORIGINS` | `_security.ts` (`checkOrigin`) | Comma-separated exact production origins (e.g. `https://gaki.studio,https://www.gaki.studio`) | Your production domain(s) |
| `NETLIFY_PREVIEW_SITE` | `_security.ts` (`checkOrigin`) | Optional Netlify site slug (e.g. `gaki-app`) to allow `https://deploy-preview-<PR>--<site>.netlify.app` when `CONTEXT !== "production"` | Netlify Site Settings -> General -> Site name |
| `KICK_CLIENT_SECRET` | Reserved (future `kick-token`) | Kick OAuth client secret (currently unused; `kick-proxy.ts` proxies public Kick v1 endpoints) | Kick Developer Portal (when OAuth flow is wired) |

## Required Client-Side Firebase Config (Public)
`apps/web/src/lib/firebase.ts` validates these at runtime and throws if any are missing:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Pre-Deploy Verification
1. Ensure local `apps/web/.env` has no `VITE_TWITCH_CLIENT_SECRET`, `VITE_KICK_CLIENT_SECRET`, `VITE_DEEPGRAM_API_KEY`, or `VITE_GEMINI_API_KEY`.
2. Run `pnpm env-check` to confirm `.env.example` parity and zero tracked or `VITE_*` secrets.
3. Run `pnpm check` and `pnpm --filter @gaki/web --filter @gaki/mobile build`.
4. After Netlify deploy, verify `deepgram-token` and `gemini-proxy` return `401` without auth and `403` for disallowed origins.
