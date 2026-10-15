# ASMO TMS Control Tower

React/Vite POC dashboard implemented against the documented Spring Boot API contract.

## Run

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. By default `VITE_USE_MOCK_API=true`, so `npm run dev` runs immediately against realistic in-memory mock data — no backend required. A yellow "Mock data" banner appears in dev builds whenever mock mode is active.
4. To use the real backend instead, set `VITE_USE_MOCK_API=false` in `.env` and start the documented backend at `http://localhost:8080`.
5. Run `npm run dev`.

## Mock mode

- Controlled by `VITE_USE_MOCK_API` (`true`/`false`) in `.env`. The switch lives in [controlTowerApi.js](/c:/Users/10747371/asmo-control-tower-react/src/api/controlTowerApi.js) only — components always call the same API methods regardless of mode.
- Mock data, filtering, derivation and pagination live under [src/mocks/](/c:/Users/10747371/asmo-control-tower-react/src/mocks). The dataset is fictional and contains no personal, confidential or production information.
- `VITE_MOCK_SCENARIO` selects a development-only behavior: `normal` (default), `empty` (no qualifying data), `slow` (2.2-3.2s latency), `error` (every call fails with the documented error envelope), or `partialError` (the sites and data-quality endpoints fail while the rest of the dashboard still renders).
- Mock responses follow the same shapes, pagination envelope, zero-based paging, sorting and exact-match filter rules as the real API, so switching `VITE_USE_MOCK_API` to `false` requires no UI changes.

## Validation

- `npm run test`
- `npm run lint`
- `npm run build`

## Chart presentation

The lane chart uses vertical X-axis labels at the existing font size, with extra
chart height to preserve the plot area. Labels longer than the 140px label budget
are ellipsized; hovering a lane label shows its full name in a native tooltip.
The existing bar tooltip and screen-reader summary retain the full lane names
and values. Collection-site and delivery-site chart labels are unchanged.

## Contract notes

Authentication is not implemented in the documented POC. The shipment-status filter and filter-option metadata endpoints are not documented, so this UI exposes the documented `slaMet` filter and text-based exact-match filters only. Export is client-side and includes the currently loaded shipment page.
