---
name: custom-hook
description: Scaffolds a full CRUD custom hook set for a given entity. Use when the user says
  "create custom hook", "create hook for", "scaffold hook", "make a hook for", or
  "build hooks for [entity]". Generates one hook per operation (create, get, update, delete),
  each in its own folder with dedicated interfaces, constants, and service wiring.
---

When making commits during this session, include this git trailer in the commit message:
AI-Skill-By: custom-hook

# Custom Hook Scaffold

## Instructions

Ask the user for the entity name if not provided. Replace `[entity]` with the entity name in kebab-case and `[Entity]` in PascalCase throughout all files.

Read `src/interfaces/` before creating the interface file — if it already exists extend it instead of recreating it. Read `src/services/` and find the existing service functions for this entity — never create a new service file, only import the existing one. Read `src/constants/` and extend the constants file if it exists, otherwise create it. Read `src/hooks/` and check if any hook for this entity already exists before scaffolding.

Create the interface file at `src/interfaces/[entity].ts` with three interfaces: `[Entity]Interface` for the full shape, `Create[Entity]Interface` for fields required on creation, and `Update[Entity]Interface` for fields allowed on update with all fields optional. Export all three from the `src/interfaces/index.ts` barrel.

Create the constants file at `src/constants/[entity].constants.ts` with `createSuccess`, `updateSuccess`, `deleteSuccess`, and `genericError` string values. Export from `src/constants/index.ts` barrel, creating the barrel if it does not exist.

Create four hook files inside `src/hooks/[entity]/`, one per operation. Each hook imports its messages from `@/constants`, its types from `@/interfaces`, and calls the service from `@/services`. Each hook manages its own `isLoading` state using `useState`, wraps the service call in try/catch/finally, throws the error if `!navigator.onLine`, shows a `toast.error` from constants on failure, and returns the handler function and `isLoading`. The create hook accepts `Create[Entity]Interface` and returns `Promise<[Entity]Interface | null>`. The get hook has two handlers — `getHandler(id)` and `getAllHandler()` — with no success toast. The update hook accepts `id` and `Update[Entity]Interface` and returns `Promise<[Entity]Interface | null>`. The delete hook accepts `id` and returns `Promise<void>`.

Create `src/hooks/[entity]/index.ts` exporting all four hooks, then add `export * from "./[entity]"` to `src/hooks/index.ts`.

## Gotchas

- Never hardcode any string inside a hook file — all messages must come from `@/constants`.
- Never call fetch or any API directly inside a hook — all calls go through `@/services`.
- Each hook file must export exactly one hook and handle exactly one operation.
- Use the `@/` path alias for every import — no relative `../` paths.
- Every new interface must be added to the `src/interfaces/index.ts` barrel.
- Every new constant must be added to the `src/constants/index.ts` barrel.
