# Hard Rules — R1 through R12.1

Full text of every rule. Read this during planning (Step 2 of the
process). Anti-patterns are at the bottom.

---

## R1 — Single Responsibility

Every component, hook, and utility does ONE thing.
- A view that fetches + transforms + renders + handles user input is
  four things. Split it.
- A hook that owns flow state + derived values + side effects is three
  things. Split it.
- A card with header + actions + meta + mentions + footer is five
  things. Split it.

---

## R2 — Presentation vs. Container separation

- **Presentational components** receive data and callbacks via props
  ONLY. No `useContext`, no `useNavigate`, no `toast`, no service calls,
  no permission checks, no business decisions. Pure rendering given
  props. They consume the standard `{ data, isLoading, fieldErrors }`
  shape that the project's hooks already produce. (`t()` from `@/hooks`
  is the only exception — it's a pure i18n utility, not state or
  side-effect.)
- **Container components / hooks** own all the wiring — read
  contexts/stores, call `useMutationAction` / `useQueryAction`,
  navigate, run side effects, pass data down to presentational pieces.
- This is the DEFAULT. Apply it unless forcing the split clearly adds
  more noise than it removes.

---

## R3 — No static data in components or hooks

All literal data belongs in `src/constants/<domain>/index.ts`:
- Option lists, labels, copy strings
- Initial state objects, default values
- Icon maps, config objects, menu structures
- Per-domain `errors` and `messages` bags (they back the error-handling
  fallbacks — see `AGENTS.md` Error Handling section)

For categorical values (statuses, priorities, phases, roles), use enums
in `src/enums/`. For app-wide static (API URLs, routes, sidebar
entries), use `src/data/`. Components and hooks IMPORT — they do not
define.

Constants are **flat per domain** (`constants/<domain>/index.ts`) — do
not introduce a `<module>` subfolder.

---

## R4 — Types live in `src/interfaces/<domain>/` (STRICT)

**Every type used by a component, hook, or helper lives under
`src/interfaces/<domain>/`. No exceptions, including component prop
interfaces.** Even a type consumed by exactly one component goes to
`interfaces/`. There is no "MAY stay inline" carve-out.

Some legacy domains still sit as flat files (`communications.ts`,
`metrics.ts`, …) — leave those alone unless explicitly asked to migrate.

Naming: `PascalCase` + `Interface` suffix. For component props, use
`<ComponentName>PropsInterface` (e.g. `AlertCardPropsInterface`,
`UserMultiSelectPropsInterface`).

Never use `any`. Never use `as unknown as X`. Never `// @ts-ignore`. If
a type is wrong, fix the source type. **When copying code, audit every
parameter and prop type — never preserve weak typing (`string` for a
known union, etc.) just because the original had it.**

### R4.1 — Splitting `interfaces/<domain>/` when it grows

Default: a single `interfaces/<domain>/index.ts` holds every type for
the domain. Split into multiple files **only when the file passes ~250
lines OR has clear sectional boundaries** (after a refactor that adds
many prop interfaces and hook types).

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

---

## R5 — No unnecessary context

Context has a real cost: re-renders, cognitive load, coupling, debugging
pain. More contexts make the app slower and harder to reason about.

This project already separates **contexts** (`src/contexts/<domain>/`,
raw definitions only) from **providers** (`src/providers/`, the wrapper
+ side-effects). Respect that split — never put initialization logic in
`contexts/`.

Create a NEW context ONLY if ALL of these hold:
- The value is consumed by 3+ components in different subtrees, AND
- Prop drilling would cross 3+ component boundaries, AND
- No existing context already owns this domain, AND
- The data isn't already in a Zustand store (`src/store/`) — for global
  UI state, prefer the store over a new context

Otherwise: prefer props, composition (children / slots), or a custom
hook that reads existing state.

When in doubt: do NOT create the context.

---

## R6 — Where extracted components live (split aggressively within a module)

Cross-module extraction needs 2+ real usage sites. **Within a single
module, every distinct visual section IS its own component — split
aggressively.** A 90-line `renderCard` function is not "one card
responsibility" — it's a header + body + actions + meta + footer, each
of which is its own component in `components/<Card>/`.

When you DO extract:
- **Simple API** — minimum props, no kitchen sinks
- **Single responsibility** — does one rendering job
- **Domain-pure** — no business logic in presentational pieces;
  everything comes in through props
- **Right location**:
  - Smallest pure UI atom (Button, Badge, Input) → `src/atoms/`
  - Radix primitive wrapper → `src/ui/`
  - Cross-page composition (Sidebar, Topbar, MetricCard) →
    `src/components/shared/`
  - **Module-internal (visual section, sub-piece) →
    `src/views/<feature>/components/`** — never at the module root,
    always inside `components/`

---

## R7 — Composition over prop explosion (HARD LIMIT: 7 props)

**8+ props is forbidden, not "a smell."** If your design exceeds 7, you
must do one of:
- Group related props into a single object (`permissions`, `actions`,
  `busy`, `counts`) — typed as a named `*Interface` in `interfaces/`
