# AGENTS.md — Twindix Performance Indicator

## Dev environment tips

- Run `npm run dev` to start the Vite dev server on localhost.
- Run `npm run build` to compile TypeScript and produce a production bundle via Vite.
- Run `npm run preview` to locally preview the production build before deploying.
- Use the path alias `@/` instead of relative paths — it maps to `src/`. Example: `import { Button } from "@/atoms"`.
- Every folder under `src/` has a barrel `index.ts`; always import from the barrel, not the individual file.

## Folder structure

```
src/
├── atoms/
├── components/
│   ├── shared/
│   └── error/
├── constants/            # one subfolder per domain (auth, users, tasks, …)
├── contexts/
├── data/
│   └── seed/             # UI-only seed data (e.g. projects)
├── enums/
├── hooks/
│   ├── shared/
│   └── <domain>/         # per-domain hook folders (auth, users, sprints, tasks, blockers, …)
├── interfaces/
│   └── <domain>/         # per-domain interface folders + legacy flat files (communications, metrics, …)
├── layouts/
├── lib/
├── providers/
├── routes/
├── schemas/
├── services/
│   └── <domain>/         # per-domain service folders
├── store/
├── ui/
├── utils/
└── views/
    ├── dashboard/
    ├── projects/         # Projects grid — click a card to show that project's sprints
    ├── sprints/
    ├── tasks/
    ├── blockers/
    ├── decisions/
    ├── communication/
    ├── workload/
    ├── reports/
    ├── analytics/
    ├── ownership/
    ├── handoffs/
    ├── users/
    ├── teams/
    ├── alerts/
    ├── red-flags/
    ├── comments-log/
    ├── profile/
    ├── settings/
    ├── errors/
    └── auth/
```

## Folder purposes

- **atoms/** — Smallest reusable UI pieces (Button, Badge, Input, Card, Textarea, Skeleton, Logo). No business logic, no API calls.
- **components/shared/** — Layout and utility components used across all pages (Sidebar, Topbar, Header, MetricCard, ScoreGauge, AnimatedNumber, EmptyState, OfflineBanner, MobileNav, StatusBadge). Composed from atoms.
- **components/error/** — Error boundary and network error display components (Boundary, NetworkError, StackTrace).
- **constants/** — Domain-scoped constant bags (error messages, labels, button copy). One subfolder per domain, each exporting a `<domain>Constants` object consumed by that domain's hooks.
- **contexts/** — Raw React context definitions only. No providers or initialization logic here.
- **data/** — Static app-wide constants: `apis.ts` (all API endpoint URLs), `common.ts` (token/auth constants), `routes.ts`, `sidebar.ts`. `data/seed/` holds UI-only seed arrays (currently just `projects.ts`).
- **enums/** — TypeScript enums for every categorical value (TaskPhase, TaskPriority, BlockerStatus, SprintStatus, MetricStatus, MetricTrend, BrowserEvents, etc.).
- **hooks/shared/** — Cross-cutting hooks: `useAuth`, `useTheme`, `useLocalStorage`, `useSettings`, `useCountUp`, `useOnlineStatus`, `usePageLoader`, `usePresence`, `t()` i18n function.
- **hooks/<domain>/** — Per-domain CRUD hooks (e.g. `use-users-list`, `use-create-task`). Each calls into the matching `services/<domain>` handler and surfaces `{ data, isLoading, error, refetch }`-shaped returns.
- **interfaces/** — TypeScript interfaces for data shapes. Most domains have their own subfolder (`interfaces/users/`, `interfaces/tasks/`, `interfaces/projects/`, …); legacy domains still live as flat files (`communications.ts`, `metrics.ts`, `ownership.ts`, `handoffs.ts`, `workload.ts`, `tasks-dialog.ts`, `common.ts`).
- **layouts/** — Page shell components: `AuthLayout`, `DashboardLayout` (with sidebar, topbar, and provider wrapping).
- **lib/** — Low-level platform utilities: `axios.ts` (client with interceptors, token refresh, 401 handling, body-less PATCH/POST/PUT fix), `cookies.ts`, `error.ts` (ApiError class), `utils.ts`.
- **providers/** — React Provider components that wrap contexts and run initialization side-effects on mount.
- **routes/** — React Router v7 configuration, route guards (`ProtectedRoute`, `PublicRoute`), and error boundary page.
- **schemas/** — Yup validation schemas, one per form (e.g. `add-task`). Keeps validation logic out of components.
- **services/** — Axios-based API client functions. One subfolder per domain: `auth`, `users`, `teams`, `sprints`, `tasks`, `blockers`, `alerts`, `red-flags`, `decisions`, `comments`, `dashboard`, `requirements`, `time-logs`.
- **store/** — Zustand stores for lightweight global UI state: `useAuthStore`, `useSprintStore`, `useProjectStore` (in-memory seeded project list), `useSidebarStore`, `useNetworkErrorStore`.
- **ui/** — Thin wrappers around Radix UI primitives following the shadcn/ui pattern (Dialog, Select, Tabs, Tooltip, Avatar, Checkbox, DropdownMenu, ScrollArea, Separator, Sonner toast). Never import Radix directly outside this folder.
- **utils/** — Pure helper functions: `cn`, `formatDate`, `translateData`, `errorHandlers`, `generateClassName`, localStorage key map.
- **views/** — One subfolder per feature page. Each contains the page component and any dialogs or sub-components that belong only to that page.
- **views/projects/** — Projects layer sits above sprints. Renders a grid of project cards with per-card Edit/Delete (`…` menu) and a page-level Add button. Clicking a card swaps the inline view to `SprintsView` with a **Back to Projects** button. UI-only — all CRUD hits the in-memory `useProjectStore` seeded from `data/seed/projects.ts`.

## Naming conventions

| Target | Convention | Examples |
|---|---|---|
| Files (non-component) | `kebab-case.ts` | `use-auth.ts`, `add-task-dialog.tsx`, `format-date.ts` |
| Files (component) | `PascalCase.tsx` | `BoardView.tsx`, `TaskDetailDialog.tsx`, `MetricCard.tsx` |
| React components | `PascalCase` | `BoardView`, `TaskDetailDialog`, `EmptyState` |
| Custom hooks | `camelCase` with `use` prefix | `useAuth()`, `useSidebarStore()`, `useCountUp()` |
| Functions & variables | `camelCase` | `checkTransition()`, `inferWorkType()`, `getMember()` |
| Interfaces | `PascalCase` + `Interface` suffix | `TaskInterface`, `BlockerInterface`, `UserInterface` |
| Enums & enum members | `PascalCase` | `TaskPhase.InProgress`, `BlockerStatus.Escalated` |
| Folders | `kebab-case` | `components/shared/`, `views/comments-log/`, `views/red-flags/` |
| Zustand stores | `camelCase` file, exported as `use*Store` | `store/sprint.ts` → `useSprintStore` |
| Storage keys | `SCREAMING_SNAKE_CASE` constants in `utils/storage.ts` | `storageKeys.tasks`, `storageKeys.authUser` |

## Environment variables

- All environment variables **must** be stored in `.env.local` (never committed) or `.env.*.local` secret files.
- Never hardcode secrets, API keys, or environment-specific URLs in source files.
- Access env variables only through the `getEnvVariable()` helper in `src/lib/utils.ts` — do not use `import.meta.env.*` directly in components or views.
- Prefix every custom variable with `VITE_` so Vite exposes it to the client bundle. Example: `VITE_API_BASE_URL`.
- Add a `.env.example` file listing every required variable name with a placeholder value whenever a new variable is introduced.
- The following built-in Vite variables are available without a prefix and are safe to use via the helper:
  - `import.meta.env.PROD` — true in production builds
  - `import.meta.env.DEV` — true in development mode

## Tech stack

| Layer | Library / Version |
|---|---|
| Framework | React 19.2.0 + TypeScript 5.7.3 |
| Routing | React Router DOM 7.13.0 |
| State (global UI) | Zustand 5.0.11 |
| State (domain data) | React Context (one provider per feature) |
| Styling | Tailwind CSS 4.1.18 |
| UI primitives | Radix UI (via `src/ui/` wrappers, shadcn/ui pattern) |
| Icons | Lucide React 0.563.0 |
| HTTP client | Axios 1.13.4 |
| Validation | Yup 1.7.1 |
| Notifications | Sonner 2.0.7 |
| Build | Vite 6.4.1 + @vitejs/plugin-react 4.7.0 |
| PWA | vite-plugin-pwa 1.2.0 |
| Git hooks | Husky 9.1.7 + Commitlint (conventional commits) |

## Authentication & token flow

1. User submits credentials → `POST /auth/login` → token returned.
2. Token stored in cookie `twindix_perf_auth_token` via `setCookieHandler()`.
3. Axios request interceptor injects `Authorization: Bearer <token>` on every request.
4. On 401 response: interceptor calls `POST /auth/refresh`, stores new token, retries original request (guarded by `_retry` flag to prevent loops).
5. On permanent 401 (refresh also fails): dispatches `AUTH_UNAUTHORIZED_EVENT`; `AuthProvider` listener clears user state and deletes cookie; `ProtectedRoute` redirects to login.
6. On app mount: if cookie exists, `authService.meHandler()` (`GET /auth/me`) restores user session; cookie deleted on failure.

## Provider hierarchy

```
BoundaryErrorClass
└── ThemeProvider
    └── AuthProvider
        └── RouterProvider
            └── Toaster (Sonner)
                └── IndicatorNetworkError
                    └── DashboardLayout (authenticated shell)
                        ├── SprintsProvider
                        ├── RedFlagsProvider
                        ├── AlertsProvider
                        └── <page providers per view>
```

## API surface (all endpoints)

Base URL: `VITE_API_URL` env variable. All routes defined in `src/data/apis.ts`.

### Auth
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Current user |
| PATCH | `/auth/heartbeat` | Keep-alive |

### Users
| Method | Path | Purpose |
|---|---|---|
| GET | `/users` | List (filters: per_page, page, role_tier, team_id) |
| POST | `/users` | Create |
| GET | `/users/:id` | Detail |
| PUT | `/users/:id` | Update |
| DELETE | `/users/:id` | Delete |
| GET | `/users/me/settings` | My settings |
| PUT | `/users/me/settings` | Update my settings |
| GET | `/users/me/profile` | My profile |
| PUT | `/users/me/profile` | Update my profile |

### Teams
| Method | Path | Purpose |
|---|---|---|
| GET | `/teams` | List |
| POST | `/teams` | Create |

### Sprints
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints` | List |
| POST | `/sprints` | Create |
| GET | `/sprints/:id` | Detail |
| PUT | `/sprints/:id` | Update |
| DELETE | `/sprints/:id` | Delete |
| POST | `/sprints/:id/activate` | Activate |
| GET | `/sprints/:id/summary` | Summary + metrics |

### Tasks (sprint-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/tasks/kanban` | Kanban view |
| GET | `/sprints/:sprintId/tasks/pipeline` | Pipeline view |
| GET | `/sprints/:sprintId/tasks/pipeline-counts` | Pipeline stage counts |
| GET | `/sprints/:sprintId/tasks/stats` | Statistics |
| GET | `/sprints/:sprintId/tasks` | List |
| POST | `/sprints/:sprintId/tasks` | Create |
| GET | `/tasks/:taskId` | Detail |
| PUT | `/tasks/:taskId` | Update |
| DELETE | `/tasks/:taskId` | Delete |
| PATCH | `/tasks/:taskId/status` | Update status |
| POST | `/tasks/:taskId/tags` | Add tag |
| DELETE | `/tasks/:taskId/tags/:tag` | Remove tag |
| POST | `/tasks/:taskId/attachments` | Add attachment |
| DELETE | `/tasks/:taskId/attachments/:id` | Remove attachment |
| GET | `/tasks/:taskId/transition-criteria` | Transition criteria |

### Requirements
| Method | Path | Purpose |
|---|---|---|
| GET | `/tasks/:taskId/requirements` | List |
| POST | `/tasks/:taskId/requirements` | Create |
| PUT | `/requirements/:id` | Update |
| DELETE | `/requirements/:id` | Delete |
| PATCH | `/requirements/:id/toggle` | Toggle completion |

### Blockers (sprint-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/blockers` | List |
| GET | `/sprints/:sprintId/blockers/analytics` | Analytics |
| POST | `/sprints/:sprintId/blockers` | Create |
| GET | `/blockers/:id` | Detail |
| PUT | `/blockers/:id` | Update |
| DELETE | `/blockers/:id` | Delete |
| POST | `/blockers/:id/resolve` | Resolve |
| POST | `/blockers/:id/escalate` | Escalate |
| POST | `/blockers/:id/tasks` | Link task |
| DELETE | `/blockers/:id/tasks/:taskId` | Unlink task |

### Time Logs
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/time-logs` | Sprint logs |
| GET | `/sprints/:sprintId/time-logs/summary` | Sprint summary |
| GET | `/tasks/:taskId/time-logs` | Task logs |
| POST | `/tasks/:taskId/time-logs` | Create |
| PUT | `/time-logs/:id` | Update |
| DELETE | `/time-logs/:id` | Delete |

### Alerts (sprint-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/alerts` | List |
| GET | `/sprints/:sprintId/alerts/count` | Count |
| POST | `/sprints/:sprintId/alerts` | Create |
| GET | `/alerts/:id` | Detail |
| PUT | `/alerts/:id` | Update |
| DELETE | `/alerts/:id` | Delete |
| POST | `/alerts/:id/acknowledge` | Acknowledge |
| POST | `/alerts/:id/done` | Mark done |

### Red Flags (sprint-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/red-flags` | List |
| GET | `/sprints/:sprintId/red-flags/count` | Count |
| POST | `/sprints/:sprintId/red-flags` | Create |
| GET | `/red-flags/:id` | Detail |
| PUT | `/red-flags/:id` | Update |
| DELETE | `/red-flags/:id` | Delete |

### Decisions (sprint-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/decisions` | List |
| POST | `/sprints/:sprintId/decisions` | Create |
| GET | `/decisions/:id` | Detail |
| PUT | `/decisions/:id` | Update |
| DELETE | `/decisions/:id` | Delete |

### Comments (sprint-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/comments` | List |
| GET | `/sprints/:sprintId/comments/analytics` | Analytics |
| POST | `/sprints/:sprintId/comments` | Create (sprint log) |
| GET | `/tasks/:taskId/comments` | List task comments |
| POST | `/tasks/:taskId/comments` | Create task comment |
| GET | `/comments/:id` | Detail |
| PUT | `/comments/:id` | Update |
| DELETE | `/comments/:id` | Delete |
| POST | `/comments/:id/respond` | Respond |

### Dashboard (sprint-scoped)
| Method | Path | Purpose |
|---|---|---|
| GET | `/sprints/:sprintId/dashboard` | Full dashboard |
| GET | `/sprints/:sprintId/dashboard/health-score` | Health score |
| GET | `/sprints/:sprintId/dashboard/metrics` | Metrics (17 KPIs) |

## Error handling

Every API call goes through `runAction` in `src/lib/handle-action.ts`. Hooks never `try/catch` directly — they use `useMutationAction` or `useQueryAction` from `src/hooks/shared/`, which delegate to `runAction`. Components never handle errors at all; they consume `{ data, isLoading, fieldErrors }` and render.

### Priority rules (apply everywhere)

1. **Backend message has first priority.** Strings in `src/constants/<domain>/errors` are fallbacks — a user only sees them when the backend sent no `data.message`. Never write a toast or inline string in a component or hook that overrides the backend.
2. **Never handle errors in a component.** Always in a hook via `runAction`. Components only consume `{ data, isLoading, error?, submit, fieldErrors }`.
3. **Toasts are for events, inline errors are for forms.** Never both for the same error. 422 errors route to `useFormErrors` via the hook's `onFieldErrors` option and never toast.
4. **Never swallow an error silently** unless it's a background side-effect (heartbeat, presence, analytics, secondary widgets). Use `silent: true` explicitly — makes intent auditable.
5. **Never `console.error` in app code** — `runAction` handles dev-only logging via its `context` option.
6. **Fallback constants per domain.** Every hook pulls its fallback message from `constants/<domain>/index.ts` — but the backend message wins whenever present (rule #1).
7. **401 is global.** No hook handles it; the axios interceptor dispatches `AUTH_UNAUTHORIZED_EVENT` and clears the cookie. Don't toast unauthorized.
8. **Optimistic updates must revert on error.** For `toggle`, drag-drop, etc. — snapshot before, restore in the caller when `runAction` returns `null`.
9. **Don't re-throw unless the caller needs to branch** (login navigate, etc.). Default is catch-and-toast via `runAction`; use `rethrow: true` only when the view needs the exception (e.g. to skip `navigate(dashboard)` on failed login).
10. **One place maps HTTP status → UX.** If you need to change "what 403 looks like", you change it in `runAction` — nowhere else.
11. **Form closes iff the handler returns truthy.** Never `closeDialog()` unconditionally after `await submit()`. On 422 the dialog stays open with inline errors; on other errors it stays open with a toast.

### Files you will touch

| File | Purpose |
|---|---|
| `src/lib/error.ts` | `ApiError` class with `statusCode`, `message`, `data`, `fieldErrors`, `code` |
| `src/lib/axios.ts` | Response interceptor — only stores backend `data.message`; extracts `data.errors` into `fieldErrors` on 422 |
| `src/lib/handle-action.ts` | `runAction(fn, options)` — status routing, network detection, dev-mode logging |
| `src/hooks/shared/use-mutation-action.ts` | Thin wrapper over `runAction` owning `isLoading`; returns a stable `mutate` reference |
| `src/hooks/shared/use-query-action.ts` | Same idea for on-mount queries; exposes `data`, `isLoading`, `refetch`, `setData` |
| `src/hooks/shared/use-form-errors.ts` | `{ fieldErrors, setFieldErrors, clearError, clear, getError }` for inline 422 display |
| `src/constants/<domain>/index.ts` | Per-domain `errors` and `messages` bags (fallback copy only) |

### Writing a new hook

```ts
export const useCreateThing = ({ onFieldErrors }: { onFieldErrors?: (e: FieldErrors) => void } = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (payload: CreateThingPayloadInterface): Promise<ThingInterface> => {
            const res = await thingsService.createHandler(payload);
            return res.data;
        },
        {
            successMessage: thingsConstants.messages.createSuccess,
            errorFallback: thingsConstants.errors.createFailed,
            onFieldErrors,
            context: "things.create",
        },
    );
    return { createHandler: mutate, isLoading };
};
```

### Wiring a form

```tsx
const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
const { createHandler } = useCreateThing({ onFieldErrors: setFieldErrors });

const handleSubmit = async () => {
    const res = await createHandler(payload);
    if (res) { /* success: close dialog + refetch */ }
    // non-truthy: dialog stays open, 422 errors are already inline, other errors already toasted
};

