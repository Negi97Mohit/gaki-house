# Authentication

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

Authentication uses **Firebase Auth** with Google Sign-In as the primary provider. A custom OAuth flow handles Electron's `file://` domain restriction.

## Feature Module

```
src/features/auth/
├── hooks/
│   └── useAuth.ts       — Auth state and methods
└── ui/
    └── (Login components)
```

## Auth Context

→ Source: [AuthContext.tsx](file:///c:/Users/Dell/Desktop/gaki/src/pages/platform/context/AuthContext.tsx)

The `AuthProvider` wraps the router and provides authentication state:
- Current user object
- Login/logout methods
- Loading state
- Auth state listener

## Two Auth Flows

### Web (Browser)
Standard Firebase popup auth:
```typescript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

### Electron (Desktop)
Custom OAuth via IPC:
```typescript
// Renderer
const result = await window.electron.auth.googleOAuth(firebaseApiKey);
if (result) {
  const credential = GoogleAuthProvider.credential(result.idToken);
  await signInWithCredential(auth, credential);
}
```

**Why custom flow?** Firebase popup auth requires the domain to be authorized in Firebase Console. Electron apps run from `file://` protocol which can't be authorized. The custom flow:
1. Fetches Google client ID from Firebase project config
2. Opens Google OAuth in a modal BrowserWindow
3. Uses `http://localhost` as redirect URI
4. Extracts tokens from URL fragment after redirect
5. Creates Firebase credential from tokens

→ See [IPC Bridge](../../architecture/ipc-bridge.md#auth-controls) for the main process handler  
→ See [Integrations](../../architecture/integrations.md#firebase) for Firebase setup
