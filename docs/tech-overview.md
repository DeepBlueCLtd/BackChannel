# Technical Architecture Overview: BackChannel

## Project Overview

**BackChannel** is a lightweight, offline-first JavaScript plugin designed to enable feedback capture and review within static HTML content. It is tailored for disconnected environments where network access is unavailable or restricted.

---

## Project Goals

- Allow user comments to be added to static HTML elements
- Require no backend or online services
- Export captured feedback as human-readable CSV
- Be easy to embed into existing HTML content via `<script>` tag
- Support complete operation offline

---

## 1. Project Structure

```
backchannel/
├── src/
│   ├── index.ts             # Main plugin entry point
│   ├── dom.ts               # DOM utility functions
│   ├── storage.ts           # LocalStorage interface
│   ├── exporter.ts          # CSV export logic
│   ├── ui.ts                # UI rendering logic
│   └── types.ts             # Shared TypeScript types
├── dist/
│   ├── backchannel.js       # Bundled and minified plugin (UMD)
│   └── backchannel.css      # Optional styles
├── example/
│   └── index.html           # Static demo page
├── rollup.config.js         # Build config
├── tsconfig.json            # TypeScript config
└── README.md
```

---

## 2. Core Components

### 2.1 `index.ts`
- Initializes plugin
- Applies configuration
- Binds event listeners

### 2.2 `dom.ts`
- Finds and annotates target elements
- Attaches event handlers
- Manages tooltips and highlights

### 2.3 `storage.ts`
- Uses `localStorage` (fallback to `sessionStorage` if needed)
- Namespaced by document or manual config
- CRUD for comment entries

### 2.4 `exporter.ts`
- Converts internal data to CSV format
- Initiates download
- Supports timestamp and initials fields

### 2.5 `ui.ts`
- Renders feedback panel
- Displays comment threads
- Provides “Add Feedback” and “Export” buttons

---

## 3. Technologies & Tools

- **Framework**: Vite, using Vanilla/Typescript template presets
- **Language**: TypeScript (compiled to ES6 JavaScript)
- **Bundler**: Rollup (single-file output, optional minification)
- **CSS**: Inline or optional external stylesheet
- **Testing**: Manual + Jest for utility units.  StoryBook V9 for UI reviews and testing, using a sample document.
- **Linting**: ESLint + Prettier

---

## 4. Plugin API

```ts
BackChannel.init({
  targetSelector: '.reviewable',
  requireInitials: true,
  allowExport: true,
  storageKey: 'feedback_doc123'
});
```

---

## 5. CSV Export Schema

To minimise duplication, the CSV export is split into two elements:

### 5.1 Document Metadata
| Field           | Description                          |
|----------------|--------------------------------------|
| Document Title  | The title of the document              |
| Document URL    | The URL of the document                |
| Document ID     | A unique identifier for the document   |
| Reviewer        | User name           |

### 5.2 Comment Data
| Field           | Description                          |
|----------------|--------------------------------------|
| Element Label  | Text content or selector             |
| Comment Text   | The comment entered by the user      |
| Timestamp      | ISO string of comment creation       |

---

## 6. Offline Support

- Fully functional offline (HTML + JS only)
- Feedback stored in `localStorage` (persists across sessions)
- No external dependencies
- Exported CSV enables manual feedback transmission

---

## 7. Security & Privacy

- No network traffic
- Comments only stored locally
- No identifiers unless user enters initials

---

## 8. Future Extensions

- Import from CSV
- Support for annotation threading
- Theming via CSS variables
- Alternate storage adapters (IndexedDB)

---

## 9. Deployment

- Copy `dist/backchannel.js` to static HTML directory
- Add `<script src="backchannel.js"></script>` to page
- Initialize with `BackChannel.init(...)`

---

## 10. Summary

BackChannel is built for simplicity, resilience, and offline operation. Its structure ensures it can be deployed into any HTML-based environment without compilation, network access, or backend dependencies. Its extensible design leaves room for future growth and customization.

