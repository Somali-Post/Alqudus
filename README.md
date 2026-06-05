# Alqudus Express Trucking LLC

Phase 1 scalable prototype for the Alqudus Express Trucking LLC public website and owner-operator driver application form.

## Install

```bash
npm install
```

## Run Dev Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```text
docs/                     Project documentation and planning
public/assets/logos/       Brand logo assets
src/assets/                App-specific static assets
src/components/layout/     Desktop and mobile shells
src/components/ui/         Reusable UI primitives
src/components/sections/   Reusable page sections
src/data/                  Navigation and placeholder content
src/pages/                 Route pages
src/routes/                Router configuration
src/styles/                Shared style helpers
src/utils/                 Utility functions
```

## Current Phase

Phase 1 is frontend-only:

- Vite + React + Tailwind CSS
- React Router for public routes
- Local/mock driver application submission
- No backend, database, authentication, or external storage yet

Future phases may add an admin dashboard, driver portal, job management, document management, commission tracking, payouts, proof of delivery, and notifications.
