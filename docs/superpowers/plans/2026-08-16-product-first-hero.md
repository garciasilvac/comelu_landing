# Product-first Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Comelu's photographic landing hero with an accessible, responsive, product-first hero featuring shadcn tabs, domain-specific product previews, and a lightweight CAD mesh background.

**Architecture:** `HeroSection` owns the semantic hero, conversion actions, and the shadcn `Tabs` root/list. `HeroProductPreview` owns the four `TabsContent` product views and separate desktop/mobile compositions, while `HeroMeshBackground` is a purely decorative inline SVG. Existing application callbacks remain the only integration surface; no new dependency or global state is introduced.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, shadcn/Base UI tabs, Vitest, Testing Library, native CSS/SVG.

## Global Constraints

- Work only in `/Users/CarlosG/wt-product-first-hero` on `feat/product-first-hero`.
- Do not preserve or adapt the current hero markup, photo background, bullet list, or hero-specific CSS.
- Keep the existing waitlist and problems-section callback behavior.
- Use the existing shadcn `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent`; do not build a custom state selector.
- Use no new dependency and no raster asset for the hero.
- Keep Spanish (Chile) copy factual for a product still in development; illustrative interface data must not read as real customer evidence or outcomes.
- Support 375, 768, 1024, and 1440 px without page-level horizontal overflow.
- Meet WCAG 2.2 AA, keyboard navigation, visible focus, practical touch targets, non-color-only states, and `prefers-reduced-motion`.
- Keep entrance motion between approximately 400 and 700 ms and avoid continuous prominent motion.
- Preserve shared reveal behavior and assets used by downstream landing sections.
- Run `pnpm test` and `pnpm build`; no separate lint or typecheck script exists in `package.json`.

---

## File map

- Create `src/components/landing/HeroProductPreview.tsx`: domain data and four shadcn tab panels with desktop and mobile product representations.
- Create `src/components/landing/HeroProductPreview.test.tsx`: tab content, pointer interaction, and domain-data contract.
- Create `src/components/landing/HeroMeshBackground.tsx`: decorative CAD mesh SVG.
- Create `src/components/landing/HeroMeshBackground.test.tsx`: decorative accessibility contract.
- Create `src/components/landing/HeroSection.tsx`: hero copy, CTAs, shadcn tabs root/list, KPI badges, and component composition.
- Create `src/components/landing/HeroSection.test.tsx`: content hierarchy, callbacks, tab list, and initial preview contract.
- Modify `src/App.tsx`: import the new standalone `HeroSection`.
- Modify `src/App.test.tsx`: update the landing contract and add integrated tab behavior.
- Modify `src/components/landing/landing-sections.tsx`: remove the discarded hero and its imports.
- Modify `src/components/landing/landing-data.ts`: remove `HERO_BULLETS` after proving it has no remaining use.
- Modify `src/index.css`: replace old hero selectors with the new layout, mesh, preview, responsive, and reduced-motion styles.
- Delete `src/lib/landingAssets.ts`: old hero-only raster imports.
- Delete `src/assets/landing/hero/hero-lab-dark.png`: unused old desktop hero image.
- Delete `src/assets/landing/hero/hero-lab-dark-mobile.png`: unused old mobile hero image.

---

### Task 1: Build the shadcn product preview tabs

**Files:**
- Create: `src/components/landing/HeroProductPreview.tsx`
- Create: `src/components/landing/HeroProductPreview.test.tsx`

**Interfaces:**
- Consumes: shadcn `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` from `@/components/ui/tabs`.
- Produces: `PRODUCT_TABS: readonly { value: ProductTabValue; label: string }[]` and `HeroProductPreview(): JSX.Element`.
- Produces tab values: `"clients" | "orders" | "production" | "payments"`; later tasks must use `"orders"` as the default.

- [ ] **Step 1: Write the failing preview test**

