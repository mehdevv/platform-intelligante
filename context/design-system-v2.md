# Design system v2 — Researcha (avril 2026)

## Principles

- **Whitespace first:** generous vertical rhythm (`py` 7–10 on marketing sections; dashboard/admin use `p: 3–4` on cards, hairline dividers).
- **No decorative glow:** hero and app shell avoid blurred orbs, heavy `box-shadow` halos, and animated diagonal washes on product surfaces.
- **Sharp color:** AEM primary `#4B5B72`, secondary `#197F94`, accent sharp `#0e7490` for inline emphasis; borders `#dde1e9` (token `border`).
- **Typography:** League Spartan (display), Ubuntu (UI), Libre Baskerville italic (small editorial only).
- **Imagery:** real photography on the homepage via `src/constants/homeImagery.js` (Unsplash until CDN/R2).

## App shell (`/dashboard`, `/admin`)

- Light sidebar: `background.paper`, `1px` right border `divider`, active nav = **left border 3px** `secondary.main` + semibold label (no dark slate full-width pills).
- Main area: `background.default` (`#EBECF1`), top bar `paper` + bottom border.
- Prefer **empty states** and links to real routes over fake charts and invented metrics.

## Implementation map

| Area | Files |
|------|--------|
| MUI theme | `src/theme.js` |
| Global utilities | `src/index.css` |
| Tokens (JSON) | `context/aem-design-tokens.json` |
| Homepage photos | `src/constants/homeImagery.js` |

See `dashboard-admin-routes.md` for IA of authenticated areas.
