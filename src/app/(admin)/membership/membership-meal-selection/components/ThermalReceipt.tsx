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
      <div style={{ marginBottom: '10px' }}>
        <div>Date : {getCurrentDateTime()}</div>
        <div>Membership</div>
        {orderData?.membershipData?.userId && typeof orderData.membershipData.userId === 'object' && (
          <>
            <div>Member: {orderData.membershipData.userId.name || 'N/A'}</div>
            {orderData.membershipData.userId.phone && <div>Phone: {orderData.membershipData.userId.phone}</div>}
          </>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Items Header (no Amount column for membership customer) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 'bold' }}>
        <div style={{ width: '70%' }}>Description</div>
        <div style={{ width: '30%', textAlign: 'right' }}>Qty</div>
      </div>

      {/* Items */}
      {orderData?.selectedProducts && Object.entries(orderData.selectedProducts).map(([uniqueId, product]: [string, any], index: number) => {
        const itemOptions = orderData?.itemOptions?.[uniqueId] || []
        return (
          <div key={index} style={{ marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '70%' }}>{product.title || product.name}</div>
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

      {/* Summary (only meals to consume for membership customer) */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <div>MEALS TO CONSUME</div>
          <div>{orderData?.mealsToConsume || 0}</div>
        </div>
      </div>

      {/* Daily Breakdown (when provided for global print) */}
      {Array.isArray(orderData?.dailyBreakdown) && orderData.dailyBreakdown.length > 0 && (
        <>
          <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Daily Breakdown</div>
          {orderData.dailyBreakdown.map((day: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '6px' }}>
              <div style={{ fontWeight: 'bold' }}>{day.dateKey} - Consumed: {day.consumed}</div>
              {day.times.map((t: any, ti: number) => (
                <div key={ti} style={{ marginLeft: '6px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 'bold' }}>{t.timeKey}</div>
                    <div>Consumed: {t.consumed}</div>
                  </div>
                  {t.items.map((it: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginLeft: '6px' }}>
                      <div style={{ width: '70%' }}>{it.title}</div>
                      <div style={{ width: '30%', textAlign: 'right' }}>{it.qty}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Membership Info */}
      {orderData?.membershipData && (
        <div style={{ marginBottom: '8px', fontSize: '10px' }}>
          <div><strong>Membership Summary</strong></div>
          <div>Total Meals: {orderData.membershipData.totalMeals || 0}</div>
          <div>Total Consumed: {orderData.membershipData.consumedMeals || 0}</div>
          <div>Current Consumed: {orderData?.mealsToConsume || 0}</div>
          <div>Current Remaining: {orderData.membershipData.remainingMeals || 0}</div>
          <div>Previous Remaining: {(orderData.membershipData.remainingMeals || 0) + (orderData.mealsToConsume || 0)}</div>
          {orderData.membershipData.startDate && <div>Start: {orderData.membershipData.startDate}</div>}
          {orderData.membershipData.endDate && <div>End: {orderData.membershipData.endDate}</div>}
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
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>NEW ORDER</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>KITCHEN 1</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '8px 0' }} />

      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>MEMBERSHIP MEAL</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Order Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>Date : {getCurrentDateTime()}</div>
        </div>
        {orderData?.membershipData?.userId && typeof orderData.membershipData.userId === 'object' && (
          <div>Member: {orderData.membershipData.userId.name || 'N/A'}</div>
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
        return (
          <div key={index} style={{ marginBottom: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '20%', fontWeight: 'bold' }}>{product.qty}</div>
              <div style={{ width: '80%' }}>{product.title || product.name}</div>
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

      {/* Membership Info (Kitchen: show consumed only summary requested) */}
      {orderData?.membershipData && (
        <div style={{ marginBottom: '8px', fontSize: '10px' }}>
          <div>Total Consumed: {orderData.membershipData.consumedMeals || 0}</div>
          <div>Current Consumed: {orderData?.mealsToConsume || 0}</div>
          <div>Current Remaining: {orderData.membershipData.remainingMeals || 0}</div>
          <div>Previous Remaining: {(orderData.membershipData.remainingMeals || 0) + (orderData.mealsToConsume || 0)}</div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        Thank You & Come Again
      </div>
    </div>
  )

  return receiptType === 'customer' ? renderCustomerReceipt() : renderKitchenReceipt()
}

export default ThermalReceipt

