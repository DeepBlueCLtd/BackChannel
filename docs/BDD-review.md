# Behaviour-Driven Test Specification: BackChannel (Review Mode)

This document defines BDD-style test scenarios covering the **Review Mode** of BackChannel, where a document author receives one or more feedback CSVs and uses the plugin to load, display, and manage feedback resolution.

---

## Feature: CSV Import

### Scenario: Load valid feedback CSV
Given the document author has a CSV file of feedback  
When the file is loaded via the "Import Feedback" button  
Then each comment is parsed and anchored to the matching element  
And all imported comments appear in the sidebar  
And a success message is shown

### Scenario: Load CSV with missing fields
Given the CSV is missing one or more required columns  
When the import is attempted  
Then an error message is shown  
And no feedback is imported

### Scenario: Load malformed CSV file
Given the file has invalid CSV syntax  
When the file is loaded  
Then the plugin should fail gracefully  
And log a detailed error to console  
And notify the user of the failure

### Scenario: Load multiple CSVs sequentially
Given two valid feedback CSVs  
When they are loaded one after another  
Then the comments are merged into a single review panel  
And source metadata (filename or reviewer initials) is preserved

---

## Feature: Feedback Display

### Scenario: Show all imported feedback
When feedback is imported  
Then the sidebar lists all feedback entries  
And each entry includes label, text, timestamp, and reviewer (if provided)

### Scenario: Highlight commented elements
Given an element has associated feedback  
When the document loads  
Then a badge or marker is rendered beside the element

### Scenario: Hover shows review summary
When the reviewer hovers over a badge  
Then a tooltip shows a truncated version of the comment

---

## Feature: Filtering and Sorting

### Scenario: Filter by reviewer initials
Given feedback from multiple reviewers  
When a reviewer filter is selected  
Then only matching comments are shown in the sidebar

### Scenario: Sort by timestamp
When the user selects “Sort by Time”  
Then comments are reordered chronologically in the sidebar

---

## Feature: Comment Resolution

### Scenario: Mark comment as resolved
Given a feedback entry in the sidebar  
When the reviewer clicks “Mark Resolved”  
Then the entry is visually updated as resolved  
And it is excluded from the default filter view

### Scenario: Undo comment resolution
When the reviewer clicks “Undo” on a resolved comment  
Then the comment returns to active state  
And is visible in the default comment list

### Scenario: Filter to only unresolved
Given some comments are resolved  
When the reviewer enables the “Unresolved Only” toggle  
Then only unresolved comments are shown

---

## Feature: Export Review State

### Scenario: Export filtered feedback
When a reviewer filters the list (e.g., unresolved only)  
And clicks “Export View”  
Then a CSV file is downloaded with only matching entries

### Scenario: Export with resolution status
When the reviewer clicks “Export All”  
Then the CSV includes a “resolved” column  
Indicating which comments have been addressed

---

## Feature: Error Handling

### Scenario: Feedback element no longer exists
Given a comment refers to an element that no longer exists in the DOM  
When the feedback is loaded  
Then a warning is shown in the sidebar  
And the comment is still listed, marked as “orphaned”

### Scenario: Duplicate entries in imported CSV
When multiple identical comments are loaded  
Then only one is displayed unless deduplication is disabled

---

## Feature: Review State Persistence

### Scenario: Save review status locally
When comments are resolved or filtered  
Then the state is saved to localStorage  
And restored when the page reloads

### Scenario: Clear review data
When the reviewer clicks “Reset Review”  
Then all local state (resolutions, filters, feedback) is cleared  
And the UI resets to initial import state

