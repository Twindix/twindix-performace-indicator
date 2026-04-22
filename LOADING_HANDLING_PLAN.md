# Loading Handling Plan — Twindix Performance Indicator

> Sibling of `ERROR_HANDLING_PLAN.md`. Error handling is shipped — loading UX is next. This plan standardizes **what the user sees while waiting**, using the same primitives that error handling already owns (`useMutationAction`, `useQueryAction`).

---

## 1. Executive Summary

Every API-calling hook already exposes `isLoading` — that part is consistent. What's **not** consistent is the UI layer:

- Some lists show a nice skeleton, others show `"Loading..."` text, others render nothing (blank).
- Buttons mostly get `disabled={isLoading}` but the spinner/label pattern is different in every dialog.
- Primary-page queries (dashboard, sprint summary) flicker between empty and full states instead of a single smooth skeleton.
- Optimistic mutations briefly show a spinner when they should show nothing (UI is already updated locally).
- Background mutations (presence, heartbeat, analytics) sometimes flicker a button or toast — they should never be visible.

Goal: **one primitive component per loading scenario, one decision table, zero inline `"Loading..."` strings.**

---

## 2. Current State — What's Already Good

| Layer | Status | Notes |
|---|---|---|
| `atoms/skeleton.tsx` | Good | Single animated pulse box — all skeletons compose from it. |
| `components/skeletons.tsx` | Good | Page-level skeleton compositions for 14 views (Dashboard, Tasks, Blockers, Decisions, Communication, Workload, Reports, Analytics, Ownership, Handoffs, Profile, RedFlags, Alerts, CommentsLog, Settings). Already the right level of detail. |
| `useMutationAction` / `useQueryAction` | Good | Both expose a stable `isLoading`. |
| `usePageLoader` (shared hook) | Partial | Already exists — audit how/where it's used and whether it should drive a global top-bar. |
| `useOnlineStatus` + `NetworkIndicator` | Good | Offline banner already handled — not in scope here. |

**What to keep.** Skeleton compositions stay; `isLoading` from hooks stays. The plan below only **adds shared button/query helpers and one decision table**.

---

## 3. Proposed Primitives (reusable, minimal surface)

### 3.1 Extend `atoms/button.tsx` with a built-in loading state

Current callers write this pattern by hand, ~15 times:

```tsx
<Button disabled={isSubmitting}>
    {isSubmitting ? <><span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Creating...</> : <>Create</>}
</Button>
```

Target:

```tsx
<Button loading={isSubmitting}>Create</Button>
```

Implementation: add a `loading?: boolean` prop. When `true` → render a spinner before children, set `disabled`. Spinner is inline to preserve width (prevents layout shift).

### 3.2 Add one shared `<QueryBoundary>` component

A tiny declarative wrapper that renders the right thing for each (`isLoading`, `data`, empty) combination — replaces the ~8 different ad-hoc patterns currently spread across views.

```tsx
<QueryBoundary
    isLoading={isLoading}
    skeleton={<TasksSkeleton />}
    empty={tasks.length === 0}
    emptyState={<EmptyState icon={ClipboardList} title={t("No tasks")} />}
>
    <TaskList tasks={tasks} />
</QueryBoundary>
```

File: `src/components/shared/query-boundary.tsx`. No new state, no new logic — just the ternary a view would have written anyway.

### 3.3 (Optional) Global top-bar progress for route transitions

A thin progress bar at the top of the layout (like nprogress) that auto-shows when any query is in-flight during a route change. Strictly optional — only add if route-change flicker is noticeable. Not blocking the plan.

### 3.4 NOT adding

- No new "loading context" provider — every hook already owns its `isLoading`, stacking contexts just hides it.
- No custom `useLoading` hook — `isLoading` from `useMutationAction`/`useQueryAction` is the single source of truth per call.
- No global `isLoading` state — conflicts with per-call loading and causes whole-page flashes.

---

## 4. UX Rules — When to Use Each Treatment

