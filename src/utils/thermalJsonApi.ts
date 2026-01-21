export interface ThermalReceiptJsonData {
  success: boolean
  statusCode: number
  message: string
  data: {
    header: {
      businessName: string
      location: string
      date: string
      time: string
      reportType: string
    }
    shiftDetails: {
      cashier: string
      logInDate: string
      logInTime: string
      logOutDate: string
      logOutTime: string
      totalPax: number
    }
    summary: {
      totalInvoiceAmount: string
      totalDiscountAmount: string
      totalEatSmartAmount: string
      netSalesAmount: string
      vatAmount: string
      grandTotal: string
    }
    salesDetails: {
      restaurantSales: string
      membershipMeal: string
      membershipRegister: string
    }
    collectionDetails: {
      cashSalesAmount: string
      creditCardAmount: string
      onlineSalesAmount: string
      tawseelAmount: string
      totalCollection: string
    }
    cashDetails: {
      totalPayInAmount: string
      totalPayOutAmount: string
    }
    denomination: {
      denominations: Array<{
        value: string
        quantity: string
        amount: string
      }>
      totalAmount: string
      expectedCashSales: string
      actualCashCount: string
      difference: string
    }
    difference: {
      totalDifferenceInCash: string
    }
    rawData: {
      totalOrders: number
      daySalesData: {
        totalOrders: number
        totalSales: number
        totalDiscount: number
        totalVat: number
        payments: {
          cash: number
          card: number
          online: number
        }
        salesByType: {
          restaurant: number
          online: number
          membership: number
        }
      }
      shiftWiseData: {
        totalOrders: number
        totalSales: number
        totalDiscount: number
        totalVat: number
        payments: {
          cash: number
          card: number
          online: number
        }
        salesByType: {
          restaurant: number
          online: number
          membership: number
        }
      }
      source: string
    }
  }
}

export const fetchThermalReceiptJson = async (date: string): Promise<ThermalReceiptJsonData> => {
  const token = localStorage.getItem('backend_token')
  
  if (!token) {
    throw new Error('Authentication token not found')
  }

  const apiBaseUrl = 'http://localhost:8080/v1/api'
  // const apiBaseUrl = 'http://localhost:5050/v1/api'
  const url = `${apiBaseUrl}/day-close-report/thermal-json/${date}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch thermal receipt JSON: ${response.status} - ${errorText}`)
  }

  const data: ThermalReceiptJsonData = await response.json()
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch thermal receipt data')
  }

  return data
}

