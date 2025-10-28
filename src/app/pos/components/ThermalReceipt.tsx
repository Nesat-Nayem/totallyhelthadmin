'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface ThermalReceiptProps {
  orderData: any
  receiptType: 'customer' | 'kitchen'
}

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ orderData, receiptType }) => {
  // Helper to parse address into address1 and address2
  const parseAddress = (address: string) => {
    if (!address) return { address1: '', address2: '' }
    const parts = address.split(',').map(part => part.trim())
    return {
      address1: parts[0] || '',
      address2: parts[1] || ''
    }
  }

  // Helper to get the display text for order type
  const getOrderTypeDisplay = (orderType: string | null) => {
    if (!orderType) return '–';
    switch (orderType.toLowerCase()) {
      case 'newmembership':
      case 'membershipmeal':
        return 'Membership';
      case 'dinein':
        return 'Dine In';
      case 'takeaway':
        return 'Take Away';
      case 'delivery':
        return 'Delivery';
      case 'online':
        return 'Online';
      default:
        return '–';
    }
  };

  // Helper to get payment method display
  const getPaymentMethodDisplay = () => {
    if (!orderData?.payments || orderData.payments.length === 0) {
      return 'CASH'; // Default for thermal receipts
    }
    
    // Get unique payment types and join them
    const paymentTypes = [...new Set(orderData.payments.map((p: any) => p.type))];
    return paymentTypes.join(', ');
  };

  // Calculate VAT (5%)
  const calculateVAT = (amount: number) => {
    return (amount * 5) / 100
  }

  const getCurrentDateTime = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  // Customer Receipt (TAX INVOICE)
  const renderCustomerReceipt = () => (
    <div className="thermal-receipt customer-receipt" style={{
      width: '300px',
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      lineHeight: '1.1',
      padding: '5px',
      backgroundColor: 'white',
      color: 'black',
      margin: '0 auto'
    }}>
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
          padding: '8px',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {/* Fork and Knife Symbol */}
          <div style={{ 
            fontSize: '14px', 
            marginBottom: '3px',
            fontWeight: 'bold',
            color: '#000',
            lineHeight: '1'
          }}>🍴</div>
          {/* Totally Healthy Text */}
          <div style={{ 
            fontSize: '9px', 
            fontWeight: 'bold', 
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: '1.1',
            marginBottom: '1px',
            fontFamily: 'serif'
          }}>Totally Healthy</div>
          {/* Tagline */}
          <div style={{ 
            fontSize: '6px', 
            textAlign: 'center',
            lineHeight: '1.0',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal'
          }}>EAT CLEAN LIVE HEALTHY</div>
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
        <div>BillNo: {orderData?.invoiceNo || 'N/A'}</div>
        <div>Date : {getCurrentDateTime()}</div>
        <div>{getOrderTypeDisplay(orderData?.selectedOrderType)}</div>
        <div>User : {getPaymentMethodDisplay()}</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Items Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 'bold' }}>
        <div style={{ width: '50%' }}>Description</div>
        <div style={{ width: '15%', textAlign: 'center' }}>Qty</div>
        <div style={{ width: '35%', textAlign: 'right' }}>Amount</div>
      </div>

      {/* Items */}
      {orderData?.selectedProducts && Object.entries(orderData.selectedProducts).map(([uniqueId, product]: [string, any], index: number) => {
        // Handle both formats: itemOptions (from Redux) and moreOptions (from database)
        const itemOptions = orderData?.itemOptions?.[uniqueId] || []
        const moreOptions = product.moreOptions || []
        
        // Get option names from either format
        const optionNames = itemOptions.length > 0 
          ? itemOptions 
          : moreOptions.map((opt: any) => typeof opt === 'string' ? opt : opt.name)
        
        return (
          <div key={index} style={{ marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '50%' }}>{product.title || product.name}</div>
              <div style={{ width: '15%', textAlign: 'center' }}>{product.qty}</div>
              <div style={{ width: '35%', textAlign: 'right' }}>{(product.price * product.qty).toFixed(2)}</div>
            </div>
            {/* Item-specific options */}
            {optionNames.length > 0 && (
              <div style={{ marginLeft: '10px', fontSize: '9px', color: '#666' }}>
                {optionNames.map((optionName: string, optIndex: number) => (
                  <div key={optIndex} style={{ marginBottom: '1px' }}>
                    + {optionName}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}


      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Bill Summary */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <div>BILL AMOUNT</div>
          <div>{orderData?.subTotal?.toFixed(2) || '0.00'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <div>5 % VAT AMOUNT</div>
          <div>{orderData?.subTotal ? calculateVAT(orderData.subTotal).toFixed(2) : '0.00'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <div>GRAND TOTAL</div>
          <div>{orderData?.totalAmount?.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Order Notes Section - Only show if notes exist */}
      {orderData?.notes && orderData.notes.trim() && (
        <>
          <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>ORDER NOTES:</div>
            <div style={{ 
              fontSize: '10px', 
              lineHeight: '1.2',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {orderData.notes}
            </div>
          </div>
        </>
      )}

      {/* Customer Info */}
      {orderData?.customer && (
        <div style={{ marginBottom: '8px' }}>
          <div>CUST. NAME : {orderData.customer.name}</div>
          {(() => {
            const { address1, address2 } = parseAddress(orderData.customer.address || '')
            return (
              <>
                {address1 && <div>Address 1 {address1}</div>}
                {address2 && <div>Address 2 {address2}</div>}
              </>
            )
          })()}
          {(orderData.customer.phone || orderData.customer.mobile) && <div>MOBILE NO : {orderData.customer.phone || orderData.customer.mobile}</div>}
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
    <div className="thermal-receipt kitchen-receipt" style={{
      width: '300px',
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      lineHeight: '1.1',
      padding: '5px',
      backgroundColor: 'white',
      color: 'black',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>NEW ORDER</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>KITCHEN 1</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '8px 0' }} />

      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{getOrderTypeDisplay(orderData?.selectedOrderType)}</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Order Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>BillNo: {orderData?.invoiceNo || 'N/A'}</div>
          <div>Date : {getCurrentDateTime()}</div>
        </div>
        <div>User : {getPaymentMethodDisplay()}</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Items Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 'bold' }}>
        <div style={{ width: '20%' }}>Qty</div>
        <div style={{ width: '80%' }}>Item</div>
      </div>

      {/* Items */}
      {orderData?.selectedProducts && Object.entries(orderData.selectedProducts).map(([uniqueId, product]: [string, any], index: number) => {
        // Handle both formats: itemOptions (from Redux) and moreOptions (from database)
        const itemOptions = orderData?.itemOptions?.[uniqueId] || []
        const moreOptions = product.moreOptions || []
        
        // Get option names from either format
        const optionNames = itemOptions.length > 0 
          ? itemOptions 
          : moreOptions.map((opt: any) => typeof opt === 'string' ? opt : opt.name)
        
        return (
          <div key={index} style={{ marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '20%' }}>{product.qty}</div>
              <div style={{ width: '80%' }}>{product.title || product.name}</div>
            </div>
            {/* Item-specific options */}
            {optionNames.length > 0 && (
              <div style={{ marginLeft: '10px', fontSize: '9px', color: '#666' }}>
                {optionNames.map((optionName: string, optIndex: number) => (
                  <div key={optIndex} style={{ marginBottom: '1px' }}>
                    + {optionName}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}


      {/* Order Notes Section - Only show if notes exist */}
      {orderData?.notes && orderData.notes.trim() && (
        <>
          <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>ORDER NOTES:</div>
            <div style={{ 
              fontSize: '10px', 
              lineHeight: '1.2',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {orderData.notes}
            </div>
          </div>
        </>
      )}

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* Staff Info */}
      {orderData?.customer && (
        <div style={{ marginTop: '8px' }}>
          <div>Staff Name : {orderData.customer.name}</div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ display: 'none' }} id={`thermal-receipt-${receiptType}`}>
      {receiptType === 'customer' ? renderCustomerReceipt() : renderKitchenReceipt()}
    </div>
  )
}

export default ThermalReceipt