| Situation | Treatment | Why |
|---|---|---|
| **Initial page load** (dashboard, sprint, tasks view) | **Skeleton** from `components/skeletons.tsx` | Shape of the final UI; no flicker. |
| **Full-page blocking query fails** | Skeleton → error fallback (already handled by error plan) | — |
| **Secondary widget** (stats, analytics, health score) | Skeleton inline within its card | Don't block the page for a side panel. |
| **List refetch** (after filter/search change) | Keep current data visible, show a small inline spinner in the toolbar | Avoid "jumping back to skeleton" which feels broken. |
| **Form submit button** | `<Button loading={isSubmitting}>` | Unified pattern. Button width stays stable. |
| **Destructive confirm button** | Same — `<Button variant="destructive" loading={...}>` | Same rule. |
| **Optimistic mutation** (drag-drop status, toggle) | **No spinner anywhere.** UI updated locally; `isLoading` is ignored. | Optimistic is optimistic. Revert on error. |
| **Inline auto-save** (future — debounced field save) | Tiny "Saved" / "Saving..." text next to the field, no spinner | Low prominence. |
| **Background mutation** (presence, heartbeat, dashboard widget refetch) | **Invisible.** Never render any loader. | User didn't trigger it. |
| **File upload** (task attachment) | Progress indicator on the specific file row | Different from generic spinner — shows progress. |
| **Route transition** | (Optional) Top-bar progress via `usePageLoader` | Orthogonal — only if routes fetch heavily. |
| **Dialog opens with a fetch** (e.g. TransitionDialog criteria) | Skeleton inside the dialog body (not the dialog frame) | Dialog header/actions should be visible immediately; only the body waits. |

---

## 5. Per-Module Plan — All 13 Domains

Legend:
- **S** = page skeleton from `components/skeletons.tsx`
- **B** = button `loading` prop (form submit / destructive)
- **I** = inline spinner in toolbar (filter/search refetch)
- **O** = optimistic — no loader
- **SI** = silent — no loader at all
- **D** = in-dialog skeleton (dialog body only)

### 5.1 Auth
| Action | Treatment |
|---|---|
| LoginView submit | **B** (replaces the manual `isSubmitting ? "Signing in..." : "Sign In"`) |
| Logout | **SI** (cookie clear + redirect is instant) |
| Presence heartbeat | **SI** |

### 5.2 Users
| Action | Treatment |
|---|---|
| Users list | Already has a pulse-card skeleton inline — keep (or extract to `UsersSkeleton` in skeletons.tsx) |
| User detail | Keep current inline skeleton; analytics card uses its own skeleton |
| Create / update / delete user | **B** on the submit button |
| User activate/deactivate dropdown item | **O** (optimistic — flip status locally, refetch if it fails) |

### 5.3 Teams
| Action | Treatment |
|---|---|
| Teams list | Already has inline skeleton — keep |
| Add team | **B** |
| Edit/delete (UI-only) | **O** |

### 5.4 Sprints
| Action | Treatment |
|---|---|
| Sprints list | Add `SprintsSkeleton` to skeletons.tsx (grid of 6 card placeholders) |
| Sprint summary | Add `SprintSummarySkeleton` — this is a blocking page query |
| Create / update / delete / activate | **B** |

### 5.5 Tasks
| Action | Treatment |
|---|---|
| Kanban / Pipeline / Tasks list | **S** via existing `TasksSkeleton` |
| Task search / filter change | **I** (keep tasks visible, spinner in toolbar) |
| Task detail dialog open | **D** (criteria/requirements fetch shows skeleton in dialog body) |
| Create / update / delete task | **B** |
| Drag-drop status change | **O** (revert on error — already done by error plan) |
| Add/remove tag | **O** |
| Upload/delete attachment | File-row progress, not generic spinner |
| TransitionDialog criteria fetch | **D** (already implemented in tasks domain commit) |

### 5.6 Blockers
| Action | Treatment |
|---|---|
| Blockers list | **S** via `BlockersSkeleton` |
| Blocker detail dialog | **D** |
| Create / update / delete / resolve / escalate / link / unlink | **B** |

