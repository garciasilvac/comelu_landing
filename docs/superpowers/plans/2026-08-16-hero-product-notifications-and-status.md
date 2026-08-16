# Hero Product Notifications and Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the conceptual product preview into a cohesive Comelu application surface with a branded notification bar, permanent Orders metrics, a traveling tab indicator, and status-aware records.

**Architecture:** Keep `HeroSection` responsible for the controlled product-tab value and shared indicator position. Keep product records and permanent metrics in `HeroProductPreview`, and isolate the shadcn/Base UI notification popover in a focused `HeroNotifications` component. Native CSS in `src/index.css` owns all visual motion and semantic tone presentation.

**Tech Stack:** React 19, TypeScript, shadcn/ui base-nova, Base UI Popover and Tabs, Phosphor Icons, Tailwind CSS 4, native CSS animations, Vitest, Testing Library, Vite.

## Global Constraints

- Work on `feat/product-first-hero` in `/Users/CarlosG/wt-product-first-hero` and update PR #29.
- Reuse the installed `@/components/ui/popover`, `@/components/ui/tabs`, and `/comelu-horizontal.svg`; add no dependencies or assets.
- Keep the landing-page copy, CTA callbacks, downstream sections, routes, backend, environment, and deployment configuration unchanged.
- The bell repeats a short alert within a ten-second cycle and remains idle for most of that cycle.
- The shared tab indicator moves between four equal positions in `100ms`.
- Tab hover animates only the label text; it does not change trigger or indicator background.
- `18 OT activas` and `3 entregas hoy` are permanent content inside Orders and never float outside the product window.
- Status meaning always remains readable as text and uses `positive`, `progress`, `warning`, or `review` tone metadata.
- `prefers-reduced-motion: reduce` disables the bell cycle, shared-indicator travel, label transform, panel entry, and hover transforms.
- Preserve Base UI ARIA, focus, arrow-key, Enter, click, tap, and hover behavior.

---

### Task 1: Add the accessible notification popover

**Files:**
- Create: `src/components/landing/HeroNotifications.tsx`
- Create: `src/components/landing/HeroNotifications.test.tsx`
- Uses: `src/components/ui/popover.tsx`

**Interfaces:**
- Produces: `HeroNotifications(): JSX.Element`.
- Renders: button named `3 notificaciones` and a Popover titled `Notificaciones`.
- Uses Base UI: `PopoverTrigger openOnHover delay={80} closeDelay={120}` plus controlled `open` state.

- [ ] **Step 1: Write the failing notification tests**

Create `HeroNotifications.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { HeroNotifications } from "./HeroNotifications";

describe("HeroNotifications", () => {
  it("opens three illustrative notifications from the bell", async () => {
    const user = userEvent.setup();
    render(<HeroNotifications />);

    const bell = screen.getByRole("button", { name: "3 notificaciones" });
    expect(bell).toBeVisible();

    await user.hover(bell);

    expect(await screen.findByText("Notificaciones")).toBeVisible();
    expect(screen.getByText("Entrega programada hoy")).toBeVisible();
    expect(screen.getByText("Orden pendiente de iniciar")).toBeVisible();
    expect(screen.getByText("Pago pendiente")).toBeVisible();
  });

  it("opens the same popover by click for touch and keyboard users", async () => {
    const user = userEvent.setup();
    render(<HeroNotifications />);

    await user.click(screen.getByRole("button", { name: "3 notificaciones" }));

    expect(await screen.findByText("Notificaciones")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm red**

Run:

```bash
pnpm test -- src/components/landing/HeroNotifications.test.tsx
```

Expected: FAIL because `./HeroNotifications` does not exist.

- [ ] **Step 3: Implement the notification component**

Create `HeroNotifications.tsx` with this structure:

```tsx
import { BellRingingIcon } from "@phosphor-icons/react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const notifications = [
  { title: "Entrega programada hoy", detail: "OT-2039 · Centro Dental Orto Sur", tone: "warning" },
  { title: "Orden pendiente de iniciar", detail: "OT-2043 · Clínica Santa María", tone: "warning" },
  { title: "Pago pendiente", detail: "Factura 00481 · Clínica Los Andes", tone: "progress" },
] as const;

