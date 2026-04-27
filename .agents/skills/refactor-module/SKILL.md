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

4. **`views/<feature>/` internal layout — MANDATORY for non-trivial views.**
   A trivial view is a single file under ~80 lines with no dialogs, no
   view-internal hooks, and no helpers. Anything else MUST use this
   structure:

   ```
   src/views/<feature>/
   ├── index.tsx              # thin container — composition only
   ├── components/            # every visual section of the page
   │   ├── index.ts           # barrel
   │   ├── <Section>.tsx      # one component per visual section
   │   └── <ComplexSection>/  # multi-part section gets its own subfolder
   │       ├── index.ts
   │       ├── <Section>.tsx  # the orchestrator that composes sub-pieces
   │       └── <Part>.tsx     # each sub-part of the section
   ├── dialogs/               # any modal / dialog / drawer
   │   ├── index.ts
   │   └── <Dialog>.tsx
   ├── hooks/                 # view-internal hooks (state, side effects, orchestration)
   │   ├── index.ts
   │   └── use-<concern>.ts
   └── helpers/               # pure helper functions (transforms, builders, predicates)
       ├── index.ts
       └── <helper>.ts
   ```

   Rules of thumb:
   - The `index.tsx` is composition-only. It does NOT contain inline JSX
     sections, render-functions for cards, or business logic. It calls
     view-internal hooks for orchestration and renders sub-components.
   - Every visual section the page has (header, filters, tabs, card, footer,
     etc.) is a component in `components/`.
   - A card or any complex section with 3+ visual parts gets its own
     subfolder under `components/` containing one orchestrator + one file
     per sub-part.
   - Form state, dialog open/close logic, per-row action handlers, derived
     lists — all live in view-internal hooks (`hooks/`), NOT inside
     `index.tsx`.
   - Pure transforms (form → API payload, sort comparators, filter
     predicates) live in `helpers/`, NOT inside the view or hook.

   Match this layout even if neighbouring views in the codebase haven't
   been migrated yet — those are work-in-progress, not the target
   convention.

5. **Plan, then edit.** Write out the list of extractions/moves. If the
   plan has any non-trivial risk (context changes, file moves, renames),
   present it to the user and get approval before editing.

---

## Hard Rules

### R1 — Single Responsibility
Every component, hook, and utility does ONE thing.
- A view that fetches + transforms + renders + handles user input is four
  things. Split it.
- A hook that owns flow state + derived values + side effects is three
  things. Split it.
- A card with header + actions + meta + mentions + footer is five things.
  Split it.

### R2 — Presentation vs. Container separation
- **Presentational components** receive data and callbacks via props ONLY.
  No `useContext`, no `useNavigate`, no `toast`, no service calls, no
  permission checks, no business decisions. Pure rendering given props.
  They consume the standard `{ data, isLoading, fieldErrors }` shape that
  the project's hooks already produce. (`t()` from `@/hooks` is the only
  exception — it's a pure i18n utility, not state or side-effect.)
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

### R4 — Types live in `src/interfaces/<domain>/` (STRICT)
**Every type used by a component, hook, or helper lives under
`src/interfaces/<domain>/`. No exceptions, including component prop
interfaces.** Even a type consumed by exactly one component goes to
`interfaces/`. There is no "MAY stay inline" carve-out.

Some legacy domains still sit as flat files (`communications.ts`,
`metrics.ts`, …) — leave those alone unless explicitly asked to migrate.

Naming: `PascalCase` + `Interface` suffix. For component props, use
`<ComponentName>PropsInterface` (e.g. `AlertCardPropsInterface`,
`UserMultiSelectPropsInterface`).

Never use `any`. Never use `as unknown as X`. Never `// @ts-ignore`. If a
type is wrong, fix the source type. **When copying code, audit every
parameter and prop type — never preserve weak typing (`string` for a
known union, etc.) just because the original had it.**

#### R4.1 — Splitting `interfaces/<domain>/` when it grows

Default: a single `interfaces/<domain>/index.ts` holds every type for the
domain. Split into multiple files **only when the file passes ~250 lines
OR has clear sectional boundaries** (after a refactor that adds many prop
interfaces and hook types).

When you split, organize by concern, not by component:

```
src/interfaces/<domain>/
├── index.ts        # barrel — `export * from "./domain"; export * from "./view";`
├── domain.ts       # data-shape types: <Entity>Interface, payloads, responses, form-state types
└── view.ts         # view types: shared groupings, *PropsInterface, hook arg/return types
```

Optional 3-file split when `view.ts` itself is large:

```
src/interfaces/<domain>/
├── index.ts        # barrel
├── domain.ts       # data shapes
├── props.ts        # *PropsInterface + view-shared groupings (Permissions, Actions, etc.)
└── hooks.ts        # UseX*ArgsInterface / UseX*ReturnInterface
```

Rules when splitting:
- `index.ts` becomes a pure barrel (`export * from "./X"`); no type
  declarations live there.
- Cross-file references inside `interfaces/<domain>/` use relative paths
  (`./domain`).
- The global `src/interfaces/index.ts` barrel keeps re-exporting from
  `./X` (no change there — adding files inside `interfaces/<domain>/`
  doesn't affect the global barrel because `export * from "./alerts"`
  picks up everything via the local `index.ts`).
- Don't pre-split a small domain just because a future refactor *might*
  add types. Split when the file actually crosses the threshold.

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

### R6 — Where extracted components live (split aggressively within a module)
Cross-module extraction needs 2+ real usage sites. **Within a single
module, every distinct visual section IS its own component — split
aggressively.** A 90-line `renderCard` function is not "one card
responsibility" — it's a header + body + actions + meta + footer, each of
which is its own component in `components/<Card>/`.

When you DO extract:
- **Simple API** — minimum props, no kitchen sinks
- **Single responsibility** — does one rendering job
- **Domain-pure** — no business logic in presentational pieces; everything
  comes in through props
- **Right location**:
  - Smallest pure UI atom (Button, Badge, Input) → `src/atoms/`
  - Radix primitive wrapper → `src/ui/`
  - Cross-page composition (Sidebar, Topbar, MetricCard) → `src/components/shared/`
  - **Module-internal (visual section, sub-piece) → `src/views/<feature>/components/`**
    — never at the module root, always inside `components/`

### R7 — Composition over prop explosion (HARD LIMIT: 7 props)
**8+ props is forbidden, not "a smell."** If your design exceeds 7, you
must do one of:
- Group related props into a single object (`permissions`, `actions`,
  `busy`, `counts`) — typed as a named `*Interface` in `interfaces/`
- Split the component into sub-components the parent composes
- Use `children` / slot props
- Use a compound-component pattern if the pieces relate
  (e.g. `<X><X.Item/></X>`)

Same rule for components dispatching by a `variant` / `kind` / `type` prop
with many branches — split, don't switch.

This is a hard limit. No exceptions documented as "pragmatic." If a plan
shows a component with 8+ props, reject the plan and redesign before
writing any code.

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
| Non-component files (hooks, utils, services, schemas, helpers) | `kebab-case.ts` | `use-auth.ts`, `format-date.ts`, `build-payload.ts` |
| Hook function (exported symbol) | `useCamelCase` | `useAuth`, `useCreateTask` |
| Functions & variables | `camelCase` | `checkTransition()`, `inferWorkType()` |
| Interfaces | `PascalCase` + `Interface` | `TaskInterface`, `UserInterface` |
| Component props interface | `PascalCase` + `PropsInterface` | `AlertCardPropsInterface` |
| Enums & members | `PascalCase` | `TaskPhase.InProgress` |
| Folders | `kebab-case` | `views/comments-log/`, `components/shared/` |
| Zustand stores | `camelCase` file → `use*Store` export | `store/sprint.ts` → `useSprintStore` |
| Storage keys | `SCREAMING_SNAKE_CASE` constants | `storageKeys.tasks` |

Do not rename files or symbols the user did not ask to rename.

### R10 — Imports go through `@/` and barrels
Two non-negotiables from `AGENTS.md`:

1. **Use the path alias `@/`**, never relative paths — except for sibling
   imports inside the same `views/<feature>/` subfolder, where
   `./Sibling` is acceptable for cohesion.
   `import { Button } from "@/atoms"` ✅
   `import { Button } from "../../atoms/button"` ❌
2. **Import from the folder's barrel `index.ts`**, not the individual file.
   Every folder under `src/` has one — keep it updated when you add/remove
   exports.

