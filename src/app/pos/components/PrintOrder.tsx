'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'
import Image from 'next/image'
import LogoBox from '@/components/LogoBox'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ThermalReceipt from './ThermalReceipt'
import { printThermalReceipt } from '@/utils/thermalPrint'

const PrintOrder = () => {
  const [showModal, setShowModal] = useState(false)
  const [showThermalOptions, setShowThermalOptions] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const { currentOrderData } = useSelector((state: RootState) => state.pos)

  // Helper to parse address into address1 and address2
  const parseAddress = (address: string) => {
    if (!address) return { address1: '', address2: '' }
    const parts = address.split(',').map(part => part.trim())
    return {
      address1: parts[0] || '',
      address2: parts[1] || ''
    }
  }

  const handleShow = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  // Load order data from Redux or localStorage
  useEffect(() => {
    if (currentOrderData) {
      setOrderData(currentOrderData)
    } else {
      // Fallback to localStorage if Redux state is empty
      const savedOrderData = localStorage.getItem('currentOrderData')
      if (savedOrderData) {
        try {
          const parsedData = JSON.parse(savedOrderData)
          setOrderData(parsedData)
        } catch (error) {
          console.error('Error parsing saved order data:', error)
        }
      }
    }
  }, [currentOrderData])

  // Generate dynamic bill number and date
  const generateBillNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `INV-${timestamp}-${random}`
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

  // Calculate VAT (5%)
  const calculateVAT = (amount: number) => {
    return (amount * 5) / 100
  }

  // Helper to get the display text for order type
  const getOrderTypeDisplay = (orderType: string | null) => {
    if (!orderType) return '–';
    switch (orderType.toLowerCase()) {
      case 'newmembership':
      case 'membershipmeal':
        return 'Membership';
      case 'dinein':
      case 'takeaway':
      case 'delivery':
        return 'Restaurant';
      case 'online':
        return 'Online';
      default:
        return '–';
    }
  };

  // Helper to get payment method display
  const getPaymentMethodDisplay = () => {
    if (!orderData?.payments || orderData.payments.length === 0) {
      return 'No Payment Selected'; // Show when no payment is actually selected
    }
    
    // Get unique payment types and join them
    const paymentTypes = [...new Set(orderData.payments.map((p: any) => p.type))];
    return paymentTypes.join(', ');
  };

  return (
    <>
      {/* Trigger Button */}
      <Button variant="info" size="sm" onClick={handleShow}>
        🖨 Print Order
      </Button>

      {/* Hidden Thermal Receipt Components */}
      {orderData && (
        <>
          <ThermalReceipt orderData={orderData} receiptType="customer" />
          <ThermalReceipt orderData={orderData} receiptType="kitchen" />
        </>
      )}

      {/* Invoice Modal */}
      <Modal 
        show={showModal} 
        onHide={handleClose} 
        centered 
        size="lg" 
        style={{ 
          margin: '20px 1rem',
          maxWidth: 'calc(100vw - 2rem)'
        }}
      >
        <Modal.Body className="px-4 py-3">
          {!orderData || (!orderData.selectedProducts || Object.keys(orderData.selectedProducts).length === 0) ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No Order Data Available</h5>
              <p className="text-muted">Please add items to your order before printing.</p>
            </div>
          ) : (
            <>
          {/* Header */}
          <div className="text-center mb-2">
            <LogoBox />
            <h5 className="fw-bold mt-2 mb-0">TOTALLY HEALTHY</h5>
            <small className="d-block">Company Name: AL AKL AL SAHI</small>
            <small className="d-block">Tel: 065392229 / 509632223</small>
            <small className="d-block fw-bold">TRN : 100512693100003</small>
          </div>

          <hr />

          {/* Bill Info */}
          <div className="small mb-2">
            <div>BillNo: {orderData?.invoiceNo || generateBillNumber()}</div>
            <div>Date: {getCurrentDateTime()}</div>
            <div>{getOrderTypeDisplay(orderData?.selectedOrderType)}</div>
            <div>User: Cash</div>
          </div>

          <hr />

          {/* Items */}
          <div className="small mb-2">
            {orderData?.selectedProducts && Object.values(orderData.selectedProducts).length > 0 ? (
              Object.values(orderData.selectedProducts).map((product: any, index: number) => (
                <div key={index} className="d-flex justify-content-between">
                  <span>{product.title || product.name}</span>
                  <span>{(product.price * product.qty).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-muted">No items in order</div>
            )}
            
            {/* More Options Items */}
            {orderData?.moreOptions && orderData.moreOptions.length > 0 && (
              <>
                {orderData.moreOptions.map((option: any, index: number) => (
                  <div key={`option-${index}`} className="d-flex justify-content-between">
                    <span>{option.name}</span>
                    <span>{(option.price * (option.qty || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <hr />

          {/* Bill Summary */}
          <div className="small">
            <div className="d-flex justify-content-between">
              <strong>BILL AMOUNT</strong>
              <span>{orderData?.subTotal?.toFixed(2) || '0.00'}</span>
            </div>
            {orderData?.discountAmountApplied > 0 && (
              <div className="d-flex justify-content-between">
                <strong>DISCOUNT</strong>
                <span>-{orderData.discountAmountApplied.toFixed(2)}</span>
              </div>
            )}
            {orderData?.deliveryCharge > 0 && (
              <div className="d-flex justify-content-between">
                <strong>DELIVERY CHARGE</strong>
                <span>{orderData.deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            {orderData?.rounding !== 0 && (
              <div className="d-flex justify-content-between">
                <strong>ROUNDING</strong>
                <span>{orderData.rounding > 0 ? '+' : ''}{orderData.rounding.toFixed(2)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between">
              <strong>5 % VAT AMOUNT</strong>
              <span>{orderData?.subTotal ? calculateVAT(orderData.subTotal).toFixed(2) : '0.00'}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>GRAND TOTAL</strong>
              <span>{orderData?.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <hr />

          {/* Customer Info */}
          <div className="small mb-2">
            {orderData?.customer ? (
              <>
                <div>
                  <strong>CUST. NAME :</strong> {orderData.customer.name || `${orderData.customer.firstName || ''} ${orderData.customer.lastName || ''}`.trim()}
                </div>
                {(() => {
                  const { address1, address2 } = parseAddress(orderData.customer.address || '')
                  return (
                    <>
                      {address1 && <div>Address1: {address1}</div>}
                      {address2 && <div>Address2: {address2}</div>}
                    </>
                  )
                })()}
                <div>Mobile No: {orderData.customer.phone || orderData.customer.mobile || 'N/A'}</div>
              </>
            ) : (
              <div className="text-center text-muted">No customer information</div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center small mt-3 mb-0">Thank You & Come Again</p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button 
            variant="dark" 
            onClick={() => setShowThermalOptions(true)}
            disabled={!orderData || (!orderData.selectedProducts || Object.keys(orderData.selectedProducts).length === 0)}
          >
            Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Thermal Options Modal */}
      <Modal 
        show={showThermalOptions} 
        onHide={() => setShowThermalOptions(false)} 
        centered 
        backdrop="static"
        keyboard={false}
        style={{
          zIndex: 1055
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          border: '3px solid #ffffff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          overflow: 'hidden',
          position: 'relative',
          maxWidth: '450px',
          width: '100%',
          margin: '0 auto'
        }}>
          {/* Header with Gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            padding: '1rem 1.5rem',
            borderBottom: '2px solid #e9ecef',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{
                  margin: 0,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  fontSize: '1.2rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  🖨️ Download Thermal Receipts
                </h4>
                <p style={{
                  margin: '0.3rem 0 0 0',
                  color: '#6c757d',
                  fontSize: '0.8rem'
                }}>
                  Choose your receipt format
                </p>
              </div>
              <button
                onClick={() => setShowThermalOptions(false)}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Body with Enhanced Design */}
          <div style={{
            padding: '1.2rem 1.5rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            position: 'relative'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <p style={{
                color: '#495057',
                fontSize: '1rem',
                fontWeight: '500',
                margin: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                Select the thermal receipt you want to download:
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              {/* Customer Receipt Button */}
              <button
                onClick={() => {
                  printThermalReceipt('customer')
                  setShowThermalOptions(false)
                }}
                style={{
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.3)'
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🧾</span>
                <span>Download Customer Receipt</span>
              </button>

              {/* Kitchen Receipt Button */}
              <button
                onClick={() => {
                  printThermalReceipt('kitchen')
                  setShowThermalOptions(false)
                }}
                style={{
                  background: 'linear-gradient(135deg, #fd7e14, #ffc107)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(253, 126, 20, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(253, 126, 20, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(253, 126, 20, 0.3)'
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🍳</span>
                <span>Download Kitchen Receipt</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '1rem 1.5rem',
            borderTop: '2px solid #dee2e6',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowThermalOptions(false)}
              style={{
                background: 'linear-gradient(135deg, #6c757d, #495057)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 30px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PrintOrder
