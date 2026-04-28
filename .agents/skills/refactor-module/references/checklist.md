# Pre-commit Checklist

Run through this **before every commit**. If any item is unchecked, do
not commit.

- [ ] Scope held: only files in the stated module were touched
- [ ] Every new component/hook has a single responsibility
- [ ] **Every visual section of the page is its own component in
      `views/<feature>/components/`** — no inline JSX sections, no
      `renderX` functions in `index.tsx`
- [ ] **`views/<feature>/` uses the `components/` + `dialogs/` +
      `hooks/` + `helpers/` subfolder layout** (unless trivial
      single-file view)
- [ ] No static data lives inside components or hooks
- [ ] No new context was created without satisfying R5 (and a Zustand
      store wasn't a better fit)
- [ ] **No types declared inline in any component or hook file** —
      every prop interface and hook arg/return type is in
      `src/interfaces/<domain>/` (R4 strict). If `interfaces/<domain>/`
      crossed ~250 lines, it's split per R4.1
- [ ] **No domain pure helpers inside hooks/components/services** —
      each lives in `src/lib/<domain>/<helper>.ts` with a barrel (R12.1)
- [ ] **No component has more than 7 props** (R7 hard limit)
- [ ] Presentational components take props only (no
      context/toast/navigate/service calls)
- [ ] No `any` / no unsafe casts / no `@ts-ignore`
- [ ] Parameter and prop types use the strongest available type (e.g.
      `AlertType`, not `string`, when an enum/union exists)
- [ ] All imports use `@/` alias and folder barrels — affected
      `index.ts` files updated (sibling imports inside one view
      subfolder may use relative paths)
- [ ] Orphaned files/imports/constants were deleted
- [ ] File naming matches project convention (kebab-case for
      non-component files and folders, PascalCase for component files)
- [ ] **No redundant parent-name prefix** — child files/folders do not
      repeat the parent folder's name (e.g. inside `Card/` use
      `Header.tsx` not `CardHeader.tsx`) (R9.1)
- [ ] Error/loading/permissions plumbing is unchanged
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm build` passes
- [ ] UI verified (rendered / main flow works) OR user confirmed
- [ ] Commit message uses conventional `refactor:` prefix (no scope)
      and names the "why"
