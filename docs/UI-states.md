# BackChannel UI States and Sidebar Interaction

This document outlines the required behaviors for the BackChannel (BC) icon and sidebar across both capture and review modes.

## 1. BC Icon States

| State | Description | Appearance | Action on Click |
|-------|-------------|------------|-----------------|
| Inactive | No feedback package matches current page | Greyed out | Show onboarding guidance and prompt to create package |
| Active (Capture) | Feedback package exists and user is in capture mode | Green icon | Open sidebar in capture mode |
| Active (Review) | Feedback package exists and user is in review mode | Green icon | Open sidebar in review mode |

## 2. Capture Mode Flow

- User navigates to the **document root** (typically the welcome or intro page).
- Clicks the grey BC icon, triggering:
  - Onboarding guidance (new window with slides)
  - Detection of single-page vs multi-page content
  - Prompt to create a new feedback package:
    - **Document Name**
    - **Author Name**
    - **Date**
    - **Root Path** (auto-filled from current URL)
- On success, the icon turns green and the sidebar is shown.

## 3. Feedback Capture Behavior

- Sidebar contains:
  - List of existing comments
  - “Capture Feedback” button
- Capture mode:
  - Hover shows highlight over elements
  - Click to select an element OR drag to highlight text
  - Shows **“Add Feedback”** form at top of sidebar
  - Submit or cancel feedback entry
  - ESC key exits capture mode
- Comments are stored in IndexedDB `comments` table

## 4. Review Mode Behavior

- Sidebar regenerates per page
- Comments listed in the sidebar
- Sidebar UI state (filters, sort, etc.) is persisted in localStorage or cookies
- Clickable comment entries:
  - Scroll to location (if on-page)
  - Navigate with timestamp anchor (if on another page)
- Highlight markers are shown inline for feedback on current page
- Links to other pages with unresolved feedback are decorated
- Resolved comments are hidden by default, toggleable

## 5. Comment Resolution

- Comments can be marked “resolved”
- Resolved status is stored in local IndexedDB
- Default behavior: hide resolved items
- Toggle available to show/hide resolved comments

## 6. Data Management

- Each page load:
  - Check `bc_root` and `bc_package` in localStorage
  - If match current URL: load that package
  - Otherwise: search IndexedDBs for matching package, then cache result
- Option to **Delete Feedback Package**:
  - Deletes IndexedDB instance and clears local cache
- No document-wide dashboard
  - Review is performed one page at a time via the sidebar

## 7. Limitations

- Replies to comments are not supported
- Feedback packages must be created from document root for consistency
- Anchor/tag-based comment navigation uses timestamp identifiers