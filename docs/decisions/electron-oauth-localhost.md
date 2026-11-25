# ADR: Electron Google OAuth Redirect Must Stay `http://localhost:3456`

## Context
Standard Firebase popup authentication fails inside Electron due to unauthorized domain / `file://` origin restrictions.

## Decision
Keep the Electron Google OAuth redirect URI at `http://localhost:3456` (`apps/desktop`).

## Why
Custom domains fail silently inside Electron wrappers. The main process opens a modal `BrowserWindow`, intercepts the redirect to `localhost:3456`, and extracts the OAuth tokens from the URL fragment.
