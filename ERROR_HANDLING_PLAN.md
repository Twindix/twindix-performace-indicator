# Error Handling Plan — Twindix Performance Indicator

## 1. Executive Summary

The project has **68 API-calling hooks across 13 domains**. ~80% already follow a decent pattern (`toast.error + getErrorMessage + success toast`), but the other 20% are inconsistent: `auth` throws raw, `users` uses a local `setError` state, `presence` swallows silently, and several domains add noisy `console.error` or defensive type casts.

The goal is to **centralize all error routing behind one reusable primitive** so every hook does the same thing, correctly, with zero boilerplate — and so UX (toast vs inline vs banner) becomes a declarative choice per call site, not a per-hook copy-paste.

---

## 2. Current State — What's Already Good

| Layer | Status | Notes |
|---|---|---|
| `lib/axios.ts` response interceptor | Good | Already unwraps `response.data.message`, rejects as `ApiError(status, msg, data)`. Already handles 401 + token refresh. |
| `lib/error.ts` `ApiError` class | Good | Holds `statusCode`, `message`, `data` — ready to extend. |
| `lib/error.ts` `getErrorMessage(err, fallback)` | Good | Sensible string extraction. |
| Sonner toaster mounted globally | Good | Already in provider tree. |
| `constants/<domain>/errors + messages` pattern | Good | Already exists per domain — just needs to be populated for auth/users/presence. |

**What to keep.** The plan below **builds on** these — it doesn't replace them.

---

## 3. Proposed Central/Reusable Architecture

### 3.0 Core principle — **backend message has first priority**

Every user-facing error string is resolved in this order, for every status, in every module:

| Priority | Source | When it's used |
|---|---|---|
| **1** | Backend `data.message` | **Always wins when the backend sent one.** |
| 2 | Status-specific default (403/429) **or** per-call `errorFallback` from the domain's constants | Backend sent no message |
| 3 | Generic `"Something went wrong. Please try again."` | Neither backend nor the call supplied a fallback |
| Exception | Hardcoded `"Network issue — please try again."` | Pure network failure (no HTTP status — backend unreachable) |

Implications that shape the whole plan:
- The `errors.*` strings in `src/constants/<domain>/index.ts` are **pure safety nets** — a user only sees them when the backend literally didn't send a message. They are never the "real" copy.
- Implementation enforcement lives in **two places only**:
  1. `src/lib/axios.ts` — the interceptor stores `data.message` on `ApiError.message` if present, otherwise leaves it empty.
  2. `src/lib/handle-action.ts` — `runAction` reads `apiError.message` first and only falls back when it is empty.
- 422 is an exception to "toast the message": backend field errors go **inline under each field** via `useFormErrors`. The 422 body-level `message` is not toasted (the field errors already speak).
- The axios transport-layer message (`"Request failed with status code 500"`, `"Network Error"`, `"timeout of 30000ms exceeded"`) is only surfaced when there is no HTTP status — i.e. connection failed before reaching the server. In all other cases the empty-message fallback kicks in.

### 3.1 Extend `ApiError` to carry field-level validation errors

```
ApiError {
  statusCode: number
  message: string            // backend `data.message` or fallback
  data?: unknown             // raw body
  fieldErrors?: Record<string, string[]>   // NEW — from Laravel 422 `errors`
  code?: string              // NEW — optional backend error code
}
```

Update axios response interceptor to populate `fieldErrors` from `data.errors` when `status === 422`. This one change unlocks inline form errors across every form.

### 3.2 Add ONE new file: `src/lib/handle-action.ts`

A single reusable primitive used by every mutation hook. Signature:

```
runAction(fn, {
  successMessage?: string,
  errorFallback?: string,
  onFieldErrors?: (e: Record<string,string[]>) => void,
  silent?: boolean,           // skip toast (analytics, presence, heartbeat)
  rethrow?: boolean,          // re-throw after toast (for callers who need it — e.g. login)
  context?: string,           // dev-mode log tag only
})
```

Responsibilities routed by `statusCode` (all toast text follows the priority from §3.0 — backend message first):

