export interface BackChannelConfig {
  requireInitials: boolean
  storageKey: string
}

import { handleElementClick } from './dom'
import { loadComments, saveComment, type CommentEntry } from './storage'
import { renderSidebar, type CommentFormData } from './ui'

const BackChannel = {
  init: (config: BackChannelConfig) => {
    console.log('BackChannel initialized with config:', config)

    

    function onCommentClick(comment: CommentEntry) {
      console.log('Sidebar comment clicked:', comment)
      const el = document.querySelector(comment.selector)
      if (el) {
        ;(el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    function onCommentSubmit(
      label: string,
      selector: string,
      data: CommentFormData
    ) {
      const newComment: CommentEntry = {
        label,
        selector,
        text: data.comment,
        timestamp: new Date().toISOString(),
        initials: data.initials
      }
      const allComments = saveComment(newComment, config.storageKey)
      renderSidebar(allComments, onCommentClick)
    }

    // Load existing comments and render sidebar
    const initialComments = loadComments(config.storageKey)
    renderSidebar(initialComments, onCommentClick)

    document.addEventListener('click', (event) => {
      handleElementClick(event, config.requireInitials, onCommentSubmit)
    })
  }
}

export default BackChannel
