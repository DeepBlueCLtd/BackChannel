# Product Requirements Document: BackChannel

## 1. Product Overview

**BackChannel** is a lightweight, offline-friendly JavaScript plugin that enables users to **capture**, **review**, and **resolve feedback** directly within static HTML content. Designed for disconnected or air-gapped environments, it provides structured comment workflows without relying on any network backend. Feedback is stored locally and exported as human-readable CSV files, which can be shared manually and imported into review sessions.

---

## 2. Goals

- Allow feedback to be added to unmodified static HTML content (Capture Mode)
- Enable document authors to review, filter, and resolve feedback offline (Review Mode)
- Require no build process, backend, or network connectivity
- Export and import feedback via CSV
- Be simple to integrate and operate in legacy and secure environments

---

## 3. Key Features

### 3.1 Capture Mode (Feedback Entry)
- Allow user to click on any DOM element to leave a comment
- Record comment text, timestamp, and reviewer initials (if configured)
- Visually mark elements with feedback
- Display all comments in a toggleable sidebar
- Store data in browser `localStorage`
- Export all feedback as CSV

### 3.2 Review Mode (Feedback Review and Resolution)
- Allow import of one or more CSV files containing feedback
- Highlight and display comments from imported data
- Indicate unresolved vs resolved feedback
- Allow user to mark feedback as resolved and undo resolution
- Filter by reviewer, timestamp, or resolution status
- Export feedback (all or filtered) with a "resolved" status column

---

## 4. Non-Goals / Constraints

- No live collaboration
- No server storage or sync
- No user authentication
- No requirement to modify original HTML content

---

## 5. Target Users

- End users reviewing HTML documents in secure/offline contexts (Capture Mode)
- Document authors, trainers, or reviewers importing feedback (Review Mode)
- Organizations using static documents in defense, enterprise, or training workflows

---

## 6. Technical Requirements

- JavaScript plugin (UMD-style, plain script tag)
- Self-contained with minimal/no external dependencies
- Compatible with legacy HTML documents (no required markup)
- No build step required for consumers
- Operates entirely client-side
- Must support modern browsers (Chrome, Edge, Firefox)

---

## 7. Success Metrics

- Drop-in use on legacy HTML files without modification
- 100+ comments handled smoothly in both modes
- CSV export/import round-trip fidelity is 100%
- All interactions available offline
- Can be operated by non-technical users with minimal guidance

---

## 8. CSV Schema

| Field     | Description                          |
|-----------|--------------------------------------|
| Label     | Readable description of target       |
| Selector  | Fallback DOM selector                |
| Text      | The comment text                     |
| Timestamp | Date/time in ISO format              |
| Initials  | Optional reviewer initials           |
| Resolved  | true/false (only in review export)   |

---

## 9. Future Enhancements (Optional)

- CSV import deduplication and versioning
- Inline thread replies
- Tag or category filters
- Theming and CSS customization
- Feedback import via QR code or signed file metadata

---

## 10. Summary

BackChannel provides a robust, privacy-respecting mechanism for capturing and reviewing feedback in disconnected environments. With support for both interactive feedback entry and offline CSV-based review workflows, it empowers static content authors to collaborate without connectivity.