| Status | Behavior | Fallback copy (only if backend sent no message) |
|---|---|---|
| 2xx | Return data; show `successMessage` toast if provided | n/a |
| 401 | Silent — interceptor already dispatches `AUTH_UNAUTHORIZED_EVENT` | n/a |
| 403 | Toast | `"You don't have permission to do this."` |
| 404 | Return `null`; toast only if not a detail/list query (configurable) | `errorFallback` |
| 408 / network / offline | Toast + push to `useNetworkErrorStore` | `"Network issue — please try again."` (hardcoded — backend can't respond) |
| 422 | Call `onFieldErrors(err.fieldErrors)` if provided — inline only, **no toast**. If no handler, toast. | `errorFallback` |
| 409 | Toast | `errorFallback` |
| 429 | Toast | `"You're going too fast — try again in a moment."` |
| 5xx | Toast; dev-only `console.error(context, err)` | `errorFallback` |
| default | Toast | `errorFallback` |

### 3.3 Add ONE new hook: `src/hooks/shared/use-form-errors.ts`

Pairs with Yup schemas + `onFieldErrors` to surface per-field backend errors inline (red text under each field), with `clearError(field)` on change. This is the bridge between backend 422 and existing forms (login, add-task, add-sprint, add-blocker, etc.).

### 3.4 Two thin wrapper hooks (optional but recommended)

- `useMutationAction(fn, options)` — loading state + `runAction` in one call. Replaces the `const [isLoading, setIsLoading] = useState` boilerplate repeated in ~40 hooks.
- `useQueryAction(fn, deps, options)` — loading + refetch + toast on error. Replaces `use-*-list` boilerplate.

Hooks shrink from ~20 lines to ~5.

### 3.5 Delete redundant code

- Remove all `console.error(...)` calls in red-flags and sprints hooks (covered by `runAction` in dev mode only).
- Remove ad-hoc `navigator.onLine` checks — move into `runAction` (one check, consistent message, feeds `useNetworkErrorStore`).
- Remove the local `setError` state from the `users/` domain — replace with `runAction + onFieldErrors` for create/update.

---

## 4. UX Rules — When to Use Each Treatment

| Situation | Treatment | Why |
|---|---|---|
| Auth login wrong credentials (401 on `/auth/login`) | **Inline banner in form** (`error` state already there) | User is still on login page; toast would be easy to miss |
| Form submission, 422 field errors | **Inline red text under each field** via `useFormErrors` | User needs to fix specific fields |
| Form submission, 400/409/5xx general error | **Toast + keep form open** | One message, non-field-specific |
| List/table fetch failure (query on mount) | **Toast** + empty-state with "Retry" button | User sees table is empty and why |
| Full-page primary query fails (dashboard, sprint detail) | **Full-page error state with retry** (use existing `components/error/NetworkError`) | Nothing else on page is useful |
| Destructive mutation (delete) success | **Toast success** | Feedback after destructive action |
| Background mutation (heartbeat, presence, view-tracking) | **Silent** (`silent: true`) | User didn't trigger it, don't nag |
| 401 anywhere | **Nothing in UI** — interceptor redirects to login | Already handled globally |
| 403 anywhere | **Toast "No permission"** | Non-actionable but must be told |
| Network down (detected by `navigator.onLine` OR network error from axios) | **Global banner** via `useNetworkErrorStore` + suppress per-call toasts | One banner, not 10 toasts |

---

## 5. Per-Module Plan — All 13 Domains

### 5.0 Universal Form/Dialog Lifecycle (applies to every mutation below)

For every **T+S** and **T+S + F** row in the tables below, the full behavior is:

| Outcome | Form/Dialog | Toast | List refresh | Return value |
|---|---|---|---|---|
| **Success (2xx)** | **Close** | Success toast | Refetch list OR local merge (`addLocal`/`patchLocal`) | Returns created/updated entity |
| **422 field errors** | **Stays open** | No toast | No refetch | Returns `null`; `fieldErrors` populated inline under each field |
| **403 / 409 / 429 / 5xx / network** | **Stays open** | Error toast (backend message or fallback) | No refetch | Returns `null` |
| **401** | N/A — global redirect to login | No toast | No refetch | Promise rejects |

**Why:** If we close the form on a non-422 error, the user loses unsaved input. If we keep it open on success, the user may submit twice. Only 422 is actionable by editing fields, so only 422 stays inline; other errors stay open + toast.

**How `runAction` enforces this (one rule everywhere):**

```
const ok = await createHandler(payload);
if (ok) closeDialog();
```

`createHandler` returns the entity on success, `null` on any error — form closes iff result is truthy.

**Special cases:**
- **Delete confirmation dialog:** close on success *and* on error (can't meaningfully retry same delete) — still toast the error.
- **Optimistic toggles** (`use-toggle-requirement`, `use-update-task-status` drag-drop): no dialog; UI updates immediately, reverts in `catch`.
- **Login** (`use-auth.onLogin`): uses `rethrow: true` so the view can `navigate(dashboard)` only on success.

---

### Treatment Legend (used in all tables below)
- **T** = toast (error) — `runAction({ errorFallback })`
- **T+S** = toast error + success toast — `runAction({ successMessage, errorFallback })`
- **F** = field errors inline via `useFormErrors` (422 handling)
- **B** = inline banner in form/page
- **P** = full-page error state (blocking query)
- **SI** = silent (analytics, heartbeat, presence)
- **R** = re-throw after toast (caller needs to branch, e.g. login redirect)

### 5.1 Auth (`hooks/auth/`)

| Hook | Action | Current | Target Treatment | Notes |
|---|---|---|---|---|
| `use-auth.onLogin` | POST /auth/login | throws raw | **B + F + R** | Inline banner for 401 wrong-credentials; field errors for 422 email/password format; re-throw so view can skip navigate. |
| `use-auth.onLogout` | POST /auth/logout | throws in try/finally | **SI** | Always clear cookie locally; backend failure irrelevant. |
| `use-presence` heartbeat | PATCH /auth/heartbeat | `.catch(() => null)` | **SI** (keep silent) | Add dev-only log via `runAction({ silent: true, context: "heartbeat" })`. |

Needs: add `authConstants.errors.loginFailed`, `logoutFailed`.

### 5.2 Users (`hooks/users/`) — **biggest refactor**

| Hook | Action | Current | Target |
|---|---|---|---|
| `use-users-list` | GET /users | silent | **T** + Retry button |
| `use-users-detail` | GET /users/:id | setError state | **T** (or P if page is user-detail only) |
| `use-users-create` | POST /users | setError state | **T+S + F** |
| `use-users-update` | PUT /users/:id | setError state | **T+S + F** |
| `use-users-delete` | DELETE /users/:id | setError state | **T+S** (+ confirm dialog at call site) |
| `use-users-analytics` | GET (analytics) | setError state | **SI** with fallback empty data |

Needs: create `constants/users/index.ts` with `errors + messages` object.

### 5.3 Teams (`hooks/teams/`)

| Hook | Action | Current | Target |
|---|---|---|---|
| `use-get-teams` | GET /teams | T + onLine check | **T** (onLine logic moves to `runAction`) |
| `use-create-team` | POST /teams | T+S + onLine check | **T+S + F** |

### 5.4 Sprints (`hooks/sprints/`)

| Hook | Action | Current | Target |
|---|---|---|---|
| `use-sprints-list` | GET /sprints | T | **T** |
| `use-sprint-summary` | GET /sprints/:id/summary | T | **P** (blocking query — summary is the whole page) |
| `use-create-sprint` | POST /sprints | T+S + console.error | **T+S + F** (drop console.error) |
| `use-update-sprint` | PUT /sprints/:id | T+S + console.error | **T+S + F** |
| `use-delete-sprint` | DELETE /sprints/:id | T+S + console.error | **T+S** |
| `use-activate-sprint` | POST /sprints/:id/activate | T+S + console.error | **T+S** |

### 5.5 Tasks (`hooks/tasks/`)

| Hook | Action | Current | Target |
|---|---|---|---|
| `use-tasks-list` | GET /sprints/:id/tasks | T | **T** |
| `use-kanban` | GET /tasks/kanban | T | **T** (used as backup source) |
| `use-pipeline` | GET /tasks/pipeline | T | **T** |
| `use-task-stats` | GET /tasks/stats | T | **SI** (secondary widget) |
| `use-task-views` | GET (4 sub-views) | T | **T** per-sub-view |
| `use-tasks-state` | local state | T | **T** |
| `use-get-task` | GET /tasks/:id | T | **P** (task detail dialog — render error state) |
| `use-create-task` | POST /sprints/:id/tasks | T+S | **T+S + F** |
| `use-update-task` | PUT /tasks/:id | T+S | **T+S + F** |
| `use-update-task-status` | PATCH /tasks/:id/status | T+S | **T+S** (optimistic — revert on error) |
| `use-delete-task` | DELETE /tasks/:id | T+S | **T+S** |
| `use-task-tags` add/remove | POST/DELETE /tags | T+S | **T+S** |
| `use-task-attachments` upload/delete | POST/DELETE /attachments | T+S | **T+S + F** (size/type 422) |

### 5.6 Blockers (`hooks/blockers/`)

All 9 hooks currently `T` or `T+S` with scattered `navigator.onLine` checks that throw — **target: same `T`/`T+S` but onLine check moves to `runAction`**. Create/update get **F** for 422.

| Hook | Target |
|---|---|
| `use-blockers-list`, `use-get-blocker` | **T** |
| `use-create-blocker`, `use-update-blocker` | **T+S + F** |
| `use-delete-blocker` | **T+S** |
| `use-resolve-blocker`, `use-escalate-blocker` | **T+S** |
| `use-link-blocker-tasks`, `use-unlink-blocker-task` | **T+S** |

### 5.7 Alerts (`hooks/alerts/`)

| Hook | Target |
|---|---|
| `use-alerts-list` | **T** |
| `use-create-alert`, `use-update-alert` | **T+S + F** |
| `use-delete-alert` | **T+S** |
| `use-acknowledge-alert`, `use-done-alert` | **T+S** |

### 5.8 Red Flags (`hooks/red-flags/`)

All four currently log to `console.error` on top of toasting — remove the console.error (centralized in `runAction` for dev only).

| Hook | Target |
|---|---|
| `use-red-flags-list` | **T** |
| `use-create-red-flag`, `use-update-red-flag` | **T+S + F** |
| `use-delete-red-flag` | **T+S** |

### 5.9 Decisions (`hooks/decisions/`)

| Hook | Target |
|---|---|
| `use-decisions-list`, `use-decisions-analytics`, `use-get-decision` | **T** (analytics could be **SI**) |
| `use-create-decision`, `use-update-decision` | **T+S + F** |
| `use-delete-decision` | **T+S** |

### 5.10 Comments (`hooks/comments/`)

| Hook | Target |
|---|---|
| `use-comments-list`, `use-get-comment` | **T** |
| `use-create-comment`, `use-update-comment`, `use-respond-comment` | **T+S + F** |
| `use-delete-comment` | **T+S** |

### 5.11 Requirements (`hooks/requirements/`)

| Hook | Target |
|---|---|
| `use-get-requirement` | **T** |
| `use-create-requirement`, `use-update-requirement` | **T+S + F** |
| `use-delete-requirement` | **T+S** |
| `use-toggle-requirement` | **T+S** (optimistic — revert on error) |

### 5.12 Time Logs (`hooks/time-logs/`)

| Hook | Target |
|---|---|
| `use-get-time-log` (3 handlers) | **T** (summary widget could be **SI**) |
| `use-create-time-log`, `use-update-time-log` | **T+S + F** |
| `use-delete-time-log` | **T+S** |

### 5.13 Dashboard (`hooks/dashboard/`)

| Hook | Target |
|---|---|
| `use-dashboard.fetchFull` | **P** (primary page query) |
| `use-dashboard.fetchHealthScore` | **SI** with fallback (widget) |
| `use-dashboard.fetchMetrics` | **SI** with fallback (widget) |

---

## 6. Implementation Tasks

Each task is scoped to one PR/commit. Tasks are ordered so every step is low-risk and non-breaking — the primitive lands first (nothing consumes it), then one small domain proves the pattern, then broken domains get fixed, then bulk migration.

> **Progress tracking:** tick the checkbox when the task is complete. Don't skip phases — later tasks assume the primitive from Phase 1 exists.

---

### Phase 1 — Foundation (non-breaking, nothing else changes)

- [ ] **Task 1.1 — Extend `ApiError` class**
  - File: `src/lib/error.ts`
  - Add `fieldErrors?: Record<string, string[]>` and `code?: string` to constructor.
  - Update `handleApiError` / `getErrorMessage` if needed (they already accept `unknown`).
  - Acceptance: type check passes, all existing callers still compile.

- [ ] **Task 1.2 — Populate `fieldErrors` from 422 in axios interceptor**
  - File: `src/lib/axios.ts`
  - In the response-error interceptor, when `status === 422` read `data.errors` (Laravel shape: `{ field: [msg, ...] }`) and pass into new `ApiError` constructor.
  - Acceptance: manual test — trigger a 422 in any form; `err.fieldErrors` is populated.

- [ ] **Task 1.3 — Create `runAction` primitive**
  - New file: `src/lib/handle-action.ts`
  - Implement `runAction<T>(fn, options)` per signature in section 3.2. Route by `err.statusCode` per table. Push network errors into `useNetworkErrorStore`. Dev-only `console.error` when `import.meta.env.DEV`.
  - Export from `src/lib/index.ts`.
  - Acceptance: unit-test or manual: `runAction(() => Promise.resolve(1), {})` returns `1`; rejects with `ApiError(500)` returns `null` + toast fires.

- [ ] **Task 1.4 — Create `useFormErrors` shared hook**
  - New file: `src/hooks/shared/use-form-errors.ts`
  - Returns `{ fieldErrors, setFieldErrors, clearError(field), clear() }`.
  - Export from `src/hooks/shared/index.ts` and `src/hooks/index.ts`.
  - Acceptance: type check passes; hook is importable.

- [ ] **Task 1.5 — (Optional) Create `useMutationAction` / `useQueryAction` wrappers**
  - New files: `src/hooks/shared/use-mutation-action.ts`, `src/hooks/shared/use-query-action.ts`.
  - Wrap `runAction` with `isLoading` state and, for queries, `refetch` + `useEffect(deps)`.
  - Acceptance: one existing hook (e.g. `use-create-team`) can be rewritten using it in <10 lines and still behaves identically.

---

### Phase 2 — Proof of concept (smallest domain first)

- [ ] **Task 2.1 — Migrate `teams/` domain**
  - Files: `src/hooks/teams/use-create-team.ts`, `src/hooks/teams/use-get-teams.ts`
  - Replace inline try/catch with `runAction`. Remove the ad-hoc `navigator.onLine` check — `runAction` handles it.
  - For `use-create-team`: accept optional `onFieldErrors` param so the `AddTeamDialog` can wire `useFormErrors`.
  - Acceptance: (1) create a team happy path → dialog closes, success toast, list refreshes. (2) trigger 422 → dialog stays open, inline errors show under fields. (3) offline → network banner shows, no per-call toast.

- [ ] **Task 2.2 — Validate the primitive against the proof**
  - If `runAction` needed a tweak to make `teams/` clean, fold the change in now before bulk migration.
  - No code to write if Phase 2.1 went smoothly.

---

### Phase 3 — Fix broken domains (highest value)

- [ ] **Task 3.1 — Populate `authConstants`**
  - File: `src/constants/auth/index.ts`
  - Add `errors.loginFailed`, `errors.logoutFailed`, `messages.loginSuccess` (if needed).

- [ ] **Task 3.2 — Fix `use-auth`**
  - File: `src/hooks/auth/use-auth.ts`
  - `onLogin`: wrap in `runAction` with `rethrow: true` and `onFieldErrors` param. Caller (LoginView) catches for banner + `useFormErrors` for field errors.
  - `onLogout`: wrap in `runAction` with `silent: true`; always clear cookie in a `finally`.
  - Acceptance: wrong password → inline banner in LoginView; 422 → inline field errors; success → navigate to dashboard.

- [ ] **Task 3.3 — Fix `use-presence`**
  - File: `src/hooks/auth/use-presence.ts`
  - Replace `.catch(() => null)` with `runAction(..., { silent: true, context: "heartbeat" })`.
  - Acceptance: no user-visible toasts on heartbeat failures; dev console shows one line.

- [ ] **Task 3.4 — Create `usersConstants`**
  - New file: `src/constants/users/index.ts` — mirror the shape of `tasksConstants`.
  - Export from `src/constants/index.ts`.

- [ ] **Task 3.5 — Migrate `users/` domain (6 hooks)**
  - Files: `use-users-list`, `use-users-detail`, `use-users-create`, `use-users-update`, `use-users-delete`, `use-users-analytics`.
  - Delete the `setError` state everywhere. Replace with `runAction`. `use-users-create` + `use-users-update` accept `onFieldErrors`. `use-users-analytics` uses `silent: true` with fallback empty data.
  - Update call sites (views) to consume `{ data, isLoading }` + `useFormErrors` instead of `error` state.
  - Acceptance: silent-list bug fixed (errors now toast); create/update forms show inline 422 errors; analytics widget no longer shows "unavailable" banner.

---

### Phase 4 — Bulk migration (pattern-identical, one domain per task)

Each task in this phase is mechanical: replace try/catch with `runAction`, drop `console.error` and `navigator.onLine` checks, add `onFieldErrors` to create/update hooks.

- [ ] **Task 4.1 — Migrate `sprints/` (6 hooks)** — also delete `console.error` from mutations; `use-sprint-summary` uses page-level error state.
- [ ] **Task 4.2 — Migrate `tasks/` (13 hooks)** — `use-task-stats` becomes `silent`; `use-get-task` uses page-level error state (task detail dialog); status/drag-drop needs optimistic revert in `onError`.
- [ ] **Task 4.3 — Migrate `blockers/` (9 hooks)** — delete every `navigator.onLine` block.
- [ ] **Task 4.4 — Migrate `alerts/` (6 hooks)**.
- [ ] **Task 4.5 — Migrate `red-flags/` (4 hooks)** — delete every `console.error`.
- [ ] **Task 4.6 — Migrate `decisions/` (6 hooks)** — `use-decisions-analytics` becomes `silent`.
- [ ] **Task 4.7 — Migrate `comments/` (6 hooks)** — delete `navigator.onLine` blocks.
- [ ] **Task 4.8 — Migrate `requirements/` (5 hooks)** — `use-toggle-requirement` needs optimistic revert.
- [ ] **Task 4.9 — Migrate `time-logs/` (4 hooks)**.
- [ ] **Task 4.10 — Migrate `dashboard/` (1 hook, 3 handlers)** — `fetchFull` uses page-level error state; `fetchHealthScore` + `fetchMetrics` become `silent` with fallback.

---

### Phase 5 — Cleanup & enforcement

- [ ] **Task 5.1 — Repo-wide audit**
  - `grep -r "console.error" src/hooks src/services src/views` → should return zero (except tests).
  - `grep -r "navigator.onLine" src/hooks` → should return zero (only `runAction` may reference it).
  - `grep -r "setError" src/hooks` → should return zero.
  - Fix any stragglers.

- [ ] **Task 5.2 — Update `AGENTS.md`**
  - Add a "Error handling" section pointing at `src/lib/handle-action.ts` and listing the 10 best practices from section 7 of this plan.

- [ ] **Task 5.3 — (Optional) Remove `src/utils/error-handlers.ts` if unused**
  - After migration, check if `checkIsNetworkErrorHandler` / `getErrorMessageHandler` are still referenced. If not, delete and remove from `src/utils/index.ts`.

---

## 7. Best Practices (codify in AGENTS.md after Task 5.2)

1. **Backend message always has first priority.** Constants in `src/constants/<domain>/errors` are **fallbacks**, not the real copy — a user only sees them when the backend literally sent no message. Never write a toast/inline string in a component or hook that overrides the backend.
2. **Never handle errors in a component** — always in a hook via `runAction`. Components only consume `{ data, isLoading, error?, submit, fieldErrors }`.
3. **Toasts are for events, inline errors are for forms.** Never both for the same error.
4. **Never swallow an error silently** unless it's a background side-effect (heartbeat, presence, analytics). Use `silent: true` explicitly — makes the intent auditable.
5. **Never `console.error` in app code** — `runAction` does it in dev mode only.
6. **Fallback constants per domain.** Every hook pulls its fallback message from `constants/<domain>/index.ts` — but remember (rule #1) the backend message wins whenever present.
7. **401 is global.** No hook handles it; the interceptor does. Don't toast unauthorized.
8. **Optimistic updates must revert on error.** For `toggle`, `status change`, `drag-drop` — snapshot before, restore in the `catch` inside `runAction`'s `onError`.
9. **Don't re-throw unless the caller needs to branch** (login navigate, blocker resolve refreshes list, etc.). Default is catch-and-toast.
10. **One place maps HTTP status → UX.** If you need to change "what 403 looks like", you change it in `runAction` — nowhere else.
11. **Form closes iff the handler returns truthy.** Never call `closeDialog()` unconditionally after `await submit()`.
