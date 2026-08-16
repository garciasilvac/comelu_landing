# Navbar and Footer Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the supplied Comelu horizontal SVG in the navbar and footer while giving both surfaces the same Tailwind `sky-700` background.

**Architecture:** Publish one adapted SVG from `public/` and reference its root-relative URL from both existing landing components. Keep navigation behavior unchanged; limit component changes to brand markup and contrast-safe Tailwind classes.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS 4, Vite 7, Vitest 4, Testing Library

## Global Constraints

- Preserve `/Users/CarlosG/Downloads/comelu horiz.svg`; create a repository copy instead of modifying the source.
- Change only the copied SVG background color from `#0363CF` to Tailwind `sky-700` (`#0369A1`).
- Use the same `/comelu-horizontal.svg` asset in the navbar and footer.
- Keep navigation structure, callbacks, the mobile sheet, page content, and global palette unchanged.
- Preserve visible keyboard focus and sufficient contrast on both `sky-700` surfaces.
- Add no animation and introduce no environment variables or dependencies.

---

## File Structure

- Create `public/comelu-horizontal.svg`: shared browser-served copy of the supplied wordmark with a `sky-700` background.
- Modify `src/App.test.tsx`: regression coverage for the two logo instances and the matching semantic surface colors.
- Modify `src/components/landing/landing-header.tsx`: navbar logo and contrast-safe `sky-700` controls.
- Modify `src/components/landing/landing-sections.tsx`: footer logo and contrast-safe `sky-700` content.

### Task 1: Shared branding asset and surfaces

**Files:**
- Create: `public/comelu-horizontal.svg`
- Modify: `src/App.test.tsx`
- Modify: `src/components/landing/landing-header.tsx`
- Modify: `src/components/landing/landing-sections.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: the user-supplied `/Users/CarlosG/Downloads/comelu horiz.svg` and the existing `LandingHeader`/`LandingFooter` props.
- Produces: the public asset URL `/comelu-horizontal.svg`; two accessible images named `Comelu`; semantic `header` and `footer` elements styled with `bg-sky-700`.

- [ ] **Step 1: Write the failing regression test**

Add this test inside the existing `describe("Comelu landing", ...)` block in `src/App.test.tsx`:

```tsx
it("uses the shared Comelu logo on matching sky navbar and footer surfaces", () => {
  render(<App />);

  const logos = screen.getAllByRole("img", { name: "Comelu" });
  expect(logos).toHaveLength(2);
  logos.forEach((logo) => expect(logo).toHaveAttribute("src", "/comelu-horizontal.svg"));
  expect(screen.getByRole("banner")).toHaveClass("bg-sky-700");
  expect(screen.getByRole("contentinfo")).toHaveClass("bg-sky-700");
});
```

This test catches removal of either shared logo, an incorrect asset URL, or divergence between the requested navbar/footer surface color.

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```bash
pnpm test src/App.test.tsx
```

Expected: FAIL because no accessible logo images named `Comelu` exist yet. Confirm the failure is an assertion failure from this new test, not a syntax or setup error.

- [ ] **Step 3: Create the adapted public asset**

Copy `/Users/CarlosG/Downloads/comelu horiz.svg` to `public/comelu-horizontal.svg`, then mechanically replace the single `#0363CF` background fill with `#0369A1`. Confirm the source remains unchanged and the repository copy contains `#0369A1` but no `#0363CF`:

```bash
rg -n "#0369A1|#0363CF" public/comelu-horizontal.svg "/Users/CarlosG/Downloads/comelu horiz.svg"
```

- [ ] **Step 4: Implement the navbar brand and sky surface**

In `src/components/landing/landing-header.tsx`:

- Change the header classes to `sticky top-0 z-40 border-b border-sky-800/40 bg-sky-700 text-white`.
- Keep the home link and `aria-label="Comelu, inicio"`, and replace its two child spans with:

```tsx
<img src="/comelu-horizontal.svg" alt="Comelu" className="h-auto w-28 sm:w-32" />
```

- Give desktop ghost navigation buttons `text-sky-50 hover:bg-white/15 hover:text-white`.
- Give the desktop waitlist button `bg-white text-sky-800 hover:bg-sky-50 hover:text-sky-900`.
- Give the mobile menu trigger `border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white`.
- Do not change the mobile sheet content or callbacks.

- [ ] **Step 5: Implement the footer brand and matching sky surface**

In `LandingFooter` within `src/components/landing/landing-sections.tsx`:

