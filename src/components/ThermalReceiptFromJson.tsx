'use client'
import React from 'react'

interface ThermalReceiptData {
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
  rawData?: {
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

interface ThermalReceiptFromJsonProps {
  data: ThermalReceiptData
  onPrint?: () => void
  onDownload?: () => void
}

const ThermalReceiptFromJson: React.FC<ThermalReceiptFromJsonProps> = ({ 
  data, 
  onPrint, 
  onDownload 
}) => {
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

  return (
    <div className="thermal-receipt-container">
      <div 
        className="thermal-receipt-content"
        style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '9px',
          lineHeight: '0.8',
          maxWidth: '280px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '1px',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          whiteSpace: 'pre-line'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '0px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '0px' }}>
            {data.header.businessName}
          </div>
          <div style={{ fontSize: '9px', marginBottom: '0px' }}>
            {data.header.location}
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '0px 0' }}></div>
          <div style={{ fontSize: '8px', marginBottom: '0px' }}>
            Date : {formatDate(data.header.date)} | Time : {formatTime(data.header.time)}
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '0px 0' }}></div>
          <div style={{ fontSize: '9px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '0px' }}>
            {data.header.reportType}
          </div>
        </div>

        {/* Shift Details */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Cashier:</span>
            <span>{data.shiftDetails.cashier}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Log In Date:</span>
            <span>{formatDate(data.shiftDetails.logInDate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Log In Time:</span>
            <span>{formatTime(data.shiftDetails.logInTime)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Log Out Date:</span>
            <span>{formatDate(data.shiftDetails.logOutDate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Log Out Time:</span>
            <span>{formatTime(data.shiftDetails.logOutTime)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Total Pax:</span>
            <span>{data.shiftDetails.totalPax}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Total Invoice Amount:</span>
            <span>{formatCurrency(data.summary.totalInvoiceAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Total Discount Amount:</span>
            <span>{formatCurrency(data.summary.totalDiscountAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Total EAT SMART AMT:</span>
            <span>{formatCurrency(data.summary.totalEatSmartAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Net Sales Amount:</span>
            <span>{formatCurrency(data.summary.netSalesAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>5% VAT Amount:</span>
            <span>{formatCurrency(data.summary.vatAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px', fontWeight: 'bold' }}>
            <span>Grand Total:</span>
            <span>{formatCurrency(data.summary.grandTotal)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
        </div>

        {/* Sales Details */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', margin: '0px', padding: '0px' }}>
            Sales Details
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Restaurant Sales:</span>
            <span>{formatCurrency(data.salesDetails.restaurantSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Membership Meal:</span>
            <span>{formatCurrency(data.salesDetails.membershipMeal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Membership Register:</span>
            <span>{formatCurrency(data.salesDetails.membershipRegister)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
        </div>

        {/* Collection Details */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', margin: '0px', padding: '0px' }}>
            Collection Details
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Cash Sales Amt:</span>
            <span>{formatCurrency(data.collectionDetails.cashSalesAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Credit Card Amt:</span>
            <span>{formatCurrency(data.collectionDetails.creditCardAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Online Sales Amt:</span>
            <span>{formatCurrency(data.collectionDetails.onlineSalesAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Tawseel Amt:</span>
            <span>{formatCurrency(data.collectionDetails.tawseelAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px', fontWeight: 'bold' }}>
            <span>Total Collection:</span>
            <span>{formatCurrency(data.collectionDetails.totalCollection)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
        </div>

        {/* Cash Details */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', margin: '0px', padding: '0px' }}>
            Cash Details
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Total Pay In Amt:</span>
            <span>{formatCurrency(data.cashDetails.totalPayInAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
            <span>Total Pay Out Amt:</span>
            <span>{formatCurrency(data.cashDetails.totalPayOutAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
        </div>

        {/* Denomination */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', margin: '0px', padding: '0px' }}>
            Denomination
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          {data.denomination.denominations.map((denom, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px' }}>
              <span>{denom.value}</span>
              <span>X {parseFloat(denom.quantity).toFixed(2)}</span>
              <span>= {formatCurrency(denom.amount)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px', fontWeight: 'bold' }}>
            <span>Total Amount:</span>
            <span>{formatCurrency(data.denomination.totalAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
        </div>

        {/* Difference */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', margin: '0px', padding: '0px' }}>
            Difference
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '1px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0px', fontWeight: 'bold' }}>
            <span>Total Difference in Cash:</span>
            <span>({formatCurrency(data.difference.totalDifferenceInCash)})</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThermalReceiptFromJson
