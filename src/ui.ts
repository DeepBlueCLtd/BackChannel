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
