'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'
import LogoBox from '@/components/LogoBox'
import ThermalReceipt from '@/app/(admin)/membership/membership-meal-selection/components/ThermalReceipt'
import { printThermalReceipt } from '@/utils/thermalPrint'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface PrintOrderProps {
  selectedProducts?: { [key: string]: any }
  itemOptions?: { [itemId: string]: string[] }
  membershipData?: any
}

const PrintOrder: React.FC<PrintOrderProps> = ({
  selectedProducts = {},
  itemOptions = {},
  membershipData
}) => {
  const [showModal, setShowModal] = useState(false)
  const [showThermalOptions, setShowThermalOptions] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  // Calculate subtotal
  const subTotal = Object.values(selectedProducts).reduce((sum: number, product: any) => {
    return sum + (product.price * product.qty)
  }, 0)

  // Calculate meals to consume
  const mealsToConsume = Object.values(selectedProducts).reduce((sum: number, product: any) => {
    return sum + product.qty
  }, 0)

  // Prepare order data for printing
  useEffect(() => {
    if (Object.keys(selectedProducts).length > 0) {
      setOrderData({
        selectedProducts,
        itemOptions,
        subTotal,
        totalAmount: subTotal,
        membershipData,
        mealsToConsume,
        selectedOrderType: 'MembershipMeal',
        invoiceNo: `MEM-${Date.now()}-${Math.floor(Math.random() * 100)}`
      })
    }
  }, [selectedProducts, itemOptions, subTotal, membershipData, mealsToConsume])

  const handleShow = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  // Generate bill number
  const generateBillNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `MEM-${timestamp}-${random}`
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

  const invoiceNo = orderData?.invoiceNo || generateBillNumber()

  return (
    <>
      {/* Trigger Button */}
      <Button variant="info" size="sm" onClick={handleShow} disabled={Object.keys(selectedProducts).length === 0}>
        🖨 Print Membership
      </Button>

      {/* Hidden Thermal Receipt Components - Only for printing */}
      {orderData && (
        <div style={{ display: 'none' }}>
          <ThermalReceipt orderData={orderData} receiptType="customer" />
          <ThermalReceipt orderData={orderData} receiptType="kitchen" />
        </div>
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
          {Object.keys(selectedProducts).length === 0 ? (
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

              {/* Header Info (Membership focused, no bill numbers) */}
              <div className="small mb-2">
                <div>Date: {getCurrentDateTime()}</div>
                <div>Membership</div>
                {membershipData?.userId && typeof membershipData.userId === 'object' && (
                  <>
                    <div>Member: {membershipData.userId.name || 'N/A'}</div>
                    {membershipData.userId.phone && <div>Phone: {membershipData.userId.phone}</div>}
                  </>
                )}
              </div>

              <hr />

              {/* Items - show item and qty only */}
              <div className="small mb-2">
                {Object.values(selectedProducts).map((product: any, index: number) => {
                  const productId = Object.keys(selectedProducts)[index]
                  const options = itemOptions[productId] || []
                  return (
                    <div key={index}>
                      <div className="d-flex justify-content-between">
                        <span>{product.title || product.name}</span>
                        <span>{product.qty}</span>
                      </div>
                      {options.length > 0 && (
                        <div className="ms-3 text-muted">
                          {options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="small">+ {opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <hr />

              {/* Summary - membership focused */}
              <div className="small">
                <div className="d-flex justify-content-between">
                  <strong>MEALS TO CONSUME</strong>
                  <span>{mealsToConsume}</span>
                </div>
              </div>

              <hr />

              {/* Membership Info */}
              <div className="small mb-2">
                <div><strong>Total Meals:</strong> {membershipData?.totalMeals || 0}</div>
                <div><strong>Consumed Meals:</strong> {membershipData?.consumedMeals || 0}</div>
                <div><strong>Remaining Meals:</strong> {membershipData?.remainingMeals || 0}</div>
                <div><strong>Status:</strong> {membershipData?.status || 'N/A'}</div>
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
            disabled={Object.keys(selectedProducts).length === 0}
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
          {/* Header */}
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
                  fontSize: '1.2rem'
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
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{
            padding: '1.2rem 1.5rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <p style={{
                color: '#495057',
                fontSize: '1rem',
                fontWeight: '500',
                margin: 0
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
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
                boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
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