// Per input:
<Input value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} />
{getError("name") && <p className="text-xs text-error">{getError("name")}</p>}
```

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production — stable, deployed |
| `test` | Integration testing branch — dev bypass login enabled |
| `test2` | Secondary testing branch |
| `feat/integrate-*` | Per-feature API integration branches (auth, sprints, tasks, blockers, alerts, red-flags, decisions, comments, dashboard, requirements, teams, users) |
| `feat/integration-core` | Core integration work merged across features |

**Current branch:** `bug/error-handling`

**Recent work:** Centralized error handling across all 13 domains (68 hooks). Introduced `runAction` primitive in `src/lib/handle-action.ts` plus `useMutationAction` / `useQueryAction` wrappers and `useFormErrors` for inline 422 display. Every domain (auth, users, teams, sprints, tasks, requirements, time-logs, blockers, alerts, red-flags, decisions, comments, dashboard) now routes through `runAction` — no more `try/catch + toast` in hooks, no `console.error`, no `navigator.onLine` checks scattered in views. Backend `data.message` is first priority everywhere; per-domain `errors`/`messages` constants are fallback-only. 422 `fieldErrors` surface inline via `useFormErrors`, never as a toast. 401 is handled globally in the axios interceptor (`AUTH_UNAUTHORIZED_EVENT`). Also fixed two infinite refetch loops by making hook return values reference-stable via `useRef`, refactored `TransitionDialog` so it owns the criteria fetch (and shows a reason textarea when moving backward), rebuilt the compound task type in `add-task-dialog.tsx` (dual checkboxes + inline task / users autocomplete), and kept sprint activate on PATCH with interceptor-injected empty body. See `ERROR_HANDLING_PLAN.md` for the full task list.
