# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Next.js 15 App Router application with a server-first pattern:

- **Server components** fetch data directly via functions in `src/app/api/getters.ts`
- **Client components** (marked `'use client'`) use React Query hooks from `src/app/api/query.ts`
- **Mutations** call `post()`, `patch()`, `del()` from `src/app/api/fetch.ts` directly (these are Server Actions)
- After mutations, cache is invalidated via `customRevalidateTag()` / `customRevalidateAllTags()`

## API Layer

- `src/app/api/fetch.ts` — core fetch wrapper (Server Actions with `"use server"`). All HTTP calls go through `get()`, `post()`, `patch()`, `del()`.
- `src/app/api/getters.ts` — server-side data fetching functions used in page components.
- `src/app/api/query.ts` — React Query hooks for client components, wrapping `get()` with query keys.
- `src/types/backend.ts` — **auto-generated** from the backend's OpenAPI spec. Do not edit manually; regenerate when the API changes using `openapi-typescript`.

## State Management

No global state library. State is managed via:
- **React Query** for all server state (caching, revalidation)
- **Next.js cache tags** for invalidation (`'backup'`, `'card'`, `'cash'`, `'organisation'`, `'tag'`, `'transaction'`, `'personal_account'`, `'stock_account'`, `'capital_investment'`)
- **Local `useState`** for UI state (modals, sidebar, etc.)

## Key Patterns
- Style using **Tailwind**, where possible all grouped in one `classes` object on top of component.
- Forms use **Formik** for state and **Zod** for schema validation
- Tables use **@tanstack/react-table**
- Path alias `@/*` maps to `src/*`
- `src/types/patch.ts` contains utility types that patch/extend the auto-generated backend types
