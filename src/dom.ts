import { showCommentForm, type CommentFormData } from './ui'
import type { CommentEntry } from './storage'

function getElementLabel(element: HTMLElement): string {
  if (element.textContent) {
    const text = element.textContent.trim().substring(0, 30)
    if (text) {
      return `${element.tagName.toLowerCase()}: '${text}...'`
    }
  }

  const allElements = Array.from(document.querySelectorAll(element.tagName))
  const index = allElements.indexOf(element)
  return `${element.tagName.toLowerCase()}[${index}]`
}

function getCssSelector(el: HTMLElement): string {
  const path = []
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase()
    if (el.id) {
      selector += '#' + el.id
      path.unshift(selector)
      break
    } else {
      let sib: Element | null = el
      let nth = 1
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() == selector) nth++
      }
      if (nth != 1) selector += `:nth-of-type(${nth})`
    }
    path.unshift(selector)
    el = el.parentNode as HTMLElement
  }
  return path.join(' > ')
}

const COMMENTED_ELEMENT_CLASS = 'backchannel-commented-element'
export function clearCommentHighlights() {
  document
    .querySelectorAll(`.${COMMENTED_ELEMENT_CLASS}`)
    .forEach(el => el.classList.remove(COMMENTED_ELEMENT_CLASS))
}

export function highlightCommentedElements(comments: CommentEntry[]) {
  // Clear existing highlights first
  document
    .querySelectorAll(`.${COMMENTED_ELEMENT_CLASS}`)
    .forEach(el => el.classList.remove(COMMENTED_ELEMENT_CLASS))

  comments.forEach(comment => {
    try {
      const el = document.querySelector(comment.selector)
      if (el) {
        el.classList.add(COMMENTED_ELEMENT_CLASS)
      }
    } catch (e) {
      console.warn(`Could not find element for selector: ${comment.selector}`, e)
    }
  })
}

export function handleElementClick(
  event: MouseEvent,
  onCommentSubmit: (label: string, selector: string, data: CommentFormData) => void,
  exitSelectMode: () => void
) {
  const clickedEl = event.target as HTMLElement

  // Clicks are already filtered by the 'select mode' logic,
  // but we do one last check to avoid commenting on the UI.
  if (
    clickedEl.closest('#backchannel-comment-form, #backchannel-sidebar, #backchannel-launch-button')
  ) {
    return
  }

  // A valid element was clicked, so exit select mode.
  exitSelectMode()

  const label = getElementLabel(clickedEl)
  const selector = getCssSelector(clickedEl)

  showCommentForm(clickedEl, data => {
    onCommentSubmit(label, selector, data)
  })
}