When extracting code into a new file, also update the parent `index.ts`.

### R11 — Don't refactor beyond the stated module
Even if you see improvements in neighbouring code, leave it. Do exactly
what the user asked for. If something outside scope looks actively broken,
flag it — do not fix it silently.

### R12.1 — Domain-bound helpers live in `src/lib/<domain>/`

Pure functions tied to one domain (payload builders, predicates,
validators, transforms) are NOT components, hooks, services, types, or
constants. They have their own home: **`src/lib/<domain>/`**, mirroring
the existing `src/lib/permissions/<module>.policy.ts` precedent.

Decision tree for "where does this function go?":

| Function | Location |
|---|---|
| Cross-app pure helper (`cn`, `formatDate`) | `src/utils/` (flat) |
| Domain-bound rule / policy / predicate | `src/lib/<domain>/<thing>.policy.ts` (existing pattern for permissions) |
| Domain-bound transform / payload builder / validator | `src/lib/<domain>/<thing>.ts` |
| Side-effect-aware composition (uses hooks) | `src/hooks/<domain>/use-<thing>.ts` |
| Axios call | `src/services/<domain>/index.ts` |

Layout for domain helpers:

```
src/lib/<domain>/
├── index.ts                      # barrel: `export { fnA } from "./fn-a";`
├── build-<thing>-payload.ts      # one helper per file
├── parse-<thing>-response.ts
└── <thing>.policy.ts             # if it's a predicate/rule (permissions style)
```

**Never** put a domain helper inline inside a hook file — that mixes a
pure transform with side-effect-aware composition (R1 violation). If
the helper is genuinely 3-5 lines and used only by one hook, the
threshold is the same as R4.1: still extract, because it's domain code
and other modules may need to follow the same pattern.

Cross-file imports inside `src/lib/<domain>/` use relative paths.
External callers import via the barrel: `import { buildAlertPayload }
from "@/lib/alerts"`.

### R12 — Do not rewire error / loading / permissions plumbing
These three systems have explicit rules in `AGENTS.md`. A refactor must
preserve them, not redesign them.

- **Error handling**: hooks call `useMutationAction` / `useQueryAction`;
  components consume `{ data, isLoading, error?, fieldErrors }`. Don't add
  `try/catch` in a component, don't toast in a presentational piece, don't
  remove `errorFallback` / `successMessage` constants.
- **Loading handling**: never write the string `"Loading..."`, never
  replace a `<QueryBoundary>` with manual ternaries, never replace
  `<Button loading>` with hand-rolled spinners.
- **Permissions**: never replace `usePermissions()` or `<Can>` with a raw
  `user.role_tier === "admin"` comparison. The grep `role_tier ===`
  outside `src/lib/permissions/` must continue to return nothing.

If a refactor genuinely needs to touch one of these, that is a separate
task and out of this skill's scope — surface it to the user.

---

## Pragmatism

These rules are a default, not a religion. Not every single line must fit a
pattern. The aim is **overall good structure**, not mechanical compliance.

- If forcing a split produces two tiny meaningless files, don't split.
- If a "rule" fight produces worse code than ignoring it, ignore it — and
  say so in the commit message so the user can push back.
- Prefer the simplest change that satisfies the rule's INTENT.

What you must never compromise on: Golden Rule, R1 (single responsibility
at module scale), R3 (no inline static data), **R4 (no inline types)**,
R5 (no needless contexts), **R7 (≤ 7 props)**, R8 (no dead code left
behind), R10 (`@/` + barrels), R11 (scope discipline), R12 (don't rewire
error/loading/permissions), and the mandatory `views/<feature>/` subfolder
layout for non-trivial views.

---

## Process — Execute in this order

### Step 1. Analyze
Read every file in the module. Produce a mental inventory:
- What is rendering (UI) — list every distinct visual section
- What is business logic / state / side effects
- What is static data currently inlined
- What types are declared inline (ALL of them — they all move)
- What JSX or logic REPEATS in 2+ places (extraction candidates)
- What single responsibilities are bundled into one file (split candidates)
- Which existing barrels (`index.ts`) the module touches

