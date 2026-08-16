# Hero Critical Status Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit overdue examples and dual client status indicators to the conceptual hero preview, remove heavy left accents, and repeat the bell alert every five seconds.

**Architecture:** Extend the preview's local typed fixture data with a `critical` semantic tone and separate OT/payment status objects for each client. Reuse `StatusBadge` for textual state communication, add only layout classes needed for the dual indicators, and keep all visual behavior in the existing hero stylesheet.

**Tech Stack:** React 19, TypeScript 5.9, Base UI/shadcn Tabs, CSS with OKLCH colors, Vitest, Testing Library, Vite.

## Global Constraints

- Work only in `/Users/CarlosG/wt-product-first-hero` on `feat/product-first-hero`; update existing PR #29.
- The preview remains conceptual and uses no real status computation, APIs, database changes, payment integration, dependencies, assets, environment variables, or deployment configuration.
- Every status is expressed in text; red is supplemental.
- Rows and cards must not use a thick left-edge accent in default or hover states.
- The bell's complete animation cycle is exactly `5s` and remains disabled by `prefers-reduced-motion: reduce`.
- Keep existing keyboard focus states, tab behavior, notification behavior, and responsive structures functional.

---

### Task 1: Add critical records and dual client indicators

**Files:**
- Modify: `src/components/landing/HeroProductPreview.test.tsx`
- Modify: `src/components/landing/HeroProductPreview.tsx`

**Interfaces:**
- Consumes: existing `StatusBadge({ children, tone })`, `TabsContent`, and `ProductTabValue` tab values.
- Produces: `StatusTone` extended with `"critical"`; client fixtures with `orders` and `payments` status objects; `.hero-client-statuses` and `.hero-client-status-label` markup hooks; critical Orders and Payments records.

- [ ] **Step 1: Write failing semantic-status tests**

Add a test that opens each relevant tab and asserts the textual state plus its semantic tone:

```tsx
it("shows separate client OT and payment states including overdue examples", async () => {
  const user = userEvent.setup();
  render(<PreviewHarness />);

  await user.click(screen.getByRole("tab", { name: "Clientes" }));

  const overdueOt = screen.getByText("1 OT atrasada");
  const overduePayment = screen.getByText("1 pago vencido");
  const criticalClient = overdueOt.closest(".hero-client-row");

  expect(screen.getAllByText("OTs").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Pagos").length).toBeGreaterThan(0);
  expect(overdueOt).toHaveAttribute("data-tone", "critical");
  expect(overduePayment).toHaveAttribute("data-tone", "critical");
  expect(criticalClient).toHaveAttribute("data-tone", "critical");

  await user.click(screen.getByRole("tab", { name: "Órdenes" }));
  expect(screen.getAllByText("Atrasada")[0]).toHaveAttribute("data-tone", "critical");

  await user.click(screen.getByRole("tab", { name: "Pagos" }));
  expect(screen.getByText("Vencida")).toHaveAttribute("data-tone", "critical");
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
pnpm test -- src/components/landing/HeroProductPreview.test.tsx
```

Expected: FAIL because `1 OT atrasada`, `1 pago vencido`, `Atrasada`, and `Vencida` are not rendered.

- [ ] **Step 3: Extend fixtures and render the two client states**

Extend the tone union:

```tsx
export type StatusTone = "positive" | "progress" | "warning" | "review" | "critical";
```

Replace each client's single `activity` with independent state objects. Use these exact illustrative states:

```tsx
const clients = [
  {
    initials: "LA",
    name: "Clínica Los Andes",
    contact: "Dra. Camila Soto",
    orders: { label: "6 activas", tone: "progress" },
    payments: { label: "1 pendiente", tone: "warning" },
    tone: "warning",
  },
  {
    initials: "OS",
    name: "Centro Dental Orto Sur",
    contact: "Dr. Martín Rojas",
    orders: { label: "1 OT atrasada", tone: "critical" },
    payments: { label: "1 pago vencido", tone: "critical" },
    tone: "critical",
  },
  {
    initials: "SM",
    name: "Clínica Santa María",
    contact: "Recepción clínica",
    orders: { label: "Al día", tone: "positive" },
    payments: { label: "Al día", tone: "positive" },
    tone: "positive",
  },
] as const;
```

Render the two indicators after `.hero-client-primary`:

```tsx
<div className="hero-client-statuses" aria-label={`Estados de ${client.name}`}>
  <div>
    <span className="hero-client-status-label">OTs</span>
    <StatusBadge tone={client.orders.tone}>{client.orders.label}</StatusBadge>
  </div>
  <div>
    <span className="hero-client-status-label">Pagos</span>
    <StatusBadge tone={client.payments.tone}>{client.payments.label}</StatusBadge>
  </div>
</div>
```

Change OT-2039 to `state: "Atrasada"`, `delivery: "15 ago"`, and `tone: "critical"`. Change Factura 00476 to `state: "Vencida"` and `tone: "critical"` so the overdue payment matches Centro Dental Orto Sur. Select the critical order for the mobile card:

```tsx
const selectedOrder = orders.find((order) => order.tone === "critical") ?? orders[0];
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
pnpm test -- src/components/landing/HeroProductPreview.test.tsx
```

Expected: all HeroProductPreview tests PASS.

- [ ] **Step 5: Commit the semantic preview change**

```bash
git add src/components/landing/HeroProductPreview.tsx src/components/landing/HeroProductPreview.test.tsx
git commit -m "feat: add critical hero product states"
```

