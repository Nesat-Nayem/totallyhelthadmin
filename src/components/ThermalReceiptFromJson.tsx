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
      const date = new Date(dateStr)
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
          fontSize: '12px',
          lineHeight: '1.2',
          maxWidth: '300px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          whiteSpace: 'pre-line'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            {data.header.businessName}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '5px' }}>
            {data.header.location}
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ fontSize: '11px', marginBottom: '5px' }}>
            Date : {formatDate(data.header.date)} | Time : {formatTime(data.header.time)}
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}>
            {data.header.reportType}
          </div>
        </div>

        {/* Shift Details */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Cashier:</span>
            <span>{data.shiftDetails.cashier}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Log In Date:</span>
            <span>{formatDate(data.shiftDetails.logInDate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Log In Time:</span>
            <span>{formatTime(data.shiftDetails.logInTime)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Log Out Date:</span>
            <span>{formatDate(data.shiftDetails.logOutDate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Log Out Time:</span>
            <span>{formatTime(data.shiftDetails.logOutTime)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Total Pax:</span>
            <span>{data.shiftDetails.totalPax}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Total Invoice Amount:</span>
            <span>{formatCurrency(data.summary.totalInvoiceAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Total Discount Amount:</span>
            <span>{formatCurrency(data.summary.totalDiscountAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Total EAT SMART AMT:</span>
            <span>{formatCurrency(data.summary.totalEatSmartAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Net Sales Amount:</span>
            <span>{formatCurrency(data.summary.netSalesAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>5% VAT Amount:</span>
            <span>{formatCurrency(data.summary.vatAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>Grand Total:</span>
            <span>{formatCurrency(data.summary.grandTotal)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
        </div>

        {/* Sales Details */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '5px' }}>
            Sales Details
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Restaurant Sales:</span>
            <span>{formatCurrency(data.salesDetails.restaurantSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Membership Meal:</span>
            <span>{formatCurrency(data.salesDetails.membershipMeal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Membership Register:</span>
            <span>{formatCurrency(data.salesDetails.membershipRegister)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
        </div>

        {/* Collection Details */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '5px' }}>
            Collection Details
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Cash Sales Amt:</span>
            <span>{formatCurrency(data.collectionDetails.cashSalesAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Credit Card Amt:</span>
            <span>{formatCurrency(data.collectionDetails.creditCardAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Online Sales Amt:</span>
            <span>{formatCurrency(data.collectionDetails.onlineSalesAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Tawseel Amt:</span>
            <span>{formatCurrency(data.collectionDetails.tawseelAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>Total Collection:</span>
            <span>{formatCurrency(data.collectionDetails.totalCollection)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
        </div>

        {/* Cash Details */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '5px' }}>
            Cash Details
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Total Pay In Amt:</span>
            <span>{formatCurrency(data.cashDetails.totalPayInAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Total Pay Out Amt:</span>
            <span>{formatCurrency(data.cashDetails.totalPayOutAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
        </div>

        {/* Denomination */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '5px' }}>
            Denomination
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          {data.denomination.denominations.map((denom, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>{denom.value}</span>
              <span>X {parseFloat(denom.quantity).toFixed(2)}</span>
              <span>= {formatCurrency(denom.amount)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>Total Amount:</span>
            <span>{formatCurrency(data.denomination.totalAmount)}</span>
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
        </div>

        {/* Difference */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '5px' }}>
            Difference
          </div>
          <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>Total Difference in Cash:</span>
            <span>({formatCurrency(data.difference.totalDifferenceInCash)})</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThermalReceiptFromJson
