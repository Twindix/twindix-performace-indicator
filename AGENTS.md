# AGENTS.md — Twindix Performance Indicator

## Dev environment tips

- Run `npm run dev` to start the Vite dev server on localhost.
- Run `npm run build` to compile TypeScript and produce a production bundle via Vite.
- Run `npm run preview` to locally preview the production build before deploying.
- Use the path alias `@/` instead of relative paths — it maps to `src/`. Example: `import { Button } from "@/atoms"`.
- Every folder under `src/` has a barrel `index.ts`; always import from the barrel, not the individual file.
- All demo data is seeded into `localStorage` on first load from `src/data/seed/`. Re-seeding happens if storage keys are missing.
- Demo login credentials: `admin@twindix.com` / `demo`.

## Folder structure

```
src/
├── atoms/
├── components/
│   └── shared/
├── contexts/
├── data/
│   └── seed/
├── enums/
├── hooks/
│   └── shared/
├── interfaces/
├── layouts/
├── lib/
├── providers/
├── routes/
├── schemas/
├── services/
├── store/
├── ui/
├── utils/
└── views/
    ├── dashboard/
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
    ├── alerts/
    ├── red-flags/
    ├── comments-log/
    ├── profile/
    ├── settings/
    └── auth/
```

## Folder purposes

- **atoms/** — Smallest reusable UI pieces (Button, Badge, Input, Card, Textarea). No business logic, no API calls.
- **components/shared/** — Layout and utility components used across all pages (Sidebar, Topbar, Header, MetricCard, EmptyState). Composed from atoms.
- **contexts/** — Raw React context definitions only. No providers or initialization logic here.
- **data/** — Static app-wide constants: route paths, API URLs, sidebar structure, and seed demo data.
- **data/seed/** — Demo data for all domain entities (tasks, sprints, blockers, members, etc.) loaded into localStorage on first run. Also holds task phase transition rules.
- **enums/** — TypeScript enums for every categorical value used across the app (TaskPhase, TaskPriority, BlockerStatus, etc.).
- **hooks/shared/** — Custom React hooks that encapsulate reusable logic (useAuth, useTheme, useLocalStorage, usePageLoader, etc.).
- **interfaces/** — TypeScript interfaces for all data model shapes. One file per domain entity plus dialog-specific types.
- **layouts/** — Page shell components that define the visual frame around route content (AuthLayout, DashboardLayout with sidebar and topbar).
- **lib/** — Low-level platform utilities not tied to React (cookie helpers, error utilities, env variable accessor).
- **providers/** — React Provider components that wrap contexts and run any initialization side-effects on mount.
- **routes/** — React Router v7 configuration, route guards (ProtectedRoute, PublicRoute), and the error boundary page.
- **schemas/** — Yup validation schemas, one per form. Keeps validation logic out of components.
- **services/** — Reserved for future backend API client functions. Keep empty until a real API is connected.
- **store/** — Zustand stores for lightweight global UI state (active sprint, sidebar open state, alerts, red flags).
- **ui/** — Thin wrappers around Radix UI primitives following the shadcn/ui pattern (Dialog, Select, Tabs, Tooltip, etc.). Never import Radix directly outside this folder.
- **utils/** — Pure helper functions and constants (cn, formatDate, localStorage key map, data transform helpers).
- **views/** — One subfolder per feature page. Each contains the page component and any dialogs or sub-components that belong only to that page.

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
| Folders | `kebab-case` | `components/shared/`, `views/comments-log/`, `data/seed/` |
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
