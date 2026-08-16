# Shadcn Visual Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make preset `b3t20MAXvW` visibly dominant across the existing Comelu landing page without changing its copy, section order, assets, lead payload, or backend behavior.

**Architecture:** Replace bespoke UI markup with focused landing components composed from the installed Base UI-flavored shadcn primitives. Move static content to `landing-data.ts`; keep each stateful behavior in the section that owns it; reduce `App.tsx` to scrolling and section composition.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, shadcn Base Nova, Base UI, Phosphor Icons, Vitest, Testing Library.

## Global Constraints

- Continue on `feat/apply-shadcn-preset` in `/Users/CarlosG/wt-apply-shadcn-preset` and update PR #25.
- Use Sky primary, Amber chart/accent, Neutral surfaces, Oxanium body, Geist Mono headings, Phosphor icons, and small radius.
- Preserve every visible string, section ID/order, image, payload field, `/functions/v1/submitLead`, Turnstile action `waitlist`, and reduced-motion behavior.
- Use semantic tokens and shadcn variants for UI state; reserve `className` for layout and image composition.
- Keep the hero as the only dark photographic surface; make the rest of the page Sky-first and light.
- Do not add sections, copy, pricing, social proof, analytics, theme toggles, or dark-mode controls.
- Do not customize generated files under `src/components/ui`.

---

### Task 1: Add behavioral safety coverage and a data boundary

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `src/App.tsx`
- Create: `src/test/setup.ts`, `src/App.test.tsx`, `src/components/landing/landing-data.ts`

**Interfaces:**
- Produces: `NAV_LINKS`, `HERO_BULLETS`, `PROBLEM_CARDS`, `AUDIENCE_BLOCKS`, `FAQ_ITEMS`, `INTERESTS`, `Role`, `LabSize`, `Interest`, `FormState`, `FieldErrors`, and `initialForm`.
- Produces: `pnpm test`.

- [ ] **Step 1: Install the test harness**

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Add `"test": "vitest run"` to `package.json`. Add the following `test` property to the existing Vite config:

```ts
test: {
  environment: "jsdom",
  setupFiles: "./src/test/setup.ts",
}
```

- [ ] **Step 2: Create test setup**

```ts
import "@testing-library/jest-dom/vitest"

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }),
})
```

- [ ] **Step 3: Write the failing mobile Sheet test**

```tsx
it("opens mobile navigation as a named modal surface", async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole("button", { name: "Abrir menú" }))
  expect(screen.getByRole("dialog", { name: "Navegación" })).toBeVisible()
})
```

Run `pnpm test -- src/App.test.tsx`. Expected: FAIL because the current inline menu is not a dialog.

- [ ] **Step 4: Add characterization tests**

Assert through accessible roles and visible copy: hero heading, section destinations, required form labels, empty-submit validation, one-open FAQ behavior, and the fourth interest becoming disabled after three selections.

- [ ] **Step 5: Extract data and types verbatim**

Move the existing constants, image imports, types, and initial form state to `landing-data.ts`; update `App.tsx` imports without changing behavior.

- [ ] **Step 6: Verify and commit**

Run `pnpm test -- src/App.test.tsx` and confirm only the named-modal test is intentionally red. Run `pnpm build`, then commit:

```bash
git add package.json pnpm-lock.yaml vite.config.ts src/test src/App.test.tsx src/components/landing/landing-data.ts src/App.tsx
git commit -m "test: cover landing migration contracts"
```

### Task 2: Migrate the shell, header, and hero

**Files:**
- Create: `src/components/landing/landing-header.tsx`, `hero-section.tsx`, `section-intro.tsx`
- Modify: `src/App.tsx`, `src/index.css`, `src/App.test.tsx`

**Interfaces:**
- `LandingHeader({ onNavigate, onWaitlist })` accepts `(id: string) => void` and `() => void`.
- `HeroSection({ onWaitlist, onProblems })` accepts two `() => void` callbacks.
- `SectionIntro({ eyebrow?, title, description })` accepts strings.

- [ ] **Step 1: Implement the header with Button and Sheet**

