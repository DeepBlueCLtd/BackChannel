# BackChannel Development Task List (Capture + Review Modes)

This document breaks down the full implementation of BackChannel, covering both feedback capture and review across multi-page documents.

---

## ✅ Phase 1: Scaffolding and Infrastructure

- [x] Set up project with TypeScript + Vite + ESLint/Prettier
- [x] Create build process to produce a single-file JS plugin
- [x] Implement IndexedDB wrapper (package store, comments table)
- [x] Define shared types: Comment, FeedbackPackage, PageMetadata
- [x] Create base CSS for badges, sidebars, buttons
- [x] Build process, distribution, demo instance

---

## ✅ Phase 2: Capture Mode – Core Functionality

### Package Creation
- [x] Check if there is an active feedback package for this URL
- [x] If there is, show enabled BC icon. Load feedback package in background.
- [x] If there isn't, show disabled BC icon
- [x] Clicking on enabled BC icon opens capture feedback sidebar
- [x] Clicking on disabled BC icon opens package creation dialog, which takes document title, author name, and (editable) URL prefix, with instructions to navigate to root before creating feedback package. Store feedback package metadata in IndexedDB
- [ ] When capture sidebar is open, decorations on page show which elements have comment. Hovering over them shows the comment.

### Commenting
- [x] Capture sidebar still has BC icon at top, clicking on it collapses the sidebar.
- [x] Capture sidebar includes `Capture Feedback` and `Export` buttons
- [x] On clicking on `Capture Feedback`, UI goes into `Capture mode`. Sidebar is hidden, though floating `Cancel Capture` button remains.  Hovering over html elements highlights the element. Clicking on an element opens the sidebar, with a `capture feedback` form open at the top, to take a comment.
- [x] Add comment on DOM click (default fallback if no `.reviewable`)
- [x] Show comment UI with editable text.  Show this form in a compact way at the top of the BC sidebar
- [x] Save comment to `comments` table with metadata
- [x] Render comment badge on target element
- [x] List current page comments in sidebar
- [ ] Clicking on a comment should navigate to the page, and highlight the comment on that page.

### Navigation
- [ ] Detect feedback package match on hyperlinked documents, show decoration when comments availble for that document.
- [ ] Append comments to same package across document

---

## ✅ Phase 3: Capture Mode – Persistence and Export

- [ ] Persist comments and badges after reload, by storing in indexed db.
- [ ] Persist last used url (and database name) in local storage (cookie)
- [ ] List and filter comments by page
- [ ] Export CSV for full feedback package (merged rows)
- [ ] Include document name, page title, URL, label, timestamp, initials
- [ ] Note: CSV will have some `organisational` data at head: document title, url ,author name.

---

## ✅ Phase 4: Review Mode – Core Functionality

### Import and Display
- [ ] BC in feedback mode also shown in grey/blue (disabled) mode.
- [ ] While app opens (by default) in capture mode, it can be opened in feedback mode by clicking on the BC icon in the top-right of the page.  Or, if there is a review feedback package present for this page URL, then it will open in feedback mode.
- [ ] Enable CSV import via file input
- [ ] Parse CSV into in-memory comment list
- [ ] Load comments into sidebar¦
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
