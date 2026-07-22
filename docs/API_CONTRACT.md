# API Contract — Property Website MVP

**Status:** Draft v1
**Scope authority:** Bound by `ROADMAP.md`, `CLAUDE.md`, `PRD.md`, `NFR.md`. Endpoints outside this contract should not be added without updating this doc first (see NFR §7).

Conventions:
- JSON request/response bodies unless noted.
- Errors: `{ "error": { "code": string, "message": string } }` with an appropriate HTTP status.
- Auth: session cookie (via the auth library chosen in Phase 1), not a bearer-token scheme, unless that changes during implementation.
- Admin routes return `403` for a logged-in non-admin user, `401` for anonymous.

---

## 1. Public — Properties

### `GET /api/properties`
List/search published properties.

**Query params:**
| Param | Type | Notes |
|---|---|---|
| `q` | string | free-text location match, optional |
| `minPrice`, `maxPrice` | number | optional |
| `type` | string | e.g. `apartment`, `house` — optional |
| `bedrooms` | number | optional |
| `sort` | enum | `price_asc`, `price_desc`, `date_desc` (default) |
| `page` | number | default 1 |
| `pageSize` | number | default 20, max 50 |

**Response `200`:**
```json
{
  "results": [ { "id": "...", "title": "...", "price": 0, "bedrooms": 0, "type": "...", "location": "...", "latitude": 0.0, "longitude": 0.0, "thumbnailUrl": "...", "createdAt": "..." } ],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```
`latitude`/`longitude` may be `null` for a listing not yet geocoded (see SCHEMA.md); the frontend's map view (FR1.6) simply omits pins for those.
Only `status = published` properties are ever returned by this endpoint, regardless of caller.

### `GET /api/properties/:id`
**Response `200`:** full property record — all fields in FR1.4 (photos array, description, price, specs, amenities, location).
**Response `404`:** if the property doesn't exist or isn't published.

---

## 2. Public — Auth

### `POST /api/auth/register`
**Body:** `{ "email": string, "password": string }`
**Response `201`:** `{ "id": "...", "email": "..." }` and sets session cookie.
**Response `409`:** email already registered.

### `POST /api/auth/login`
**Body:** `{ "email": string, "password": string }`
**Response `200`:** `{ "id": "...", "email": "...", "isAdmin": boolean }`, sets session cookie.
**Response `401`:** invalid credentials.

### `POST /api/auth/logout`
**Response `200`:** clears session cookie.

---

## 3. Public — Chat

### `POST /api/chat/message`
Single-session, non-persistent-across-sessions chat (per PRD FR3.3). No `conversationId` history lookup across sessions required for MVP — client keeps the running message array and resends it each call, OR server keeps it keyed by session cookie for the session's lifetime. (Pick one during implementation; document the choice here once decided — currently unresolved implementation detail, not a product requirement.)

**Body:**
```json
{
  "messages": [ { "role": "user", "content": "..." } ]
}
```

**Response `200`:**
```json
{ "reply": "...", "propertiesReferenced": ["propertyId1", "propertyId2"] }
```
`propertiesReferenced` lets the frontend show property cards inline with the AI's answer; optional/empty if the reply doesn't reference specific listings.

**Response `503`:** AI provider failure/timeout —
```json
{ "error": { "code": "ai_unavailable", "message": "..." } }
```
Frontend uses this to trigger the FR3.4 fallback UI.

**Rate limiting:** `429` with `Retry-After` header when the per-session/IP limit (NFR §4) is exceeded.

**Hard constraint:** this endpoint must never write anything except (optionally) a chat log row. It must not create a lead, contact, or any record tied to visitor identity/contact info.

---

## 4. Admin — Properties (all routes require `isAdmin`)

### `GET /api/admin/properties`
List **all** properties regardless of status (draft + published), for the admin list view.
Query params: `status` (optional filter), `page`, `pageSize`.

### `POST /api/admin/properties`
**Body:** `{ "title", "description", "price", "bedrooms", "bathrooms", "area", "type", "location", "latitude"?: number, "longitude"?: number, "amenities": string[], "photos": string[], "status": "draft" | "published" }`

`latitude`/`longitude` are optional at creation; if omitted, a server-side geocoding step (e.g. a Nominatim lookup against the `location` text) may populate them asynchronously — implementation detail, not a separate endpoint.
**Response `201`:** created property record.

### `GET /api/admin/properties/:id`
Full record regardless of status (admin can view drafts).

### `PATCH /api/admin/properties/:id`
Partial update, same fields as `POST`. Includes changing `status` between `draft`/`published`.
**Response `200`:** updated record.

### `DELETE /api/admin/properties/:id`
Deletes the listing outright. (No soft-delete/archive requirement in MVP — if that's wanted, treat as a scope addition, not implied by this contract.)
**Response `204`.**

---

## 5. Explicitly not in this contract

Per PRD §4 / ROADMAP parking lot, there are intentionally **no** endpoints for: leads (`/api/leads`), favorites, requirement profiles, matches/recommendations, visits, agents, users/invite, audit log, analytics, notifications, bulk upload, amenity vocabulary management. If a task seems to need one of these, that's a scope-change signal — flag it rather than adding the route.

---

## 6. Decisions Log (previously open, now resolved)

- Map provider — resolved: lat/lng fields above reflect it.
- Seed data source — resolved: placeholder/fixture data (see SCHEMA.md §5).

## 7. Build-order note

Per `ROADMAP.md`, routes above may be temporarily backed by static fixture JSON (matching these shapes exactly) during early Phase 2/4 build, so frontend work isn't blocked on the Prisma/Postgres layer. A route is not considered done (per `TESTING_STRATEGY_AND_DOD.md`) until it's backed by the real database.
