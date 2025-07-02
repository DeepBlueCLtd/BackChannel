# BackChannel Development Task List (Capture + Review Modes)

This document breaks down the full implementation of BackChannel, covering both feedback capture and review across multi-page documents.

---

## ✅ Phase 1: Scaffolding and Infrastructure

- [ ] Set up project with TypeScript + Vite + ESLint/Prettier
- [ ] Create build process to produce a single-file JS plugin
- [ ] Implement IndexedDB wrapper (package store, comments table)
- [ ] Define shared types: Comment, FeedbackPackage, PageMetadata
- [ ] Create base CSS for badges, sidebars, buttons

---

## ✅ Phase 2: Capture Mode – Core Functionality

### Package Creation
- [ ] Check if there is an active feedback package for this URL
- [ ] If there is, open it
- [ ] If there isn't, provide some user guidance on how to create one, including inviting user to navigate to welcome/home page, and create one
- [ ] Show dialog to confirm/edit URL prefix, document name and author initials
- [ ] Store feedback package metadata in IndexedDB
- [ ] Load active package on pages matching prefix

### Commenting
- [ ] Add comment on DOM click (default fallback if no `.reviewable`)
- [ ] Show comment UI with editable text.  Show this form in a compact way at the top of the BC sidebar
- [ ] Save comment to `comments` table with metadata
- [ ] Render comment badge on target element
- [ ] List current page comments in sidebar

### Navigation
- [ ] Detect feedback package match on other pages
- [ ] Append comments to same package across document

---

## ✅ Phase 3: Capture Mode – Persistence and Export

- [ ] Persist comments and badges after reload
- [ ] List and filter comments by page
- [ ] Export CSV for full feedback package (merged rows)
- [ ] Include document name, page title, URL, label, timestamp, initials
- [ ] Note: CSV will have some `organisational` data at head: document title, url ,author initials.

---

## ✅ Phase 4: Review Mode – Core Functionality

### Import and Display
- [ ] Enable CSV import via file input
- [ ] Parse CSV into in-memory comment list
- [ ] Load comments into sidebar
- [ ] Highlight comments for current page
- [ ] If an in-page link is to a URL for which there is a feedback comment, show "open comment in linked page" decoration to UR.  This decoration will include an arrow.
- [ ] Show off-page comments in sidebar with page label + link
- [ ] Toggle: "This Page Only" vs "Entire Document"

### Comment Linking
- [ ] Map current page comments to DOM elements
- [ ] Gracefully handle missing elements
- [ ] Provide link to off-page comment source

---

## ✅ Phase 5: Review Mode – Managing Feedback

### Resolution Management
- [ ] Allow marking a comment as resolved / reopened
- [ ] Update sidebar badge and state styling
- [ ] Persist resolution status in memory

### Exporting Reviewed Feedback
- [ ] Export current page (CSV with resolution info)
- [ ] Export full document feedback (merged CSV)

---

## ✅ Phase 6: User Interface Polish

- [ ] Add sort/filter controls in sidebar (page, timestamp, resolution)
- [ ] Highlight active comment
- [ ] Style review links, navigation aids
- [ ] Improve badge contrast and click hit-area

---

## ✅ Phase 7: Error Handling & Edge Cases

- [ ] Warn on missing or malformed CSV imports
- [ ] Handle IndexedDB failure gracefully
- [ ] Detect invalid feedback package input
- [ ] Log and skip rows with missing fields

---

## ✅ Phase 8: Testing and QA

- [ ] Unit tests for core logic (IndexedDB, parsing, rendering)
- [ ] Integration tests simulating multi-page workflow
- [ ] Manual QA across browsers and file protocols
- [ ] Coverage review vs BDD specs

---

## ✅ Phase 9: Documentation and Packaging

- [ ] Write end-user guide for Capture + Review
- [ ] Document CSV format and metadata
- [ ] Add embed/install instructions
- [ ] Minify and publish single-file plugin
