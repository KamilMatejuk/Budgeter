# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Budgeter is a personal-finance app: a FastAPI + MongoDB backend (`backend/`), a Next.js 15 frontend (`frontend/`), and a Mongo instance, all orchestrated by Docker Compose. The domain is Polish — tag names, account types, organisation titles and many UI strings are Polish (e.g. `Osobiste`/`Walutowe`/`Lunchowe`/`Oszczędnościowe` account types, the `Wyjazdy` tag that is sorted last by convention). Do not translate these strings.

## Commands

Everything runs through the Makefile, which wraps `docker compose` with two project names (`budgeter-dev`, `budgeter-prod`). **You must rebuild/regenerate inside the containers** — there is no host-level toolchain assumed.

- `make run` — start the dev stack (frontend :48521, backend :48522, mongo), tail `backend`+`frontend` logs. Run this before `make types` — the type generator hits `http://backend:8000/openapi.json` over the docker network.
- `make stop` — stop and remove dev+prod containers.
- `make build` — build dev and prod images, then `npm install` in the frontend container.
- `make prod` — production deploy (binds `/var/lib/budgeter/mongo`, needs `sudo`).
- `make logs` — tail prod logs.
- `make backup` — POST to the backup endpoint to create an auto `.bson` snapshot.

Checking code (run from the repo root; operates in the frontend container):
- `make check` — runs `tsc --noEmit` then `knip` (unused exports/deps). This is the project's only typecheck/lint gate — there is **no test framework** and no separate backend lint.
- Inside `frontend/`: `npm run typecheck`, `npm run usecheck` (knip), `npm run dev` (turbopack), `npm run build`.

### Regenerating frontend API types (critical workflow)

`frontend/src/types/backend.ts` is **auto-generated** from the backend's OpenAPI spec. Never hand-edit it. When you change a backend Pydantic model or route:

1. `make run` (backend must be up and serving `/openapi.json`).
2. `make types` — runs `openapi-typescript http://backend:8000/openapi.json` inside the frontend container and overwrites `src/types/backend.ts`.
3. If you added a new backend `enum`, also mirror it by hand in `frontend/src/types/enum.ts` (which also holds display helpers like `CURRENCY_SYMBOLS`). `enum.ts` is hand-maintained on purpose.

`src/types/backend.ts` and `src/types/patch.ts` are excluded from knip in `frontend/knip.json`.

## Backend architecture (FastAPI, Python 3.13, async Motor/MongoDB)

`backend/main.py` is the only entrypoint (`uvicorn main:app`). It mounts routers under `/api/...`. `core/db.py` connects on startup; default DB name is `expense_tracker` (env `MONGO_DB_NAME`). **Mongo `_id` is stored as a string** throughout — `routes/base.py` does `data.id = str(data.id)` on create and all queries compare against string ids. `PyObjectId` only validates/serializes.

### Model triple pattern (`models/`, `models/base.py`)

Every resource is a base Pydantic model plus three derived classes via metaclasses in `models/base.py`:
- `Foo` — the create/update shape (`extra: "forbid"`, `_id` alias).
- `FooPartial(Foo, metaclass=Partial)` — all fields `Optional`, for PATCH bodies.
- `FooWithId(Foo, metaclass=WithId)` — adds required `id`, for responses.
- `FooRichWithId(...)` (per model, in `models/products.py`/`models/transaction.py`) — *enriched* variant with nested objects joined and a computed `value_pln` (FX-converted to PLN).

When adding a resource, follow this triple — don't roll your own `_id` handling.

### Generic CRUD (`routes/base.py`)

`get`/`create`/`patch`/`delete` helpers operate on a Mongo collection + model class. `CRUDRouterFactory` generates GET / GET-by-id / POST / PATCH / DELETE endpoints from the model triple and sets OpenAPI-accurate return annotations. Routes are registered selectively via `factory.create_post()` etc. (not all resources expose all verbs). All helpers are wrapped in `fail_wrapper`, which **catches every exception** and returns `{"error": str(e)}` instead of raising — so the frontend always receives `{response, error}` and the backend logs the traceback.

### Routes (`routes/`)

