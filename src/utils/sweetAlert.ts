import Swal from 'sweetalert2'

// Simple confirmation utility as alternative to SweetAlert2
export const confirmDelete = (title: string = 'Are you sure?', text: string = 'This action cannot be undone.'): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${title}\n\n${text}`)
    resolve(confirmed)
  })
}

export const showSuccess = (message: string) => {
  Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: message,
    confirmButtonColor: '#28a745',
    confirmButtonText: 'OK'
  })
}

export const showError = (message: string) => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545',
    allowOutsideClick: true,
    allowEscapeKey: true,
    customClass: {
      popup: 'swal2-popup-custom',
      title: 'swal2-title-custom'
    }
  })
}

export const showCustomerRequiredAlert = (): Promise<boolean> => {
  return Swal.fire({
    icon: 'warning',
    title: 'Customer Required!',
    html: `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; color: #ffc107; margin-bottom: 20px;">
          👤
        </div>
        <h4 style="color: #333; margin-bottom: 15px;">Customer Information Required</h4>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          For membership orders, customer information is mandatory. Please select a customer before proceeding.
        </p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
          <strong>Why is this required?</strong><br>
          <small style="color: #666;">Membership orders need to be linked to a specific customer for tracking and billing purposes.</small>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Select Customer',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#007bff',
    cancelButtonColor: '#6c757d',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-popup-custom',
      title: 'swal2-title-custom'
    }
  }).then((result) => {
    return result.isConfirmed
  })
}

export const showMealError = (message: string) => {
  Swal.fire({
    icon: 'error',
    title: 'Meal Selection Error',
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545',
    allowOutsideClick: true,
    allowEscapeKey: true,
    customClass: {
      popup: 'swal2-popup-custom',
      title: 'swal2-title-custom'
    }
  })
}

export const showInfo = (title: string, message: string) => {
  Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonColor: '#17a2b8',
    confirmButtonText: 'OK'
  })
}