### 5.7 Alerts
| Action | Treatment |
|---|---|
| Alerts list | **S** via `AlertsSkeleton` |
| Create / update / delete / acknowledge / done | **B** |
| Acknowledge / done buttons in list rows | **B** (per-row loading) — each card knows its own id |

### 5.8 Red Flags
| Action | Treatment |
|---|---|
| Red flags list | **S** via `RedFlagsSkeleton` |
| Create / update / delete | **B** |

### 5.9 Decisions
| Action | Treatment |
|---|---|
| Decisions list | **S** via `DecisionsSkeleton` |
| Analytics card | **SI** (silent; render card as empty if data missing) |
| Create / update / delete | **B** |

### 5.10 Comments
| Action | Treatment |
|---|---|
| Comments list | **S** via `CommentsLogSkeleton` |
| Analytics card | **SI** |
| Create / update / delete / respond | **B** |

### 5.11 Requirements (task-scoped)
| Action | Treatment |
|---|---|
| Requirements fetch (inside TaskDetailDialog) | **D** in the requirements section of the dialog |
| Create / update / delete | **B** |
| Toggle checkbox | **O** (revert on error) |

### 5.12 Time Logs
| Action | Treatment |
|---|---|
| Task time-logs fetch | **D** (inside task dialog) |
| Sprint summary | **SI** (secondary widget) |
| Create / update / delete time log | **B** |

### 5.13 Dashboard
| Action | Treatment |
|---|---|
| Full dashboard query | **S** via `DashboardSkeleton` — the plan's primary page-level skeleton |
| Health score widget | **SI** (silent) |
| Metrics widget | **SI** (silent) |

---

## 6. Implementation Tasks

Each task is scoped to one PR/commit. Ordered so the primitive lands first; every migration after it is mechanical.

---

### Phase 1 — Primitives (non-breaking)

- [ ] **Task 1.1 — Extend `atoms/button.tsx` with `loading` prop**
  - Add `loading?: boolean`. When `true` → render inline spinner, set `disabled`.
  - Keep the spinner inline in the flex row so button width doesn't collapse.
  - Acceptance: existing callers still work; a new caller can replace the manual spinner span.

- [ ] **Task 1.2 — Create `<QueryBoundary>`**
  - New file: `src/components/shared/query-boundary.tsx`.
  - Props: `{ isLoading, skeleton, empty?, emptyState?, children }`.
  - Renders `skeleton` while loading, `emptyState` when `empty && !isLoading`, else `children`.
  - Export from `src/components/shared/index.ts`.
  - Acceptance: type check passes; used experimentally in one view.

- [ ] **Task 1.3 — Add missing page skeletons**
  - File: `src/components/skeletons.tsx`.
  - Add `SprintsSkeleton`, `SprintSummarySkeleton`, `UsersSkeleton`, `TeamsSkeleton`.
  - Acceptance: each new skeleton mirrors the shape of its final view.

---

### Phase 2 — Form submit buttons (mechanical)

One task per domain. Each task replaces `isLoading ? "…ing" : "Create"` patterns with `<Button loading={isLoading}>Create</Button>`.

- [ ] **Task 2.1 — Auth** (LoginView)
- [ ] **Task 2.2 — Users** (Add/Edit User dialog, deactivate dropdown)
- [ ] **Task 2.3 — Teams** (Add Team dialog)
- [ ] **Task 2.4 — Sprints** (Add/Edit Sprint, delete confirm, activate menu)
- [ ] **Task 2.5 — Tasks** (AddTaskDialog, TaskDetailDialog delete, TransitionDialog confirm)
- [ ] **Task 2.6 — Blockers** (Add/Edit/Resolve/Escalate dialogs)
- [ ] **Task 2.7 — Alerts** (Add/Edit + per-row ack/done buttons)
- [ ] **Task 2.8 — Red Flags** (Add/Edit dialogs)
- [ ] **Task 2.9 — Decisions** (Add/Edit dialogs)
- [ ] **Task 2.10 — Comments** (Add/Edit/Respond inputs)
- [ ] **Task 2.11 — Requirements** (inline add button within TaskDetailDialog)
- [ ] **Task 2.12 — Time Logs** (Add/Edit time log in TransitionDialog and inside task detail)

