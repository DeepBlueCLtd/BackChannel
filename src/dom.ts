function getElementLabel(element: HTMLElement): string {
  if (element.textContent) {
    const text = element.textContent.trim().substring(0, 30)
    if (text) {
      return `${element.tagName.toLowerCase()}: \'${text}...\''`
    }
  }

  const allElements = Array.from(document.querySelectorAll(element.tagName))
  const index = allElements.indexOf(element)
  return `${element.tagName.toLowerCase()}[${index}]`
}

import { showCommentForm } from './ui'
import { saveComment, type CommentEntry } from './storage'

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

export function handleElementClick(
  event: MouseEvent,
  targetSelector: string,
  requireInitials: boolean,
  storageKey: string
) {
  const clickedEl = event.target as HTMLElement

  if (!clickedEl.matches(targetSelector)) {
    return
  }

  const label = getElementLabel(clickedEl)
  const selector = getCssSelector(clickedEl)

  showCommentForm(clickedEl, requireInitials, (data) => {
    const newComment: CommentEntry = {
      label,
      selector,
      text: data.comment,
      timestamp: new Date().toISOString(),
      initials: data.initials
    }
    const allComments = saveComment(newComment, storageKey)
    console.log('Comment saved. All comments:', allComments)
  })
}