- `transaction.py` exposes **two routers**: `/api/transaction` (singular, single-item ops: CRUD + `/split`, `/repay`, `/restore/{id}`, `/last/{account}`) and `/api/transactions` (plural, list ops: `/{year}/{month}`, `/filtered`, `/deleted`, `/transfer`, `/new`, `/debt`). `enrich_transactions` joins organisation (regex match), account, rich tags, and `value_pln`.
- `products.py` builds CRUD sub-routers (`/cash`, `/personal_account`, `/card`, `/stock_account`, `/capital_investment`) under `/api/products`. Most `GET` endpoints manually enrich with `value_pln`.
- `sources/` — bank-specific CSV import parsers (`millenium.py`, `revolut.py`), each with a request model + `create_<source>_transaction`. Imports are deduplicated by a SHA-256 hash of the payload stored in the `source_parsed` collection.
- `backup.py` — BSON dumps of every collection to `backend/backups/`. Filenames encode kind+name: `auto_<...>.bson` (created automatically before destructive ops: import, repay, split — see the existing files) vs `manual_<name>.bson`. `restore/{name}` **wipes all collections** then re-inserts.

### Money & history invariants

- `core/utils.py::Value` does all arithmetic at 2 decimal places (scaled by 100 to dodge float error). Use `Value.add/sum/...`, not raw `+`.
- Transaction `value` is **immutable after create** — `patch_transaction` asserts `data.value is None`. Splits must sum exactly to the original value. Repay reconciles a debt (`value<0`) against a repayment (`value>0`); `diff==0` deletes both, otherwise the larger-value side is updated and the other soft-deleted.
- Deletes are **soft** (`deleted=True`). Transaction/account value changes (create, patch personal account, transaction create/delete/restore) call `mark_account_value_in_history` in `routes/sources/utils.py` to maintain `account_daily_history`; `remove_leading_zero_history` trims leading zero-balance days. Card monthly counters live in `card_monthly_history`.
- FX: amounts are stored in their original `Currency` (PLN/USD/EUR); `Forex` converts for aggregation, caching NBP rates to `exchange_rates.json` (refreshed if >7 days old, else falls back to hard-coded constants).
- `routes/utils.py` has the tag-tree helpers (parent/children, rich names formatted as `"Parent/Child"`) and `create_tags_condition` (Mongo condition builder for `tagsIn`/`tagsOut` with `AND`/`OR` joins — `Join` enum). Travels children recursively.

## Frontend architecture (Next.js 15 App Router, React 19, server-first, strict TS)

Path alias `@/*` → `src/*`.

### API / data layer (`src/app/api/`)

- `fetch.ts` — `"use server"` Server Actions `get`/`post`/`patch`/`del` wrapping `fetch` to `${NEXT_PUBLIC_API_URL}`. They **never throw** — every call returns `{ response, error }`. Also exports `customRevalidateTag` / `customRevalidateAllTags` (Next cache-tag invalidation).
- `getters.ts` — server-component data fetchers, each tagged with a Next cache tag (`["transaction"]`, `["tag"]`, `["personal_account"]`, etc.). These tags are the invalidation contract.
- `query.ts` — React Query hooks for client components (`useCashs`, `usePersonalAccounts`, `useRichTags`, `useUsedTags`, `useOrganisations`, `useLastTransaction`, `usePeopleWithDebt`, `useAccountValueHistory`, ...) wrapping `get()`.

Data flow: **server components** call `getters.ts`; **client components** use hooks from `query.ts`; **mutations** call the Server Actions in `fetch.ts` then call `customRevalidateTag(<tag>)` to bust the Next cache. The set of cache tags is: `backup, card, cash, organisation, tag, transaction, personal_account, stock_account, capital_investment` (see `customRevalidateAllTags`). After a backend model/route change, regenerate `backend.ts` (above) so these typed callers stay in sync.

### State

No global store. React Query for server state, Next cache tags for invalidation, local `useState` for UI (modals, sidebar). `ReactQueryProvider` wraps the app in `layout.tsx`; the sidebar is rendered alongside `{children}`.

### Components (`src/components/`)

- `form/` — Formik + Zod (`formik-validator-zod`) inputs, one `*InputWithError` per field type; composite selectors in `form/fields/`.
- `table/` — `@tanstack/react-table`. `Table.tsx` is the generic wrapper; `tables/TableX.tsx` per entity; `cells/CellX.tsx` are cell renderers.
- `modal/` — `Modal.tsx` base, then `custom/` (flows like SplitTransaction, Repay, Debt), `delete/` (soft-delete + restore), `update/` (`Update*Modal`).
- `dashboard/` — charts via `chart.js` / `react-chartjs-2` (history, income/expense, month comparison, requirements, debt).
- `sidebar/`, `button/`, `toast/`, `page_layout/` (PageHeader/SectionHeader/Summary/MultiColumnSection).

### Conventions

- Style with **Tailwind**; group all classNames into a single `classes` object at the top of a component (this is the established pattern — match it).
- Forms: **Formik** for state, **Zod** for validation.
- New backend enums → mirror in `src/types/enum.ts`, not just `backend.ts`.
