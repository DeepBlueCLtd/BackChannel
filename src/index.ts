export interface BackChannelConfig {
  requireInitials: boolean
  storageKey: string
}

import { handleElementClick } from './dom'
import { loadComments, saveComment, type CommentEntry } from './storage'
import { createLaunchButton, renderSidebar, type CommentFormData } from './ui'

const BackChannel = {
  init: (config: BackChannelConfig) => {
    console.log('BackChannel initialized with config:', config)

    let isSelectModeActive = false
    let sidebarEl: HTMLElement | null = null
    let highlightedEl: HTMLElement | null = null

    const style = document.createElement('style')
    style.textContent = `
      .backchannel-highlight {
        outline: 2px dashed #007bff !important;
        cursor: crosshair !important;
      }
    `
    document.head.appendChild(style)

    function highlightElement(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (target === highlightedEl || target.closest('#backchannel-comment-form, #backchannel-sidebar, #backchannel-launch-button')) {
        return
      }
      unhighlightElement()
      highlightedEl = target
      highlightedEl.classList.add('backchannel-highlight')
    }

    function unhighlightElement() {
      if (highlightedEl) {
        highlightedEl.classList.remove('backchannel-highlight')
        highlightedEl = null
      }
    }

    function enterSelectMode() {
      isSelectModeActive = true
      document.addEventListener('mouseover', highlightElement)
      document.addEventListener('mouseout', unhighlightElement)
      if (sidebarEl) {
        const provideFeedbackButton = sidebarEl.querySelector(
          '#backchannel-provide-feedback'
        ) as HTMLElement
        const cancelButton = sidebarEl.querySelector(
          '#backchannel-cancel-select-mode'
        ) as HTMLElement
        if (provideFeedbackButton) provideFeedbackButton.style.display = 'none'
        if (cancelButton) cancelButton.style.display = 'inline-block'
      }
    }

    function exitSelectMode() {
      isSelectModeActive = false
      unhighlightElement()
      document.removeEventListener('mouseover', highlightElement)
      document.removeEventListener('mouseout', unhighlightElement)
      if (sidebarEl) {
        const provideFeedbackButton = sidebarEl.querySelector(
          '#backchannel-provide-feedback'
        ) as HTMLElement
        const cancelButton = sidebarEl.querySelector(
          '#backchannel-cancel-select-mode'
        ) as HTMLElement
        if (provideFeedbackButton) provideFeedbackButton.style.display = 'inline-block'
        if (cancelButton) cancelButton.style.display = 'none'
      }
    }

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
      if (sidebarEl) sidebarEl.remove()
      sidebarEl = renderSidebar(
        allComments,
        onCommentClick,
        enterSelectMode,
        exitSelectMode
      )
      sidebarEl.style.display = 'block'
    }

    function toggleSidebar() {
      if (!sidebarEl) {
        const initialComments = loadComments(config.storageKey)
        sidebarEl = renderSidebar(
          initialComments,
          onCommentClick,
          enterSelectMode,
          exitSelectMode
        )
      }
      if (sidebarEl) {
        const isVisible = sidebarEl.style.display !== 'none'
        sidebarEl.style.display = isVisible ? 'none' : 'block'
        if (isVisible) {
          exitSelectMode()
        }
      }
    }

    createLaunchButton(toggleSidebar)

    document.addEventListener('click', (event) => {
      if (isSelectModeActive) {
        handleElementClick(event, config.requireInitials, onCommentSubmit, exitSelectMode)
      }
    })
  }
}

export default BackChannel
