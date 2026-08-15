# Shadcn Preset Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current UI foundation with the complete shadcn preset `b3t20MAXvW` while preserving landing-page behavior.

**Architecture:** Let the shadcn CLI generate configuration, semantic theme tokens, typography, utilities, hooks, and the complete official component catalog. Keep product-specific landing-page markup and behavior intact, changing consumers only when generated component APIs require it.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, shadcn CLI 3.x, pnpm 10.

## Global Constraints

- Work only on `feat/apply-shadcn-preset` in `/Users/CarlosG/wt-apply-shadcn-preset`.
- Pass preset code `b3t20MAXvW` directly to the CLI; do not decode it manually.
- Reinstall and overwrite existing UI primitives as explicitly requested.
- Install all official shadcn components.
- Preserve product behavior, accessibility, reduced-motion handling, and external integrations.

---

### Task 1: Apply the preset foundation

**Files:**
- Create: `components.json`
- Modify: `src/index.css`
- Modify: `src/lib/utils.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: shadcn project configuration and semantic Tailwind theme tokens consumed by generated UI components.

- [ ] Run `pnpm dlx shadcn@latest init --preset b3t20MAXvW --force --reinstall --yes`.
- [ ] Run `pnpm dlx shadcn@latest info --json` and verify framework, base, style, icon library, aliases, and Tailwind CSS path.
- [ ] Review the generated diff and commit it as `chore: apply shadcn preset foundation`.

### Task 2: Install the complete component catalog

**Files:**
- Create/overwrite: `src/components/ui/*.tsx`
- Create as generated: `src/hooks/*.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: the full official component catalog available through the aliases recorded in `components.json`.

- [ ] Preview with `pnpm dlx shadcn@latest add --all --dry-run`.
- [ ] Install with `pnpm dlx shadcn@latest add --all --overwrite --yes`.
- [ ] Review generated files for hardcoded aliases, wrong icon library imports, or incomplete composition.
- [ ] Commit as `feat: install all shadcn components`.

### Task 3: Integrate and verify the migration

**Files:**
- Modify only if required: `src/App.tsx`
- Modify only if required: generated UI consumers reported by TypeScript.

**Interfaces:**
- Consumes: generated shadcn primitives and semantic theme tokens.
- Produces: a buildable and smoke-tested landing page with unchanged product behavior.

- [ ] Run `pnpm build` and resolve only migration-related type or import errors.
- [ ] Start `pnpm dev`, smoke-test the landing page in a browser, and check the console.
- [ ] Verify `prefers-reduced-motion`, keyboard focus, responsive navigation, FAQ, and form rendering.
- [ ] Run a final `pnpm build` and inspect `git diff --check` plus repository status.
- [ ] Commit integration fixes, if any, as `fix: align landing page with shadcn preset`.
- [ ] Push the branch and open a PR using the repository template if available.
