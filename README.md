# Property Website MVP

A real-estate listing website: public browse/search, an AI chatbot for natural-language Q&A and property search, simple email+password login, and a minimal admin screen to manage listings.

**Status:** Planning stage. Phase 0 (docs) is complete; no application code has been written yet — see [Project status](#project-status).

## What this is

- **Public site** — browse and search properties, view property detail pages. No login required.
- **AI chatbot** — natural-language Q&A and property search only. It answers questions and helps visitors find listings; it does not capture leads, create CRM records, book visits, or message anyone.
- **Login** — one role, `user` (email + password). Admin access is a single `isAdmin` flag, not a separate role system.
- **Admin CRUD** — a basic authenticated screen to create, edit, delete, and publish/unpublish property listings.

Leads/CRM, agent roles, notifications, visit scheduling, bulk upload, and multi-city/currency support are explicitly out of scope for this MVP. See [`CLAUDE.md`](CLAUDE.md) §2 for the full exclusion list.

## Tech stack

- Next.js (App Router), Node.js
- PostgreSQL + Prisma
- Tailwind CSS
- LLM: Anthropic API (direct)
- Maps: OpenStreetMap tiles + Leaflet.js
- Currency: INR only
- Local/dev via Docker (docker-compose for app + Postgres)

## Project status

This repo is currently docs-only:
- No `package.json`, `src/`, or `prisma/` yet — Phase 1 (data model + auth) hasn't started.
- Local git is initialized but has no commits yet.

Once Phase 1 scaffolding lands, this section and [`CLAUDE.md`](CLAUDE.md) will be updated with real install/build/test/run commands.

## Documentation

All planning docs live in [`docs/`](docs/) and are treated as authoritative by Claude Code (see [`CLAUDE.md`](CLAUDE.md) §8):

| Doc | Purpose |
|---|---|
| [`ROADMAP.md`](docs/ROADMAP.md) | Phase gates, current phase, what's allowed to be built right now |
| [`PRD.md`](docs/PRD.md) | Product requirements |
| [`NFR.md`](docs/NFR.md) | Non-functional requirements |
| [`API_CONTRACT.md`](docs/API_CONTRACT.md) | Endpoint contracts |
| [`SCHEMA.md`](docs/SCHEMA.md) | Data model / Prisma schema |
| [`TESTING_STRATEGY_AND_DOD.md`](docs/TESTING_STRATEGY_AND_DOD.md) | Testing levels and Definition of Done |
| [`GITHUB_WORKFLOW.md`](docs/GITHUB_WORKFLOW.md) | Issues, PRs, labels, milestones, CI |
| [`REPORTING.md`](docs/REPORTING.md) | Phase-end report and screenshot requirements |
| [`UI_REFERENCE.md`](docs/UI_REFERENCE.md) | Design screens, tokens, and screen-to-route mapping (source of truth for what's actually being built — `docs/design_reference/design-references-catalog.md` describes an older, larger CRM scope and should not be used for scope decisions) |

## Build progress

[`progress.html`](progress.html) is a live dashboard of GitHub milestones/issues/PRs — open it in any browser (fetches directly from the public GitHub API, no build step, no token needed).

## Working in this repo

See [`CLAUDE.md`](CLAUDE.md) for the full set of process rules (branching, commits, PRs, scope-creep policy, Definition of Done). In short: work happens in short-lived `feature/`/`fix/` branches off `main`, every change lands via PR, and no out-of-scope functionality gets built without flagging it first.

# NextJS setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
