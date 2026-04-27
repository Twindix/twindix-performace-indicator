---
name: refactor-module
description: Use this skill when the user asks to refactor, restructure, clean up, or improve the code quality of a specific React/TypeScript module ("clean up the dashboard module"). MUST be used any time the task is code-quality refactoring without behavior change. Do NOT use for adding features, fixing bugs, changing logic, or changing UI.
---

# Refactor Module — Twindix Performance Indicator

Governs how to refactor a React/TypeScript module in this repo without
changing what it does. The module must behave and look identical before and
after. Only the code's shape changes.

This skill is paired with `AGENTS.md` at the repo root — that file is the
source of truth for folder layout, naming, error handling, loading, and
permissions. When this skill and `AGENTS.md` disagree, `AGENTS.md` wins.

---

## Golden Rule — NEVER break the module

**You are refactoring CODE QUALITY ONLY.** Never break the main logic, the
main UI, or any existing feature of the module. If a refactor would change
what the user sees, clicks, or experiences, stop and revert.

If you catch yourself "improving" logic, renaming things the user did not ask
about, or rewriting a function because it "could be simpler" — stop. That is
not this task.

You also must not break the three cross-cutting systems documented in
`AGENTS.md`:
- **Error handling** — `runAction` / `useMutationAction` / `useQueryAction`
- **Loading handling** — `<Button loading>`, `<QueryBoundary>`, `skeletons.tsx`
- **Permissions** — `usePermissions()` / `<Can>`, never raw `role_tier ===`

A refactor that rewires any of those is out of scope for this skill.

---

## Phase 0 — Before you touch anything

1. **Lock the scope.** Confirm with the user exactly which module/folder is in
   scope. Write the scope down. Do not edit files outside it.
2. **Read the whole module first.** Open every file in the target folder and
   its direct dependencies. Understand:
   - The public surface (routes, exports, providers, imports from outside)
   - Data flow (who owns state, who reads it, which context/store)
   - Existing types, constants, hooks, services the module already uses
3. **Match this project's existing layout.** Do NOT invent new folder
   conventions. The canonical map (see `AGENTS.md` for full descriptions):

   | Concern | Path |
   |---|---|
   | Pages (one per feature) | `src/views/<feature>/` |
   | Smallest reusable UI | `src/atoms/` |
   | Cross-page shared layout/UI | `src/components/shared/` |
   | Error boundary / network UI | `src/components/error/` |
   | Radix wrappers (shadcn pattern) | `src/ui/` |
   | Page shells | `src/layouts/` |
   | Raw context definitions | `src/contexts/<domain>/` |
   | Provider components | `src/providers/` |
   | Cross-cutting hooks | `src/hooks/shared/` |
   | Per-domain hooks (CRUD) | `src/hooks/<domain>/` |
   | Per-domain constants (errors, messages, labels) | `src/constants/<domain>/index.ts` |
   | Per-domain interfaces | `src/interfaces/<domain>/` |
   | Per-domain axios services | `src/services/<domain>/` |
   | Zustand stores | `src/store/` |
   | Yup validation schemas | `src/schemas/` |
   | TypeScript enums | `src/enums/` |
   | App-wide static data (apis, routes, common) | `src/data/` |
   | Low-level platform utilities | `src/lib/` |
   | Pure helper functions | `src/utils/` |
   | React Router config + guards | `src/routes/` |

4. **Plan, then edit.** Write out the list of extractions/moves. If the plan
   has any non-trivial risk (context changes, file moves, renames), present it
   to the user and get approval before editing.

---

## Hard Rules

### R1 — Single Responsibility
Every component, hook, and utility does ONE thing.
- A view that fetches + transforms + renders + handles user input is four
  things. Split it.
- A hook that owns flow state + derived values + side effects is three things.
  Split it.