- Change the footer classes to `mt-16 border-t border-sky-800/40 bg-sky-700 text-white`.
- Replace the standalone brand paragraph with:

```tsx
<img src="/comelu-horizontal.svg" alt="Comelu" className="h-auto w-32 sm:w-36" />
```

- Use `text-sky-100` and `text-sky-200/80` for the two informational paragraphs.
- Use `text-sky-50 hover:bg-white/15 hover:text-white` for footer navigation buttons.
- Keep the existing white separator treatment.
- Use `text-amber-200 hover:bg-white/15 hover:text-amber-100` for the waitlist action.

- [ ] **Step 6: Run the targeted test and verify GREEN**

Run:

```bash
pnpm test src/App.test.tsx
```

Expected: PASS with 6 tests in `src/App.test.tsx` and no console errors.

- [ ] **Step 7: Run the full automated checks**

Run:

```bash
pnpm test
pnpm build
git diff --check
```

Expected: 3 test files pass with 28 tests total; TypeScript and Vite build exit 0; `git diff --check` emits no output.

- [ ] **Step 8: Commit the implementation**

```bash
git add public/comelu-horizontal.svg src/App.test.tsx src/components/landing/landing-header.tsx src/components/landing/landing-sections.tsx
git commit -m "feat: align navbar and footer branding"
```

### Task 2: Responsive browser verification

**Files:**
- Verify: `src/components/landing/landing-header.tsx`
- Verify: `src/components/landing/landing-sections.tsx`
- Verify: `public/comelu-horizontal.svg`

**Interfaces:**
- Consumes: the production build and browser-rendered landing page from Task 1.
- Produces: verification evidence for desktop and mobile layout, accessibility, and console health; no new code unless a concrete defect is found.

- [ ] **Step 1: Start the local application**

Run:

```bash
pnpm dev --host 127.0.0.1
```

Record the port printed by Vite and keep the process running for browser checks.

- [ ] **Step 2: Verify the desktop presentation**

At a 1440 × 900 viewport, confirm:

- Navbar and footer have the same `rgb(3, 105, 161)` background.
- The Comelu SVG is fully visible, undistorted, and legible in both locations.
- Desktop navigation and waitlist actions retain readable contrast and visible keyboard focus.
- The sticky navbar does not obscure or overlap its controls.

- [ ] **Step 3: Verify the mobile presentation**

At a 390 × 844 viewport, confirm:

- The navbar logo and menu trigger fit on one row without clipping.
- The mobile navigation sheet still opens, closes, and displays its existing content.
- The footer logo, text, and navigation wrap without horizontal overflow.

- [ ] **Step 4: Check runtime health**

Confirm the browser console has no new errors and the SVG request returns HTTP 200. Stop the development server after verification.

- [ ] **Step 5: Re-run final verification before push**

```bash
pnpm test
pnpm build
git diff --check HEAD^ HEAD
git status --short --branch
```

Expected: 28/28 tests pass, build exits 0, diff check emits no output, and the worktree is clean on `feat/navbar-footer-branding`.

- [ ] **Step 6: Push and create the review-ready PR**

```bash
git push -u origin feat/navbar-footer-branding
gh pr create --base main --head feat/navbar-footer-branding --title "feat: align navbar and footer branding" --body $'## Summary\n- Replaces the text-only navbar and footer marks with the supplied Comelu horizontal SVG.\n- Aligns both surfaces to Tailwind sky-700 with contrast-safe controls.\n- Keeps navigation behavior, page content, and global tokens unchanged.\n\n## Test plan\n- pnpm test\n- pnpm build\n- Desktop check at 1440 × 900\n- Mobile check at 390 × 844\n- Browser console and SVG HTTP 200 check\n\n## Files touched\n- public/comelu-horizontal.svg\n- src/App.test.tsx\n- src/components/landing/landing-header.tsx\n- src/components/landing/landing-sections.tsx\n\n## Risks and rollback\n- Risk: the supplied SVG canvas may make the wordmark appear small; responsive widths were checked on desktop and mobile.\n- Rollback: revert the implementation commit, or revert the whole PR.\n\n## Production checklist\n- [x] No environment variables or secrets added\n- [x] No dependency or migration changes\n- [ ] Confirm deployed SVG returns HTTP 200\n- [ ] Smoke-test navbar and footer after deployment'
```

The PR body must include the summary and scope boundaries, commands and manual checks, key files, risks and rollback, and a no-production-configuration-required checklist.