### Step 2. Plan
Write the change list. For each entry specify:
- What extraction/move it is
- Source file → destination file (using the canonical paths above)
- For new components: prop count (must be ≤ 7) and prop interface name
- Which barrel(s) need updating
- Why it satisfies which rule (R1/R2/R3/...)

**Before writing any code**, list every component you'll create with its
prop count. If any > 7, redesign before writing. If `index.tsx` will end
up over ~80 lines, the split is incomplete — find more sections to extract.

Share the plan with the user if it is non-trivial. Adjust based on
feedback.

### Step 3. Refactor in small atomic steps
ONE change at a time:
- Extract one component / hook / constants file, OR
- Move one group of types to `src/interfaces/<domain>/`, OR
- Split one over-stuffed file

After each step, move to Step 4 before proceeding.

### Step 4. Verify (per-step or end-only based on user preference)
Default: verify after every step. If the user explicitly says "verify only
at the end", batch the verification — but warn them once that a single
end-of-run failure is harder to localize.

- `pnpm tsc --noEmit` — no new TS errors introduced
- `pnpm build` — must succeed (this project standardized on pnpm; see
  commit `a282a31`)
- **UI check if the module has visible UI** — run `pnpm dev` and exercise
  the page in the browser, or have the user confirm the main flow still
  works. A passing build does NOT prove the UI works.
- If any of these fail: revert the last change, understand why, redo it
  correctly. Do not commit a broken state.

### Step 5. Commit
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

---

## Anti-Patterns — Never do these

- Extracting a `<CardWrapper>` from a single usage **at a module root**
  (cross-module). Within a module, extracting from one usage is REQUIRED
  by R1.
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
- Using relative paths instead of the `@/` alias (except sibling imports
  inside one `views/<feature>/` subfolder)
- `as any` / `as unknown as X` / `// @ts-ignore` to silence type errors
- Renaming files or symbols the user didn't ask about
- "While I'm here" edits to code outside the module scope
- Rewriting logic while claiming to refactor ("I noticed this could be simpler...")
- Committing when `pnpm build` fails
- Leaving orphaned files behind after an extraction
- Inventing a new folder convention instead of matching this project's
- **Inline interface declarations in component files** (R4 strict)
- **Components with 8+ props** (R7 hard)
- **`renderX` functions inside `index.tsx`** — those are missing components
- **Flat `views/<feature>/` for non-trivial views** — must use the
  `components/` + `dialogs/` + `hooks/` + `helpers/` subfolder layout

---

## Checklist — Use before committing each step

- [ ] Scope held: only files in the stated module were touched
- [ ] Every new component/hook has a single responsibility
- [ ] **Every visual section of the page is its own component in
      `views/<feature>/components/`** — no inline JSX sections, no
      `renderX` functions in `index.tsx`
- [ ] **`views/<feature>/` uses the `components/` + `dialogs/` + `hooks/` +
      `helpers/` subfolder layout** (unless trivial single-file view)
- [ ] No static data lives inside components or hooks
- [ ] No new context was created without satisfying R5 (and a Zustand
      store wasn't a better fit)
- [ ] **No types declared inline in any component or hook file** — every
      prop interface and hook arg/return type is in
      `src/interfaces/<domain>/` (R4 strict). If `interfaces/<domain>/`
      crossed ~250 lines, it's split per R4.1
- [ ] **No domain pure helpers inside hooks/components/services** — each
      lives in `src/lib/<domain>/<helper>.ts` with a barrel (R12.1)
- [ ] **No component has more than 7 props** (R7 hard limit)
- [ ] Presentational components take props only (no context/toast/navigate/
      service calls)
- [ ] No `any` / no unsafe casts / no `@ts-ignore`
- [ ] Parameter and prop types use the strongest available type (e.g.
      `AlertType`, not `string`, when an enum/union exists)
- [ ] All imports use `@/` alias and folder barrels — affected `index.ts`
      files updated (sibling imports inside one view subfolder may use
      relative paths)
- [ ] Orphaned files/imports/constants were deleted
- [ ] File naming matches project convention (kebab-case for non-component,
      PascalCase for components)
- [ ] Error/loading/permissions plumbing is unchanged
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm build` passes
- [ ] UI verified (rendered / main flow works) OR user confirmed
- [ ] Commit message uses conventional `refactor:` prefix (no scope) and
      names the "why"

If any item is unchecked, do not commit.

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
