import type { CommentEntry } from './storage'

export function updateLaunchButton(count: number) {
  const button = document.getElementById('backchannel-launch-button')
  if (button) {
    if (count > 0) {
      button.textContent = `BC (${count})`
    } else {
      button.textContent = 'BC'
    }
  }
}

export function createLaunchButton(onClick: () => void) {
  const button = document.createElement('button')
  button.id = 'backchannel-launch-button'
  button.textContent = 'BC'
  button.style.position = 'fixed'
  button.style.top = '20px'
  button.style.right = '20px'
  button.style.width = '50px'
  button.style.height = '50px'
  button.style.borderRadius = '50%'
  button.style.backgroundColor = '#007bff'
  button.style.color = 'white'
  button.style.border = 'none'
  button.style.fontSize = '20px'
  button.style.fontWeight = 'bold'
  button.style.cursor = 'pointer'
  button.style.zIndex = '10001'

  button.onclick = onClick
  document.body.appendChild(button)
}

export function renderSidebar(
  comments: CommentEntry[],
  onCommentClick: (entry: CommentEntry) => void,
  onProvideFeedbackClick: () => void,
  onCancelClick: () => void,
  onExportClick: () => void
): HTMLElement {
  const existingSidebar = document.querySelector('#backchannel-sidebar')
  if (existingSidebar) {
    existingSidebar.remove()
  }

  const sidebar = document.createElement('div')
  sidebar.id = 'backchannel-sidebar'
  sidebar.style.position = 'fixed'
  sidebar.style.right = '0'
  sidebar.style.top = '0'
  sidebar.style.width = '300px'
  sidebar.style.height = '100%'
  sidebar.style.backgroundColor = '#f9f9f9'
  sidebar.style.borderLeft = '1px solid #ccc'
  sidebar.style.padding = '10px'
  sidebar.style.zIndex = '9999'
  sidebar.style.overflowY = 'auto'
  sidebar.style.display = 'none' // Hidden by default
  sidebar.style.boxSizing = 'border-box'

  const title = document.createElement('h3')
  title.textContent = 'Comments'
  title.style.marginTop = '0'
  sidebar.appendChild(title)

  const buttonContainer = document.createElement('div')
  buttonContainer.style.padding = '10px 0'
  buttonContainer.style.borderTop = '1px solid #ccc'

  const provideFeedbackButton = document.createElement('button')
  provideFeedbackButton.id = 'backchannel-provide-feedback'
  provideFeedbackButton.textContent = 'Provide Feedback'
  provideFeedbackButton.onclick = onProvideFeedbackClick
  buttonContainer.appendChild(provideFeedbackButton)

  const exportButton = document.createElement('button')
  exportButton.textContent = 'Export CSV'
  exportButton.onclick = onExportClick
  buttonContainer.appendChild(exportButton)

  const cancelButton = document.createElement('button')
  cancelButton.id = 'backchannel-cancel-select-mode'
  cancelButton.textContent = 'Cancel'
  cancelButton.onclick = onCancelClick
  cancelButton.style.display = 'none' // Initially hidden
  buttonContainer.appendChild(cancelButton)

  sidebar.appendChild(buttonContainer)

  if (comments.length === 0) {
    const noComments = document.createElement('p')
    noComments.textContent = 'No comments yet.'
    sidebar.appendChild(noComments)
  } else {
    const list = document.createElement('ul')
    list.style.listStyle = 'none'
    list.style.padding = '0'
    list.style.margin = '0'

    comments.forEach(comment => {
      const listItem = document.createElement('li')
            listItem.setAttribute('data-timestamp', comment.timestamp)
      listItem.style.padding = '8px'
      listItem.style.borderBottom = '1px solid #eee'
      listItem.style.cursor = 'pointer'

      const label = document.createElement('div')
      label.textContent = comment.label
      label.style.fontWeight = 'bold'
      label.style.marginBottom = '4px'

      const timestamp = document.createElement('div')
      timestamp.textContent = new Date(comment.timestamp).toLocaleString()
      timestamp.style.fontSize = '0.8em'
      timestamp.style.color = '#666'
      
      listItem.appendChild(label)
      listItem.appendChild(timestamp)

      listItem.onclick = () => onCommentClick(comment)
      list.appendChild(listItem)
    })
        sidebar.appendChild(list)
  }

  document.body.appendChild(sidebar)
  return sidebar
}

export interface CommentFormData {
  comment: string
  initials?: string
}

export function showCommentForm(
  targetEl: HTMLElement,
  requireInitials: boolean,
  onSubmit: (data: CommentFormData) => void
) {
  // Remove any existing form
  const existingForm = document.querySelector('#backchannel-comment-form')
  if (existingForm) {
    existingForm.remove()
  }

  const form = document.createElement('form')
  form.id = 'backchannel-comment-form'
  form.style.position = 'absolute'
  form.style.border = '1px solid #ccc'
  form.style.background = '#fff'
  form.style.zIndex = '10000'
  form.style.resize = 'both'
  form.style.overflow = 'hidden'

  const header = document.createElement('div')
  header.textContent = 'Add Comment'
  header.style.padding = '8px 10px'
  header.style.cursor = 'move'
  header.style.backgroundColor = '#f1f1f1'
  header.style.borderBottom = '1px solid #ccc'
  form.appendChild(header)

  const container = document.createElement('div')
  container.style.padding = '10px'
  form.appendChild(container)

  const rect = targetEl.getBoundingClientRect()
  form.style.top = `${window.scrollY + rect.bottom}px`
  form.style.left = `${window.scrollX + rect.left}px`

  const commentLabel = document.createElement('label')
  commentLabel.innerText = 'Comment:'
  const commentTextarea = document.createElement('textarea')
  commentTextarea.name = 'comment'
  commentTextarea.required = true
  commentLabel.append(commentTextarea)

  container.appendChild(commentLabel)

  let initialsInput: HTMLInputElement | undefined
  if (requireInitials) {
    const initialsLabel = document.createElement('label')
    initialsLabel.innerText = 'Initials:'
    initialsInput = document.createElement('input')
    initialsInput.type = 'text'
    initialsInput.name = 'initials'
    initialsInput.required = true
    initialsLabel.append(initialsInput)
    container.appendChild(initialsLabel)
  }

  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.innerText = 'Submit'

  const cancelButton = document.createElement('button')
  cancelButton.type = 'button'
  cancelButton.innerText = 'Cancel'
  cancelButton.onclick = () => form.remove()

  const buttonGroup = document.createElement('div')
  buttonGroup.append(submitButton, cancelButton)
  container.appendChild(buttonGroup)

  // Make the form draggable
  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  header.onmousedown = (e) => {
    isDragging = true
    offsetX = e.clientX - form.offsetLeft
    offsetY = e.clientY - form.offsetTop
    document.onmousemove = (e) => {
      if (isDragging) {
        form.style.left = `${e.clientX - offsetX}px`
        form.style.top = `${e.clientY - offsetY}px`
      }
    }
    document.onmouseup = () => {
      isDragging = false
      document.onmousemove = null
      document.onmouseup = null
    }
  }

  form.onsubmit = (event) => {
    event.preventDefault()
    const formData: CommentFormData = {
      comment: commentTextarea.value,
      initials: initialsInput?.value
    }
    onSubmit(formData)
    form.remove()
  }

  document.body.appendChild(form)
  commentTextarea.focus()
}
