# Hero Product Notifications and Status Design

## Objective

Refine the conceptual Comelu product preview so it behaves like a cohesive application surface: notifications live in a branded top bar, operational metrics belong to the Orders view, tab selection travels between options, and product records communicate status through consistent semantic treatments.

This is a follow-up to the product-first hero in PR #29. It does not change the landing-page message, CTA behavior, product routes, backend data, or production configuration.

## Product Window Header

The conceptual product window uses a Sky-colored top bar matching the blue used by the Comelu brand surface. The existing `/comelu-horizontal.svg` asset replaces the placeholder `C` mark and text. The header retains the `Operación del laboratorio` context on layouts with enough space and the `Vista conceptual` disclosure.

A notification bell sits at the trailing edge of the header. It has an accessible name that includes the notification count and a visible count badge. Its alert animation consists of a short restrained bell movement followed by a long idle period, repeating on a ten-second cycle. It never produces continuous motion.

## Notification Interaction

The bell opens a controlled shadcn/Base UI `Popover`. Pointer enter and leave provide the requested hover behavior, while the native trigger and controlled open state preserve keyboard focus plus click/tap access. The notification surface contains a title, short explanatory text, and three illustrative notifications:

1. An order delivery scheduled for today.
2. An order that has not started.
3. A pending invoice or payment.

Each entry includes a readable status label and supporting order or customer context. Color supplements this text but never replaces it. The overlay is conceptual product UI and does not mark items as read or persist state.

## Orders Metrics

The two floating KPI notes are removed from the hero stage. `18 OT activas` and `3 entregas hoy` become compact, permanent metric cards inside the Orders panel, positioned after the panel heading and before the desktop table or mobile order card.

The cards are visible whenever Orders is selected and are absent from Clients, Production, and Payments. Their layout uses two columns where space permits and stacks or compresses without horizontal overflow on narrow screens.

## Tab Selection Motion

The tabs list contains one shared visual selection indicator behind the triggers. It occupies one of four equal positions and moves from the previous position to the next in `100ms`. The selected value is controlled at the hero level so the indicator index and the Base UI tab value cannot diverge.

Tab triggers remain transparent on hover. Only the label text receives hover feedback through a small transform. The active label remains readable above the shared indicator, and focus-visible styling remains independent of hover.

The existing panel-entry animation remains restrained. The shared indicator replaces the per-trigger active-pill scale animation so selection communicates movement from origin to destination instead of recreating a pill at the destination.

## Semantic Status System

Status tone is explicit in preview data rather than inferred from arbitrary text. Four tones are used consistently:

- `positive`: completed, paid, received, or up to date; green treatment.
- `progress`: active production or active workload; Sky treatment.
- `warning`: pending, not started, or due today; amber treatment.
- `review`: quality control or review states; violet treatment.

Badges expose the tone through a data attribute. Rows, production columns, and cards receive the same tone so borders, inset accents, and low-opacity backgrounds reinforce the status. Every surface continues to render the status as text, preserving meaning for users who cannot distinguish color.

## Responsive Behavior

At desktop widths, the top bar shows brand, context, conceptual disclosure, and bell in one row. At narrower widths, context may hide while the logo, disclosure, and bell remain available. Notification content stays within the viewport.

The four tab positions remain equal so the `100ms` indicator transform is deterministic. The mobile Orders card keeps the permanent metrics above it. No negative positioning or detached floating notes are introduced.

## Accessibility and Motion

- The bell is a real button with an accessible notification-count label and visible focus state.
- The notification overlay supports hover, focus, keyboard, click, and tap rather than relying only on hover.
- Existing Base UI tab keyboard behavior and ARIA relationships remain intact.
- Status meaning is always present in text.
- Under `prefers-reduced-motion: reduce`, the ten-second bell alert, shared pill travel, tab-label transform, panel entry, and surface transforms are disabled or made immediate.

## Testing and Acceptance

Automated tests must verify:

- the product header renders the shared Comelu logo;
- the bell exposes the notification count;
- the three illustrative notifications are available through the notification interaction;
- Orders contains both permanent metric cards;
- the old floating KPI elements are absent;
- selecting each tab still changes the product panel;
- stateful rows and cards expose the expected semantic tone;
- the controlled tab value drives the shared indicator index.

Rendered acceptance checks cover 1440×900, 1024×768, 768×1024, and 375×812. Reviewers should verify that the header does not overflow, the notification surface stays on-screen, the selection indicator travels between tabs, the hover affects only label text, the metrics remain inside Orders, and reduced-motion mode eliminates the new movement.

## Scope Boundaries

- No backend notification system, persistence, read/unread mutations, routing, or authenticated product work.
- No new brand assets; reuse `/comelu-horizontal.svg`.
- No new dependencies when the installed shadcn/Base UI components can provide the required overlay.
- No change to the landing header, footer, CTA copy, waitlist, or downstream sections.
- No deployment or environment-variable changes.

## Rollback

The implementation will be isolated in layered commits. Reverting the notification/header commit removes the bell and branded bar; reverting the tab-motion commit restores the current per-trigger pill; reverting the status/Orders commit restores the current KPI and tone presentation. Reverting PR #29 remains the full rollback path.
