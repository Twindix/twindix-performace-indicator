# Permissions & Roles — Implementation Plan (V0.4)

Source: **Twindix API Updates V0.4 — User Roles & Permissions, Complete Frontend Reference (2026‑04‑22)**.

This plan maps the doc's 5‑tier role model onto the project's existing architecture (Zustand auth store, `runAction` error primitive, `QueryBoundary`, per‑domain hooks/services/constants, `Can`‑style declarative gating). Nothing outside the plan is introduced.

---

## 1. Current project state (post V0.5/V0.6)

What already exists and will be reused:
- `src/constants/users/index.ts:3` — `usersConstants.roleTiers = ["admin", "manager", "member", "viewer"]` and `roleTierLabels` map. **`tester` still missing.**
- `src/interfaces/common.ts:24` — `UserInterface.role_tier: string` (needs narrowing).
- `src/store/auth.ts` — current user cache; `useAuth()` exposes `{ user, isAuthenticated, ... }`.
- `src/lib/handle-action.ts:83` — `runAction` already toasts `"You don't have permission to do this."` on HTTP 403.
- `src/lib/axios.ts:75` — wraps any 403 in `ApiError(403, …)`.
- `src/routes/protected.tsx` — auth‑only route guard (no role guard yet).

Existing ad‑hoc role checks that must be migrated to the new primitive:
- `src/views/decisions/index.tsx:80` — `isPM = user?.role_tier === "manager"` (lines 296, 413).
- `src/views/teams/index.tsx:17` — `isAdmin = user?.role_tier === "admin"` (lines 73, 97).
- `src/views/tasks/TaskDetailDialog.tsx:104` — `isManager = admin || manager` for phase finish.

Role selects in UI:
- `src/views/users/index.tsx:236‑239` — the only real role select. Already reads `usersConstants.roleTiers` + labels (will auto‑inherit `tester` once added).

---

## 2. Target architecture (layered, reusable)

```
src/constants/permissions/index.ts         RoleTier union, messages
src/lib/permissions/
  ├── helpers.ts                           inRoles, ownerOf, Ctx
  ├── index.ts                             aggregates + re‑exports
  ├── auth.policy.ts
  ├── sprints.policy.ts
  ├── projects.policy.ts
  ├── tasks.policy.ts
  ├── comments.policy.ts
  ├── blockers.policy.ts
  ├── red-flags.policy.ts
  ├── alerts.policy.ts
  ├── decisions.policy.ts
  ├── users.policy.ts
  └── teams.policy.ts
src/hooks/shared/use-permissions.ts        usePermissions() binds current user
src/components/shared/can.tsx              <Can check={(p)=>...}>
src/components/shared/can-route.tsx        <CanRoute allow={["admin"]}>
```

`role_tier` is narrowed from `string` → `RoleTier` union (`"admin" | "manager" | "tester" | "member" | "viewer"`). Ownership resolver per module:

| Module | Owner field |
|---|---|
| tasks | `task.assignee?.id` |
| blockers | `blocker.reporter?.id` (edit own), `blocker.owner?.id` (resolve/escalate/link own) |
| comments | `comment.author.id` |
| red‑flags | `red_flag.reporter.id` |
| alerts | `alert.creator.id` |
| decisions | `decision.created_by.id` |
| time‑logs | `time_log.user_id` |

---

## 3. Full permission matrix (captured verbatim from doc)

| Module | Action | admin | manager | tester | member | viewer |
|---|---|---|---|---|---|---|
| **auth** | login / logout / view /me / edit settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| | PUT /me (name, presence) | ✅ | ✅ | ✅ | ✅ | ❌ |
| **sprints** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create / edit / activate | ✅ | ✅ | ❌ | ❌ | ❌ |
| **projects** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create / edit | ✅ | ✅ | ❌ | ❌ | ❌ |
| | delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| **tasks** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create | ✅ | ✅ | ✅ | ✅ | ❌ |
| | edit any | ✅ | ✅ | ❌ | ❌ | ❌ |
| | edit own | ✅ | ✅ | own | own | ❌ |
| | delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| | move phase | ✅ | ✅ | own | own | ❌ |
| | requirements/attachments/time any | ✅ | ✅ | ❌ | ❌ | ❌ |
| | requirements/attachments/time own | ✅ | ✅ | ✅ | ✅ | ❌ |
| **comments** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | add / edit own / delete own / respond | ✅ | ✅ | ✅ | ✅ | ❌ |
| | edit others | ❌ | ❌ | ❌ | ❌ | ❌ |
| | delete others | ✅ | ❌ | ❌ | ❌ | ❌ |
| **blockers** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create | ✅ | ✅ | ✅ | ✅ | ❌ |
| | edit any | ✅ | ✅ | ❌ | ❌ | ❌ |
| | edit own / resolve‑escalate own / link own | ✅ | ✅ | own | own | ❌ |
| | delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| **red‑flags** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create / edit own / delete own | ✅ | ✅ | ✅ | ✅ | ❌ |
| | edit others / delete others | ✅ | ❌ | ❌ | ❌ | ❌ |
| **alerts** | view / acknowledge | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create / edit own / delete own / mark done | ✅ | ✅ | ❌ | ❌ | ❌ |
| | edit others | ✅ | ❌ | ❌ | ❌ | ❌ |
| **decisions** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create | ✅ | ✅ | ❌ | ✅ | ❌ |
| | edit any / delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| | edit own | ✅ | ✅ | ❌ | ✅ | ❌ |
| **users** | view list + analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create / edit / deactivate | ✅ | ❌ | ❌ | ❌ | ❌ |
| **teams** | view | ✅ | ✅ | ✅ | ✅ | ✅ |
| | create / edit / delete / members | ✅ | ❌ | ❌ | ❌ | ❌ |
| **dashboard / profile / settings** | view + edit own | ✅ | ✅ | ✅ | ✅ | ✅ |

