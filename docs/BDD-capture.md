# Behaviour-Driven Test Specification: BackChannel – Capture Mode (with Feedback Packages)

This document defines the BDD test cases for the Capture Mode of BackChannel, including support for multi-page feedback via feedback packages.

---

## Feature: Feedback Package Initialization

### Scenario: Create a new feedback package
Given the user is on the welcome or introduction page  
When the user clicks “Create Feedback Package”  
Then a dialog appears showing the current folder-based URL stem  
And a default document name from the page `<title>`  
And the user can confirm or edit the name and URL prefix  
And the system stores this package info in IndexedDB

### Scenario: Feedback package already exists
Given the current page URL matches an existing feedback package prefix  
When the page loads  
Then the plugin connects to the existing feedback package database  
And all new comments will be associated with that package

---

## Feature: Adding Feedback

### Scenario: Add a comment to a valid element
Given the user clicks on a visible DOM element  
When the comment form appears and is submitted  
Then the comment is saved to the IndexedDB `comments` table  
And includes metadata: page URL, page title, document name, timestamp, etc.  
And the element is visually marked with a feedback badge  
And the comment appears in the sidebar

### Scenario: Add feedback to another page in the same package
Given a feedback package has already been created  
And the user navigates to another page whose URL contains the URL snippet 
When the user adds a comment  
Then the comment is added to the same feedback package in IndexedDB

### Scenario: Attempt to add feedback without a package
Given no feedback package is active  
When the user tries to add a comment  
Then the system shows a warning prompting the user to create a feedback package first

---

## Feature: Local Storage and Persistence

### Scenario: Feedback persists across page reload
Given the user has added comments to a page in a package  
When the page reloads  
Then the same comments are shown in the sidebar  
And previously commented elements are marked

### Scenario: Comments are isolated to their feedback package
Given two feedback packages exist with different URL prefixes  
When the user navigates between them  
Then only the comments associated with the current package and page are shown

---

## Feature: CSV Export

### Scenario: Export current page feedback
When the user clicks “Export Feedback”  
Then a CSV is downloaded containing only comments from the current page  
And each comment row includes: document name, page title, page URL, element label, text, timestamp, initials

### Scenario: Export document-wide feedback (optional)
When the user selects “Export Entire Document”  
Then the CSV includes comments from all pages under the same feedback package  
And each row includes metadata to identify its page

---

## Feature: Error Handling

### Scenario: IndexedDB unavailable
Given browser storage is blocked or fails  
When the user tries to create a feedback package or add a comment  
Then an error message is shown  
And the action is aborted safely

### Scenario: Invalid package name or URL prefix
When the user enters invalid input in the “Create Feedback Package” dialog  
Then the system prevents confirmation  
And highlights the invalid fields

---

## Feature: Sidebar and UI

### Scenario: Sidebar shows current page comments
When the sidebar is opened  
Then it lists all comments for the current page  
With label, initials (if configured), and timestamp

### Scenario: Comment on this page vs other pages
Given multiple comments exist across multiple pages  
When the user views the sidebar in Capture Mode  
Then only comments for the current page are shown  
And the comment count reflects only the visible page

