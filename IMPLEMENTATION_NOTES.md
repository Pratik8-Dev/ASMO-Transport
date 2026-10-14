# Implementation Notes

## 1. Requirement summary

Responsive React dashboard with five KPI cards, shared exact-match filters, three Recharts bar charts, paginated/sortable shipment grid, DQ summary, scope panel, client-side current-page Excel export, per-section loading/error/empty states, and TanStack Query caching/refetching.

## 2. API inventory

- `GET /actuator/health`: readiness, not invoked by the dashboard API client because it is outside `/api/v1`.
- `GET /api/v1/dashboard/summary`: five KPI areas.
- `GET /api/v1/lanes/performance`: lane performance chart.
- `GET /api/v1/sites/performance`: collection and delivery charts, separated by `role`.
- `GET /api/v1/data-quality/summary`: DQ-01 through DQ-04 counts.
- `GET /api/v1/shipments`: paginated shipment grid with `page`, `size`, and `sort`.
- `GET /api/v1/shipments/{jobId}`: documented detail operation, API function included for a future drawer.
- `POST /api/v1/admin/etl/upload`: intentionally omitted from operator navigation.
- `GET /api/v1/admin/etl/status`: last completed load timestamp.

Common documented query parameters are `from`, `to`, `collectionSite`, `deliverySite`, `lane`, `carrier`, `priority`, `distanceBand`, and `slaMet`. Empty values are omitted.

## 3. Dashboard mapping

- Summary API: KPI cards and SLA version.
- Sites API: collection/delivery site charts using `site`, `role`, `jobs`, `otdPercentage`.
- Lanes API: lane chart using `lane`, `jobs`, `otdPercentage`.
- DQ API: documented count keys and labels.
- Shipments API: grid fields exactly mapped from ShipmentDto.
- ETL status API: Data-as-of display uses `lastCompletedAt`.

## 4. Gaps, conflicts, and explicit assumptions

1. The API guide has no filter-options endpoint. Text inputs preserve the documented exact-match behavior instead of inventing option values.
2. `shipmentStatus` is requested by the screen specification but is not a documented query parameter or ShipmentDto field. The UI does not send it and visibly explains the gap.
3. There is no export endpoint. The POC scope requires export, so the implementation exports the currently loaded shipment page on the client. It does not claim to export every server row.
4. Authentication is explicitly not implemented in the POC, so no token handling is added.
5. KPI calculations remain server-owned because the summary API provides the KPI values. The UI only formats values.
6. The API does not provide chart numerators. Tooltips show the documented job count as denominator and omit numerator.
7. The POC scope excludes broader priority-distance rows and VTD logic, while the KPI document contains broader SLA tables. The React application displays API results and does not reimplement either rule set.
8. Timestamps follow the API contract. Browser locale formatting is used, without changing business timezone semantics.

## 5. Component architecture

`DashboardPage` owns UI filter/pagination/sort state. TanStack Query hooks own server state. API modules own HTTP concerns. Adapters map DTOs into view models. Render components do not access Axios or raw DTO structures.

## 6. Folder structure

See `src/api`, `components`, `hooks`, `pages`, `services`, `utils`, `constants`, `styles`, and `tests`.

## 7. Dependencies

Run `npm install`. Runtime packages: React, TanStack Query, Axios, Recharts, Lucide React, and SheetJS. Development packages: Vite, Vitest, React Testing Library, ESLint, and Prettier.

## 8. Environment template

Copy `.env.example` to `.env`. It contains local placeholders only and no credentials.

## 9-15. Implementation and tests

Complete API layer, adapters, hooks, components, page, styles, and tests are included under `src`. Tests cover adapters, null/malformed fields, formatting, filter behavior, KPI card states, query construction, and shipment table status rendering.

## 16. Run and build

```bash
cp .env.example .env
npm install
npm run dev
npm run test
npm run lint
npm run build
```

## 17a. Mock API mode

