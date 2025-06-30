# Product Requirements Document: BackChannel

## 1. Product Overview

**BackChannel** is a lightweight, offline-friendly JavaScript plugin that enables users to **capture**, **review**, and **resolve feedback** across one or more static HTML pages. Designed for disconnected or air-gapped environments, it provides structured comment workflows without relying on any network backend. Feedback is stored locally in the browser and exported as human-readable CSV files, which can be shared manually and imported for review.

---

## 2. Goals

- Allow feedback to be added to unmodified static HTML content (Capture Mode)
- Enable document authors to review, filter, and resolve feedback offline (Review Mode)
- Group feedback across multiple pages into a document-wide “Feedback package”
- Require no build process, backend, or network connectivity
- Export and import feedback via CSV
- Be simple to integrate and operate in legacy and secure environments

---

## 3. Key Features

### 3.1 Capture Mode (Feedback Entry)
- User selects any visible HTML element to leave a comment
- Records comment text, timestamp, reviewer initials (if configured)
- Visually marks elements with feedback
- Displays feedback in a toggleable sidebar
- Supports creating a multi-page **Feedback package**:
  - User initiates the package on a “Welcome” or “Introduction” page
  - Defines a URL prefix and document name
  - Feedback added to any page under that prefix is grouped in the same package
- Stores feedback in a browser IndexedDB instance, scoped to the document package
- Exports feedback as CSV with required metadata

### 3.2 Review Mode (Feedback Review and Resolution)
- Allows importing one or more feedback CSVs
- Supports **Document-wide review** and **Page-only view**
- Displays and links feedback across multiple pages:
  - Local page comments are highlighted and interactive
  - Off-page comments are shown in the sidebar with page title + link
- Enables filtering by reviewer, page, resolution status
- Allows marking feedback as resolved / unresolved
- Persists review status in local IndexedDB
- Exports feedback including resolution state

---

## 4. Multi-Page Feedback Model

- A Feedback package includes:
  - A **document name** (default from `<title>` of the root page)
  - A **URL prefix** (default from folder path of root page)
  - A local IndexedDB instance containing a `comments` table
- Each comment entry includes:
  - Page URL
  - Page title
  - Document name
  - Page label (optional override)
  - Label for target element
  - Text, timestamp, initials, resolved status

---

## 5. Non-Goals / Constraints

- No live collaboration
- No server storage or sync
- No user authentication
- No required modification to original HTML content

---

## 6. Target Users

- End users reviewing HTML documents in secure/offline contexts (Capture Mode)
- Document authors or editors reviewing submitted feedback (Review Mode)
- Teams working on training material, documentation, or static knowledge bases

---

## 7. Technical Requirements

- JavaScript plugin (UMD-style, script tag usage)
- Self-contained with no required dependencies
- Compatible with legacy HTML documents
- Fully functional offline, including multi-page persistence
- Modern browser support (Chrome, Edge, Firefox)

---

## 8. Success Metrics

- Multi-page feedback supported across 5+ pages with full traceability
- Sidebar performance acceptable with 100+ comments
- CSV export/import round-trip preserves all metadata
- Easily adoptable by teams working with static HTML

---

## 9. CSV Schema

| Field       | Description                            |
|-------------|----------------------------------------|
| Document    | Document name from feedback package     |
| Page URL    | Full page URL                          |
| Page Title  | Title tag or override                  |
| Page Label  | Optional user-defined label            |
| Element     | Label/selector of commented element    |
| Text        | Comment content                        |
| Timestamp   | ISO datetime of entry                  |
| Initials    | Reviewer ID (if required)              |
| Resolved    | true/false (for review state)          |

---

## 10. Future Enhancements (Optional)

- Merge feedback from multiple reviewers in the same view
- Allow assigning comments to sections or categories
- Import/export full feedback package as JSON bundle
- Synchronize review state across machines (manual or networked)

---

## 11. Summary

BackChannel is designed for structured, document-wide feedback on static web content. It supports both feedback entry and review workflows across multiple pages — without requiring connectivity, build systems, or page modification. By using a lightweight local database and CSV-based exchange, it enables frictionless offline review for the disconnected web.