### R2 — Presentation vs. Container separation
- **Presentational components** receive data and callbacks via props ONLY.
  No `useContext`, no `useNavigate`, no `toast`, no service calls, no
  permission checks, no business decisions. Pure rendering given props.
  They consume the standard `{ data, isLoading, fieldErrors }` shape that
  the project's hooks already produce.
- **Container components / hooks** own all the wiring — read contexts/stores,
  call `useMutationAction` / `useQueryAction`, navigate, run side effects,
  pass data down to presentational pieces.
- This is the DEFAULT. Apply it unless forcing the split clearly adds more
  noise than it removes.

### R3 — No static data in components or hooks
All literal data belongs in `src/constants/<domain>/index.ts`:
- Option lists, labels, copy strings
- Initial state objects, default values
- Icon maps, config objects, menu structures
- Per-domain `errors` and `messages` bags (they back the error-handling
  fallbacks — see `AGENTS.md` Error Handling section)

For categorical values (statuses, priorities, phases, roles), use enums in
`src/enums/`. For app-wide static (API URLs, routes, sidebar entries), use
`src/data/`. Components and hooks IMPORT — they do not define.

Constants are **flat per domain** (`constants/<domain>/index.ts`) — do not
introduce a `<module>` subfolder.

### R4 — Types live in `src/interfaces/<domain>/`
Shared types (used by a context, multiple components, or exposed across
modules) live under `src/interfaces/<domain>/`. Some legacy domains still
sit as flat files (`communications.ts`, `metrics.ts`, …) — leave those
alone unless explicitly asked to migrate.

A type used by exactly ONE component and private to it MAY stay inline in
that file — but the moment a second file needs it, move it to `interfaces/`.

Naming: `PascalCase` + `Interface` suffix (e.g. `TaskInterface`).

Never use `any`. Never use `as unknown as X`. Never `// @ts-ignore`. If a
type is wrong, fix the source type.

### R5 — No unnecessary context
Context has a real cost: re-renders, cognitive load, coupling, debugging
pain. More contexts make the app slower and harder to reason about.

This project already separates **contexts** (`src/contexts/<domain>/`, raw
definitions only) from **providers** (`src/providers/`, the wrapper +
side-effects). Respect that split — never put initialization logic in
`contexts/`.

Create a NEW context ONLY if ALL of these hold:
- The value is consumed by 3+ components in different subtrees, AND
- Prop drilling would cross 3+ component boundaries, AND
- No existing context already owns this domain, AND
- The data isn't already in a Zustand store (`src/store/`) — for global UI
  state, prefer the store over a new context

Otherwise: prefer props, composition (children / slots), or a custom hook
that reads existing state.

When in doubt: do NOT create the context.

### R6 — Reusable components must earn it
Do NOT extract a "reusable" component from a single usage site. One-off UI
stays local to its `views/<feature>/` folder.

Wait for 2+ real usages before extracting. When you DO extract:
- **Simple API** — minimum props, no kitchen sinks
- **Single responsibility** — does one rendering job
- **Domain-pure** — no business logic, no coupling to a specific feature;
  everything comes in through props
- **Right location**:
  - Smallest pure UI atom (Button, Badge, Input) → `src/atoms/`
  - Radix primitive wrapper → `src/ui/`
  - Cross-page composition (Sidebar, Topbar, MetricCard) → `src/components/shared/`
  - Module-shared (only within one view) → inside that view folder

### R7 — Composition over prop explosion
If a component reaches 8+ props, or has many conditional JSX branches based
on a `variant` / `kind` / `type` prop, STOP adding props. Instead:
- Accept `children` / slot props
- Split into sub-components the caller composes
- Use a compound-component pattern if the pieces relate (e.g. `<X><X.Item/></X>`)

### R8 — Delete dead code in the same commit
When an extraction orphans old code:
- Remove the orphaned file(s)
- Remove unused imports
- Remove constants/types that are no longer referenced
- Update the affected `index.ts` barrels — every folder under `src/` has one
- Run a search to confirm nothing points to the removed path

