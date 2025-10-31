'use client'

import React from 'react'

interface ThermalReceiptProps {
  orderData: any
  receiptType: 'customer' | 'kitchen'
}

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ orderData, receiptType }) => {
  const getCurrentDateTime = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  // Calculate VAT (5%)
  const calculateVAT = (amount: number) => {
    return (amount * 5) / 100
  }

  // Customer Receipt (TAX INVOICE)
  const renderCustomerReceipt = () => (
    <div 
      id="thermal-receipt-customer"
      className="thermal-receipt customer-receipt" 
      style={{
        width: '300px',
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        lineHeight: '1.1',
        padding: '5px',
        backgroundColor: 'white',
        color: 'black',
        margin: '0 auto'
      }}
    >
      {/* Header with Logo */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div className="logo-circle" style={{ 
          border: '2px dashed #000',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 8px auto',
          padding: '8px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '3px', fontWeight: 'bold' }}>🍴</div>
          <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center' }}>Totally Healthy</div>
          <div style={{ fontSize: '6px', textAlign: 'center' }}>EAT CLEAN LIVE HEALTHY</div>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>TAX INVOICE</div>
      </div>

      {/* Company Info */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>TOTALLY HEALTHY</div>
        <div>Company Name AL AKL AL SAHI</div>
        <div>Tel 065392229 / 509632223</div>
        <div style={{ fontWeight: 'bold' }}>TRN : 100512693100003</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Bill Info */}
      <div style={{ marginBottom: '10px', fontSize: '10px' }}>
        <div>Date : {getCurrentDateTime()}</div>
        <div>BillNo: {orderData?.invoiceNo || orderData?.orderNo || 'N/A'}</div>
        <div>Membership</div>
        {orderData?.membershipData?.userId && typeof orderData.membershipData.userId === 'object' && (() => {
          const userId = orderData.membershipData.userId as any
          return (
            <>
              <div>User: {userId.name || 'N/A'}</div>
              {userId.phone && <div>Phone: {userId.phone}</div>}
            </>
          )
        })()}
      </div>
      
      {/* Customer Details Section */}
      {orderData?.membershipData?.userId && typeof orderData.membershipData.userId === 'object' && (() => {
        const userId = orderData.membershipData.userId as any
        const hasAddress = userId.address1 || userId.address || userId.address2 || userId.email
        if (!hasAddress) return null
        return (
          <>
            <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />
            <div style={{ marginBottom: '10px', fontSize: '10px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>CUST. NAME : {userId.name || 'N/A'}</div>
              {(userId.address1 || userId.address) && <div>Address 1 {userId.address1 || userId.address}</div>}
              {userId.address2 && <div>Address 2 {userId.address2}</div>}
              {userId.phone && <div>MOBILE NO : {userId.phone}</div>}
              {userId.email && <div>Email: {userId.email}</div>}
            </div>
          </>
        )
      })()}

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Items Header (no Amount column for membership customer) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 'bold' }}>
        <div style={{ width: '70%' }}>Items</div>
        <div style={{ width: '30%', textAlign: 'right' }}>Qty</div>
      </div>

      {/* Items */}
      {orderData?.selectedProducts && Object.entries(orderData.selectedProducts).map(([uniqueId, product]: [string, any], index: number) => {
        const itemOptions = orderData?.itemOptions?.[uniqueId] || []
        const mealTypeLabel = product.mealType 
          ? product.mealType.charAt(0).toUpperCase() + product.mealType.slice(1)
          : ''
        return (
          <div key={index} style={{ marginBottom: '2px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '70%', wordWrap: 'break-word' }}>
                {product.title || product.name}
                {mealTypeLabel && ` - ${mealTypeLabel}`}
              </div>
              <div style={{ width: '30%', textAlign: 'right' }}>{product.qty}</div>
            </div>
            {itemOptions.length > 0 && (
              <div style={{ marginLeft: '10px', fontSize: '9px', color: '#666' }}>
                {itemOptions.map((optionName: string, optIndex: number) => (
                  <div key={optIndex} style={{ marginBottom: '1px' }}>+ {optionName}</div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Simplified Membership Summary */}
      {orderData?.membershipData && (
        <div style={{ marginBottom: '8px', fontSize: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <div>Total Consumed:</div>
            <div>{orderData.membershipData.consumedMeals || 0}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <div>Current Consumed:</div>
            <div>{orderData?.mealsToConsume || 0}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <div>Total Remaining:</div>
            <div>{orderData.membershipData.remainingMeals || 0}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        Thank You & Come Again
      </div>
    </div>
  )

  // Kitchen Receipt (NEW ORDER)
  const renderKitchenReceipt = () => (
    <div 
      id="thermal-receipt-kitchen"
      className="thermal-receipt kitchen-receipt" 
      style={{
        width: '300px',
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        lineHeight: '1.1',
        padding: '5px',
        backgroundColor: 'white',
        color: 'black',
        margin: '0 auto'
      }}
    >
      {/* Header with Logo */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div className="logo-circle" style={{ 
          border: '2px dashed #000',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 6px auto',
          padding: '6px'
        }}>
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>🍴</div>
          <div style={{ fontSize: '8px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.1' }}>Totally<br/>Healthy</div>
          <div style={{ fontSize: '5px', textAlign: 'center', marginTop: '2px', lineHeight: '1' }}>EAT CLEAN</div>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' }}>NEW ORDER</div>
        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>KITCHEN 1</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Company Info */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>TOTALLY HEALTHY</div>
        <div style={{ fontSize: '9px' }}>Company Name AL AKL AL SAHI</div>
        <div style={{ fontSize: '9px' }}>Tel: 065392229 / 509632223</div>
        <div style={{ fontWeight: 'bold', fontSize: '9px' }}>TRN : 100512693100003</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Order Type */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>MEMBERSHIP MEAL</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Order Info */}
      <div style={{ marginBottom: '10px', fontSize: '10px' }}>
        <div>Date : {getCurrentDateTime()}</div>
        {orderData?.membershipData?.userId && typeof orderData.membershipData.userId === 'object' && (
          <>
            <div>Member: {orderData.membershipData.userId.name || 'N/A'}</div>
          </>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Items Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 'bold' }}>
        <div style={{ width: '20%' }}>Qty</div>
        <div style={{ width: '80%' }}>Item</div>
      </div>

      {/* Items */}
      {orderData?.selectedProducts && Object.entries(orderData.selectedProducts).map(([uniqueId, product]: [string, any], index: number) => {
        const itemOptions = orderData?.itemOptions?.[uniqueId] || []
        const mealTypeLabel = product.mealType 
          ? product.mealType.charAt(0).toUpperCase() + product.mealType.slice(1)
          : ''
        return (
          <div key={index} style={{ marginBottom: '4px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '20%', fontWeight: 'bold' }}>{product.qty}</div>
              <div style={{ width: '80%', wordWrap: 'break-word' }}>
                {product.title || product.name}
                {mealTypeLabel && ` (${mealTypeLabel})`}
              </div>
            </div>
            {itemOptions.length > 0 && (
              <div style={{ marginLeft: '25px', fontSize: '9px', color: '#666' }}>
                {itemOptions.map((optionName: string, optIndex: number) => (
                  <div key={optIndex} style={{ marginBottom: '1px' }}>+ {optionName}</div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* User Details (instead of consumption details) */}
      {orderData?.membershipData?.userId && typeof orderData.membershipData.userId === 'object' && (() => {
        const userId = orderData.membershipData.userId as any
        return (
          <div style={{ marginBottom: '8px', fontSize: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>CUSTOMER DETAILS</div>
            {userId.name && <div><strong>Name:</strong> {userId.name}</div>}
            {userId.phone && <div><strong>Phone:</strong> {userId.phone}</div>}
            {userId.email && <div><strong>Email:</strong> {userId.email}</div>}
            {(userId.address1 || userId.address) && (
              <div><strong>Address 1:</strong> {userId.address1 || userId.address}</div>
            )}
            {userId.address2 && <div><strong>Address 2:</strong> {userId.address2}</div>}
          </div>
        )
      })()}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        Thank You & Come Again
      </div>
    </div>
  )

  return receiptType === 'customer' ? renderCustomerReceipt() : renderKitchenReceipt()
}

export default ThermalReceipt

