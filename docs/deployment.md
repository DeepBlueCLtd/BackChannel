# BackChannel Deployment Strategy

This document outlines the deployment, build, and integration strategy for the BackChannel feedback capture tool.

---

## 1. Overview

BackChannel is designed to run as a standalone JavaScript plugin, directly embedded via a `<script>` tag into static HTML documents. It supports both feedback capture and review modes and operates entirely offline.

---

## 2. Initialization Strategy

- The plugin auto-initializes **after `window.onload`** to ensure the DOM is fully loaded.
- It inspects the current URL to determine if a matching feedback package is active.
- If an active package is found, the BackChannel icon is shown in **active** (green) mode.
- Otherwise, the icon is shown as **inactive** (grey) and clicking it provides onboarding guidance.

---

## 3. Script Behavior

- ✅ **Self-injecting CSS**: All required styles are injected dynamically, no `<link>` tags or stylesheets are needed.
- ✅ **Single active instance**: A global guard prevents duplicate initialization (`window.BackChannelActive`).
- ✅ **Console logging**: Logs are **not stripped** from production — console logs remain for traceability.
- ✅ **Sidebar persistence**: Sidebar state and filter settings are cached across pages using `localStorage`.

---

## 4. Build Requirements

BackChannel is authored in **TypeScript** and built using **Vite** (or Rollup if needed). The build must:

- Output a **single `.js` file**, including:
  - All JS logic (plugin, sidebar, storage)
  - All CSS styles (via inline `<style>` injection)
  - No external assets or runtime dependencies
- Produce an ES5-compatible UMD/IIFE bundle suitable for legacy browsers
- Minify all code except `console.log()` statements
- Ensure global entrypoint (`window.BackChannelActive`) is defined and guarded

---

## 5. Embedding Instructions

Document authors embed the plugin like so:

```html
<script src="assets/backchannel.js"></script>
```

- This should be placed at the **end of the `<body>` tag** for fastest load and correct timing.
- No other setup is required.
- When loaded, the plugin will detect if feedback mode is active and inject the UI appropriately.

---

## 6. Directory Structure

```
dist/
├── backchannel.js        # Minified production bundle
src/
├── main.ts               # Plugin entrypoint
├── sidebar.ts            # UI controls and DOM injection
├── storage.ts            # IndexedDB and localStorage helpers
├── icons/                # Inline SVG icons
├── styles/               # CSS (to be bundled and injected)
```

---

## 7. Future Packaging Options

While initial distribution is via embedded script, additional strategies could include:

- ✅ Self-hosted ZIP archive for air-gapped environments
- ✅ CDN-based hosting (e.g. jsDelivr, UNPKG)
- ✅ NPM package for development usage

These can be revisited once adoption stabilizes.

---

## 8. Versioning

- Use semantic versioning (semver): `MAJOR.MINOR.PATCH`
- Embed version string in console log output on load
- Optionally expose version as `window.BackChannelVersion`

---

## 9. Summary

| Feature                     | Supported |
|----------------------------|-----------|
| Offline operation          | ✅         |
| Script-based embed         | ✅         |
| Inline CSS injection       | ✅         |
| Auto-init after load       | ✅         |
| Console logs kept          | ✅         |
| Vite or Rollup build       | ✅         |
| Single `.js` file          | ✅         |

BackChannel is optimized for deployment in legacy and offline publishing contexts with minimal integration burden.