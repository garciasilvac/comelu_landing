# Hero Critical Status Refinement Design

## Objective

Improve the conceptual Comelu product preview in PR #29 by making overdue work unmistakable, giving client rows separate operational and payment signals, removing the heavy left-edge accents, and shortening the notification-bell reminder cycle.

This refinement changes only illustrative hero content and presentation. It does not introduce real customer data, backend state, payment logic, notification persistence, or product routes.

## Client Status Indicators

Each client row displays two compact, text-labeled indicators:

- `OTs` communicates the state of that client's work orders.
- `Pagos` communicates the state of that client's payments.

At least one client demonstrates the critical case with `1 OT atrasada` and `1 pago vencido`. Other clients use non-critical examples such as active work, OTs up to date, pending payments, or payments up to date. The indicators remain distinct so a healthy payment state cannot visually mask an operational issue, and vice versa.

The client row itself may use the most urgent of its two states as a subtle overall treatment, while each indicator retains its own explicit tone and text. Critical status is always conveyed by wording as well as color.

## Critical Examples

The preview adds a `critical` semantic tone using a restrained red treatment:

- Orders includes an OT whose visible state is `Atrasada`.
- Payments includes a visible item whose state is `Vencido` or `Vencida`, matching the noun shown.
- Clients includes one row with a red overdue-OT indicator and a red overdue-payment indicator.

Existing positive, progress, warning, and review examples remain where space permits. The examples are conceptual and should be internally consistent across labels, dates, and supporting text.

## Surface Treatment

Rows, cards, and status-aware surfaces no longer use the thick inset border on their left edge. Semantic meaning remains visible through:

- status badges and client indicators;
- low-opacity state backgrounds;
- subtle full-perimeter borders;
- restrained outer hover shadows or elevation.

Hover must not recreate a left-edge accent. It may increase elevation or border clarity without shifting layout. Text labels and focus-visible states remain readable against every semantic background.

## Notification Timing

The bell keeps its existing short alert movement followed by an idle interval, but the full cycle changes from ten seconds to five seconds. The bell must remain still for most of each cycle so it reads as an occasional reminder rather than continuous motion.

Under `prefers-reduced-motion: reduce`, the bell animation remains disabled.

## Responsive Behavior

The two client indicators wrap within the client content area instead of forcing horizontal overflow. Desktop rows remain compact, while narrow layouts can place the indicators on a second line. Order and payment critical examples use the same responsive structures already present in their respective panels.

## Accessibility

- Every status is expressed in text; red is supplemental.
- Red foreground/background combinations must retain readable contrast.
- Removing the left accent must not remove keyboard focus indicators.
- Bell motion remains disabled for reduced-motion users.
- Client indicators must remain legible without relying on hover.

## Testing and Acceptance

Automated checks verify:

- a client renders separate OT and payment indicators;
- the critical client indicators expose the `critical` tone and overdue text;
- Orders includes an overdue OT with the `critical` tone;
- Payments includes an overdue payment with the `critical` tone;
- existing tab interaction and notification content continue to work.

Rendered acceptance checks should confirm that no row or card has a thick left border in default or hover states, the red examples remain readable, client indicators wrap cleanly, the bell repeats on a five-second cycle, and reduced-motion mode disables its movement.

## Scope Boundaries

- No real status computation, dates, APIs, database changes, or payment integration.
- No changes to landing-page copy, CTA behavior, navigation, waitlist, or sections outside the conceptual product preview.
- No new dependency or asset.
- No deployment or environment-variable changes.

## Rollback

The implementation will be split into small commits for test coverage, critical client/order/payment examples, and visual/motion refinement. Individual commits can be reverted independently, while reverting PR #29 remains the complete rollback path.
