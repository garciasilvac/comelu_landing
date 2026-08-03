# Impeccable Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Impeccable design context for Comelu's public marketing landing page without changing the implemented interface.

**Architecture:** Install Impeccable's Codex skill locally so the harness can expose its commands for this repository. Root-level context documents separate product strategy (`PRODUCT.md`) from visual implementation guidance (`DESIGN.md`); later Impeccable commands read both before proposing design changes.

**Tech Stack:** Codex project skills, Impeccable CLI, React 19, TypeScript, Vite, Tailwind CSS 4.

## Global Constraints

- Comelu is a brand surface for its public Spanish (Chile) marketing landing page, not an authenticated SaaS UI.
- Preserve application source and the existing waitlist flow; this task only installs skills and adds context documentation.
- Target WCAG 2.2 AA, including reduced-motion support, keyboard access, visible focus, accessible form feedback, 44 by 44 px targets where practical, and usability at 200% zoom.
- The visual register is precise, modern, and trustworthy: specialized, warm, clinically clean, and technically grounded.
- Do not emulate a reference brand or introduce heavy gradients, pervasive glassmorphism, excessive motion, low-contrast dark UI, bubble-shaped components, stock-photo-heavy visuals, or hype-driven copy.

---

### Task 1: Install Impeccable's project-local Codex skill

**Files:**

- Create: `.agents/skills/impeccable/` (installer-managed skill files)

**Interfaces:**

- Consumes: `package.json` and Impeccable's official CLI installer.
- Produces: Codex-discoverable Impeccable skill commands for this repository.

- [ ] Install with `npx impeccable skills install -y --providers=codex --scope=project`.
- [ ] Inspect `.agents/skills/` for the installed Impeccable `SKILL.md` and supporting assets.
- [ ] Commit only installer-managed skill files with `chore: install impeccable project skill`.

### Task 2: Add Comelu's product and design context

**Files:**

- Create: `PRODUCT.md`
- Create: `DESIGN.md`

**Interfaces:**

- Consumes: the confirmed brand register, voice, references, anti-references, accessibility requirements, and current tokens in `src/index.css` and `src/App.tsx`.
- Produces: stable root-level context read by Impeccable before future design work.

- [ ] Write `PRODUCT.md` as strategy only: audience, product purpose, waitlist conversion goal, brand-surface register, three-word voice, references, anti-references, Spanish (Chile), and WCAG 2.2 AA requirements. Exclude colors, fonts, spacing values, and components.
- [ ] Write `DESIGN.md` from the current implementation: dark navy, teal, cool blue, and off-white palette; Inter system font stack; rounded but restrained panels; layered editorial composition; focus styles; and reduced-motion behavior. Treat the visual prohibitions as future-facing rules.
- [ ] Validate both files with `test -f PRODUCT.md && test -f DESIGN.md` and `rg -n "WCAG 2.2 AA|brand surface|precisa|moderna|confiable" PRODUCT.md DESIGN.md`.
- [ ] Commit both files with `docs: add impeccable design context`.

### Task 3: Verify the documentation-only setup

**Files:**

- Verify: `package.json`
- Verify: `PRODUCT.md`
- Verify: `DESIGN.md`

**Interfaces:**

- Consumes: the project build and committed Impeccable configuration.
- Produces: evidence that initialization did not regress the landing page build.

- [ ] Run `pnpm build`; it must complete TypeScript compilation and the Vite production build with exit code 0.
- [ ] Review `git status --short`, `git log --oneline main..HEAD`, and `git diff main...HEAD --stat`; only Impeccable skill/context files and setup documentation may differ from `main`.
- [ ] Push with `git push -u origin chore/impeccable-init` so the focused pull request can be opened.
