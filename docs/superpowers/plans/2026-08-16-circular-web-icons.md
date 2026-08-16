# Circular Web Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Comelu's square browser icon backgrounds with preset-aligned circular `sky-700` backgrounds and fully transparent outer corners, while preserving valid maskable and Safari assets.

**Architecture:** `public/favicon.svg` remains the canonical standard icon. A focused Node script invokes macOS `sips` to regenerate standard PNGs and ICO entries from that SVG, and derives a temporary full-bleed variant for maskable outputs. Vitest parses SVG, PNG, ICO, manifest, and HTML metadata directly so platform contracts are regression-tested without adding a runtime dependency.

**Tech Stack:** SVG, PNG, ICO, Node.js built-ins, macOS `sips`, Vitest, Vite.

## Global Constraints

- Standard icon backgrounds use Tailwind `sky-700` (`#0369A1`).
- The amber Comelu “C” geometry and `#FCB102` color remain unchanged.
- Standard icon corners have alpha `0`; no translucent halo is introduced beyond antialiasing at the circle edge.
- Maskable icons remain full-bleed and keep the existing 10% safe-area reduction.
- Safari pinned tab remains a single-color “C” silhouette.
- No horizontal social/Open Graph composition, landing redesign, new dependency, or unrelated refactor is included.

---

### Task 1: Specify transparency and platform contracts

**Files:**
- Modify: `src/icon-assets.test.ts`
- Modify: `src/icon-metadata.test.ts`

**Interfaces:**
- Consumes: committed files under `public/` and `index.html`.
- Produces: `readPng(path): { width: number; height: number; colorType: number; alphaAt(x: number, y: number): number }`, a test-only PNG decoder for 8-bit RGBA assets.

- [ ] **Step 1: Add a real PNG alpha decoder to the asset test**

Import `inflateSync` from `node:zlib`. Parse the PNG signature and chunks, concatenate `IDAT`, inflate scanlines, reverse PNG filters 0–4 using bytes-per-pixel `4`, and expose alpha samples. Assert `bitDepth === 8` and `colorType === 6` so unsupported output fails explicitly.

- [ ] **Step 2: Write failing circular-source and alpha assertions**

Change the canonical SVG assertions to require one `<circle>`, zero `<rect>` elements, `#0369A1`, and `#FCB102`. For `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `apple-touch-icon.png`, and both Android `purpose: any` PNGs, assert corner alpha `0` and center alpha `255`. For both maskable PNGs, assert corner and center alpha `255`.

- [ ] **Step 3: Extend ICO assertions**

Read each ICO directory entry's image offset and size, parse the embedded PNG, and assert its top-left alpha is `0` for all 16, 32, and 48 px entries.

- [ ] **Step 4: Write failing preset-color metadata assertions**

Assert `site.webmanifest.theme_color`, HTML `meta[name="theme-color"]`, and the Safari mask link's `color` are exactly `#0369A1`.

- [ ] **Step 5: Run the focused tests and verify RED**

Run: `pnpm test -- src/icon-assets.test.ts src/icon-metadata.test.ts`

Expected: FAIL because `favicon.svg` still contains a rectangle and `#015AB5`, standard PNG corners are opaque, and metadata still uses `#015AB5`.

- [ ] **Step 6: Commit the executable specification**

```bash
git add src/icon-assets.test.ts src/icon-metadata.test.ts
git commit -m "test: specify circular web icon behavior"
```

### Task 2: Replace the canonical vector and add deterministic generation

**Files:**
- Modify: `public/favicon.svg`
- Create: `scripts/generate-web-icons.mjs`

**Interfaces:**
- Consumes: `public/favicon.svg`, containing one centered `<circle>` and one amber `<path>`.
- Produces: standard PNG sizes, full-bleed maskable PNG sizes, and an ICO with PNG entries at 16, 32, and 48 px.

- [ ] **Step 1: Replace the square source background**

In `public/favicon.svg`, replace `<rect width="1254" height="1254" fill="#015AB5"/>` with `<circle cx="627" cy="627" r="627" fill="#0369A1"/>`. Do not alter the amber path data.

- [ ] **Step 2: Add the generation script**

Create `scripts/generate-web-icons.mjs` using only `node:child_process`, `node:fs`, `node:os`, and `node:path`. It must:

- render the canonical SVG as a transparent PNG with `sips`;
- resize it with `sips` to 16, 32, 48, 180, 192, and 512 px;
- write the standard outputs to their existing names;
- derive a temporary SVG with a full-canvas `#0369A1` rectangle and `<g transform="translate(62.7 62.7) scale(0.9)">` around the unchanged amber path;
- render maskable 192 and 512 px PNGs from that full-bleed variant;
- assemble `favicon.ico` with valid ICONDIR and ICONDIRENTRY records pointing to the generated 16, 32, and 48 px PNG buffers;
- clean its temporary directory in `finally`.

- [ ] **Step 3: Regenerate every raster and ICO asset**

Run: `node scripts/generate-web-icons.mjs`

Expected: the eight PNG files and `favicon.ico` are replaced in place; standard PNGs have transparent corners and maskable PNGs remain opaque.

- [ ] **Step 4: Run asset tests and verify partial GREEN**

Run: `pnpm test -- src/icon-assets.test.ts`

Expected: PASS for SVG shape, dimensions, standard alpha, maskable alpha, ICO entries, and manifest icon declarations. The metadata test remains red until Task 3.

- [ ] **Step 5: Inspect the smallest and adaptive outputs visually**

Inspect `public/favicon-16x16.png`, `public/apple-touch-icon.png`, and `public/maskable-icon-512x512.png`. Confirm the C remains legible, transparent corners exist only on standard icons, and the maskable symbol stays inside its safe area.

- [ ] **Step 6: Commit vector, generator, and generated assets**

```bash
git add public/favicon.svg public/favicon.ico public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/apple-touch-icon.png public/android-chrome-192x192.png public/android-chrome-512x512.png public/maskable-icon-192x192.png public/maskable-icon-512x512.png scripts/generate-web-icons.mjs
git commit -m "feat: replace web icons with circular variants"
```

### Task 3: Align browser metadata with the preset sky color

**Files:**
- Modify: `index.html`
- Modify: `public/site.webmanifest`

**Interfaces:**
- Consumes: the fixed public asset paths already linked by the page.
- Produces: browser chrome, install theme, and Safari pinned-tab tint metadata set to `#0369A1`.

- [ ] **Step 1: Update HTML theme colors**

Change the Safari mask link `color` and `meta[name="theme-color"]` content from `#015AB5` to `#0369A1`.

- [ ] **Step 2: Update manifest theme color**

Change `site.webmanifest.theme_color` from `#015AB5` to `#0369A1`. Keep `background_color` white and retain all icon declarations.

- [ ] **Step 3: Run focused tests and verify GREEN**

Run: `pnpm test -- src/icon-assets.test.ts src/icon-metadata.test.ts`

Expected: both test files pass with no failures.

- [ ] **Step 4: Commit the metadata change**

```bash
git add index.html public/site.webmanifest
git commit -m "fix: align icon metadata with sky palette"
```

### Task 4: Document, serve, and verify the complete suite

**Files:**
- Modify: `docs/web-icons.md`

**Interfaces:**
- Consumes: the final asset suite and metadata.
- Produces: reviewer-facing documentation and fresh verification evidence.

- [ ] **Step 1: Update icon documentation**

Document `sky-700` (`#0369A1`) as the background color, transparent standard corners, opaque full-bleed maskable sources, the generator command, and the unchanged Safari mask behavior.

- [ ] **Step 2: Run the full automated verification**

Run:

```bash
pnpm test
pnpm build
git diff --check
```

Expected: all tests pass, production build exits `0`, and `git diff --check` emits no errors.

- [ ] **Step 3: Start Vite on an unused local port and verify HTTP assets**

Run `pnpm dev --host 127.0.0.1`, record the selected port, and request the page plus every icon asset. Assert HTTP `200` and correct MIME types for SVG, ICO, PNG, and manifest files.

- [ ] **Step 4: Verify rendered page health**

Open the local page using the available browser workflow. Confirm page identity, meaningful content, no framework overlay, no relevant console errors, and that the favicon URL returns the circular source. If the integrated Browser remains unavailable, report that exact blocker and use the previously established Playwright fallback only if permitted.

- [ ] **Step 5: Commit documentation**

```bash
git add docs/web-icons.md
git commit -m "docs: document circular web icons"
```

- [ ] **Step 6: Push and prepare the stacked PR**

Push `fix/circular-web-icons` and open a PR targeting `feat/web-icons`. Include summary, tests, key files, risks, rollback, and production checklist. Note that the PR can be retargeted to `main` after its base PR merges.
