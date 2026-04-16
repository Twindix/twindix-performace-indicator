---
name: services
description: Scaffolds a new API resource end-to-end as full CRUD — URL registration, module constants, response types, service handlers, optional shared context, barrel exports, and typed consumption with error handling. Use when the user says
  "add endpoint", "create service for", "wire up endpoint", "add API for", or
  "scaffold service for [resource]".
---

When making commits during this session, include this git trailer in the commit message:
AI-Skill-By: services

# API Endpoint Cycle

## Instructions

Ask the user for the resource name if not provided (e.g. `tasks`). Replace `<resource>` with the resource name in kebab-case and the service/type identifiers in camelCase and PascalCase throughout all files.

By default, scaffold the full CRUD set for every new resource: `listHandler`, `detailHandler`, `createHandler`, `updateHandler`, `deleteHandler`. Only skip an operation if the user explicitly says the resource does not need it.

Every module lives in its own folder, not a flat file. The folder name matches the resource in kebab-case and is the same across `src/services/<resource>/`, `src/interfaces/<resource>/`, `src/constants/<resource>/`, and (if created) `src/contexts/<resource>/`. Each folder's entry is `index.ts` (or `index.tsx` for contexts).

Read `src/data/apis.ts` before adding URLs — if the resource key already exists under `apisData`, extend it with the new endpoint keys instead of redefining it. Read `src/interfaces/<resource>/index.ts`, `src/services/<resource>/index.ts`, and `src/constants/<resource>/index.ts` and extend them if they already exist instead of recreating them.

Add all CRUD URLs in `src/data/apis.ts` under a single resource key. Use functions for parameterized paths (e.g. `detail: (id: string) => \`/tasks/${id}\``).

Add every module-level hardcoded or static string (labels, default messages, copy, enum-like strings, fallback values) in `src/constants/<resource>/index.ts`. Never inline static text inside services, contexts, hooks, or components — import it from `@/constants/<resource>` instead. Re-export from `src/constants/index.ts`.

Add response and payload types in `src/interfaces/<resource>/index.ts`. Name each interface after the resource and operation, suffixed with `ResponseInterface` or `PayloadInterface`. Re-export from `src/interfaces/index.ts`.

Create the service in `src/services/<resource>/index.ts` — import `apiClient` from `@/lib/axios`, import `apisData` from `@/data`, import types from `@/interfaces`, and import any static strings from `@/constants/<resource>`. All handlers for one resource live on a single exported service object (e.g. `tasksService`). Re-export from `src/services/index.ts`.

If the resource's data needs to be shared across multiple components, create a context in `src/contexts/<resource>/index.tsx` — define a typed `Context`, a `Provider` that calls the service handlers and holds state, and a `use<Resource>` hook for consumers. Add the matching `<Resource>ContextInterface` to `src/interfaces/<resource>/index.ts` and re-export the provider and hook from `src/contexts/index.ts`. Only create a context when there is real cross-component sharing; do not create one for a resource consumed in a single component.

Consume the service in a hook or component: `import { tasksService } from "@/services"`, call it inside try/catch, and pass the caught error through `handleApiError` from `@/lib/error` to get a typed `ApiError` with `statusCode` and `message`. If a context was created, wrap the app section with `<TasksProvider>` and call `useTasks()` from any child.

After scaffolding is complete, run `npx tsc --noEmit` to verify the whole cycle compiles with no type errors. This is the sanity check — it catches missing barrel exports, wrong import paths, mistyped handlers, and mismatched interfaces without needing unit tests. If it exits non-zero, fix the reported errors before handing the work back to the user.

## Gotchas

- Scaffold full CRUD by default — only omit a handler when the user explicitly says the resource does not need it.
- Every module is a folder, not a flat file. `src/services/tasks/index.ts`, not `src/services/tasks.ts`. Same for interfaces, constants, and contexts.
- Folder names must match across `services/`, `interfaces/`, `constants/`, and `contexts/` for the same resource.
- Never hardcode a URL string inside a service or component — all paths must come from `apisData` in `@/data`.
- Never inline hardcoded or static text inside services, contexts, hooks, or components — all static strings must live in `src/constants/<resource>/index.ts` and be imported from `@/constants/<resource>`.
- Never import `axios` directly in a service — always use `apiClient` from `@/lib/axios`.
- Never swallow errors silently — every service call in a consumer or context handler must be wrapped in try/catch and routed through `handleApiError` from `@/lib/error`.
- Use the `@/` path alias for every import — no relative `../` paths.
- Every new interface must be re-exported from `src/interfaces/index.ts`.
- Every new service must be re-exported from `src/services/index.ts`.
- Every new constants module must be re-exported from `src/constants/index.ts`.
- Every new context must be re-exported from `src/contexts/index.ts`.
- One service object per resource — group all its handlers together; do not split handlers across multiple files.
- Only create a context when the resource is shared across multiple components; for single-component usage, call the service directly.
- Always finish the cycle by running `npx tsc --noEmit` — a zero exit code is the minimum proof that the cycle is wired correctly end-to-end.
