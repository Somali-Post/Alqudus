# Technical Architecture

## Phase 1 stack

- Frontend: Vite, React, and Tailwind CSS.
- Routing: React Router.
- Data handling: local/mock form submission only.
- Backend: no live backend integration in Phase 1.

## Frontend structure

Use a future backend-ready structure with clear boundaries between pages, reusable components, layout components, and data helpers.

Suggested folders after the React app is created:

- `src/components`
- `src/layouts`
- `src/pages`
- `src/routes`
- `src/data`
- `src/features`
- `src/lib`

## Phase 1 data handling

The driver application form should submit locally or to mock handlers only. Store temporary data in component state or a small mock service. Do not add a real database, authentication system, or backend API until a later phase.

Design form models so they can later map cleanly to backend DTOs.

## Future backend-ready modules

Plan the codebase so these modules can be added later without a broad rewrite:

- Driver applications
- Document tracking
- Jobs and loads
- Commissions
- Payouts
- Proof of delivery
- Notifications
- Driver portal
- Admin dashboard

## Routing strategy

Use React Router for public pages and future private areas.

Phase 1 routes may include:

- Home
- Driver application
- Contact

Future routes may include:

- Admin dashboard
- Driver profile
- Applications review
- Jobs and loads
- Documents
- Commissions and payouts

## Layout strategy

Desktop and mobile should use separate layout decisions where needed.

Desktop should feel like a professional trucking/logistics website with clear sections, strong hero content, and readable multi-column layouts.

Mobile should feel app-like, with compact page flow, large touch targets, app-style headers, bottom navigation where useful, card-based sections, and minimal horizontal complexity.