Asymmetric cases worth flagging (must not be simplified away):
- Decisions: tester cannot create, member can. Only module where tester < member.
- Alerts: `viewer` can acknowledge — their only write action.
- Alerts edit/delete: manager only on own; admin on any.
- Comments: edit others always denied, even for admin.
- Red‑flags: edit/delete others admin‑only — manager cannot.
- Task move phase: tester/member own‑only; manager any.
- PUT /me name+presence: allowed for everyone except viewer.

---

## 4. Role selects — centralization

Goal: every role `<Select>` in the app shows the canonical list from one source, correctly ordered, with user‑facing labels.

Central source: `usersConstants.roleTiers` + `usersConstants.roleTierLabels` (extend with `tester`).

Concrete changes:
- Add `tester: "Tester"` to `roleTierLabels` and `"tester"` to `roleTiers`.
- `src/views/users/index.tsx:236‑239` already maps over `ROLE_TIERS` — picks up `tester` automatically after the constant is extended. Verify label rendering for all 5 tiers.
- Filter selects (e.g. users list filter, workload filter) must import `usersConstants.roleTiers` — never hard‑code strings.
- Where a select should **not** show all tiers (hypothetical future filter), wrap the list via a helper `roleTierOptions(include?: RoleTier[])` in `src/constants/permissions/index.ts` so the source remains one.

---

## 5. Integration with existing error handling

Reuse, don't replace:
- `runAction` already handles 403 → toast `"You don't have permission to do this."` This stays.
- Add optional `expectAuthorized?: boolean` (default `true`) to `RunActionOptions`. When `false`, 403 is silently swallowed (for speculative calls). When `true` and the UI had already gated the action, a 403 indicates mid‑session role drift — log with `context: "permissions"` so the mismatch is visible in dev.

No changes to `ApiError`, `axios.ts`, or `sonner` wiring.

---

## 6. Open questions to confirm before merging Phase 1

- Backend `role_tier` string: confirm exact literals (`admin | manager | tester | member | viewer`).
- Blocker ownership: doc uses "own reported" for edit, "own" for resolve/escalate/link. We will resolve edit via `reporter.id`, resolve/escalate/link via `owner.id`. Backend confirmation avoids a re‑work.
- `UserInterface.role_tier` narrowing: ensure no serializer returns an unknown value (would break the union).

---

# Tasks

Workflow:
- **All tasks stay on the current branch (`feat/permissions-and-roles`).** No per‑task branches, no per‑task PRs.
- **Commit after every task** with a focused message (`feat(permissions): <task summary>`). One task = one commit.
- **No build or type‑check between tasks.** TypeScript errors introduced mid‑way are fine as long as they are closed by a later task on the list.
- **Build + type‑check + manual smoke only at the very end**, after Task 7, before pushing for review.

---

## Task 1 — Foundations: types, constants, `tester` tier

Scope: make the 5‑tier model a compile‑time fact without changing behavior.

- Create `src/constants/permissions/index.ts` exporting:
  - `ROLE_TIERS` (tuple of all 5 literals, canonical order: admin → manager → tester → member → viewer)
  - `RoleTier` (union type)
  - `PERMISSION_MESSAGES` (forbidden, viewerReadOnly)
- Update `src/constants/users/index.ts`:
  - Import `ROLE_TIERS` and re‑export as `usersConstants.roleTiers`.
  - Extend `roleTierLabels` to include `tester: "Tester"`.
- Narrow `src/interfaces/common.ts:24` — `role_tier: RoleTier`.
- Narrow `src/interfaces/users/index.ts:6, 35, 43` — payload/list params use `RoleTier`.

Exit criteria: `tester` is in the constant; `role_tier` is a union everywhere; no runtime behavior change. Type‑check runs at the end (Task 7), not here.

---

## Task 2 — Policy layer

Scope: one declarative policy module per domain. No wiring into views yet.

