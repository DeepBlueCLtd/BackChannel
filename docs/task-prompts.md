# BackChannel Code Generation Prompts

This document provides a step-by-step set of structured prompts for a code-generation LLM to implement the BackChannel project. Each step follows best practices, builds incrementally on the last, and avoids introducing unused or unconnected code.

---

## ✅ 1. Setup and Bootstrap

### 1.1 Create a minimal plugin entry point

```
You are building a lightweight browser plugin for static HTML pages. 
Start by writing a TypeScript file that defines a `BackChannel` object with a single `init()` method.

This method should accept a config object with a `targetSelector` (string) and `requireInitials` (boolean).

For now, just log a message when `init()` is called.

Output a file: `src/index.ts`
```

---

## ✅ 2. Target Detection and Click Handling

### 2.1 Select elements and respond to clicks

```
Expand the `BackChannel.init()` method to add a click listener to the document. 
When the user clicks an element that matches the `targetSelector`, call a function `handleElementClick()`.

Write this function in a separate file `src/dom.ts`. It should log the clicked element and generate a label string using tag name and textContent (or fallback to tag/index).

Ensure all necessary types are defined.

Update `src/index.ts` to import and use this function.
```

---

## ✅ 3. Comment Popup UI

### 3.1 Display and submit a comment form

```
Create a file `src/ui.ts`. In it, define a function `showCommentForm(targetEl: HTMLElement, onSubmit: (data) => void)`.

Render a floating div near the element. The form should have:
- A textarea for comment text
- A text input for initials (if `requireInitials` is true)
- Submit and Cancel buttons

When submitted, call `onSubmit()` with the comment text and initials.

Wire this into `handleElementClick()` so clicking a target shows the form.

Extended UI Requirements:
- the user should be given an `affordance` that informs them that it's possible to provide feedback on an element
- the form should float above the page, and be re-positionable, so that the user can still read the content the feedback relates to.
```

---

## ✅ 4. Comment Storage

### 4.1 Save and retrieve comments

```
Create a file `src/storage.ts`. Define:
- A type `CommentEntry` (label, selector, text, timestamp, initials)
- `saveComment(entry: CommentEntry, storageKey: string)`
- `loadComments(storageKey: string): CommentEntry[]`

Use `localStorage` to persist and retrieve data in JSON format.

Update `index.ts` to store comments using the config-defined `storageKey`.
```

---

## ✅ 5. Sidebar Rendering

### 5.1 Display stored comments

```
Extend `src/ui.ts` with a `renderSidebar(comments: CommentEntry[], onCommentClick: (entry) => void)` function.

The sidebar should:
- Appear fixed on the right
- List each comment with label and timestamp
- Call `onCommentClick()` when a comment is selected

Wire it into `init()` so the sidebar appears with any loaded comments.
```

---

## ✅ 6. Element Highlighting

### 6.1 Mark commented elements

```
Create a helper in `dom.ts` called `highlightCommentedElements(comments: CommentEntry[])`.

This should:
- Loop through comments
- Attempt to find each element in the DOM by selector or text
- Add a class or icon badge near the element

Call this after loading comments in `init()`, and when a new comment is saved.
```

---

## ✅ 7. Export to CSV

### 7.1 Add CSV export functionality

```
Create `src/exporter.ts` and implement a function `exportCommentsToCSV(comments: CommentEntry[])`.

Format the CSV as: label, selector, comment text, timestamp, initials.

In `ui.ts`, add an “Export Feedback” button to the sidebar that triggers this download.

Update `init()` to load and wire everything together.
```

---

## ✅ 8. Import CSV (Review Mode)

### 8.1 Load and render comments from a CSV file

```
In `ui.ts`, add a file input for uploading a feedback CSV.

Create `importCommentsFromCSV(file: File): Promise<CommentEntry[]>` in `exporter.ts`.

On successful import:
- Merge with current comments
- Render in sidebar
- Highlight elements

Handle errors and show warnings for unmatched (orphaned) comments.
```

---

## ✅ 9. Resolution Workflow

### 9.1 Add resolution status tracking

```
Update `CommentEntry` to include a `resolved` boolean.

In `ui.ts`, allow toggling a comment as resolved/unresolved.

Show resolved items with different style, and provide a filter to view unresolved only.

Persist resolution state in `localStorage`.
```

---

## ✅ 10. Review Export

### 10.1 Export reviewed comments

```
Update `exportCommentsToCSV()` to include a “resolved” column.

Add a UI option to export either all or just unresolved comments.

Ensure the sidebar filter and export options are in sync.
```

---

## ✅ 11. Final Polish

### 11.1 Add inline styles and accessibility

```
Ensure all UI elements have accessible labels and keyboard navigation.

Use inline CSS for popup and sidebar to minimize install complexity.

Add a minimal help icon or tooltip near controls.
```

---

## ✅ 12. Packaging

### 12.1 Minify and document

```
Use Rollup to output a minified `backchannel.js`.

Add full JSDoc-style comments to all public functions.

Update README with:
- Setup instructions
- Basic usage
- Init config reference
- CSV schema definition
```
