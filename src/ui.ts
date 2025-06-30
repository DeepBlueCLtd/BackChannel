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
  form.style.padding = '10px'
  form.style.zIndex = '10000'

  const rect = targetEl.getBoundingClientRect()
  form.style.top = `${window.scrollY + rect.bottom}px`
  form.style.left = `${window.scrollX + rect.left}px`

  const commentLabel = document.createElement('label')
  commentLabel.innerText = 'Comment:'
  const commentTextarea = document.createElement('textarea')
  commentTextarea.name = 'comment'
  commentTextarea.required = true
  commentLabel.append(commentTextarea)

  form.appendChild(commentLabel)

  let initialsInput: HTMLInputElement | undefined
  if (requireInitials) {
    const initialsLabel = document.createElement('label')
    initialsLabel.innerText = 'Initials:'
    initialsInput = document.createElement('input')
    initialsInput.type = 'text'
    initialsInput.name = 'initials'
    initialsInput.required = true
    initialsLabel.append(initialsInput)
    form.appendChild(initialsLabel)
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
  form.appendChild(buttonGroup)

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
