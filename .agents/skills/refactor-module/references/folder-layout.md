# Folder Layout

Canonical paths for the Twindix Performance Indicator project. Match this
exactly — do NOT invent new folder conventions.

`AGENTS.md` at the repo root is the source of truth. When this file and
`AGENTS.md` disagree, `AGENTS.md` wins.

---

## Canonical paths

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

---

## `views/<feature>/` internal layout — MANDATORY for non-trivial views

A trivial view is a single file under ~80 lines with no dialogs, no
view-internal hooks, and no helpers. **Anything else MUST use this
structure:**

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

### Rules of thumb

- The `index.tsx` is composition-only. It does NOT contain inline JSX
  sections, render-functions for cards, or business logic. It calls
  view-internal hooks for orchestration and renders sub-components.
- Every visual section the page has (header, filters, tabs, card,
  footer, etc.) is a component in `components/`.
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
