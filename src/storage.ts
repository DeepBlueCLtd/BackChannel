export interface CommentEntry {
  label: string
  selector: string
  text: string
  timestamp: string
  initials?: string
}

export function saveComment(entry: CommentEntry, storageKey: string): CommentEntry[] {
  const allComments = loadComments(storageKey)
  const updatedComments = [...allComments, entry]
  localStorage.setItem(storageKey, JSON.stringify(updatedComments))
  return updatedComments
}

export function loadComments(storageKey: string): CommentEntry[] {
  const rawData = localStorage.getItem(storageKey)
  if (!rawData) {
    return []
  }
  try {
    const parsed = JSON.parse(rawData)
    // A simple check to see if it's an array of comments
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.error('Error loading comments from localStorage:', error)
    return []
  }
  return []
}
