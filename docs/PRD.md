# Product Requirements Document: BackChannel

## 1. Product Overview

**BackChannel** is a lightweight, offline-friendly JavaScript plugin that enables users to capture, review, and export feedback directly within static web content. Designed for disconnected or air-gapped environments, it provides structured comment tools without relying on a network backend. Feedback is stored locally and can be exported as a human-readable CSV file for transfer and later processing.

## 2. Goals

- Allow feedback to be added to static HTML content (offline)
- Require no backend, build process, or internet connection
- Enable export of all captured feedback as CSV
- Be embeddable into existing HTML documents
- Keep the footprint minimal and the UI unobtrusive

## 3. Key Features

### 3.1 Commenting System
- Add a comment to a specific element on the page
- Store comment text, timestamp, and (optionally) author initials
- Visual indicator on commented elements
- Comments visible in a side panel, grouped by section

### 3.2 Storage and Persistence
- Feedback stored in browser `localStorage` or `IndexedDB`
- Configurable storage namespace to support multiple documents
- No data leaves the browser unless exported manually

### 3.3 Export and Transfer
- One-click export of all comments to a **CSV file**:
  - Fields: element selector/label, comment text, timestamp, user initials
- Human-readable format; ready for manual transfer (USB, email, printout)

### 3.4 Configurability
- Optional config block embedded in HTML `<script>` or `<meta>` tag
- Enables/disables features (e.g., highlight mode, initials prompt)

### 3.5 UI and Usability
- Floating **“Add Feedback”** button to activate comment mode
- Toggleable sidebar to view or hide all comments
- Tooltip indicators for commented elements
- Keyboard accessibility support (optional)

## 4. Non-Goals / Constraints

- No online syncing or live collaboration
- No integration with cloud storage
- No support for comment moderation (all comments are local and uncontrolled)

## 5. Target Users

- Internal documentation reviewers
- Users in secure or air-gapped environments (e.g., defense, R&D, enterprise)
- Authors of standalone HTML content (e.g., tech manuals, reference sites)

## 6. Technical Requirements

- Pure JavaScript, no build step (single `.js` file)
- Compatible with common static site generators (e.g., Jekyll, Hugo)
- Operates entirely client-side
- Minimal dependencies (only one: [uPlot or equivalent] for future chart enrichments)
- Must support modern evergreen browsers (Chrome, Edge, Firefox)

## 7. Success Metrics

- Able to integrate into any HTML document with a single `<script>` include
- Can add and export 50+ comments on a single page without performance issues
- CSV is readable and complete when imported into Excel or Google Sheets
- Can operate fully in an offline browser session

## 8. Future Enhancements (Optional)

- Threaded replies or tag categorization
- Load/reimport previously saved CSVs
- Filter/search within feedback sidebar
- Compatibility with PDF export (printable comment report)
- Minimal UI theme customization via CSS variables
