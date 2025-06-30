# Behaviour-Driven Test Specification: BackChannel (Capture Mode)

This document defines behaviour-driven test scenarios in pseudo-code to ensure high code coverage for the BackChannel plugin, taking into account that it must operate on legacy HTML content with **no modifications or special CSS classes**.

---

## Feature: Plugin Initialization

### Scenario: Successful initialization with auto-discovery
Given a static HTML page with standard structural elements  
When `BackChannel.init()` is called with no `targetSelector`  
Then the plugin should allow the user to select arbitrary visible elements  
And the “Add Feedback” button should appear  
And no errors should be logged

### Scenario: Initialization with valid config overrides
When `BackChannel.init()` is called with a tag whitelist (e.g., `['h1', 'p']`)  
Then only those tags should be interactive for feedback  
And a visual indicator (e.g., hover highlight) should be enabled

### Scenario: Initialization fails gracefully
When the plugin is initialized in a browser with no DOM (edge case)  
Then it should log an error but not crash  
And the page should remain usable

---

## Feature: Adding Feedback

### Scenario: User selects an element and adds a comment
Given the user clicks on a visible paragraph element  
When the feedback form appears and the comment is submitted  
Then the comment is stored locally  
And a badge or icon appears next to the element

### Scenario: Feedback on multiple elements
Given the user clicks on multiple elements and submits feedback  
Then each comment should be linked to its respective DOM element  
And shown correctly in the sidebar

### Scenario: Selecting a non-interactive element
When the user clicks an element that is excluded (e.g., `<script>`)  
Then no feedback form should appear  
And the click should be ignored

---

## Feature: Storage and Persistence

### Scenario: Comments persist across page reloads
Given one or more comments are submitted  
When the page is reloaded  
Then the same comments reappear in the sidebar  
And the elements are still marked

### Scenario: Comments are scoped to URL or doc ID
Given comments are submitted on one HTML page  
When another HTML page is opened  
Then no feedback should carry over unless sharing the same `storageKey`

---

## Feature: Export

### Scenario: Export to CSV with legacy DOM references
Given comments have been added to untagged elements  
When the user exports to CSV  
Then each row includes a readable label (e.g., element type and text preview)  
And the CSV can be opened in Excel

### Scenario: Export with no comments
When no comments are stored  
Then export should still trigger a CSV download with only header rows

---

## Feature: Config Options

### Scenario: Custom label function
Given a custom label generator is supplied in the init config  
When a comment is saved  
Then the label in the CSV and UI uses the custom format

---

## Feature: UI/UX

### Scenario: Sidebar toggle
When the user toggles the sidebar open/closed  
Then the layout should adapt without affecting page content

### Scenario: Tooltip on hover
Given a commented element is present  
When the user hovers over the element  
Then a tooltip shows the first line of the comment

---

## Error Handling

### Scenario: localStorage fails
Given storage is unavailable  
When the user submits a comment  
Then an error message should appear  
And the data is not saved

### Scenario: Invalid CSV export state
When the export function fails due to malformed data  
Then a user-visible error is shown  
And no corrupted file is downloaded

---

## Edge Cases

### Scenario: Feedback on elements with no text content
When the user comments on an image or icon-only element  
Then the label should fall back to tag name and index  
And the UI should still show the comment in the sidebar

### Scenario: Multiple comments on one element
Given a user submits two comments on the same paragraph  
Then both comments are shown in thread format under the same anchor

