# Recommendations — premium visual & motion (Researcha)

This complements the AEM palette. The logo mark suggests **diagonal geometry** and **teal on deep black** (`#40828d` on `#000`).

## Shapes & layout

1. **Diagonal rhythm** — Reuse a ~125° angle (section backgrounds, dividers, card corners via `clip-path`, or subtle stripes). Keeps parity with the logo without copying it literally.
2. **Layered depth** — Stack frosted panels (`backdrop-filter`) over a dark or softly striped base; reserve flat white only for dense data tables.
3. **Asymmetric grids** — Alternate 60/40 splits on marketing sections; avoids “template” symmetry.
4. **Corner cuts** — Small chamfer or one clipped corner on primary CTAs (CSS `clip-path: polygon(...)`) for a bespoke feel.

## Motion (keep subtle, <400ms)

1. **Page enter** — Short fade+slide (already started with `.section-fade-in`). Extend with staggered children (`animation-delay` per card).
2. **Scroll-linked** — Parallax only on hero shapes (low amplitude) or progress line following the diagonal.
3. **Hover** — Cards lift + border glow (`.card-lift`); primary buttons light sweep (`.btn-shimmer`).
4. **Loading** — Skeleton screens shaped like chart blocks; avoid generic spinners on dashboards.

## Micro-interactions

1. **Search** — Focus ring tinted with `--brand-mark`; command-K palette later for power users.
2. **Charts** — Animate bars/lines on first paint (Recharts `isAnimationActive`).
3. **Success states** — Checkmark draw or soft pulse on “saved” / “copied”.

## Accessibility & performance

- Respect `prefers-reduced-motion`: disable drift, parallax, and shimmer when set.
- Prefer `transform` and `opacity` for animations (GPU-friendly).
- Lazy-load heavy imagery; logo PNG is fine for header; serve WebP/AVIF for large marketing assets.

## Next implementation steps

- Add `prefers-reduced-motion` media queries wrapping key animations in `index.css`.
- Introduce **Framer Motion** or **MUI Collapse** only where you need orchestrated page transitions.
- Export an **SVG favicon** cropped from the mark for crisper tabs at 16×16.