- Add `src/lib/permissions/helpers.ts`:
  ```ts
  export type Ctx = { role: RoleTier; userId: string };
  export const inRoles = (ctx: Ctx, ...roles: RoleTier[]) => roles.includes(ctx.role);
  ```
- Add one `.policy.ts` per module (auth, sprints, projects, tasks, comments, blockers, red‑flags, alerts, decisions, users, teams). Each exports a flat object of predicates, one per action in the matrix (§3).
- Each policy imports the resource interface it checks against. No React, no hooks.
- `src/lib/permissions/index.ts` re‑exports all policies + helpers.
- Comment every own‑vs‑any rule citing the matrix row (it protects the asymmetric cases).

Exit criteria: `src/lib/permissions` is self‑contained and referenced from nowhere.

---

## Task 3 — Hook + UI primitives

Scope: React surface that views consume.

- Add `src/hooks/shared/use-permissions.ts`:
  - Reads current user via `useAuth()`.
  - Builds `Ctx` once per user change with `useMemo`.
  - Returns a bound object `{ tasks, comments, blockers, … }` where each predicate has `Ctx` pre‑bound. Null user → all predicates return `false`.
- Add `src/components/shared/can.tsx` — `<Can check={(p)=>p.tasks.delete()} fallback={…}>children</Can>`.
- Add `src/components/shared/can-route.tsx` — `<CanRoute allow={RoleTier[]} redirectTo="/dashboard">`.
- Wire barrels in `src/hooks/index.ts` and `src/components/shared/index.ts`.

Exit criteria: a component can write `const p = usePermissions(); p.tasks.delete()` and get a boolean.

---

## Task 4 — Error‑handling integration

Scope: extend `runAction` to distinguish expected vs surprising 403.

- Add `expectAuthorized?: boolean` (default `true`) to `RunActionOptions` in `src/lib/handle-action.ts`.
- Branch on 403: if `expectAuthorized === true` (the UI should have gated it), keep current toast + `devLog(context ?? "permissions", err)`. If `false`, swallow silently.
- Document the new option in `AGENTS.md` under "Error handling".

Exit criteria: existing behavior preserved; new opt‑in silences speculative 403s.

---

## Task 5 — Migrate existing ad‑hoc role checks

Scope: replace every hand‑rolled role check with the policy primitive. Parity, not new behavior.

- `src/views/decisions/index.tsx:80` — drop `isPM`; replace lines 296, 413 with `p.decisions.setStatus(decision)`.
- `src/views/teams/index.tsx:17` — drop `isAdmin`; replace lines 73, 97 with `p.teams.manage()`.
- `src/views/tasks/TaskDetailDialog.tsx:104` — replace `isManager` + `canFinish` with `p.tasks.finishPhase(task)` (policy helper that collapses the own‑or‑manager rule).
- `src/views/workload/index.tsx:120` — display‑only `role_tier?.replace(...)` stays, but swap to `usersConstants.roleTierLabels[member.role_tier]` so UI shows the canonical label.

Exit criteria: no direct `role_tier === …` comparison remains in `src/views/**`.

---

## Task 6 — Apply permissions module by module

Scope: wire `<Can>` / `p.*()` into every feature view. One PR per module, merged in this order: users → teams → projects → sprints → decisions → tasks → comments → blockers → red‑flags → alerts → profile.

For each module PR:
- Gate create / edit / delete buttons and icons per matrix row.
- Disable form inputs where the role cannot save (e.g. viewer's profile name/presence).
- Hide rows in dropdown menus (MoreHorizontal) that the current role cannot use.
- Add admin‑only route via `<CanRoute allow={["admin"]}>` for `users` management and `teams` management pages; all other routes remain auth‑only.
- Keep action handlers intact — the server still rejects; `runAction` surfaces the 403 if the role changes mid‑session.

Exit criteria: each PR's view renders identically for admin, hides actions correctly for every other tier by visual check.

---

## Task 7 — Audit sweep & rollout close‑out

Scope: catch anything missed during the per‑module pass.

- Grep `src/views/**` for leftover literal `"admin" | "manager" | "tester" | "member" | "viewer"` comparisons; migrate any hits.
- Grep `src/hooks/**` for mutation hook call sites (`useCreate*`, `useUpdate*`, `useDelete*`, `useToggle*`, `useResolve*`, `useEscalate*`, `useActivate*`, `useAcknowledge*`, `useDone*`). For each call site, confirm the invoking component is wrapped in `<Can>` or gated by `p.*()`.
- Confirm every role `<Select>` reads `usersConstants.roleTiers` (no hardcoded tuples).
- Update `AGENTS.md` with a short "Permissions" section pointing at `src/lib/permissions/` and `<Can>`.
- Delete any now‑dead imports.

Exit criteria: grep returns zero hardcoded role comparisons outside the policy layer and the centralized constants.
