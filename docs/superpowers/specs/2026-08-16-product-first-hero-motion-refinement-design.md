# Product-first hero motion refinement design

## Context

This document refines the approved product-first hero in PR #29. It does not replace the original design specification. The current desktop hierarchy consumes too much vertical space: the product tabs reach the bottom of the initial viewport and the conceptual product window is not visible without scrolling.

The confirmed root cause is the combination of a 5rem desktop top padding, a headline constrained to 15 characters per line at up to 4.5rem, and a 3.5rem gap before the product tabs.

## Success criterion

At 1440×900, the initial page view must show all of the following without scrolling:

- the complete headline;
- supporting copy;
- both CTA controls;
- the four product tabs;
- the product-window header containing **Vista conceptual**;
- at least the first product row or card.

The mobile composition remains legible and does not become artificially compressed to satisfy the desktop target.

## Selected approach

Use **A · Jerarquía compacta**. Preserve the centered composition and component architecture while adjusting desktop typography and vertical rhythm:

- widen the headline measure from approximately 15ch to approximately 20ch;
- reduce the desktop headline maximum from 4.5rem to approximately 3.6rem;
- reduce desktop top padding and the gaps between copy, actions, tabs, and preview;
- retain the current mobile font floor and stacked CTA behavior;
- avoid negative preview margins, overlapping content, or a two-column redesign.

The final values may be tuned during rendered verification, but they must satisfy the explicit 1440×900 criterion and preserve the existing 375 px composition.

## Product-change motion

The shadcn tab behavior and DOM structure remain unchanged. Motion is CSS-only and does not add React state or a dependency.

When a tab becomes active:

- the matching `TabsContent` panel enters with opacity, `translateY(8px)`, and `scale(.992)`;
- duration is approximately 320 ms using the existing restrained easing curve;
- the active tab pill enters from `scale(.97)` with a contained Sky border/glow;
- tab background, border, color, shadow, and transform transition over approximately 220 ms.

The selected product panel changes immediately for assistive technology; animation is only visual enhancement.

## Hover microinteractions

Add subtle hover feedback to:

- client rows;
- payment rows;
- order-table rows except the table header;
- production columns and order cards;
- the mobile order card;
- product tab triggers.

Hover feedback uses a slightly brighter border/background, a contained shadow, and no more than 1–2 px of translation. Transitions last approximately 180 ms. No continuous animation, spring overshoot, large movement, or pointer-following effect is introduced.

## Accessibility and motion preference

- Preserve the current keyboard and ARIA behavior from shadcn/Base UI.
- Keep visible focus independent from hover styling.
- Do not require hover or animation to understand any state.
- Under `prefers-reduced-motion: reduce`, remove tab-panel entrance, active-pill animation, hover transforms, and transition delays while retaining immediate state changes.
- Touch layouts receive no hover-dependent behavior.

## Implementation scope

The refinement should primarily modify `src/index.css`. Component markup changes are allowed only if rendered verification proves a CSS-only solution cannot expose the conceptual preview at the target viewport. No product data, copy, dependencies, assets, routes, or CTA actions change.

## Verification

- Preserve all existing automated hero and tab tests.
- Run `pnpm test`, `pnpm build`, and `git diff --check`.
- Verify 1440×900 against the explicit first-viewport criterion.
- Recheck 375, 768, and 1024 px for overflow, readable content, and CTA/tab fit.
- Verify pointer hover, tab click, keyboard navigation, focus visibility, and reduced-motion behavior when browser automation is available.
- Keep the Browser/Playwright limitation explicit if the environment still provides neither.

## Risks and rollback

The main risk is compressing the marketing copy too aggressively or making hover motion distracting. Breakpoints isolate the desktop rhythm change, translations remain at or below 2 px, and reduced motion disables all new transforms.

Rollback is reverting the refinement commit(s) on PR #29; the underlying product-first hero remains intact.