- Split the component into sub-components the parent composes
- Use `children` / slot props
- Use a compound-component pattern if the pieces relate
  (e.g. `<X><X.Item/></X>`)

Same rule for components dispatching by a `variant` / `kind` / `type`
prop with many branches — split, don't switch.

This is a hard limit. No exceptions documented as "pragmatic." If a
plan shows a component with 8+ props, reject the plan and redesign
before writing any code.

---

## R8 — Delete dead code in the same commit

When an extraction orphans old code:
- Remove the orphaned file(s)
- Remove unused imports
- Remove constants/types that are no longer referenced
- Update the affected `index.ts` barrels — every folder under `src/`
  has one
- Run a search to confirm nothing points to the removed path

Do not leave old code "in case." The user wants the project clean.

---

## R9 — Match existing naming

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

---

## R9.1 — No redundant parent-name prefix in file/folder names

The folder path already provides context. **Never repeat the parent
folder's name as a prefix on a child file or subfolder.**

```
views/projects/components/
  Card/              ✅   (not ProjectCard/ ❌ — you're already in projects/)
    Header.tsx       ✅   (not CardHeader.tsx ❌ — you're already in Card/)
    Footer.tsx       ✅   (not CardFooter.tsx ❌)
    Actions.tsx      ✅   (not CardActions.tsx ❌)

views/tasks/dialogs/TaskDetailDialog/
  Header.tsx         ✅   (not TaskDetailHeader.tsx ❌)
  MetaGrid.tsx       ✅   (not TaskMetaGrid.tsx ❌)
```

This keeps names short, avoids stuttering, and makes import paths
readable.

**All new files and folders must also use the correct case:**
- Folders → `kebab-case`
- Component files → `PascalCase.tsx`
- Everything else (hooks, utils, helpers, services) → `kebab-case.ts`

---

## R10 — Imports go through `@/` and barrels

Two non-negotiables from `AGENTS.md`:

1. **Use the path alias `@/`**, never relative paths — except for
   sibling imports inside the same `views/<feature>/` subfolder, where
   `./Sibling` is acceptable for cohesion.
   `import { Button } from "@/atoms"` ✅
   `import { Button } from "../../atoms/button"` ❌
2. **Import from the folder's barrel `index.ts`**, not the individual
   file. Every folder under `src/` has one — keep it updated when you
   add/remove exports.

When extracting code into a new file, also update the parent `index.ts`.

---

## R11 — Don't refactor beyond the stated module

Even if you see improvements in neighbouring code, leave it. Do exactly
what the user asked for. If something outside scope looks actively
broken, flag it — do not fix it silently.

---

## R12 — Do not rewire error / loading / permissions plumbing

These three systems have explicit rules in `AGENTS.md`. A refactor must
preserve them, not redesign them.

- **Error handling**: hooks call `useMutationAction` / `useQueryAction`;
  components consume `{ data, isLoading, error?, fieldErrors }`. Don't
  add `try/catch` in a component, don't toast in a presentational
  piece, don't remove `errorFallback` / `successMessage` constants.
- **Loading handling**: never write the string `"Loading..."`, never
  replace a `<QueryBoundary>` with manual ternaries, never replace
  `<Button loading>` with hand-rolled spinners.
- **Permissions**: never replace `usePermissions()` or `<Can>` with a
  raw `user.role_tier === "admin"` comparison. The grep `role_tier ===`
  outside `src/lib/permissions/` must continue to return nothing.

If a refactor genuinely needs to touch one of these, that is a separate
task and out of this skill's scope — surface it to the user.

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
External callers import via the barrel:
`import { buildAlertPayload } from "@/lib/alerts"`.

---

## Anti-Patterns — Never do these

- Extracting a `<CardWrapper>` from a single usage **at a module root**
  (cross-module). Within a module, extracting from one usage is REQUIRED
  by R1.
- Creating a context for state used by one feature (especially when a
  Zustand store would do)
- Placing initialization logic in `src/contexts/` instead of
  `src/providers/`
- Leaving a 40-line options array inline in a component body
- Giving a presentational component a `toast()` / `useNavigate()` /
  service call
- Adding a `try/catch` in a hook instead of using `useMutationAction`
- Rendering the literal string `"Loading..."`
- Comparing `user.role_tier === "admin"` directly in a view
- Importing from a deep file path instead of the folder barrel
- Using relative paths instead of the `@/` alias (except sibling imports
  inside one `views/<feature>/` subfolder)
- `as any` / `as unknown as X` / `// @ts-ignore` to silence type errors
- Renaming files or symbols the user didn't ask about
- "While I'm here" edits to code outside the module scope
- Rewriting logic while claiming to refactor ("I noticed this could be
  simpler...")
- Committing when `pnpm build` fails
- Leaving orphaned files behind after an extraction
- Inventing a new folder convention instead of matching this project's
- **Inline interface declarations in component files** (R4 strict)
- **Components with 8+ props** (R7 hard)
- **`renderX` functions inside `index.tsx`** — those are missing
  components
- **Flat `views/<feature>/` for non-trivial views** — must use the
  `components/` + `dialogs/` + `hooks/` + `helpers/` subfolder layout
