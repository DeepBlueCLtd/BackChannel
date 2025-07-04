# Task: Versioned Seeding of Demo IndexedDB Data

## 📌 Objective

Ensure that demo pages load persistent IndexedDB data **only once per version**, preventing loss of user-added data (e.g. comments) on each page navigation. This avoids reseeding on every page load and keeps the `DatabaseService` decoupled from fake/mock database logic.

## 🎯 Expected Outcomes

- A block of JSON embedded in each demo page (via `window.demoDatabaseSeed`) defines:
  - A version string (e.g. `demo-v2`)
  - One or more IndexedDB database definitions
- On initial page load:
  - If the seed version has **not yet been applied**, the real browser IndexedDB is populated with the defined data.
  - If the seed version **has already been applied**, no changes are made.
- User-added data (e.g. comments) persists across page navigations.

## 📁 Demo JSON Format

There is a sample database object already in `FakeData.ts`.

## 🔨 Sub-tasks

### 1. Understand requirement
- [ ] Remove concept of Fake-Databases from DatabaseService (db.ts).

### 2. Create the Seeding Utility
- [ ] Write a utility function (e.g. `seedDemoDatabaseIfNeeded()`) that:
  - Checks `localStorage` for the current seed version
  - If missing, seeds `indexedDB` using the provided structure
  - Sets the seed version in `localStorage` after successful seeding

### 3. Hook into Page Load
- [ ] Call `seedDemoDatabaseIfNeeded()` in a `src/index.ts` before initialising DatabaseService

### 4. Test and Validate
- [ ] Load demo page and confirm database is seeded once
- [ ] Add new data (e.g. comments), navigate away, and confirm persistence
- [ ] Change `window.demoDatabaseSeed.version` and verify that the seeding re-runs and overwrites previous contents

### 5. (Optional) Extend for Future Use
- [ ] Allow clearing/resetting the seeded database for debugging
- [ ] Create a dev-only toggle to force reseeding even with same version

## ✅ Benefits

- Prevents repeated seeding and data loss
- Maintains demo realism with persistent user data
- Keeps `DatabaseService` simple and focused
- Enables clean upgrades via version bump
