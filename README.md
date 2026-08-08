# Beast Mode Lite

A private, mobile-first 90-day consistency tracker. Each day has three goals:

1. Complete one or two DDPY workouts
2. Log food
3. Meet the personal step goal

Three checks is a **Beast** day, two is **OK**, one is **Lame**, and zero
**Sucks**. The app includes repeatable rounds, a 90-day map, streaks, completion
stats, and achievements.

## Stack

- React, TypeScript, and Vite
- Convex database and Convex Auth
- Render static-site hosting

## Local setup

Requirements: Node.js 22 or newer and a Convex account (a local anonymous
deployment also works).

```bash
npm install
npx convex dev
```

In a second terminal:

```bash
npm run dev
```

`npx convex dev` writes `VITE_CONVEX_URL` to `.env.local`. Configure the one
email allowed to register:

```bash
npx convex env set OWNER_EMAIL you@example.com
```

Initialize Convex Auth signing keys once per deployment:

```bash
npx @convex-dev/auth --skip-git-check
```

On first visit, choose **Create the owner account**. Registration is rejected
for every email except `OWNER_EMAIL`. Passwords require at least 12 characters
with uppercase, lowercase, and a number.

> Convex Auth is currently beta. This lightweight private version does not send
> password-reset email. Store the password in a password manager.

## Checks

```bash
npm test
npm run lint
npm run build
```

## Production Convex

Link the project to the desired Convex account, deploy the functions, then set
the production-only variables:

```bash
npx convex login
npx convex deploy
npx convex env set --prod OWNER_EMAIL you@example.com
npx @convex-dev/auth --prod --skip-git-check
```

Copy the production client URL printed by Convex. Do not put `OWNER_EMAIL`,
`JWT_PRIVATE_KEY`, or `JWKS` in Render; those belong only in Convex.

## Render

`render.yaml` defines a static site with:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- SPA rewrite: `/*` to `/index.html`
- Required public variable: `VITE_CONVEX_URL`

Push this project to a GitHub or GitLab repository, create a Render Blueprint
from that repository, and enter the production Convex client URL when Render
asks for `VITE_CONVEX_URL`.