```tsx
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetTrigger render={<Button variant="outline" size="icon-lg" aria-label="Abrir menú" />}>
    <ListIcon />
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Navegación</SheetTitle></SheetHeader>
    {NAV_LINKS.map((link) => (
      <SheetClose
        key={link.id}
        render={<Button variant="ghost" className="justify-start" />}
        onClick={() => onNavigate(link.id)}
      >
        {link.label}
      </SheetClose>
    ))}
  </SheetContent>
</Sheet>
```

Use `bg-background/90`, `border-border`, `text-muted-foreground`, and Button variants; use no raw colors.

- [ ] **Step 2: Verify GREEN**

Run `pnpm test -- src/App.test.tsx`. The named dialog and characterization tests must pass.

- [ ] **Step 3: Implement the hero**

Use `Badge variant="secondary"`, `Button size="lg"`, and an outline Button. Preserve all copy and the hero image. Keep explicit CSS only for photographic overlay layers compatible with Neutral/Sky.

- [ ] **Step 4: Replace the page shell**

Use `bg-background text-foreground`, retain Sky-compatible ambient decoration, and delete the `primaryButton` and `secondaryButton` class constants.

- [ ] **Step 5: Verify and commit**

```bash
pnpm test
pnpm build
git add src/App.tsx src/index.css src/components/landing/landing-header.tsx src/components/landing/hero-section.tsx src/components/landing/section-intro.tsx src/App.test.tsx
git commit -m "feat: migrate landing shell to shadcn"
```

### Task 3: Migrate informational sections to Card composition

**Files:**
- Create: `problems-section.tsx`, `audience-section.tsx`, `trust-section.tsx`, `placeholder-visual.tsx` under `src/components/landing/`
- Modify: `src/App.tsx`, `src/index.css`, `src/App.test.tsx`

**Interfaces:**
- CTA sections accept `onWaitlist: () => void`.
- `ProblemsSection` owns `currentProblemIndex` and `allowCarouselMotion`.
- `PlaceholderVisual` preserves current alt text, images, and optional specification output.

- [ ] **Step 1: Move the carousel state and render it through Card**

Keep the eight-second interval and reduced-motion listener. Use full Card composition and `bg-chart-2` only for active progress.

- [ ] **Step 2: Implement audience cards**

```tsx
<Card className="h-full">
  <img src={item.imageSrc} alt={item.placeholder} className="aspect-video w-full object-cover" />
  <CardHeader>
    <CardTitle>{item.title}</CardTitle>
    <CardDescription>{item.description}</CardDescription>
  </CardHeader>
  <CardContent className="text-muted-foreground">{item.detail}</CardContent>
</Card>
```

- [ ] **Step 3: Implement trust Card and remove obsolete card CSS**

Delete `.panel-frame`, `.glass-card`, `.dark-card`, and superseded problem/audience selectors. Retain only image geometry, reveal, and carousel motion selectors still referenced.

- [ ] **Step 4: Verify and commit**

```bash
pnpm test
pnpm build
git add src/App.tsx src/index.css src/components/landing
git commit -m "feat: compose landing sections with shadcn cards"
```

### Task 4: Migrate the waitlist form to Field controls

**Files:**
- Create: `src/components/landing/waitlist-section.tsx`
- Modify: `src/App.tsx`, `src/index.css`, `src/App.test.tsx`

**Interfaces:**
- `WaitlistSection({ firstInputRef })` owns current form state, validation, Turnstile lifecycle, and submission.
- The request body remains `{ nombre, email, telefonoPais, telefonoNumero, rol, tamano, intereses, otraNecesidad, checklist, turnstileToken }`.

- [ ] **Step 1: Move form logic verbatim, then run tests**

Move state, validation helpers, Turnstile effect, and submit handler before changing controls. Run `pnpm test` to verify the contract.

- [ ] **Step 2: Compose controls with Field**

```tsx
<Field data-invalid={Boolean(fieldErrors.nombre)}>
  <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
  <Input id="nombre" name="nombre" aria-invalid={Boolean(fieldErrors.nombre)} />
  {fieldErrors.nombre
    ? <FieldError>{fieldErrors.nombre}</FieldError>
    : <FieldDescription>Escribe tu nombre y apellido.</FieldDescription>}
</Field>
```