---

### Phase 3 — Page-level skeletons (one per view)

- [ ] **Task 3.1 — Views already using `*Skeleton`** — audit and wrap with `<QueryBoundary>` for consistency.
- [ ] **Task 3.2 — Views without a skeleton** — swap "Loading..." / blank / pulse-div with the matching skeleton component.
- [ ] **Task 3.3 — Sprint detail / summary** — apply `SprintSummarySkeleton` from Task 1.3.
- [ ] **Task 3.4 — Users / Teams** — apply `UsersSkeleton` / `TeamsSkeleton` from Task 1.3.

---

### Phase 4 — In-dialog skeletons

- [ ] **Task 4.1 — TaskDetailDialog** (requirements + time-logs sections)
- [ ] **Task 4.2 — TransitionDialog** (criteria — already done in error plan; verify skeleton shape)
- [ ] **Task 4.3 — BlockerDetailDialog** (if any async section)

---

### Phase 5 — Optimistic mutations

- [ ] **Task 5.1 — Task drag-drop** — confirm no spinner shows during optimistic status update.
- [ ] **Task 5.2 — Requirement toggle** — same.
- [ ] **Task 5.3 — User activate/deactivate** — convert from await-then-refetch to optimistic-with-revert.
- [ ] **Task 5.4 — Tag add/remove** — same consideration.

---

### Phase 6 — Cleanup

- [ ] **Task 6.1 — Repo audit**
  - `grep -r '"Loading..."' src` → replace each with the right skeleton or button-loading.
  - `grep -r "animate-spin" src` → every remaining instance must be inside the Button atom or an approved component.
  - `grep -r "animate-pulse" src` → every instance must be inside a `*Skeleton` component or the `Skeleton` atom.
- [ ] **Task 6.2 — Extend AGENTS.md** with a "Loading" section (mirror the "Error handling" section).
- [ ] **Task 6.3 — (Optional) Global top-bar progress** — add `usePageLoader`-driven nprogress-style bar if route transitions feel heavy.

---

## 7. Best Practices (codify in AGENTS.md after Task 6.2)

1. **Loading state is owned by the hook, displayed by the component.** Read `isLoading` from the same hook call that triggered the request.
2. **One skeleton per page.** Don't layer a page skeleton over individual card spinners — it causes double animation.
3. **Never render `"Loading..."` text.** Use a skeleton or `<Button loading>`.
4. **Never render a spinner without disabling its trigger.** If the user can click twice, the server gets two requests.
5. **Optimistic = no spinner.** If you update local state before the server confirms, do **not** show a loading indicator — it defeats the purpose.
6. **Background mutations are invisible.** `silent: true` in `runAction` must match `no loading UI` in the view (heartbeat, presence, analytics widgets).
7. **Keep content during refetch.** When filters/search change, keep the old rows visible and show a tiny toolbar spinner — don't jump back to the skeleton.
8. **Skeleton mirrors final shape.** A list skeleton has the same number of rows as a typical result; a chart skeleton has the same bounding box as the chart.
9. **Button width must not jump.** When `loading` flips, the spinner replaces the icon inline (children stay visible or shift predictably).
10. **Dialogs open instantly.** Only the dialog's body waits on fetches — header and action buttons are rendered immediately.
11. **One place defines "what loading looks like".** If you want a different spinner, change the Button atom and the `Skeleton` atom — nowhere else.

---

## Relationship to the error-handling plan

- Same primitives own both concerns: `useMutationAction` → `{ mutate, isLoading }`, `useQueryAction` → `{ data, isLoading, refetch, setData }`.
- `runAction`'s `silent: true` flag is the contract between the two plans — a silent error implies an invisible loader (and vice versa).
- The `<QueryBoundary>` component complements the plan's existing `components/error/NetworkError` / error-boundary components — one renders success/empty states, the other renders failure states.
- Best Practices #5 (optimistic) and #6 (background) match the error plan's rules about not toasting for those same cases.