Do not leave old code "in case." The user wants the project clean.

### R9 — Match existing naming
Per `AGENTS.md`:

| Target | Convention | Examples |
|---|---|---|
| Component files | `PascalCase.tsx` | `BoardView.tsx`, `MetricCard.tsx` |
| Non-component files (hooks, utils, services, schemas) | `kebab-case.ts` | `use-auth.ts`, `format-date.ts`, `add-task.ts` |
| Hook function (exported symbol) | `useCamelCase` | `useAuth`, `useCreateTask` |
| Functions & variables | `camelCase` | `checkTransition()`, `inferWorkType()` |
| Interfaces | `PascalCase` + `Interface` | `TaskInterface`, `UserInterface` |
| Enums & members | `PascalCase` | `TaskPhase.InProgress` |
| Folders | `kebab-case` | `views/comments-log/`, `components/shared/` |
| Zustand stores | `camelCase` file → `use*Store` export | `store/sprint.ts` → `useSprintStore` |
| Storage keys | `SCREAMING_SNAKE_CASE` constants | `storageKeys.tasks` |

Do not rename files or symbols the user did not ask to rename.

### R10 — Imports go through `@/` and barrels
Two non-negotiables from `AGENTS.md`:

1. **Use the path alias `@/`**, never relative paths.
   `import { Button } from "@/atoms"` ✅ — `import { Button } from "../../atoms/button"` ❌
2. **Import from the folder's barrel `index.ts`**, not the individual file.
   Every folder under `src/` has one — keep it updated when you add/remove
   exports.

When extracting code into a new file, also update the parent `index.ts`.

### R11 — Don't refactor beyond the stated module
Even if you see improvements in neighbouring code, leave it. Do exactly what
the user asked for. If something outside scope looks actively broken, flag
it — do not fix it silently.

### R12 — Do not rewire error / loading / permissions plumbing
These three systems have explicit rules in `AGENTS.md`. A refactor must
preserve them, not redesign them.

- **Error handling**: hooks call `useMutationAction` / `useQueryAction`;
  components consume `{ data, isLoading, error?, fieldErrors }`. Don't add
  `try/catch` in a component, don't toast in a presentational piece, don't
  remove `errorFallback` / `successMessage` constants.
- **Loading handling**: never write the string `"Loading..."`, never replace
  a `<QueryBoundary>` with manual ternaries, never replace `<Button loading>`
  with hand-rolled spinners.
- **Permissions**: never replace `usePermissions()` or `<Can>` with a raw
  `user.role_tier === "admin"` comparison. The grep `role_tier ===` outside
  `src/lib/permissions/` must continue to return nothing.

If a refactor genuinely needs to touch one of these, that is a separate task
and out of this skill's scope — surface it to the user.

---

## Pragmatism

These rules are a default, not a religion. Not every single line must fit a
pattern. The aim is **overall good structure**, not mechanical compliance.

- If forcing a split produces two tiny meaningless files, don't split.
- If a "rule" fight produces worse code than ignoring it, ignore it — and
  say so in the commit message so the user can push back.
- Prefer the simplest change that satisfies the rule's INTENT.

