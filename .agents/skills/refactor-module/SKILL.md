---
name: refactor-module
description: Use this skill when the user asks to refactor, restructure, clean up, or improve the code quality of a specific React/TypeScript module ("clean up the dashboard module"). MUST be used any time the task is code-quality refactoring without behavior change. Do NOT use for adding features, fixing bugs, changing logic, or changing UI.
---

# Refactor Module — Twindix Performance Indicator

Refactor a React/TypeScript module without changing what it does. The
module must behave and look identical before and after — only the code's
shape changes.

This skill is paired with `AGENTS.md` at the repo root. When this skill
and `AGENTS.md` disagree, `AGENTS.md` wins.

Reference files (read when their step says to):
- `references/folder-layout.md` — canonical paths + mandatory
  `views/<feature>/` subfolder layout
- `references/rules.md` — R1–R12.1 in full, plus anti-patterns
- `references/checklist.md` — pre-commit checklist

---

## Golden Rule — NEVER break the module

**You are refactoring CODE QUALITY ONLY.** Never break the main logic,
the main UI, or any existing feature. If a refactor would change what
the user sees, clicks, or experiences, stop and revert.

If you catch yourself "improving" logic, renaming things the user did
not ask about, or rewriting because it "could be simpler" — stop. That
is not this task.

You also must NOT rewire the three cross-cutting systems documented in
`AGENTS.md`:
- **Error handling** — `runAction` / `useMutationAction` / `useQueryAction`
- **Loading handling** — `<Button loading>`, `<QueryBoundary>`, `skeletons.tsx`
- **Permissions** — `usePermissions()` / `<Can>`, never raw `role_tier ===`

If a refactor genuinely needs to touch one of these, surface it as a
separate task — out of scope for this skill.

---

## Process — execute in this order

### Step 1 — Lock scope and read the module

1. Confirm with the user exactly which folder is in scope. Write it
   down. Do not edit files outside it.
2. Read every file in the target folder and its direct dependencies.
   Understand:
   - The public surface (routes, exports, providers, outside imports)
   - Data flow (who owns state, who reads it, which context/store)
   - Existing types, constants, hooks, services the module already uses
3. **Read `references/folder-layout.md`** to refresh the canonical paths
   and the mandatory `views/<feature>/` subfolder layout. Match this
   project's existing layout — do NOT invent new conventions.

### Step 2 — Plan

Produce a mental inventory:
- What is rendering (UI) — list every distinct visual section
- What is business logic / state / side effects
- What is static data currently inlined
- What types are declared inline (ALL of them — they all move)
- What JSX or logic REPEATS in 2+ places (extraction candidates)
- What single responsibilities are bundled into one file (split candidates)
- Which existing barrels (`index.ts`) the module touches

Then write the change list. For each entry specify:
- What extraction/move it is
- Source file → destination file
- For new components: prop count (must be ≤ 7) and prop interface name
- Which barrel(s) need updating
- Why it satisfies which rule (R1/R2/R3/...)

**Read `references/rules.md` during planning** to confirm each move
respects R1–R12.1.

**Before writing any code:**
- If any planned component has > 7 props, redesign before writing.
- If `index.tsx` would end up over ~80 lines, the split is incomplete —
  find more sections to extract.

Share the plan with the user if it is non-trivial. Adjust based on
feedback.

### Step 3 — Refactor in small atomic steps

ONE change at a time:
- Extract one component / hook / constants file, OR
- Move one group of types to `src/interfaces/<domain>/`, OR
- Split one over-stuffed file.

After each step, move to Step 4 before continuing.

### Step 4 — Verify

Default: verify after every step. If the user explicitly says "verify
only at the end", warn them once that a single end-of-run failure is
harder to localize, then batch.

- `pnpm tsc --noEmit` — no new TS errors introduced
- `pnpm build` — must succeed (this project standardized on pnpm)
- **UI check** if the module has visible UI — run `pnpm dev` and exercise
  the page in the browser, or have the user confirm the main flow still
  works. **A passing build does NOT prove the UI works.**
- If any of these fail: revert the last change, understand why, redo it
  correctly. Do not commit a broken state.

### Step 5 — Commit

One commit per module (or per cohesive refactor step within a large
module). This repo uses Commitlint with conventional commits — the type
prefix is required, and **scopes are not allowed by the project's
commit-msg hook** (use plain `refactor:`, not `refactor(alerts):`).

```
refactor: <one-line summary of what changed>

<why — which rules/patterns this achieves; any tradeoffs; anything the
reviewer should know>
```

Do NOT commit:
- Failing builds / failing typecheck
- Untested UI changes
- Unrelated file edits
- Files outside the stated scope

**Run through `references/checklist.md` before every commit.**

---

## Hard Rules — quick index

Full text, examples, and anti-patterns live in `references/rules.md`.
Read it during planning. Quick index:

- **R1** Single Responsibility — every component/hook/util does ONE thing
- **R2** Presentation vs. Container separation
- **R3** No static data in components/hooks → `src/constants/<domain>/`
- **R4** All types in `src/interfaces/<domain>/` (STRICT — including props)
- **R4.1** When/how to split `interfaces/<domain>/`
- **R5** No unnecessary context (prefer props, composition, or Zustand)
- **R6** Module-internal extracted components → `views/<feature>/components/`
- **R7** ≤ 7 props per component (HARD LIMIT)
- **R8** Delete dead code in the same commit
- **R9** Match existing naming (folders `kebab-case`, components `PascalCase.tsx`, everything else `kebab-case.ts`)
- **R9.1** No redundant parent-name prefix — inside `Card/` name files `Header.tsx` not `CardHeader.tsx`
- **R10** Imports use `@/` alias and folder barrels
- **R11** Never refactor beyond the stated module
- **R12** Never rewire error / loading / permissions plumbing
- **R12.1** Domain helpers → `src/lib/<domain>/`

The non-negotiables: Golden Rule, R1, R3, **R4**, R5, **R7**, R8, R10,
R11, R12, and the mandatory `views/<feature>/` subfolder layout for
non-trivial views.

---

## Pragmatism

These rules are a default, not a religion. The aim is **overall good
structure**, not mechanical compliance.

- If forcing a split produces two tiny meaningless files, don't split.
- If a "rule" fight produces worse code than ignoring it, ignore it —
  and say so in the commit message so the user can push back.
- Prefer the simplest change that satisfies the rule's intent.

The non-negotiables listed above still hold.

---

## When in doubt — ask

Rather than guess, ask the user:
- "Is X in or out of scope?"
- "This looks like a logic bug — fix it in this task, or flag only?"
- "I see this pattern in 2 places — extract now, or leave for later?"
- "This refactor would touch the error/loading/permissions plumbing —
  split it into a separate task?"
- "Should I skip per-step verification and only verify at the end?"

Better to pause than to ship a broken module.
