## Task: BC-DB-FAKE3 - Support Demo JSON Definitions of Fake IndexedDB Content

### 🎯 Purpose

Allow demo/test pages to load fake database contents by importing a `fakeData.ts` file that exports an array of typed JSON objects. These are converted into `IDBDatabase` instances using `fake-indexeddb`, and injected via a static method on `DatabaseService`.

---

### 🧩 Design Overview

1. `fakeData.ts` exports an array of simple, typed JSON definitions:
   ```ts
   export const fakeData = [
     {
       name: 'bc-demo',
       version: 1,
       objectStores: [
         {
           name: 'comments',
           keyPath: 'id',
           data: [
             { id: 1, text: 'Fake comment A' },
             { id: 2, text: 'Fake comment B' }
           ]
         }
       ]
     }
   ];
   ```

2. `index.ts` will:
   - Detect presence of `window.fakeData`
   - Convert JSON entries into `IDBDatabase` instances using `fake-indexeddb`
   - Call `DatabaseService.useFakeDatabases([...])`

---

### 🛠️ Requirements

#### 1. Update `DatabaseService.ts`
- Add static property and methods:
  ```ts
  static #fakeDatabases: IDBDatabase[] = [];

  static useFakeDatabases(dbs: IDBDatabase[]) {
    this.#fakeDatabases = dbs;
  }

  static clearFakeDatabases() {
    this.#fakeDatabases = [];
  }

  static async databases(): Promise<IDBDatabase[]> {
    if (this.#fakeDatabases.length) return this.#fakeDatabases;
    return (await window.indexedDB.databases?.()) || [];
  }

  static async open(name: string): Promise<IDBDatabase> {
    if (this.#fakeDatabases.length) {
      const db = this.#fakeDatabases.find(db => db.name === name);
      if (!db) throw new Error(`Fake DB '${name}' not found`);
      return db;
    }
    return indexedDB.open(name);
  }
  ```

#### 2. Add helper: `loadFakeDatabasesFromJson(jsonDef: FakeDbJson[])`
- Converts typed JSON into populated `IDBDatabase` objects using `fake-indexeddb`.

#### 3. Update `index.ts`
- If `window.fakeData` is present:
  - Call the helper
  - Pass result to `DatabaseService.useFakeDatabases(...)`

---

### 📁 Files Affected

| File             | Description                                     |
|------------------|-------------------------------------------------|
| `DatabaseService.ts` | Add static registry, override methods         |
| `fakeData.ts`    | Export JSON array of fake database definitions |
| `index.ts`       | Detect and load fakeData                       |
| `helpers/fakeDb.ts` | Implements `loadFakeDatabasesFromJson(...)` using `fake-indexeddb` |

---

### ✅ Success Criteria

- [ ] Real `IDBDatabase` access is bypassed when `fakeData` is present
- [ ] JSON structure for fake DBs is clear and type-checked
- [ ] Fake DBs support reads/writes during demo
- [ ] Demo page loads with `DatabaseService` working entirely in-memory
- [ ] Behavior matches live version in all core flows

---

### 🔍 Types

```ts
export interface FakeDbJson {
  name: string;
  version: number;
  objectStores: {
    name: string;
    keyPath: string;
    data: any[];
  }[];
}
```

---

### 🧪 Example Use in Demo Page

```html
<script type="module" src="/fakeData.ts"></script>
<script type="module" src="/index.ts"></script>
```
