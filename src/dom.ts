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

import type { CommentFormData } from './ui'

export function handleElementClick(
  event: MouseEvent,
  requireInitials: boolean,
  onCommentSubmit: (label: string, selector: string, data: CommentFormData) => void
) {
  const clickedEl = event.target as HTMLElement

  // Prevent clicks on the plugin's own UI
  if (clickedEl.closest('#backchannel-comment-form, #backchannel-sidebar')) {
    return
  }

  const label = getElementLabel(clickedEl)
  const selector = getCssSelector(clickedEl)

  showCommentForm(clickedEl, requireInitials, (data) => {
    onCommentSubmit(label, selector, data)
  })
}
