# BackChannel Task List – Capture and Review Modes

This task list breaks down the full implementation of the BackChannel plugin into safe, iterative steps. It covers both `Capture` mode (end-user providing feedback) and `Review` mode (author reviewing and resolving feedback from CSV).

---

## ✅ Phase 1: Foundation — Setup and Scaffolding

- [ ] Initialize Git repository
- [ ] Create folder structure (`src/`, `dist/`, `example/`)
- [ ] Add baseline files: `README.md`, `.gitignore`, `LICENSE`
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Configure Rollup for bundling (`rollup.config.js`)
- [ ] Add ESLint + Prettier
- [ ] Confirm build outputs to `dist/backchannel.js`
- [ ] Create test `example/index.html` with placeholder init
- [ ] Define a dummy `BackChannel.init()` to bootstrap

---

## ✍️ Phase 2: Capture Mode

### 2.1 Target Detection and Click Handling
- [ ] Enable click-to-comment on any visible DOM element
- [ ] Add hover and focus highlights for selectable elements
- [ ] Track selected element (label, DOM ref, fallback index)

### 2.2 Comment Entry UI
- [ ] Create popup comment form
- [ ] Support initials input if required
- [ ] Validate form input and allow cancel/submit
- [ ] Save to in-memory data model on submit

### 2.3 Local Storage Backend
- [ ] Store submitted comments in `localStorage`
- [ ] Use scoped `storageKey` if configured
- [ ] Load existing comments on page load

### 2.4 Sidebar View
- [ ] Create sidebar to list all comments
- [ ] Show metadata: label, timestamp, initials
- [ ] Scroll to anchor on comment click
- [ ] Visually mark elements with comment icons

### 2.5 CSV Export
- [ ] Add “Export Feedback” button
- [ ] Generate downloadable CSV file
- [ ] Include: label, comment, timestamp, reviewer

---

## 🗂 Phase 3: Review Mode

### 3.1 CSV Import and Parsing
- [ ] Add “Import Feedback” button to sidebar
- [ ] Support drag-and-drop or file picker
- [ ] Parse CSV with validation (columns: label, comment, timestamp, reviewer)
- [ ] Identify matching DOM elements
- [ ] Handle unmatched entries as "orphaned"

### 3.2 Feedback Display
- [ ] Merge imported feedback with any existing
- [ ] Visually mark elements with imported comments
- [ ] Tooltip on hover with preview
- [ ] Sidebar lists all imported feedback

### 3.3 Filtering and Sorting
- [ ] Add filter by reviewer initials
- [ ] Add toggle to show/hide resolved comments
- [ ] Enable sort by timestamp or label

### 3.4 Comment Resolution Workflow
- [ ] Add “Mark Resolved” button per comment
- [ ] Support undo resolution
- [ ] Visually distinguish resolved vs unresolved
- [ ] Persist resolution status in localStorage

### 3.5 Review Export
- [ ] Export current review state as CSV
- [ ] Include “resolved” column
- [ ] Add “Export Filtered View” option

---

## 🧪 Phase 4: Robustness and Edge Cases

- [ ] Handle localStorage full/unavailable
- [ ] Gracefully report CSV import errors
- [ ] Warn for “orphaned” comments
- [ ] Fallback labels for elements without innerText
- [ ] Support multiple comments per element
- [ ] Large scale test: 100+ comments

---

## 🎨 Phase 5: Usability and Polish

- [ ] Style popup and sidebar for clarity
- [ ] Ensure accessibility (keyboard focus, aria labels)
- [ ] Add in-page help tooltip
- [ ] Optional: inline styles fallback

---

## 📦 Phase 6: Distribution and Docs

- [ ] Minify final JS bundle
- [ ] Provide UMD-compatible output
- [ ] Document plugin API and init options
- [ ] Write integration guide for legacy HTML
- [ ] Add usage examples and demo GIFs
- [ ] Prepare ZIP-based release and/or NPM publish

