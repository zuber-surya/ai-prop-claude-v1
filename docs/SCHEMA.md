# SCHEMA — Property Website MVP

**Status:** Draft v1
**Scope authority:** Bound by `ROADMAP.md`, `CLAUDE.md`, `PRD.md`, `NFR.md`, `API_CONTRACT.md`. Only three tables exist in this MVP — see §4 for what's deliberately absent.

---

## 1. ERD (prose form)

```
User
 └─ (no direct FK relationships to Property in this MVP — no favorites, no ownership tracking)

Property
 └─ stands alone; no FK to User (no "listed by agent" concept in MVP)

ChatMessage
 └─ belongs to a session (sessionId string), optionally linked to a User if logged in when the message was sent
```

There are no foreign-key relationships between `Property` and the other two tables. The chatbot references properties by ID in its response (`propertiesReferenced` per API_CONTRACT.md §3), but that's an application-level lookup at request time, not a stored relationship — there's no need to persist "which properties were shown in which chat message" for MVP.

---

## 2. Prisma schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  isAdmin      Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  chatMessages ChatMessage[]

  @@map("users")
}

model Property {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Int                      // INR, smallest unit (paise) to avoid float issues. Single currency only — no multi-currency support (see CLAUDE.md §2, §4).
  type        String                   // e.g. "apartment", "house", "villa" — free string for MVP, not an enum table
  bedrooms    Int
  bathrooms   Int
  area        Int                      // sq ft — unit TBD if multi-unit ever needed, single unit assumed for MVP
  location    String                   // free-text label for display (e.g. "Adajan, Surat")
  latitude    Float?                   // for map view (FR1.6) — nullable so a listing can exist before geocoding
  longitude   Float?
  amenities   String[]                 // simple string array, no canonical vocabulary table in MVP
  photos      String[]                 // array of storage URLs
  status      PropertyStatus @default(draft)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([price])
  @@index([type])
  @@map("properties")
}

enum PropertyStatus {
  draft
  published
}

model ChatMessage {
  id        String   @id @default(cuid())
  sessionId String                       // groups messages within one browser session
  userId    String?                      // set if the visitor happened to be logged in; not required
  user      User?    @relation(fields: [userId], references: [id])
  role      ChatRole
  content   String
  createdAt DateTime @default(now())

  @@index([sessionId])
  @@map("chat_messages")
}

enum ChatRole {
  user
  assistant
}
```

---

## 3. Notes on modeling choices

- **`price` as Int in paise (INR smallest unit)** — confirmed single currency (INR), avoids floating-point rounding bugs; frontend divides by 100 and formats for display.
- **`amenities` and `photos` as native Postgres arrays** — fine at MVP scale; if amenity filtering/autocomplete becomes a real feature later, revisit as a join table (this was the `Amenity` model in the old full-scope spec — deliberately not resurrected here).
- **`latitude`/`longitude` are nullable** — a property can be created via admin CRUD before it's geocoded; the map view (FR1.6) simply omits pins with null coordinates rather than erroring. Geocoding itself (address → lat/lng) is an implementation detail for Phase 4/build time — e.g. a one-time Nominatim (OSM's free geocoder) lookup on save — not a separate feature.
- **`ChatMessage.userId` is optional** — chat works for anonymous visitors per PRD FR3.1; linking to a user is incidental, not load-bearing for any feature in this MVP.
- **No `deletedAt`/soft-delete** — `DELETE /api/admin/properties/:id` per the API contract does a hard delete; add soft-delete only if that becomes a real requirement.

---

## 4. Deliberately absent (vs. the old full-scope spec)

No tables for: `Lead`, `Opportunity`, `Agent`, `RequirementProfile`, `MatchingConfig`, `Notification`, `AuditLogEntry`, `SavedProperty`/favorites, `Visit`, `SessionLog`, `Amenity` (as a vocabulary table). If a future task implies needing one of these, that's a schema-change/scope-change request — flag it against ROADMAP.md rather than adding a model quietly.

---

## 5. Seeding approach

Seed data is placeholder/fixture data, not a real listings import (decided in ROADMAP.md). The seed script should generate a reasonable spread of `Property` rows — varied `type`, `price`, `bedrooms`, `status` (mix of `draft`/`published` so admin views have something to work with), and a few with `latitude`/`longitude` populated (real coordinates for a plausible city/area, e.g. Surat) and a few left `null` to exercise the "ungeocoded listing" case in the map view. Photos can point to placeholder image URLs.
