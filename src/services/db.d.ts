export class DatabaseService {
  constructor(documentTitle: string)

  readonly isSupported: boolean
  readonly dbName: string

  init(): Promise<boolean>

  // Package store methods
  addPackage(packageData: {
    id: string
    name: string
    version: string
    author: string
    description: string
  }): Promise<string | null>

  getPackage(id: string): Promise<{
    id: string
    name: string
    version: string
    author: string
    description: string
  } | null>

  updatePackage(packageData: {
    id: string
    name: string
    version: string
    author: string
    description: string
  }): Promise<boolean>

  deletePackage(id: string): Promise<boolean>

  // Comment store methods
  addComment(commentData: {
    timestamp: number
    xpath: string
    elementText: string
    feedback: string
    pageUrl: string
    documentTitle: string
    initials?: string
  }): Promise<number | null>

  getComment(timestamp: number): Promise<{
    timestamp: number
    xpath: string
    elementText: string
    feedback: string
    pageUrl: string
    documentTitle: string
    initials?: string
  } | null>

  updateComment(commentData: {
    timestamp: number
    xpath: string
    elementText: string
    feedback: string
    pageUrl: string
    documentTitle: string
    initials?: string
  }): Promise<boolean>

  deleteComment(timestamp: number): Promise<boolean>

  getAllComments(): Promise<Array<{
    timestamp: number
    xpath: string
    elementText: string
    feedback: string
    pageUrl: string
    documentTitle: string
    initials?: string
  }> | null>
}