Create `src/components/landing/HeroProductPreview.test.tsx` with a real shadcn tab root so the test verifies the production interaction rather than a custom state wrapper:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroProductPreview, PRODUCT_TABS } from "./HeroProductPreview";

function PreviewHarness() {
  return (
    <Tabs defaultValue="orders">
      <TabsList aria-label="Explorar Comelu">
        {PRODUCT_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
        ))}
      </TabsList>
      <HeroProductPreview />
    </Tabs>
  );
}

describe("HeroProductPreview", () => {
  it("shows the orders preview by default and switches to payments", async () => {
    const user = userEvent.setup();
    render(<PreviewHarness />);

    expect(screen.getAllByText("OT-2048")[0]).toBeVisible();
    expect(screen.getAllByText("Corona zirconia")[0]).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Pagos" }));

    expect(screen.getByText("Factura 00481")).toBeVisible();
    expect(screen.getByText("Comprobante adjunto")).toBeVisible();
  });

  it("exposes four domain tabs and conceptual-data labeling", () => {
    render(<PreviewHarness />);

    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByText("Vista conceptual")).toBeVisible();
  });

  it("changes panels with arrow-key tab navigation", async () => {
    const user = userEvent.setup();
    render(<PreviewHarness />);
    const ordersTab = screen.getByRole("tab", { name: "Órdenes" });
    ordersTab.focus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Producción" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Por iniciar")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the preview test and confirm the red state**

Run: `pnpm test -- src/components/landing/HeroProductPreview.test.tsx`

Expected: FAIL because `./HeroProductPreview` does not exist.

- [ ] **Step 3: Implement domain data and real `TabsContent` panels**

Create `src/components/landing/HeroProductPreview.tsx`. Use these exported tab definitions exactly:

```tsx
export type ProductTabValue = "clients" | "orders" | "production" | "payments";

export const PRODUCT_TABS = [
  { value: "clients", label: "Clientes" },
  { value: "orders", label: "Órdenes" },
  { value: "production", label: "Producción" },
  { value: "payments", label: "Pagos" },
] as const satisfies readonly { value: ProductTabValue; label: string }[];
```

Render four direct `TabsContent` children with values matching the definitions. Give each panel a shared product-window shell containing `Vista conceptual`. Use these required visible examples:

```tsx
const orders = [
  { id: "OT-2048", client: "Clínica Los Andes", work: "Corona zirconia", state: "En producción", delivery: "18 ago" },
  { id: "OT-2043", client: "Clínica Santa María", work: "Prótesis removible", state: "Por iniciar", delivery: "19 ago" },
  { id: "OT-2039", client: "Centro Dental Orto Sur", work: "Puente 3 piezas", state: "Control de calidad", delivery: "18 ago" },
] as const;
```

The desktop order panel renders column headers and all three rows using `.hero-preview-desktop`. Its mobile-specific `.hero-preview-mobile` card renders `OT-2048`, `Cliente: Clínica Los Andes`, `Trabajo: Corona zirconia`, `Estado: En producción`, and `Entrega: 18 ago` as text, not icon-only fields. The other panels render:

- Clients: Clínica Los Andes, Centro Dental Orto Sur, Clínica Santa María, contact context, and active-order context.
- Production: Por iniciar, En producción, Control de calidad, and no more than three sample order cards.
- Payments: Factura 00481, Pendiente, Pagada, and the exact phrase `Comprobante adjunto`.

State badges include visible text, not color alone. Do not use images, canvas, or an active-tab React state variable.

- [ ] **Step 4: Run the preview tests**

Run: `pnpm test -- src/components/landing/HeroProductPreview.test.tsx`

Expected: 3 tests PASS; clicking Pagos and arrowing to Producción select real shadcn panels and reveal matching content.

- [ ] **Step 5: Commit the preview unit**

```bash
git add src/components/landing/HeroProductPreview.tsx src/components/landing/HeroProductPreview.test.tsx
git commit -m "feat: add product preview tabs"
```

---

### Task 2: Add the lightweight CAD mesh background

**Files:**
- Create: `src/components/landing/HeroMeshBackground.tsx`
- Create: `src/components/landing/HeroMeshBackground.test.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: no props and no runtime data.
- Produces: `HeroMeshBackground(): JSX.Element`, a non-focusable decorative layer.

- [ ] **Step 1: Write the failing accessibility test**

Create `src/components/landing/HeroMeshBackground.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroMeshBackground } from "./HeroMeshBackground";

describe("HeroMeshBackground", () => {
  it("is decorative and cannot receive focus", () => {
    const { container } = render(<HeroMeshBackground />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).not.toHaveAttribute("role", "img");
  });
});
```

- [ ] **Step 2: Run the mesh test and confirm the red state**

Run: `pnpm test -- src/components/landing/HeroMeshBackground.test.tsx`

Expected: FAIL because `./HeroMeshBackground` does not exist.

- [ ] **Step 3: Implement the decorative SVG**

Create `src/components/landing/HeroMeshBackground.tsx` with an outer `div.hero-mesh-background`, an inline SVG using `viewBox="0 0 1440 900"`, `preserveAspectRatio="xMidYMid slice"`, `aria-hidden="true"`, and `focusable="false"`. Use one low-opacity path group for 10–16 connected polygon edges, one group for 4–6 small Amber circles, and no tooth silhouette, text, filters, Canvas, WebGL, or JavaScript animation.

Add only the mesh foundation to `src/index.css`:

```css
.hero-mesh-background {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: radial-gradient(circle at 50% 78%, color-mix(in oklch, var(--primary), transparent 78%), transparent 42%);
  mask-image: linear-gradient(to bottom, black 0%, black 68%, transparent 100%);
}

.hero-mesh-background svg {
  width: 100%;
  height: 100%;
  opacity: 0.28;
}
```

Use CSS classes for Sky edges and Amber nodes rather than hard-coded light-theme colors.

- [ ] **Step 4: Run the mesh test and build**

Run: `pnpm test -- src/components/landing/HeroMeshBackground.test.tsx && pnpm build`

Expected: test PASS; TypeScript and Vite build PASS.

- [ ] **Step 5: Commit the background unit**

```bash
git add src/components/landing/HeroMeshBackground.tsx src/components/landing/HeroMeshBackground.test.tsx src/index.css
git commit -m "feat: add hero mesh background"
```

---

### Task 3: Compose the standalone hero and conversion actions

**Files:**
- Create: `src/components/landing/HeroSection.tsx`
- Create: `src/components/landing/HeroSection.test.tsx`

**Interfaces:**
- Consumes: `onWaitlist: () => void` and `onProblems: () => void`.
- Consumes: `PRODUCT_TABS` and `HeroProductPreview` from Task 1; `HeroMeshBackground` from Task 2.
- Produces: `HeroSection({ onWaitlist, onProblems }: HeroSectionProps): JSX.Element`.

- [ ] **Step 1: Write the failing hero contract tests**

Create `src/components/landing/HeroSection.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("presents the product-first hierarchy and accessible tabs", () => {
    render(<HeroSection onWaitlist={vi.fn()} onProblems={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Toda la operación de tu laboratorio dental, en un solo lugar." })).toBeVisible();
    expect(screen.getByText("Software para laboratorios dentales en Chile")).toBeVisible();
    expect(screen.getByRole("tablist", { name: "Explorar Comelu" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Órdenes" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("18 OT activas")).toBeVisible();
    expect(screen.getByText("3 entregas hoy")).toBeVisible();
  });

  it("keeps both existing conversion callbacks", async () => {
    const user = userEvent.setup();
    const onWaitlist = vi.fn();
    const onProblems = vi.fn();
    render(<HeroSection onWaitlist={onWaitlist} onProblems={onProblems} />);

    await user.click(screen.getByRole("button", { name: "Unirme a la lista de espera" }));
    await user.click(screen.getByRole("button", { name: "Ver qué buscamos resolver" }));

    expect(onWaitlist).toHaveBeenCalledOnce();
    expect(onProblems).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the hero test and confirm the red state**

Run: `pnpm test -- src/components/landing/HeroSection.test.tsx`

Expected: FAIL because `./HeroSection` does not exist.

- [ ] **Step 3: Implement the standalone hero composition**

Create `src/components/landing/HeroSection.tsx` with this public interface:

```tsx
export type HeroSectionProps = {
  onWaitlist: () => void;
  onProblems: () => void;
};
```

Render a semantic `<section aria-labelledby="hero-title" className="hero-section">`, `HeroMeshBackground`, a `.hero-content` wrapper, the approved badge/headline/supporting copy, and two existing shadcn `Button` controls inside `.hero-actions`. Use the approved text exactly. Render `Tabs defaultValue="orders" className="hero-product-tabs"`, a `TabsList aria-label="Explorar Comelu" className="hero-tabs-list"`, one `TabsTrigger` per `PRODUCT_TABS` entry, then `HeroProductPreview` inside `.hero-preview-stage` as a child of the same `Tabs` root.

Render exactly two desktop KPI badges near the preview: `18 OT activas` and `3 entregas hoy`. Add adjacent or screen-reader context identifying the interface values as illustrative. Do not place the old bullet list, old explanatory paragraph, raster background styles, or a second tab state implementation in this component.

- [ ] **Step 4: Run hero and preview tests**

Run: `pnpm test -- src/components/landing/HeroSection.test.tsx src/components/landing/HeroProductPreview.test.tsx`

Expected: all 5 focused tests PASS; the orders tab is selected by default, keyboard navigation changes panels, and both callbacks fire once.

- [ ] **Step 5: Commit the composed hero**

```bash
git add src/components/landing/HeroSection.tsx src/components/landing/HeroSection.test.tsx
git commit -m "feat: compose product-first hero"
```

---

### Task 4: Integrate the replacement and remove old hero code

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/components/landing/landing-sections.tsx`
- Modify: `src/components/landing/landing-data.ts`
- Delete: `src/lib/landingAssets.ts`
- Delete: `src/assets/landing/hero/hero-lab-dark.png`
- Delete: `src/assets/landing/hero/hero-lab-dark-mobile.png`

**Interfaces:**
- Consumes: `HeroSection` and `HeroSectionProps` from Task 3.
- Preserves: `onWaitlistClick` and `() => scrollTo("que-resuelve")` behavior in `App`.
- Removes: the old `HeroSection` export from `landing-sections.tsx`, `HERO_BULLETS`, and `landingHeroImages`.

- [ ] **Step 1: Update the integrated landing test first**

Modify the hero assertion in `src/App.test.tsx` and add integrated tab behavior:

```tsx
expect(
  screen.getByRole("heading", {
    level: 1,
    name: "Toda la operación de tu laboratorio dental, en un solo lugar.",
  }),
).toBeVisible();
expect(screen.queryByText("El Software que cambiará la gestión del laboratorio dental")).not.toBeInTheDocument();
```

Add this test:

```tsx
it("switches product previews through accessible shadcn tabs", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("tab", { name: "Producción" }));

  expect(screen.getByText("Por iniciar")).toBeVisible();
  expect(screen.getAllByText("Control de calidad")[0]).toBeVisible();
});
```

- [ ] **Step 2: Run the integrated test and confirm the red state**

Run: `pnpm test -- src/App.test.tsx`

Expected: FAIL because `App` still renders the old headline and old hero.

- [ ] **Step 3: Connect the new component and remove old code**

In `src/App.tsx`, remove `HeroSection` from the grouped `landing-sections` import and add:

```tsx
import { HeroSection } from "@/components/landing/HeroSection";
```

Keep the current JSX callback wiring unchanged:

```tsx
<HeroSection onWaitlist={onWaitlistClick} onProblems={() => scrollTo("que-resuelve")} />
```

In `landing-sections.tsx`, delete the old `HeroSection` function and remove its now-dead imports: `CheckCircleIcon`, `Badge`, `landingHeroImages`, and `HERO_BULLETS`. Retain `SparkleIcon`, shared `data-reveal` attributes, and every downstream section.

In `landing-data.ts`, delete only `HERO_BULLETS`. Then delete `landingAssets.ts` and both `src/assets/landing/hero/hero-lab-dark*.png` files after running the reference scan below.

- [ ] **Step 4: Prove old hero resources have no remaining consumers**

Run:

```bash
rg -n "landingHeroImages|HERO_BULLETS|hero-lab-dark|hero-panel|hero-grid|hero-copy" src
```

Expected before CSS cleanup: matches only for old `.hero-*` selectors in `src/index.css`; no TypeScript or asset import matches.

- [ ] **Step 5: Run the integrated and full test suites**

Run: `pnpm test -- src/App.test.tsx && pnpm test`

Expected: integrated test PASS; all repository tests PASS.

- [ ] **Step 6: Commit integration and old asset cleanup**

```bash
git add src/App.tsx src/App.test.tsx src/components/landing/landing-sections.tsx src/components/landing/landing-data.ts src/lib/landingAssets.ts src/assets/landing/hero/hero-lab-dark.png src/assets/landing/hero/hero-lab-dark-mobile.png
git commit -m "refactor: replace legacy landing hero"
```

---

### Task 5: Implement responsive visual states and reduced motion

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: class names rendered by Tasks 1–3.
- Produces: stable layouts at 375, 768, 1024, and 1440 px with no horizontal page overflow.

- [ ] **Step 1: Remove the old hero CSS before adding replacements**

Delete `.hero-panel`, `.hero-panel-inner`, `.hero-grid`, `.hero-copy`, and their hero-specific media-query declarations from `src/index.css`. Do not delete `.section-block`, carousel styles, `[data-reveal]`, or shared reduced-motion rules.

Run:

```bash
rg -n "hero-panel|hero-panel-inner|hero-grid|hero-copy" src
```

Expected: no matches.

- [ ] **Step 2: Add the approved desktop foundation**

Add focused class groups to `src/index.css` for `.hero-section`, `.hero-content`, `.hero-actions`, `.hero-product-tabs`, `.hero-tabs-list`, `.hero-preview-stage`, `.hero-product-window`, `.hero-kpi`, desktop table/workflow/payment surfaces, and the mesh classes from Task 2.

Use these layout constraints:

```css
.hero-section {
  position: relative;
  isolation: isolate;
  width: 100%;
  overflow: clip;
  background: oklch(0.14 0.035 242);
  color: white;
}

.hero-content {
  width: min(100% - 2rem, 76rem);
  margin-inline: auto;
  padding-block: 4.5rem 0;
  text-align: center;
}

.hero-product-window {
  width: 100%;
  min-height: 27rem;
  border: 1px solid color-mix(in oklch, white, transparent 88%);
  border-radius: var(--radius-2xl);
  background: color-mix(in oklch, black, var(--primary) 10%);
  box-shadow: 0 32px 80px -44px color-mix(in oklch, var(--primary), transparent 34%);
}
```

Use `clamp()` for the headline between approximately 2.25rem and 4.5rem, keep its measure near 14–16 words per line at large sizes, cap the preview at 76rem, and retain a minimum 44 px control height where practical. Use no viewport-width calculation that can exceed the page.

- [ ] **Step 3: Add mobile and tablet compositions**

At the base/375 px layout:

- stack CTAs full-width;
- keep tabs inside the hero width with compact trigger padding;
- show `.hero-preview-mobile` and hide `.hero-preview-desktop`;
- hide `.hero-kpi`;
- render the OT-2048 detail card at a readable font size;
- ensure the product window has no desktop min-width.

At `min-width: 768px`, allow inline CTAs and a simplified desktop/tablet preview. At `min-width: 1024px`, show the full desktop preview and KPI badges. At 1440 px, preserve the 76rem content cap.

- [ ] **Step 4: Add restrained entrance motion and reduced-motion override**

Create one `@keyframes hero-enter` and use CSS custom properties for stagger delay/distance. Apply 400–700 ms transitions to the badge, headline, supporting copy, actions, and preview. The preview starts at `translateY(24px) scale(.985)`; the headline starts at `translateY(8px)`.

Inside the existing `@media (prefers-reduced-motion: reduce)`, add explicit hero overrides so all hero entrance elements render with `opacity: 1`, `transform: none`, `animation: none`, and tab panels do not crossfade. No essential content may depend on animation completion.

- [ ] **Step 5: Run tests and build after styling**

Run: `pnpm test && pnpm build`

Expected: all tests PASS; `tsc -b` and Vite build PASS with no missing asset reference.

- [ ] **Step 6: Commit the visual implementation**

```bash
git add src/index.css
git commit -m "style: add responsive hero presentation"
```

---

### Task 6: Verify responsive, keyboard, reduced-motion, and cleanup behavior

**Files:**
- Modify only if a verified defect is found: hero files from Tasks 1–5.

**Interfaces:**
- Consumes: the completed landing page through `pnpm dev`.
- Produces: verification evidence for the PR description; no new package or committed screenshot is required.

- [ ] **Step 1: Start the local application**

Run: `pnpm dev --host 127.0.0.1`

Expected: Vite reports a local HTTP URL and no startup error.

- [ ] **Step 2: Verify the four required viewport sizes**

At 375×812, 768×1024, 1024×768, and 1440×900, inspect the initial viewport and confirm:

- no `document.documentElement.scrollWidth > document.documentElement.clientWidth`;
- headline has no clipping or oversized line;
- primary and secondary CTAs are fully visible and usable;
- tabs fit or scroll only inside their own contained list;
- preview content is legible;
- the 375 px view shows the dedicated OT-2048 detail composition;
- 1024 and 1440 px show the wide product window;
- KPI badges do not overlap tabs or preview content.

- [ ] **Step 3: Verify tab and keyboard behavior**

Use Tab to focus the product tab list, arrow through Clientes → Órdenes → Producción → Pagos, and confirm visible focus and matching panel content. Activate both CTAs and verify they move focus/scroll to the existing destinations. Check the browser console after these interactions; expected console error count is zero.

- [ ] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload, and confirm all hero content appears immediately with no translate/scale entrance and tab changes remain understandable.

- [ ] **Step 5: Run the final automated gates and residue scan**

Run:

```bash
pnpm test
pnpm build
git diff --check
rg -n "landingHeroImages|HERO_BULLETS|hero-lab-dark|hero-panel|hero-grid|hero-copy" src || true
git status --short
```

Expected: all tests PASS; build PASS; no whitespace errors; residue scan has no matches; only intentional task files are modified and `.superpowers/` remains untracked and unstaged.

- [ ] **Step 6: Commit verified fixes only if verification changed code**

If Steps 2–5 revealed and fixed a defect, stage only the affected hero file and commit with a specific conventional message such as:

```bash
git add src/index.css src/components/landing/HeroSection.tsx src/components/landing/HeroProductPreview.tsx
git commit -m "fix: prevent hero overflow on mobile"
```

If no defect was found, do not create an empty commit.

---

## Completion and PR preparation

After all tasks pass:

1. Review `git log --oneline origin/main..HEAD` and confirm commits are layered and conventional.
2. Push with `git push -u origin feat/product-first-hero`.
3. Create one PR titled **feat: replace landing hero with product preview**.
4. Include summary, commands and manual viewport checks, key files, risks, rollback instructions, and the statement that no dependency, environment variable, or production configuration was added.
5. Do not merge or deploy without separate user instruction.
