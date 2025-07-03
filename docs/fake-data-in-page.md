## Task: BC-DB-FAKE - Load Fake IndexedDB from `fakeData.ts` in Demo Pages

### 🧩 Purpose

Allow demo/test pages to preload a fake in-memory IndexedDB via a `fakeData.ts` file. This enables precise control over test data while maintaining full TypeScript support. The system should fall back to real IndexedDB if no fake data is provided.

---

### 🛠️ Requirements

#### 1. Global `fakeDb` detection
- During app startup (`index.ts`), check if `window.fakeDb` is present.
- If present, use `fake-indexeddb` to create an in-memory DB using the provided data.
- Otherwise, fall back to regular IndexedDB via the existing `DatabaseService`.

#### 2. Accept `fakeDb` as constructor parameter
- Update `DatabaseService` to accept an optional fake DB object.
- If provided, inject it instead of using `indexedDB`.

#### 3. Demo integration
- A demo HTML page should include:
  ```html
  <script type="module" src="/fakeData.ts"></script>
  <script type="module" src="/index.ts"></script>
  ```
- `fakeData.ts` should assign data to `window.fakeDb` as an exported constant.
- Support full TypeScript type checking in `fakeData.ts`.

#### 4. Types
- Define `FakeDatabase` interface in a shared `types.ts`.
- Ensure fake data is validated against this interface at runtime.

---

### 📁 File Changes

| File | Change |
|------|--------|
| `src/index.ts` | Add conditional fakeDb logic before constructing `DatabaseService`. |
| `src/services/db.ts` | Accept optional injected fake DB implementation. |
| `src/types.d.ts` | Add `FakeDatabase` interface. |
| `fakeData.ts` | Example TypeScript file with sample in-memory DB. |
| `demo/index.html` | Sample HTML file that loads `fakeData.ts` before `index.ts`. |

---

### ✅ Test Case (Playwright or Jest)

Create a Playwright test:

```ts
test('loads fake data from fakeData.ts', async ({ page }) => {
  await page.goto('/demo/index.html');
  await expect(page.locator('.feedback-comment')).toHaveCount(3); // based on fake data
});
```

---

### 🧪 Success Criteria

- [ ] Demo page renders UI using fake data only (no persistent IndexedDB used)
- [ ] Switching between pages with different `fakeData.ts` loads different datasets
- [ ] No changes required to production code using real IndexedDB
- [ ] Demo data is fully type-checked via TS
- [ ] Tests confirm that fake data loads and populates the app

---

### 🗂️ Output

- [ ] `src/index.ts` patch for conditional DB load
- [ ] Updated `src/services/db.ts`
- [ ] `fakeData.ts` example
- [ ] Working demo HTML
- [ ] Test verifying fake DB load