export function HeroNotifications() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        openOnHover
        delay={80}
        closeDelay={120}
        className="hero-notification-trigger"
        aria-label="3 notificaciones"
      >
        <BellRingingIcon aria-hidden="true" />
        <span className="hero-notification-count" aria-hidden="true">3</span>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={10} className="hero-notification-popover">
        <PopoverHeader>
          <PopoverTitle>Notificaciones</PopoverTitle>
          <PopoverDescription>Actividad ilustrativa del laboratorio</PopoverDescription>
        </PopoverHeader>
        <ul className="hero-notification-list">
          {notifications.map((notification) => (
            <li key={notification.title} className="hero-notification-item" data-tone={notification.tone}>
              <span className="hero-notification-dot" aria-hidden="true" />
              <span><strong>{notification.title}</strong><small>{notification.detail}</small></span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 4: Run the focused tests and confirm green**

Run the focused command from Step 2. Expected: 2 tests pass.

- [ ] **Step 5: Commit the isolated notification component**

```bash
git add src/components/landing/HeroNotifications.tsx src/components/landing/HeroNotifications.test.tsx
git commit -m "feat: add hero notification popover"
```

---

### Task 2: Brand the product bar and integrate permanent semantic Orders content

**Files:**
- Modify: `src/components/landing/HeroProductPreview.tsx`
- Modify: `src/components/landing/HeroProductPreview.test.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: `HeroNotifications` from Task 1.
- Produces: `StatusTone = "positive" | "progress" | "warning" | "review"` and tone-aware preview rows.
- Preserves: `HeroProductPreview()` and `PRODUCT_TABS` public APIs.

- [ ] **Step 1: Add failing assertions for brand, metrics, and tones**

Extend `HeroProductPreview.test.tsx` with:

```tsx
it("brands the product bar and keeps operational metrics inside Orders", () => {
  render(<PreviewHarness />);

  expect(screen.getByRole("img", { name: "Comelu" })).toHaveAttribute("src", "/comelu-horizontal.svg");
  expect(screen.getByRole("button", { name: "3 notificaciones" })).toBeVisible();
  expect(screen.getByLabelText("18 órdenes de trabajo activas")).toBeVisible();
  expect(screen.getByLabelText("3 entregas programadas para hoy")).toBeVisible();
});

it("exposes semantic tones on product records", () => {
  render(<PreviewHarness />);

  expect(screen.getByText("En producción").closest("article")).toHaveAttribute("data-tone", "progress");
  expect(screen.getByText("Por iniciar").closest("article")).toHaveAttribute("data-tone", "warning");
  expect(screen.getByText("Control de calidad").closest("article")).toHaveAttribute("data-tone", "review");
});
```

Update the first `App.test.tsx` test to expect three shared logos because navbar, product mockup, and footer now reuse the asset:

```tsx
expect(logos).toHaveLength(3);
```

- [ ] **Step 2: Run the focused tests and confirm red**

```bash
pnpm test -- src/components/landing/HeroProductPreview.test.tsx src/App.test.tsx
```

Expected: FAIL because the header still renders the placeholder mark, permanent metrics do not exist inside Orders, tones are incomplete, and the app currently has two logos.

- [ ] **Step 3: Make tones explicit in preview data**

In `HeroProductPreview.tsx`, add:

```tsx
export type StatusTone = "positive" | "progress" | "warning" | "review";
```

Add `tone` to each record:

```tsx
// Clients: active workloads = progress; Al día = positive.
// Orders: En producción = progress; Por iniciar = warning; Control de calidad = review.
// Production stages: Por iniciar = warning; En producción = progress; Control de calidad = review.
// Payments: Pendiente = warning; Pagada and Recibido = positive.
```

Change the badge API and every call site:

```tsx
function StatusBadge({ children, tone }: { children: string; tone: StatusTone }) {
  return <span className="hero-status" data-tone={tone}>{children}</span>;
}
```

Place `data-tone={record.tone}` on client rows, order rows, production columns, production-order cards, payment rows, and the mobile order card.

- [ ] **Step 4: Replace the placeholder product brand and add header notifications**

Change `ProductWindowHeader` to:

```tsx
function ProductWindowHeader() {
  return (
    <div className="hero-window-header">
      <div className="hero-window-brand">
        <img src="/comelu-horizontal.svg" alt="Comelu" />
      </div>
      <span className="hero-window-context">Operación del laboratorio</span>
      <div className="hero-window-tools">
        <span className="hero-concept-label">Vista conceptual</span>
        <HeroNotifications />
      </div>
    </div>
  );
}
```

Import `HeroNotifications` from `./HeroNotifications` at the top of the file.

- [ ] **Step 5: Add permanent metrics inside Orders**

After the Orders panel heading, add:

```tsx
<div className="hero-order-summary" aria-label="Resumen de órdenes">
  <article className="hero-order-metric" data-tone="progress" aria-label="18 órdenes de trabajo activas">
    <strong>18</strong><span>OT activas</span>
  </article>
  <article className="hero-order-metric" data-tone="warning" aria-label="3 entregas programadas para hoy">
    <strong>3</strong><span>entregas hoy</span>
  </article>
</div>
```

- [ ] **Step 6: Run focused tests and confirm green**

Run the command from Step 2. Expected: all focused tests pass.

- [ ] **Step 7: Commit semantic product content**

```bash
git add src/components/landing/HeroProductPreview.tsx src/components/landing/HeroProductPreview.test.tsx src/App.test.tsx
git commit -m "feat: integrate semantic product status"
```

---

### Task 3: Replace floating KPIs with a traveling tab indicator

**Files:**
- Modify: `src/components/landing/HeroSection.tsx`
- Modify: `src/components/landing/HeroSection.test.tsx`

**Interfaces:**
- Consumes: `ProductTabValue` and `PRODUCT_TABS` from `HeroProductPreview`.
- Produces: controlled Base UI Tabs and `.hero-tabs-indicator` with custom property `--hero-tab-index`.

- [ ] **Step 1: Replace old KPI expectations with a failing indicator test**

In `HeroSection.test.tsx`, remove the two `Dato ilustrativo` expectations and add:

```tsx
it("moves one shared selection indicator with the controlled tab", async () => {
  const user = userEvent.setup();
  const { container } = render(<HeroSection onWaitlist={vi.fn()} onProblems={vi.fn()} />);
  const tabsList = screen.getByRole("tablist", { name: "Explorar Comelu" });

  expect(tabsList).toHaveStyle({ "--hero-tab-index": "1" });
  expect(container.querySelectorAll(".hero-tabs-indicator")).toHaveLength(1);
  expect(container.querySelector(".hero-kpi")).not.toBeInTheDocument();

  await user.click(screen.getByRole("tab", { name: "Producción" }));

  expect(tabsList).toHaveStyle({ "--hero-tab-index": "2" });
});
```

- [ ] **Step 2: Run the focused test and confirm red**

```bash
pnpm test -- src/components/landing/HeroSection.test.tsx
```

Expected: FAIL because tabs are uncontrolled, the indicator does not exist, and floating KPIs remain.

- [ ] **Step 3: Control tab value and indicator index**

Update imports and state in `HeroSection.tsx`:

```tsx
import { type CSSProperties, useState } from "react";
import { HeroProductPreview, PRODUCT_TABS, type ProductTabValue } from "./HeroProductPreview";

const [activeTab, setActiveTab] = useState<ProductTabValue>("orders");
const activeTabIndex = PRODUCT_TABS.findIndex((tab) => tab.value === activeTab);
const tabListStyle = { "--hero-tab-index": activeTabIndex } as CSSProperties;
```

Use controlled tabs and render the shared indicator:

```tsx
<Tabs
  value={activeTab}
  onValueChange={(value) => setActiveTab(value as ProductTabValue)}
  className="hero-product-tabs"
>
  <TabsList aria-label="Explorar Comelu" className="hero-tabs-list" style={tabListStyle}>
    <span className="hero-tabs-indicator" aria-hidden="true" />
    {PRODUCT_TABS.map((tab) => (
      <TabsTrigger key={tab.value} value={tab.value} className="hero-tab-trigger">
        <span className="hero-tab-label">{tab.label}</span>
      </TabsTrigger>
    ))}
  </TabsList>
```

Delete both `.hero-kpi` nodes from `.hero-preview-stage`.

- [ ] **Step 4: Run the focused test and confirm green**

Run the command from Step 2. Expected: all HeroSection tests pass.

- [ ] **Step 5: Commit tab behavior separately**

```bash
git add src/components/landing/HeroSection.tsx src/components/landing/HeroSection.test.tsx
git commit -m "feat: add traveling hero tab indicator"
```

---

### Task 4: Style the branded bar, motion, semantic states, and responsive layout

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes all `.hero-*` classes and `data-tone` attributes from Tasks 1–3.
- Preserves the current 1440×900 compact hero rhythm and existing focus-visible behavior.

- [ ] **Step 1: Style the Sky application bar and logo**

Update `.hero-window-header` to use the current primary Sky surface, four desktop columns, and high-contrast text:

```css
.hero-window-header {
  grid-template-columns: auto minmax(0, 1fr) auto;
  background: var(--primary);
  color: var(--primary-foreground);
}

.hero-window-brand img {
  width: 6.75rem;
  height: auto;
}

.hero-window-tools {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 0.75rem;
}
```

Remove `.hero-window-mark` because the placeholder no longer exists. At mobile widths, use brand / flexible spacer / tools columns and keep `.hero-window-context` hidden.

- [ ] **Step 2: Style notification trigger and Popover**

Add the notification presentation:

```css
.hero-notification-trigger {
  position: relative;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid oklch(1 0 0 / 20%);
  border-radius: 50%;
  background: oklch(1 0 0 / 10%);
  color: white;
}

.hero-notification-trigger svg {
  width: 1rem;
  height: 1rem;
  animation: hero-bell-alert 10s ease-in-out infinite;
}

.hero-notification-count {
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  display: grid;
  width: 1rem;
  height: 1rem;
  place-items: center;
  border-radius: 50%;
  background: var(--chart-2);
  color: oklch(0.2 0.04 75);
  font-size: 0.58rem;
  font-weight: 700;
}

.hero-notification-popover {
  width: min(20rem, calc(100vw - 2rem));
  border: 1px solid oklch(0.78 0.06 235 / 22%);
  background: oklch(0.145 0.03 239 / 98%);
  color: oklch(0.94 0.015 235);
}

.hero-notification-list {
  display: grid;
  gap: 0.45rem;
}

.hero-notification-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.65rem;
  padding: 0.65rem;
  border: 1px solid color-mix(in oklch, var(--hero-tone), transparent 76%);
  border-radius: var(--radius-lg);
  background: var(--hero-tone-soft);
}

.hero-notification-item > span:last-child {
  display: grid;
  gap: 0.15rem;
}

.hero-notification-item small {
  color: oklch(0.72 0.025 235);
}

.hero-notification-dot {
  width: 0.45rem;
  height: 0.45rem;
  margin-top: 0.3rem;
  border-radius: 50%;
  background: var(--hero-tone);
}
```

Add a ten-second animation with a short alert window and a long idle tail:

```css
@keyframes hero-bell-alert {
  0%, 4%, 100% { transform: rotate(0); }
  0.8% { transform: rotate(12deg); }
  1.6% { transform: rotate(-10deg); }
  2.4% { transform: rotate(7deg); }
  3.2% { transform: rotate(-4deg); }
}
```

Apply `animation: hero-bell-alert 10s ease-in-out infinite` to the bell SVG.

- [ ] **Step 3: Style the permanent Orders metrics and semantic tones**

Delete `.hero-kpi`, `.hero-kpi-orders`, `.hero-kpi-deliveries`, `.hero-kpi-dot`, and related desktop display rules. Add the permanent summary:

```css
.hero-order-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.hero-order-metric {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid color-mix(in oklch, var(--hero-tone), transparent 74%);
  border-radius: var(--radius-lg);
  background: var(--hero-tone-soft);
}

.hero-order-metric strong {
  color: var(--hero-tone);
  font-family: var(--font-heading);
  font-size: 1rem;
}
```

Define reusable data-tone properties:

```css
:is(.hero-product-window, .hero-notification-popover) [data-tone="positive"] { --hero-tone: oklch(0.8 0.12 151); --hero-tone-soft: oklch(0.43 0.1 153 / 18%); }
:is(.hero-product-window, .hero-notification-popover) [data-tone="progress"] { --hero-tone: oklch(0.81 0.1 230); --hero-tone-soft: oklch(0.39 0.1 239 / 24%); }
:is(.hero-product-window, .hero-notification-popover) [data-tone="warning"] { --hero-tone: oklch(0.85 0.15 75); --hero-tone-soft: oklch(0.47 0.11 70 / 20%); }
:is(.hero-product-window, .hero-notification-popover) [data-tone="review"] { --hero-tone: oklch(0.78 0.1 305); --hero-tone-soft: oklch(0.42 0.1 300 / 20%); }
```

Use `var(--hero-tone)` and `var(--hero-tone-soft)` for badge color/background/border and apply an inset `3px 0` accent to tone-aware rows and cards. Keep the existing hover movement limits at 1–2 px.

- [ ] **Step 4: Replace active-trigger animation with shared-indicator travel**

Make `.hero-tabs-list` positioned and preserve its overflow behavior. Style the shared indicator and transparent triggers with:

```css
.hero-tabs-indicator {
  position: absolute;
  inset-block: 3px;
  left: 3px;
  width: calc((100% - 6px) / 4);
  transform: translateX(calc(var(--hero-tab-index) * 100%));
  transition: transform 100ms ease-out;
}

.hero-tab-trigger,
.hero-tab-trigger:hover,
.hero-tab-trigger[data-active],
.hero-tab-trigger[data-active]:hover {
  position: relative;
  z-index: 1;
  background: transparent;
  box-shadow: none;
  transform: none;
}

.hero-tab-label {
  transition: transform 100ms ease-out;
}

.hero-tab-trigger:hover .hero-tab-label {
  transform: translateY(-1px) scale(1.02);
}
```

Set `.hero-tab-trigger` to transparent backgrounds in normal, hover, and active states, and keep it above the indicator. Remove `hero-tab-pill-in` and its keyframes. Add `.hero-tab-label` transition and apply only `transform: translateY(-1px) scale(1.02)` on trigger hover.

- [ ] **Step 5: Extend responsive and reduced-motion rules**

Ensure the Popover width fits 375 px, header tools do not overlap the brand, and the two Orders metrics remain inside the panel at all breakpoints.

Inside `prefers-reduced-motion: reduce`, set:

```css
.hero-notification-trigger svg { animation: none; }
.hero-tabs-indicator,
.hero-tab-label { transition: none; }
.hero-tab-trigger:hover .hero-tab-label { transform: none; }
```

Keep the existing panel and surface reduced-motion overrides.

- [ ] **Step 6: Run the full automated gates**

```bash
pnpm test
pnpm build
git diff --check
```

Expected: 40 tests pass (35 existing plus 2 notification tests, 2 preview tests, and 1 indicator test), build passes, and no whitespace errors are reported.

- [ ] **Step 7: Commit visual presentation**

```bash
git add src/index.css tsconfig.tsbuildinfo
git commit -m "style: polish hero product application states"
```

---

### Task 5: Rendered QA, push, and PR update

**Files:**
- No committed source files unless QA reveals a defect.

- [ ] **Step 1: Start the local app**

```bash
pnpm dev --host 127.0.0.1
```

Use the assigned Vite port exactly.

- [ ] **Step 2: Verify desktop and mobile behavior**

At 1440×900, 1024×768, 768×1024, and 375×812 verify:

- the Sky bar shows the real Comelu logo without clipping;
- the bell alerts briefly and stays idle for the remainder of its ten-second cycle;
- hover, focus, and click/tap open the notification Popover inside the viewport;
- the Orders metrics are permanent and no floating notes remain;
- the shared pill travels from origin to destination in `100ms`;
- tab hover moves only the text and never changes the background;
- record tones match their visible status text;
- no horizontal overflow or relevant console warnings occur;
- reduced-motion mode removes the new movement.

If the in-app Browser is unavailable and Playwright is not installed, record that limitation instead of claiming rendered QA.

- [ ] **Step 3: Re-run final verification after any QA edits**

```bash
pnpm test
pnpm build
git diff --check
git status --short
```

- [ ] **Step 4: Push the existing branch and update PR #29**

```bash
git push origin feat/product-first-hero
gh pr checks 29 --watch --interval 5
```

Update the PR with the notification interaction, integrated Orders metrics, traveling pill, semantic statuses, command results, rendered-QA status, risks, and rollback commits. Do not create another PR, merge, or deploy manually.