export const generateThermalReceiptHtml = (data: ThermalReceiptJsonData['data']): string => {
  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toFixed(2)
  }

  const formatDate = (dateStr: string) => {
    try {
      // Handle DD/MM/YYYY format from API
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/')
        // Create date in MM/DD/YYYY format for JavaScript Date constructor
        const date = new Date(`${month}/${day}/${year}`)
        if (isNaN(date.getTime())) {
          return dateStr // Return original if invalid
        }
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }
      // Fallback for other formats
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        return dateStr
      }
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      // Check if time already has AM/PM
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        // Time already has AM/PM, just return as is
        return timeStr
      }
      
      // Parse 24-hour format and convert to 12-hour with AM/PM
      const [hours, minutes] = timeStr.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeStr
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thermal Receipt</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          line-height: 0.8;
          max-width: 280px;
          margin: 0 auto;
          background-color: white;
          padding: 1px;
          white-space: pre-line;
        }
        .receipt {
          border: 1px solid #000;
          padding: 1px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        .right { text-align: right; }
        .flex { display: flex; justify-content: space-between; }
        .border-top { border-top: 1px solid #000; margin: 0px 0; }
        .section-heading { margin: 0px; padding: 0px; }
        @media print {
          body { 
            font-size: 7px !important; 
            line-height: 0.6 !important; 
            padding: 0px !important; 
            margin: 0px !important;
            page-break-inside: avoid;
          }
          .receipt { 
            padding: 0px !important; 
            border: none !important;
            page-break-inside: avoid;
          }
          .border-top { 
            margin: 0px 0 !important; 
          }
          .section-heading {
            margin: 0px !important;
            padding: 0px !important;
          }
          * {
            page-break-inside: avoid;
            margin: 0px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <!-- Header -->
        <div class="center" style="margin-bottom: 0px;">
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 0px;">
            ${data.header.businessName}
          </div>
          <div style="font-size: 9px; margin-bottom: 0px;">
            ${data.header.location}
          </div>
          <div class="border-top"></div>
          <div style="font-size: 8px; margin-bottom: 0px;">
            Date : ${formatDate(data.header.date)} | Time : ${formatTime(data.header.time)}
          </div>
          <div class="border-top"></div>
          <div class="bold underline" style="margin-bottom: 0px;">
            ${data.header.reportType}
          </div>
        </div>

        <!-- Shift Details -->
        <div style="margin-bottom: 0px;">
          <div class="flex" style="margin-bottom: 0px;">
            <span>Cashier:</span>
            <span>${data.shiftDetails.cashier}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Log In Date:</span>
            <span>${formatDate(data.shiftDetails.logInDate)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Log In Time:</span>
            <span>${formatTime(data.shiftDetails.logInTime)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Log Out Date:</span>
            <span>${formatDate(data.shiftDetails.logOutDate)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Log Out Time:</span>
            <span>${formatTime(data.shiftDetails.logOutTime)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Total Pax:</span>
            <span>${data.shiftDetails.totalPax}</span>
          </div>
          <div class="border-top"></div>
        </div>

        <!-- Summary -->
        <div style="margin-bottom: 0px;">
          <div class="flex" style="margin-bottom: 0px;">
            <span>Total Invoice Amount:</span>
            <span>${formatCurrency(data.summary.totalInvoiceAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Total Discount Amount:</span>
            <span>${formatCurrency(data.summary.totalDiscountAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Total EAT SMART AMT:</span>
            <span>${formatCurrency(data.summary.totalEatSmartAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Net Sales Amount:</span>
            <span>${formatCurrency(data.summary.netSalesAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 2px;">
            <span>5% VAT Amount:</span>
            <span>${formatCurrency(data.summary.vatAmount)}</span>
          </div>
          <div class="border-top"></div>
          <div class="flex bold" style="margin-bottom: 2px;">
            <span>Grand Total:</span>
            <span>${formatCurrency(data.summary.grandTotal)}</span>
          </div>
          <div class="border-top"></div>
        </div>

        <!-- Sales Details -->
        <div style="margin-bottom: 0px;">
          <div class="center bold underline section-heading">
            Sales Details
          </div>
          <div class="border-top"></div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Restaurant Sales:</span>
            <span>${formatCurrency(data.salesDetails.restaurantSales)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Membership Meal:</span>
            <span>${formatCurrency(data.salesDetails.membershipMeal)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Membership Register:</span>
            <span>${formatCurrency(data.salesDetails.membershipRegister)}</span>
          </div>
          <div class="border-top"></div>
        </div>

        <!-- Collection Details -->
        <div style="margin-bottom: 0px;">
          <div class="center bold underline section-heading">
            Collection Details
          </div>
          <div class="border-top"></div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Cash Sales Amt:</span>
            <span>${formatCurrency(data.collectionDetails.cashSalesAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Credit Card Amt:</span>
            <span>${formatCurrency(data.collectionDetails.creditCardAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Online Sales Amt:</span>
            <span>${formatCurrency(data.collectionDetails.onlineSalesAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Tawseel Amt:</span>
            <span>${formatCurrency(data.collectionDetails.tawseelAmount)}</span>
          </div>
          <div class="border-top"></div>
          <div class="flex bold" style="margin-bottom: 0px;">
            <span>Total Collection:</span>
            <span>${formatCurrency(data.collectionDetails.totalCollection)}</span>
          </div>
          <div class="border-top"></div>
        </div>

        <!-- Cash Details -->
        <div style="margin-bottom: 0px;">
          <div class="center bold underline section-heading">
            Cash Details
          </div>
          <div class="border-top"></div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Total Pay In Amt:</span>
            <span>${formatCurrency(data.cashDetails.totalPayInAmount)}</span>
          </div>
          <div class="flex" style="margin-bottom: 0px;">
            <span>Total Pay Out Amt:</span>
            <span>${formatCurrency(data.cashDetails.totalPayOutAmount)}</span>
          </div>
          <div class="border-top"></div>
        </div>

        <!-- Denomination -->
        <div style="margin-bottom: 0px;">
          <div class="center bold underline section-heading">
            Denomination
          </div>
          <div class="border-top"></div>
          ${data.denomination.denominations.map(denom => `
            <div class="flex" style="margin-bottom: 0px;">
              <span>${denom.value}</span>
              <span>X ${parseFloat(denom.quantity).toFixed(2)}</span>
              <span>= ${formatCurrency(denom.amount)}</span>
            </div>
          `).join('')}
          <div class="border-top"></div>
          <div class="flex bold" style="margin-bottom: 0px;">
            <span>Total Amount:</span>
            <span>${formatCurrency(data.denomination.totalAmount)}</span>
          </div>
          <div class="border-top"></div>
        </div>

        <!-- Difference -->
        <div style="margin-bottom: 0px;">
          <div class="center bold underline section-heading">
            Difference
          </div>
          <div class="border-top"></div>
          <div class="flex bold" style="margin-bottom: 0px;">
            <span>Total Difference in Cash:</span>
            <span>(${formatCurrency(data.difference.totalDifferenceInCash)})</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
