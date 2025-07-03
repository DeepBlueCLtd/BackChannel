### 🛠️ Task: Enable `DatabaseService` to use optional in-memory IndexedDB (via `fake-indexeddb`)

#### Goal:
Refactor the `DatabaseService` class to optionally accept a custom `indexedDB` implementation (such as `fake-indexeddb`) for use in tests or demos.

---

#### 📄 Target File:
`src/services/DatabaseService.ts`

---

#### 🧩 Requirements:

- Accept an **optional constructor parameter**: `idb: IDBFactory`.
- Default to using the browser's global `window.indexedDB` if no parameter is passed.
- Replace all direct references to `window.indexedDB` or `indexedDB` in the service with `this.idb`.
- Ensure this works seamlessly with both browser and fake-indexeddb environments.

---

#### 🧪 Add Jest Test:

Create a test file: `__tests__/DatabaseService.test.ts`

Use `fake-indexeddb` to test this in-memory mode.

```ts
import { indexedDB as fakeIndexedDB } from 'fake-indexeddb';
import { DatabaseService } from '../src/services/DatabaseService';

describe('DatabaseService with in-memory IndexedDB', () => {
  it('creates and reads an object store entry', async () => {
    const dbService = new DatabaseService(fakeIndexedDB);
    await dbService.init(); // Assume you have an init() method that sets up schema

    await dbService.setItem('comments', { id: 'abc123', text: 'Test comment' });
    const item = await dbService.getItem('comments', 'abc123');
    expect(item).toEqual({ id: 'abc123', text: 'Test comment' });
  });
});
```

---

#### 🧪 Success Criteria:
- ✅ `DatabaseService` still functions with default browser `indexedDB`.
- ✅ When `fake-indexeddb` is passed in, all data stays in-memory.
- ✅ Tests pass and confirm data access works via both backends.

---