What you must never compromise on: Golden Rule, R1 (single responsibility
at module scale), R3 (no inline static data), R5 (no needless contexts),
R8 (no dead code left behind), R10 (`@/` + barrels), R11 (scope discipline),
R12 (don't rewire error/loading/permissions).

---

## Process — Execute in this order

### Step 1. Analyze
Read every file in the module. Produce a mental inventory:
- What is rendering (UI)
- What is business logic / state / side effects
- What is static data currently inlined
- What types are declared inline and used in 2+ places
- What JSX or logic REPEATS in 2+ places (extraction candidates)
- What single responsibilities are bundled into one file (split candidates)
- Which existing barrels (`index.ts`) the module touches

### Step 2. Plan
Write the change list. For each entry specify:
- What extraction/move it is
- Source file → destination file (using the canonical paths above)
- Which barrel(s) need updating
- Why it satisfies which rule (R1/R2/R3/...)

Share the plan with the user if it is non-trivial. Adjust based on feedback.

### Step 3. Refactor in small atomic steps
ONE change at a time:
- Extract one component / hook / constants file, OR
- Move one group of types to `src/interfaces/<domain>/`, OR
- Split one over-stuffed file

After each step, move to Step 4 before proceeding.

### Step 4. Verify after EVERY step (not just at the end)
- `pnpm tsc --noEmit` — no new TS errors introduced
- `pnpm build` — must succeed (this project standardized on pnpm; see
  commit `a282a31`)
- **UI check if the module has visible UI** — run `pnpm dev` and exercise
  the page in the browser, or have the user confirm the main flow still
  works. A passing build does NOT prove the UI works.
- If any of these fail: revert the last change, understand why, redo it
  correctly. Do not commit a broken state.

### Step 5. Commit
One commit per module (or per cohesive refactor step within a large module).
This repo uses Commitlint with conventional commits — the type prefix is
required.

```
refactor(<module>): <one-line summary of what changed>

<why — which rules/patterns this achieves; any tradeoffs; anything the
reviewer should know>
```

Do NOT commit:
- Failing builds / failing typecheck
- Untested UI changes
- Unrelated file edits
- Files outside the stated scope

---

## Anti-Patterns — Never do these

- Extracting a `<CardWrapper>` from a single usage
- Creating a context for state used by one feature (especially when a
  Zustand store would do)
- Placing initialization logic in `src/contexts/` instead of `src/providers/`
- Leaving a 40-line options array inline in a component body
- Giving a presentational component a `toast()` / `useNavigate()` / service
  call
- Adding a `try/catch` in a hook instead of using `useMutationAction`
- Rendering the literal string `"Loading..."`
- Comparing `user.role_tier === "admin"` directly in a view
- Importing from a deep file path instead of the folder barrel
- Using relative paths instead of the `@/` alias
- `as any` / `as unknown as X` / `// @ts-ignore` to silence type errors
- Renaming files or symbols the user didn't ask about
- "While I'm here" edits to code outside the module scope
- Rewriting logic while claiming to refactor ("I noticed this could be simpler...")
- Committing when `pnpm build` fails
- Leaving orphaned files behind after an extraction
- Inventing a new folder convention instead of matching this project's

---

## Checklist — Use before committing each step

- [ ] Scope held: only files in the stated module were touched
- [ ] Every new component/hook has a single responsibility
- [ ] No static data lives inside components or hooks
- [ ] No new context was created without satisfying R5 (and a Zustand store
      wasn't a better fit)
- [ ] No component was extracted from a single usage site
- [ ] Presentational components take props only (no context/toast/navigate/
      service calls)
- [ ] No `any` / no unsafe casts / no `@ts-ignore`
- [ ] Types are in `src/interfaces/<domain>/` (if shared) or inline (if
      truly local)
- [ ] All imports use `@/` alias and folder barrels — affected `index.ts`
      files updated
- [ ] Orphaned files/imports/constants were deleted
- [ ] File naming matches project convention (kebab-case for non-component,
      PascalCase for components)
- [ ] Error/loading/permissions plumbing is unchanged
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm build` passes
- [ ] UI verified (rendered / main flow works) OR user confirmed
- [ ] Commit message uses conventional `refactor(<module>):` prefix and
      names the "why"

If any item is unchecked, do not commit.

---

## When in doubt — ask

Rather than guess, ask the user:
- "Is X in or out of scope?"
- "This looks like a logic bug — fix it in this task, or flag only?"
- "Should this type go to `src/interfaces/<domain>/` or stay inline?"
- "I see this pattern in 2 places — extract now, or leave for later?"
- "This refactor would touch the error/loading/permissions plumbing — split
  it into a separate task?"

Better to pause than to ship a broken module.
