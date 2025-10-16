// Thermal Print Utility Functions

export const printThermalReceipt = (receiptType: 'customer' | 'kitchen') => {
  const printSingleReceipt = (type: 'customer' | 'kitchen') => {
    const receiptElement = document.getElementById(`thermal-receipt-${type}`)
    if (!receiptElement) {
      console.error(`Thermal receipt element not found: thermal-receipt-${type}`)
      return
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      console.error('Failed to open print window')
      return
    }

    // Get the receipt content
    const receiptContent = receiptElement.innerHTML

    // Write the thermal receipt HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Receipt - ${type.toUpperCase()}</title>
          <style>
            @media print {
              @page {
                size: 80mm 200mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                line-height: 1.0;
                color: black;
                background: white;
              }
              .thermal-receipt {
                width: 100% !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 2px !important;
                border: none !important;
                background: white !important;
              }
              .thermal-receipt * {
                color: black !important;
                background: white !important;
                font-family: 'Courier New', monospace !important;
              }
              hr {
                border: none !important;
                border-top: 1px dashed #000 !important;
                margin: 3px 0 !important;
              }
              .logo-circle {
                border: 2px dashed #000 !important;
                border-radius: 50% !important;
                width: 60px !important;
                height: 60px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 auto 3px auto !important;
                padding: 3px !important;
              }
            }
            body {
              margin: 0;
              padding: 2px;
              font-family: 'Courier New', monospace;
              font-size: 10px;
              line-height: 1.0;
              background: white;
              color: black;
            }
            .thermal-receipt {
              width: 300px;
              margin: 0 auto;
              background: white;
              color: black;
            }
            hr {
              border: none;
              border-top: 1px dashed #000;
              margin: 3px 0;
            }
            .logo-circle {
              border: 2px dashed #000;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin: 0 auto 3px auto;
              padding: 3px;
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `)

    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  // Print single receipt
  printSingleReceipt(receiptType)
}
