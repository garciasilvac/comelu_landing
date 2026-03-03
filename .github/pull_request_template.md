# 📌 PR Summary

**Type:** feat / fix / chore / refactor / docs / test / style  
**Branch:** `<type>/<slug>`  
**Worktree:** `../wt-<slug>`  
**Related issue (optional):** #

---

## 🎯 What changed (and why)

- 
- 

**Scope boundaries (what this PR does NOT do):**
- 
- 

---

## 🧪 How to test locally

### Option A — Using the worktree (recommended)

    cd ../wt-<slug>
    pnpm i
    pnpm dev

### Option B — Checking out the branch (no worktree)

    git fetch --all --prune
    git checkout <branch>
    pnpm i
    pnpm dev

### Production-like validation (when applicable)

    pnpm build
    pnpm preview

### Optional checks (if available)

    pnpm lint
    pnpm test

### Manual checklist

- [ ] Feature works as expected
- [ ] No visual regressions
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Accessibility OK (focus + reduced motion)
- [ ] `pnpm build` passes
- [ ] `pnpm preview` looks correct (production-like)

---

## 📂 Files touched

- 
- 

---

## 🚀 Production / deployment notes

- [ ] No production config changes
- [ ] Requires env var update
- [ ] Requires build/config change
- [ ] Requires manual step in production

**Steps:**

1. 
2. 
3. 

**Rollback:**

- [ ] Revert PR
- [ ] Revert specific commits (list):

---

## ⚠️ Risks / edge cases

- 
- 

---

## 🧱 Commit structure (layered)

List commits (top → bottom):

1. 
2. 
3. 

Confirm:

- [ ] Commits are small and logically isolated
- [ ] Safe to revert individually
- [ ] Branch pushed (`git push -u origin <branch>`)