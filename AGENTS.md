# AGENTS.md — Agent Contract (Comelu)

## Golden rules
- **Always** use a new **branch + worktree** per task.
- **Never** work on `main` (or any shared branch).
- **One task per PR**. Do not mix unrelated changes.
- Keep changes minimal, clear, and easy to review.

## Branch & worktree naming
- Branch: `<type>/<slug>`  
  Examples: `feat/scroll-reveal`, `fix/lead-form-401`, `chore/lint-cleanup`
- Worktree path: `../wt-<slug>`  
  Example: `../wt-scroll-reveal`

## Required workflow (every task)
1) Sync base:
   - `git fetch --all --prune`
   - `git switch main && git pull --rebase`
2) Create branch + worktree (show exact commands in your output):
   - `git switch -c <type>/<slug>`
   - `git worktree add ../wt-<slug> <type>/<slug>`
3) Work **only** inside the worktree folder.
4) Run local checks when available (choose what exists in the project):
   - install: `pnpm i` / `npm i` / `bundle install`
   - lint: `pnpm lint`
   - test: `pnpm test`
   - build: `pnpm build`
   - quick smoke: `pnpm dev` (or equivalent)
5) Commit and push.
6) Leave the PR ready for review (use PR template if present).

## Commit policy (IMPORTANT)
- Make **short, layered commits** so work can be reverted **by parts**.
- Each commit must be logically isolated and safe to revert.
- Prefer **3–8 commits** per task (unless the task is tiny).
- Use **conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`
- Examples (good):
  - `chore: add scroll reveal utility`
  - `style: add reveal CSS states`
  - `feat: apply reveal to feature cards`
  - `fix: respect prefers-reduced-motion`

## PR requirements (must include)
- Summary: what changed + why + scope boundaries
- Test plan: commands run + manual checks performed
- Files touched: highlight key files
- Risks/edge cases + rollback notes
- Production/deploy checklist **if applicable** (instructions only; no secrets)

## Production / deploy rules
- **Never** commit secrets/keys/tokens.
- If env vars are needed:
  - update `.env.example`
  - document exact steps to configure in production (Vercel/host/etc.)
- Provide rollback steps:
  - revert PR, or revert specific commits (list if relevant)

## Accessibility / UX requirements
- Respect `prefers-reduced-motion` (disable/reduce animations).
- Keep animations subtle (no disruptive motion).
- Ensure keyboard focus states remain usable.
- Avoid introducing console errors.

## Output format (what you must deliver)
At the end of the task, provide:
1) Branch + worktree created (paths + commands)
2) Summary of changes (bullets)
3) Files modified/added
4) How to run/verify locally (step-by-step)
5) What was tested (commands + results)
6) PR title + PR description (ready to paste) + checklist
7) Production/deploy steps (if applicable)