Use `NativeSelect`/`NativeSelectOption` for role, country, and size; `Textarea` for `otraNecesidad`.

- [ ] **Step 3: Compose interests as choice cards**

Use `FieldSet`, `FieldLegend`, horizontal `Field`, `FieldLabel`, and `Checkbox`. Preserve the maximum-three rule through `disabled` on unchecked choices after three selections.

- [ ] **Step 4: Replace feedback and loading markup**

Use destructive Alert for errors, default Alert for success, and:

```tsx
<Button type="submit" size="lg" disabled={isSubmitting}>
  {isSubmitting ? <Spinner data-icon="inline-start" /> : <PaperPlaneTiltIcon data-icon="inline-start" />}
  {isSubmitting ? "Enviando..." : "Quiero unirme a la lista de espera"}
</Button>
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm test
pnpm build
git add src/App.tsx src/index.css src/components/landing/waitlist-section.tsx src/App.test.tsx
git commit -m "feat: migrate waitlist form to shadcn fields"
```

### Task 5: Migrate FAQ/footer and complete visual QA

**Files:**
- Create: `src/components/landing/faq-section.tsx`, `landing-footer.tsx`
- Modify: `src/App.tsx`, `src/index.css`, this plan

**Interfaces:**
- `FaqSection()` renders existing `FAQ_ITEMS` through Accordion with one-open behavior.
- `LandingFooter({ onNavigate, onWaitlist })` retains current labels and destinations.

- [ ] **Step 1: Replace custom FAQ with Accordion**

Render `AccordionItem`, `AccordionTrigger`, and `AccordionContent` for each existing item. Use `<Accordion defaultValue={["faq-0"]} multiple={false}>` so only one answer can remain open.

- [ ] **Step 2: Implement the footer**

Use `Separator`, link Buttons, `bg-muted/40`, and `text-muted-foreground`; keep existing copy.

- [ ] **Step 3: Reduce App and remove dead CSS**

`App` retains only scroll/focus coordination and ordered section composition. Remove unused selectors and verify:

```bash
rg -n '#[0-9a-fA-F]{3,8}|rgba\(' src/App.tsx src/components/landing
rg -n 'space-[xy]-|h-[0-9]+ w-[0-9]+' src/App.tsx src/components/landing
```

Expected: no raw interface colors, no `space-x/y`, and equal dimensions use `size-*`.

- [ ] **Step 4: Run automated verification**

```bash
pnpm test
pnpm build
git diff --check
```

- [ ] **Step 5: Run rendered QA**

Start `pnpm dev --host 127.0.0.1`. Capture desktop 1280×720 and mobile 390×844. Verify identity, meaningful DOM, no overlay, console, first viewport, Sheet open/close/Escape, carousel selection, FAQ expansion, empty-form validation, interest limit, reduced motion, focus, and clipping.

- [ ] **Step 6: Record visual comparison and commit**

Confirm Sky dominance, restrained Amber, Neutral light surfaces, unchanged copy/order/assets, dark hero, preset typography, responsive collapse, and no clipped content. Mark this plan complete and commit:

```bash
git add src/App.tsx src/index.css src/components/landing docs/superpowers/plans/2026-08-15-shadcn-visual-migration.md
git commit -m "style: complete sky-first landing migration"
```

### Task 6: Update PR #25

**Files:** No repository files expected.

**Interfaces:** Produces an updated remote branch and PR description/checklist.

- [ ] **Step 1: Verify branch**

```bash
git status --short --branch
git log --oneline origin/main..HEAD
pnpm test
pnpm build
```

- [ ] **Step 2: Push and update the PR**

```bash
git push origin feat/apply-shadcn-preset
gh pr edit 25 --title "feat: apply shadcn preset across landing page"
```

Update the PR body with the visual migration, commands, files, known local Turnstile limitation, screenshot evidence, risks, and rollback by phase-specific commits.
