# Behaviour-Driven Test Specification: BackChannel – Review Mode (with Feedback Packages)

This document defines the BDD test cases for the Review Mode of BackChannel, with support for loading and managing multi-page feedback.

---

## Feature: Importing Feedback

### Scenario: Load a CSV file with feedback for the current document
Given the user opens Review Mode  
And selects a valid CSV file  
When the file is parsed  
Then the comments are displayed in the sidebar  
And the document name from the CSV is recorded in memory  
And the plugin associates comments with the correct page URLs

### Scenario: Load multiple CSVs for the same document
Given the user imports multiple CSV files with matching document names  
When each file is parsed  
Then all comments are merged in the view  
And each comment retains its original page metadata

### Scenario: Load a CSV with a different document name
When the document name in the imported CSV differs from the current page’s feedback package  
Then the plugin warns the user or isolates the comments in a separate session

---

## Feature: Page-Based and Document-Wide Toggle

### Scenario: View only current page comments
Given comments from multiple pages are loaded  
When the user selects “This Page Only”  
Then the sidebar filters comments to the current page URL  
And only local elements are highlighted

### Scenario: View document-wide comments
Given comments from multiple pages are loaded  
When the user selects “Entire Document”  
Then the sidebar lists comments from all pages  
And each comment shows its page title and link  
And only comments for the current page are highlighted

---

## Feature: Feedback Resolution

### Scenario: Mark a comment as resolved
When the user clicks “Mark Resolved” on a comment  
Then the comment’s status is updated in memory  
And a visual indicator shows it as resolved  
And the status will be included in the next CSV export

### Scenario: Reopen a resolved comment
Given a comment is marked as resolved  
When the user clicks “Reopen”  
Then the comment is marked as unresolved  
And returns to active view

---

## Feature: Navigation and Linking

### Scenario: Navigate to the page of a comment
Given the sidebar shows an off-page comment  
When the user clicks its link  
Then the browser navigates to that comment’s page URL

### Scenario: Comments on current page are linked to elements
When the current page has matching feedback  
Then the plugin attempts to highlight the commented element  
And if not found, shows a “missing element” icon in the sidebar

---

## Feature: Export Reviewed Feedback

### Scenario: Export current page comments
When the user selects “Export This Page”  
Then a CSV is generated with comments only from the current page  
And includes their resolution state and metadata

### Scenario: Export full document feedback
When the user selects “Export Entire Document”  
Then a CSV is generated with comments from all pages  
And includes page URL, title, label, and resolution

---

## Feature: Error Handling

### Scenario: Malformed CSV file
When the user tries to import a malformed CSV  
Then the plugin displays an error  
And no comments are imported

### Scenario: Missing required metadata
When a row is missing a required field (e.g., Page URL or Text)  
Then the row is skipped  
And a warning is shown or logged

---

## Feature: UI and Sidebar

### Scenario: Filter comments by resolution
When the user toggles “Show Resolved”  
Then resolved comments are included or excluded from the view accordingly

### Scenario: Sort comments by page, timestamp, or status
When the user selects a sort option  
Then the sidebar reorders the visible comments

