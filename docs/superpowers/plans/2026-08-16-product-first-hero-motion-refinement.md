# Product-first Hero Motion Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the conceptual product header and first row within the initial 1440×900 viewport, then add restrained tab, panel, row, list, and card microanimations.

**Architecture:** Keep the existing React/shadcn structure unchanged and implement the refinement in `src/index.css`. Desktop-only rhythm overrides compact the marketing stack, while CSS transitions and keyframes enhance existing tab and preview classes without new state or dependencies.

**Tech Stack:** React 19, shadcn/Base UI tabs, Tailwind CSS 4, native CSS animations, Vitest, Vite.

## Global Constraints

- Work on `feat/product-first-hero` in `/Users/CarlosG/wt-product-first-hero` and update PR #29.
- Keep the centered option-A composition, copy, CTA actions, product data, and component structure.
- At 1440×900, show the complete copy/CTA stack, tabs, `Vista conceptual`, and at least the first product row or card without scrolling.
- Preserve the dedicated 375 px mobile composition and avoid negative margins or content overlap.
- Add no dependencies, assets, React state, routes, or production configuration.
- Keep movement at 1–2 px for hover, approximately 220 ms for the active pill, and approximately 320 ms for panel entry.
- Disable new animations, transforms, and transition delays under `prefers-reduced-motion: reduce`.
- Preserve keyboard, focus-visible, and ARIA behavior from shadcn/Base UI.

---

### Task 1: Compact the desktop hierarchy and add product microanimations

**Files:**
- Modify: `src/index.css`
- Test: existing `src/components/landing/HeroProductPreview.test.tsx`
- Test: existing `src/components/landing/HeroSection.test.tsx`

**Interfaces:**
- Consumes: existing `.hero-*` classes rendered by `HeroSection` and `HeroProductPreview`.
- Produces: desktop rhythm satisfying the 1440×900 criterion plus CSS-only hover/tab motion.
- Preserves: `Tabs`, `TabsTrigger`, and `TabsContent` behavior and current React component APIs.

- [ ] **Step 1: Record the failing rendered criterion before editing**

At 1440×900, load the existing PR branch and record that `.hero-window-header` has a top edge at or below `window.innerHeight`, so `Vista conceptual` and the first product row are not visible without scrolling. The screenshot supplied with the task is valid baseline evidence when browser automation is unavailable.

The browser assertion, when evaluation is available, is:

```js
const header = document.querySelector(".hero-window-header");
const firstRow = document.querySelector(".hero-product-panel[data-active] .hero-table-row:not(.hero-table-head), .hero-product-panel[data-active] article");
({
  headerVisible: Boolean(header) && header.getBoundingClientRect().top < window.innerHeight,
  firstRowVisible: Boolean(firstRow) && firstRow.getBoundingClientRect().top < window.innerHeight,
  overflowFree: document.documentElement.scrollWidth === document.documentElement.clientWidth,
});
```

Expected before the fix: `headerVisible` or `firstRowVisible` is `false` at 1440×900.

- [ ] **Step 2: Add exact desktop rhythm overrides**

Inside `@media (min-width: 768px)`, set:

```css
.hero-content { padding-top: 3rem; }
.hero-title {
  max-width: 22ch;
  margin-top: 1rem;
  font-size: clamp(2.5rem, 4.6vw, 3.6rem);
  line-height: 1.02;
}
.hero-supporting-copy {
  margin-top: 0.9rem;
  line-height: 1.55;
}
.hero-actions { margin-top: 1.25rem; }
.hero-product-tabs {
  gap: 0.75rem;
  margin-top: 2rem;
}
```

Do not alter base/mobile typography. Do not use negative margins or absolute positioning for the copy, tabs, or product window.

- [ ] **Step 3: Enhance product-tab and panel transitions**

Update `.hero-tab-trigger` to transition background, border, color, shadow, and transform over approximately 220 ms. On hover-capable pointers, translate an inactive or active tab upward by 1 px with a subtle background. Animate `.hero-tab-trigger[data-active]` using a new `hero-tab-pill-in` keyframe from `scale(.97)` to `scale(1)`.

Update `.hero-product-panel` to use a 320 ms `hero-tab-in` animation. Change the keyframe start to:

```css
from {
  opacity: 0;
  transform: translateY(8px) scale(.992);
}
```

Keep the final state at `opacity: 1` and `transform: translateY(0) scale(1)`.

- [ ] **Step 4: Add hover transitions to preview surfaces**

Give these selectors a shared 180 ms transition for background, border, box-shadow, and transform:

```css
.hero-client-row,
.hero-payment-row,
.hero-table-row:not(.hero-table-head),
.hero-production-column,
.hero-production-order,
.hero-mobile-order
```

Inside `@media (hover: hover) and (pointer: fine)`, apply:

- list/payment/table rows: brighter border/background and at most `translateY(-1px)` or `translateX(2px)`;
- production columns/cards and mobile order card: `translateY(-2px)` maximum and a contained shadow;
- tab triggers: `translateY(-1px)` and a subtle Sky-tinted background.

Do not animate table headers or add continuous animation.

- [ ] **Step 5: Extend reduced-motion overrides**

Inside the existing `prefers-reduced-motion` block:

- keep `.hero-product-panel { animation: none; }`;
- add `.hero-tab-trigger[data-active] { animation: none; }`;
- force hover transforms for tab triggers, rows, columns, cards, and the mobile order card to `none`;
- set their transition to `none` so visual state changes are immediate.

- [ ] **Step 6: Run automated regression gates**

Run:

```bash
pnpm test
pnpm build
git diff --check
```

Expected: 35 tests pass; TypeScript/Vite build passes; no whitespace errors.

- [ ] **Step 7: Verify rendered behavior**

At 1440×900, confirm `headerVisible`, `firstRowVisible`, and `overflowFree` are all `true`. Recheck 375×812, 768×1024, and 1024×768 for headline readability, CTA/tab fit, and horizontal overflow. Exercise:

- click Clientes → Órdenes → Producción → Pagos;
- keyboard focus with arrows plus Enter activation;
- tab pill animation;
- panel entry animation;
- hover feedback on rows, cards, and production columns;
- `prefers-reduced-motion: reduce` with no transform-based microanimation.

If neither Browser nor Playwright is available, record that limitation in PR #29 and use the supplied Safari screenshot as the before-state evidence.

- [ ] **Step 8: Commit and update PR #29**

```bash
git add src/index.css tsconfig.tsbuildinfo
git commit -m "style: refine hero viewport and motion"
git push origin feat/product-first-hero
```

Update PR #29 with the new success criterion, animation summary, test results, and any browser-validation limitation. Do not create a second PR or merge/deploy.
