// Simple confirmation utility as alternative to SweetAlert2
export const confirmDelete = (title: string = 'Are you sure?', text: string = 'This action cannot be undone.'): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${title}\n\n${text}`)
    resolve(confirmed)
  })
}

export const showSuccess = (message: string) => {
  // This would be replaced with actual SweetAlert2 when available
  console.log('Success:', message)
}

export const showError = (message: string) => {
  // This would be replaced with actual SweetAlert2 when available
  console.error('Error:', message)
}
