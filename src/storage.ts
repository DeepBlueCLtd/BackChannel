import { DatabaseService } from './services/db.js'

export interface CommentEntry {
  label: string
  selector: string
  text: string
  timestamp: string
  initials?: string
}

// Map between CommentEntry and DatabaseService comment schema
function mapCommentEntryToDbComment(entry: CommentEntry, documentTitle: string): any {
  return {
    timestamp: parseInt(entry.timestamp, 10) || Date.now(),
    xpath: entry.selector,
    elementText: entry.label,
    feedback: entry.text,
    pageUrl: window.location.pathname,
    documentTitle: documentTitle,
    initials: entry.initials,
  }
}

function mapDbCommentToCommentEntry(dbComment: any): CommentEntry {
  return {
    label: dbComment.elementText,
    selector: dbComment.xpath,
    text: dbComment.feedback,
    timestamp: dbComment.timestamp.toString(),
    initials: dbComment.initials,
  }
}

// Initialize database service
let dbService: DatabaseService | null = null
let dbInitialized = false

function getDbService(): Promise<DatabaseService> {
  if (dbService && dbInitialized) {
    return Promise.resolve(dbService)
  }

  // Extract document title or use default
  const documentTitle = document.title || 'BackChannel Document'

  dbService = new DatabaseService(documentTitle)

  if (!dbService.isSupported) {
    console.warn('IndexedDB is not supported in this browser. Falling back to localStorage.')
    return Promise.reject(new Error('IndexedDB not supported'))
  }

  return (
    dbService
      .init()
      .then((success: boolean) => {
        if (!success) {
          return Promise.reject(new Error('Failed to initialize database'))
        }
        dbInitialized = true
        return dbService as DatabaseService
      })
      // @ts-ignore
      .catch((error: Error) => {
        console.error('Error initializing database:', error)
        return Promise.reject(error)
      })
  )
}

// Fallback to localStorage if IndexedDB is not available
function saveCommentToLocalStorage(entry: CommentEntry, storageKey: string): CommentEntry[] {
  const allComments = loadCommentsFromLocalStorage(storageKey)
  const updatedComments = [...allComments, entry]
  localStorage.setItem(storageKey, JSON.stringify(updatedComments))
  return updatedComments
}

function loadCommentsFromLocalStorage(storageKey: string): CommentEntry[] {
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

export async function saveComment(
  entry: CommentEntry,
  storageKey: string
): Promise<CommentEntry[]> {
  try {
    const db = await getDbService()
    const documentTitle = document.title || 'BackChannel Document'
    const dbComment = mapCommentEntryToDbComment(entry, documentTitle)

    const result = await db.addComment(dbComment)
    if (result === null) {
      throw new Error('Failed to add comment to database')
    }

    return loadComments(storageKey)
  } catch (error) {
    console.warn('Using localStorage fallback for saving comment:', error)
    return saveCommentToLocalStorage(entry, storageKey)
  }
}

export async function loadComments(storageKey: string): Promise<CommentEntry[]> {
  try {
    const db = await getDbService()
    const comments = await db.getAllComments()

    if (comments === null) {
      throw new Error('Failed to load comments from database')
    }

    return comments.map(mapDbCommentToCommentEntry)
  } catch (error) {
    console.warn('Using localStorage fallback for loading comments:', error)
    return loadCommentsFromLocalStorage(storageKey)
  }
}
