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

export function handleElementClick(event: MouseEvent, targetSelector: string) {
  const clickedEl = event.target as HTMLElement

  if (!clickedEl.matches(targetSelector)) {
    return
  }

  const label = getElementLabel(clickedEl)
  console.log('Element clicked:', { element: clickedEl, label })
}