`VITE_USE_MOCK_API` (default `true` in `.env`/`.env.example`) is read once, centrally, inside [controlTowerApi.js](/c:/Users/10747371/asmo-control-tower-react/src/api/controlTowerApi.js) via `isMockApiEnabled()`. Every method on `controlTowerApi` branches there between the real Axios call and the matching [mockApi](/c:/Users/10747371/asmo-control-tower-react/src/mocks/mockApi.js) method; no other module, hook, or component is aware mock mode exists.

- [src/mocks/mockData.js](/c:/Users/10747371/asmo-control-tower-react/src/mocks/mockData.js): 36 fictional, deterministic shipments spanning 3 collection sites, 4 delivery sites, 4 carriers, 3 priorities (plus an absent-priority stand-in case), 3 distance bands, DQ-01 through DQ-04 flags, null `slaMet`/`inWindow`, missing optional timestamps, and future-dated/reverse-sequence anomalies.
- [src/mocks/mockEngine.js](/c:/Users/10747371/asmo-control-tower-react/src/mocks/mockEngine.js): pure functions that apply the documented exact-match/date-range/boolean filters, sort, paginate (zero-based), and derive the summary/lane/site/data-quality shapes from the filtered shipment subset, honoring the documented DQ exclusions (validated OTD excludes DQ-01; transit excludes DQ-01/02/03; collection timeliness excludes DQ-01). Dwell hours have no dedicated timestamp in the documented `ShipmentDto`, so they are approximated from `legKm` and explicitly commented as a mock simplification.
- [src/mocks/mockApi.js](/c:/Users/10747371/asmo-control-tower-react/src/mocks/mockApi.js): adds simulated latency (300-700ms, or 2.2-3.2s for `slow`), the documented error envelope, 404 shipment lookups, and the in-memory ETL status/upload workflow. `VITE_MOCK_SCENARIO` (`normal`, `empty`, `slow`, `error`, `partialError`) is read the same way as the mock switch.
- [MockModeBanner.jsx](/c:/Users/10747371/asmo-control-tower-react/src/components/common/MockModeBanner.jsx): dev-only banner (`import.meta.env.DEV`) shown in [DashboardPage.jsx](/c:/Users/10747371/asmo-control-tower-react/src/pages/DashboardPage.jsx) whenever mock mode is active; renders nothing in production builds.
- Switching to the real backend is limited to setting `VITE_USE_MOCK_API=false`; no component, adapter, or type contract changes.

## 17b. Mock API tests

[mockApi.test.js](/c:/Users/10747371/asmo-control-tower-react/src/tests/mockApi.test.js) covers: the mock switch itself, filtered-shipment/lane-aggregate reconciliation, filter exclusion, zero-based pagination and sorting, shipment lookup plus 404, the `empty` scenario, the `error` scenario, `partialError` isolating sites/data-quality while other sections still resolve, a successful ETL upload that updates subsequent status reads, and a rejected non-`.xlsx` upload.

## 17c. Known mock-mode assumptions

- Dwell-time figures are a distance-based approximation (no dedicated site-arrival timestamp is documented on `ShipmentDto`); this is a mock-only simplification, clearly commented in code, and not a live calculation.
- `standInApplied` reflects the documented stand-in rules (ASN date = job created on; priority defaults to "Normal") and is not derived per-filter.
- The ETL upload mock function and `/admin/etl/upload` endpoint constant are provided in the API layer for completeness; there is no admin upload screen in this POC's UI, matching the existing scope boundary already documented for `getShipment`.

## 18. Final validation checklist

- Only documented endpoints and parameters are used.
- All five KPIs are present.
- Shared filters feed summary, lane, site, DQ and shipment queries.
- Recharts charts are responsive and use 0-100 percent axes.
- Dynamic KPI values are API-driven.
- API calls stay outside presentation components.
- Loading, error, empty, disabled, keyboard-focus, and mobile states are included.
- No credentials, live shipment fixtures, or production URLs are included.
- Known gaps remain explicit rather than fabricated.