---

### Task 2: Refine status surfaces and bell timing

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `data-tone="critical"`, `.hero-client-statuses`, `.hero-client-status-label`, and the existing `hero-bell-alert` keyframes.
- Produces: critical OKLCH custom properties, responsive dual-indicator layout, left-accent-free semantic surfaces, and a five-second bell cycle.

- [ ] **Step 1: Confirm every heavy left accent location before editing**

Run:

```bash
rg -n "inset 3px 0|hero-bell-alert 10s|critical|hero-client-statuses" src/index.css src/components/landing/HeroProductPreview.tsx
```

Expected: CSS reports the current `inset 3px 0` shadows and `10s` bell cycle; TSX reports the new critical and client-status hooks.

- [ ] **Step 2: Add the critical palette and client indicator layout**

Add the critical variables beside the other semantic tones:

```css
:is(.hero-product-window, .hero-notification-popover) [data-tone="critical"] {
  --hero-tone: oklch(0.76 0.16 25);
  --hero-tone-soft: oklch(0.42 0.13 25 / 22%);
}
```

Replace the old single client-badge placement with wrapping dual indicators:

```css
.hero-client-statuses {
  grid-column: 2;
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.hero-client-statuses > div {
  display: grid;
  gap: 0.2rem;
}

.hero-client-status-label {
  color: oklch(0.62 0.025 235);
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

At `min-width: 768px`, set `.hero-client-statuses { grid-column: auto; flex-wrap: nowrap; }`. Keep the row grid as `auto minmax(0, 1fr) auto` so the group owns the trailing column.

- [ ] **Step 3: Remove inset accents and shorten the bell cycle**

Change the icon declaration to:

```css
animation: hero-bell-alert 5s ease-in-out infinite;
```

Remove `box-shadow: inset 3px 0 var(--hero-tone)` from the shared tone surface rule. In hover rules, retain only outer elevation where present:

```css
box-shadow: 0 12px 28px -24px var(--hero-tone);
```

for client/payment rows, no `box-shadow` for table rows, and:

```css
box-shadow: 0 16px 32px -26px var(--hero-tone);
```

for production columns/orders and the mobile order. Preserve the subtle full border, semantic background, transforms, focus styles, and existing reduced-motion override.

- [ ] **Step 4: Verify CSS invariants and focused tests**

Run:

```bash
if rg -n "inset 3px 0|hero-bell-alert 10s" src/index.css; then exit 1; fi
rg -n "hero-bell-alert 5s|critical|hero-client-statuses" src/index.css src/components/landing/HeroProductPreview.tsx
pnpm test -- src/components/landing/HeroProductPreview.test.tsx
```

Expected: the forbidden-pattern check exits successfully with no matches, the required-pattern search finds all three hooks, and all focused tests PASS.

- [ ] **Step 5: Commit the visual and motion refinement**

```bash
git add src/index.css
git commit -m "style: refine hero status surfaces"
```

---

### Task 3: Complete regression and rendered verification

**Files:**
- Verify: `src/components/landing/HeroProductPreview.tsx`
- Verify: `src/components/landing/HeroProductPreview.test.tsx`
- Verify: `src/index.css`

**Interfaces:**
- Consumes: completed semantic fixtures, responsive indicator layout, CSS status palette, and bell animation.
- Produces: evidence that the existing PR remains buildable, test-clean, responsive, accessible, and ready for review.

- [ ] **Step 1: Run static and automated checks**

Run:

```bash
git diff --check
pnpm test
pnpm build
```

Expected: no whitespace errors, all Vitest tests PASS, and TypeScript/Vite build exits 0.

- [ ] **Step 2: Start the local preview for rendered checks**

Run:

```bash
pnpm dev --host 127.0.0.1
```

Expected: Vite serves the landing page on the reported localhost URL without terminal errors.

- [ ] **Step 3: Inspect the conceptual preview at target viewports**

Using the available browser-control tooling, inspect 1440×900, 1024×768, 768×1024, and 375×812. At each applicable viewport verify:

- client rows show separate `OTs` and `Pagos` labels without overflow;
- Centro Dental Orto Sur shows both red critical indicators;
- Orders visibly includes the red `Atrasada` OT, including the mobile card;
- Payments visibly includes the red `Vencida` invoice;
- default and hover states contain no thick left edge;
- the bell alerts once per five-second cycle and remains idle for most of it;
- reduced-motion emulation disables the bell movement;
- tabs, notification popover, focus rings, and hover effects still work without console errors.

Expected: all checks pass. If browser tooling is unavailable, record that limitation explicitly and do not claim rendered verification.

- [ ] **Step 4: Review the final diff and commit any verification-only adjustment**

Run:

```bash
git diff --stat HEAD~2
git diff HEAD~2 -- src/components/landing/HeroProductPreview.tsx src/components/landing/HeroProductPreview.test.tsx src/index.css
git status --short
```

Expected: only the scoped preview/test/style files plus the approved spec and plan are changed, and the worktree is clean. If a rendered check required a small correction, repeat the relevant tests and commit it separately with `fix: polish critical hero states`.

- [ ] **Step 5: Push and confirm the existing PR**

```bash
git push origin feat/product-first-hero
gh pr checks 29 --watch
gh pr view 29 --json url,mergeStateStatus,statusCheckRollup
```

Expected: the branch pushes successfully, PR #29 remains the target, required checks pass, and the PR is mergeable or reports only a non-code repository policy state.
