'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Button, Badge, Row, Col, Form, Spinner, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetPaidOrdersTodayQuery, useGetUnpaidOrdersTodayQuery } from '@/services/orderApi'


// Simple Status Display Component
const StatusDisplay = ({ status }: { status: 'paid' | 'unpaid' }) => {
  return (
    <Badge 
      bg={status === 'paid' ? 'success' : 'warning'} 
      className="px-3 py-2 fs-6"
      style={{
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {status === 'paid' ? 'PAID' : 'UNPAID'}
    </Badge>
  )
}

// Payment History Modal Component
const PaymentHistoryModal = ({ show, onHide, paymentHistory }: { show: boolean; onHide: () => void; paymentHistory?: any }) => {
  if (!paymentHistory || !paymentHistory.entries || paymentHistory.entries.length === 0) {
    return (
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Payment History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <IconifyIcon icon="mdi:history" className="text-muted" style={{ fontSize: '3rem' }} />
            <p className="text-muted mt-3">No payment history available for this order.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Payment History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="bg-light rounded p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Total Paid: <span className="text-success fw-bold">AED {paymentHistory.totalPaid}</span></h6>
            <div className="d-flex gap-2">
              <Badge bg="info">{paymentHistory.entries.length} entries</Badge>
              {paymentHistory.changeSequence && paymentHistory.changeSequence.length > 0 && (
                <Badge bg="warning">{paymentHistory.changeSequence.length} mode changes</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {/* Payment History Entries */}
          {paymentHistory.entries.map((entry: any, index: number) => (
            <div key={index} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <Badge 
                    bg={
                      entry.action === 'order_created' ? 'primary' :
                      entry.action === 'payment_received' ? 'success' :
                      entry.action === 'add_item' ? 'info' :
                      entry.action === 'remove_item' ? 'warning' :
                      'secondary'
                    }
                    className="me-2"
                  >
                    {entry.action.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <small className="text-muted">
                    {new Date(entry.timestamp).toLocaleString()}
                  </small>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-primary">AED {entry.total}</div>
                  <small className="text-muted">Total</small>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-4">
                  <small className="text-muted">Paid:</small>
                  <div className="fw-semibold text-success">AED {entry.paid}</div>
                </div>
                <div className="col-4">
                  <small className="text-muted">Remaining:</small>
                  <div className="fw-semibold text-warning">AED {entry.remaining}</div>
                </div>
                <div className="col-4">
                  <small className="text-muted">Total Paid:</small>
                  <div className="fw-semibold text-info">AED {entry.paid + (paymentHistory.entries.slice(0, index).reduce((sum: number, prev: any) => sum + prev.paid, 0))}</div>
                </div>
              </div>
              
              {entry.payments && entry.payments.length > 0 && (
                <div className="mb-2">
                  <small className="text-muted">Payment Methods:</small>
                  <div className="d-flex gap-2 mt-1">
                    {entry.payments.map((payment: any, pIndex: number) => (
                      <Badge key={pIndex} bg="light" text="dark" className="d-flex align-items-center gap-1">
                        <IconifyIcon 
                          icon={
                            payment.type === 'Cash' ? 'solar:wallet-money-bold' : 
                            payment.type === 'Card' ? 'solar:card-bold' : 
                            'solar:smartphone-2-bold'
                          } 
                          style={{ fontSize: '12px' }}
                        />
                        {payment.type}: AED {payment.amount}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-light rounded p-2">
                <small className="text-muted">{entry.description}</small>
              </div>
            </div>
          ))}

          {/* Payment Mode Change Sequences */}
          {paymentHistory.changeSequence && paymentHistory.changeSequence.length > 0 && (
            <div className="mt-4">
              <h6 className="text-warning mb-3">
                <IconifyIcon icon="solar:refresh-bold" className="me-2" />
                Payment Mode Changes
              </h6>
              {paymentHistory.changeSequence.map((change: any, index: number) => (
                <div key={index} className="border border-warning rounded p-3 mb-3 bg-warning bg-opacity-10">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <Badge bg="warning" className="me-2">
                        <IconifyIcon icon="solar:refresh-bold" className="me-1" />
                        MODE CHANGED
                      </Badge>
                      <small className="text-muted">
                        {new Date(change.timestamp).toLocaleString()}
                      </small>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Change #{index + 1}</small>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">From:</small>
                      <div className="d-flex gap-1 mt-1 flex-wrap">
                        {change.from.map((mode: string, modeIndex: number) => (
                          <Badge key={modeIndex} bg="danger" className="d-flex align-items-center gap-1">
                            <IconifyIcon 
                              icon={
                                mode === 'Cash' ? 'solar:wallet-money-bold' : 
                                mode === 'Card' ? 'solar:card-bold' : 
                                mode === 'Gateway' ? 'solar:smartphone-2-bold' :
                                mode === 'Online Transfer' ? 'solar:transfer-horizontal-bold' :
                                'solar:link-bold'
                              } 
                              style={{ fontSize: '10px' }}
                            />
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">To:</small>
                      <div className="d-flex gap-1 mt-1 flex-wrap">
                        {change.to.map((mode: string, modeIndex: number) => (
                          <Badge key={modeIndex} bg="success" className="d-flex align-items-center gap-1">
                            <IconifyIcon 
                              icon={
                                mode === 'Cash' ? 'solar:wallet-money-bold' : 
                                mode === 'Card' ? 'solar:card-bold' : 
                                mode === 'Gateway' ? 'solar:smartphone-2-bold' :
                                mode === 'Online Transfer' ? 'solar:transfer-horizontal-bold' :
                                'solar:link-bold'
                              } 
                              style={{ fontSize: '10px' }}
                            />
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <small className="text-muted">
                      <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                      Changed at: {new Date(change.timestamp).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

// Enhanced Product modal component with payment details
const ProductDetailsModal = ({ show, onHide, orderData }: { show: boolean; onHide: () => void; orderData?: any }) => {
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="bg-light rounded p-3">
            <div className="d-flex justify-content-between mb-3">
              <Badge bg="dark">Order ID: {orderData?.orderNo || orderData?.invoiceNo || 'N/A'}</Badge>
              <div className="fw-semibold">Number of Products: {orderData?.items?.length || 0}</div>
            </div>

            {/* Dynamic Products List */}
            {orderData?.items?.map((item: any, index: number) => (
              <div key={index} className="d-flex align-items-center justify-content-between border rounded mb-2 p-2">
                <div className="d-flex align-items-center gap-2">
                  <div>
                    <strong>{item.title}</strong>
                    <div>Quantity: {item.qty}</div>
                  </div>
                </div>
                <strong className="text-success">AED {item.price}</strong>
              </div>
            )) || (
              <div className="text-center py-3">
                <p className="text-muted">No products found for this order.</p>
              </div>
            )}

            {/* Extra Items */}
            {orderData?.extraItems?.length > 0 && (
              <>
                <hr className="my-3" />
                <h6 className="text-muted">Extra Items:</h6>
                {orderData.extraItems.map((item: any, index: number) => (
                  <div key={index} className="d-flex align-items-center justify-content-between border rounded mb-2 p-2">
                    <div className="d-flex align-items-center gap-2">
                      <div>
                        <strong>{item.name}</strong>
                        <div>Quantity: {item.qty || 1}</div>
                      </div>
                    </div>
                    <strong className="text-success">AED {item.price}</strong>
                  </div>
                ))}
              </>
            )}

            {/* Payment Details Section */}
            <hr className="my-3" />
            <h6 className="text-muted mb-3">Payment Details:</h6>
            <div className="row mb-3">
              <div className="col-6">
                <strong>Payment Status:</strong>
                <div className="mt-1">
                  <StatusDisplay status={orderData?.status || 'unpaid'} />
                </div>
              </div>
              <div className="col-6">
                <strong>Payment History:</strong>
                <div className="mt-1">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => setShowPaymentHistory(true)}
                    className="d-flex align-items-center gap-1 fw-bold"
                    style={{
                      background: 'linear-gradient(45deg, #28a745, #20c997)',
                      border: 'none',
                      boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)',
                      transition: 'all 0.3s ease',
                      transform: 'scale(1.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)'
                    }}
                  >
                    <IconifyIcon icon="mdi:history" style={{ fontSize: '16px' }} />
                    View History
                  </Button>
                </div>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            {orderData?.payments && orderData.payments.length > 0 && (
              <div className="mb-3">
                <strong>Payment Methods:</strong>
                <div className="mt-2">
                  {orderData.payments.map((payment: any, index: number) => (
                    <div key={index} className="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <IconifyIcon 
                          icon={payment.type === 'Cash' ? 'solar:wallet-money-bold' : 
                                payment.type === 'Card' ? 'solar:card-bold' : 
                                'solar:smartphone-2-bold'} 
                          className="text-primary"
                        />
                        <span className="fw-semibold">{payment.type}</span>
                      </div>
                      <span className="text-success fw-bold">AED {payment.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <hr className="my-3" />
            <div className="small">
              <div className="d-flex justify-content-between mb-2">
                <strong>Sub Total:</strong>
                <span>AED {orderData?.subTotal || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <strong>Total:</strong>
                <span>AED {orderData?.total || 0}</span>
              </div>
              {(orderData?.discountAmount !== undefined && orderData.discountAmount !== null) && (
                <div className="d-flex justify-content-between mb-2">
                  <strong>Discount:</strong>
                  <span>AED {orderData.discountAmount}</span>
                </div>
              )}
              {(orderData?.shippingCharge !== undefined && orderData.shippingCharge !== null) && (
                <div className="d-flex justify-content-between mb-2">
                  <strong>Shipping:</strong>
                  <span>AED {orderData.shippingCharge}</span>
                </div>
              )}
              {(orderData?.rounding !== undefined && orderData.rounding !== null) && (
                <div className="d-flex justify-content-between mb-2">
                  <strong>Rounding:</strong>
                  <span>AED {orderData.rounding}</span>
                </div>
              )}
              {(orderData?.receiveAmount !== undefined && orderData.receiveAmount !== null) && (
                <div className="d-flex justify-content-between mb-2">
                  <strong>Received:</strong>
                  <span>AED {orderData.receiveAmount}</span>
                </div>
              )}
              {(orderData?.changeAmount !== undefined && orderData.changeAmount !== null) && (
                <div className="d-flex justify-content-between mb-2">
                  <strong>Change:</strong>
                  <span>AED {orderData.changeAmount}</span>
                </div>
              )}
              {(orderData?.dueAmount !== undefined && orderData.dueAmount !== null) && (
                <div className="d-flex justify-content-between mb-2">
                  <strong>Due Amount:</strong>
                  <span>AED {orderData.dueAmount}</span>
                </div>
              )}
              {(orderData?.payableAmount !== undefined && orderData.payableAmount !== null) && (
                <div className="d-flex justify-content-between mb-2">
                  <strong>Payable Amount:</strong>
                  <span>AED {orderData.payableAmount}</span>
                </div>
              )}
            </div>
            {orderData?.note && (
              <div className="mt-2">
                <strong>Note:</strong> {orderData.note}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment History Modal */}
      <PaymentHistoryModal
        show={showPaymentHistory}
        onHide={() => setShowPaymentHistory(false)}
        paymentHistory={orderData?.paymentHistory}
      />
    </>
  )
}

// Main component
const ViewOrder = ({ onEditOrder }: { onEditOrder?: (orderData: any) => void }) => {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid')
  const [search, setSearch] = useState('')
  const [showProducts, setShowProducts] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Fetch orders from new APIs - only when modal is open
  const { data: paidOrdersData, isLoading: isLoadingPaid, error: errorPaid, refetch: refetchPaid } = useGetPaidOrdersTodayQuery(
    undefined,
    { skip: !showModal || activeTab !== 'paid' }
  )
  
  const { data: unpaidOrdersData, isLoading: isLoadingUnpaid, error: errorUnpaid, refetch: refetchUnpaid } = useGetUnpaidOrdersTodayQuery(
    undefined,
    { skip: !showModal || activeTab !== 'unpaid' }
  )

  const handleShow = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  // Function to refresh current tab data
  const handleRefresh = () => {
    if (activeTab === 'paid') {
      refetchPaid()
    } else {
      refetchUnpaid()
    }
  }

  // Listen for custom event to reopen modal when coming back from edit
  useEffect(() => {
    const handleReopenViewOrders = () => {
      setShowModal(true)
    }

    window.addEventListener('reopenViewOrders', handleReopenViewOrders)
    
    return () => {
      window.removeEventListener('reopenViewOrders', handleReopenViewOrders)
    }
  }, [])

  // Auto-refresh when switching tabs
  useEffect(() => {
    if (showModal) {
      handleRefresh()
    }
  }, [activeTab, showModal])

  // Get current orders based on active tab
  const currentOrdersData = activeTab === 'paid' ? paidOrdersData : unpaidOrdersData
  const isLoading = activeTab === 'paid' ? isLoadingPaid : isLoadingUnpaid
  const error = activeTab === 'paid' ? errorPaid : errorUnpaid

  // Filter orders by search
  const filteredOrders = currentOrdersData?.data?.filter((order: any) => {
    const matchesSearch = order.invoiceNo?.toLowerCase().includes(search.toLowerCase()) || 
                         order.orderNo?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  }) || []

  return (
    <>
      {/* Trigger Button */}
      <Button variant="dark" size="lg" onClick={handleShow}>
        <IconifyIcon icon="mdi:eye-outline" className="me-1" /> View Orders
      </Button>

      {/* Orders Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Orders</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Tabs */}
          <div className="d-flex gap-2 mb-3">
            {['unpaid', 'paid'].map((tab) => {
              let variant: string = 'light'

              if (activeTab === tab) {
                if (tab === 'unpaid') variant = 'danger'
                else if (tab === 'paid') variant = 'success'
              }

              return (
                <Button key={tab} variant={variant} size="sm" className="text-capitalize" onClick={() => setActiveTab(tab as any)}>
                  {tab}
                </Button>
              )
            })}
          </div>

          {/* Search */}
          <Form.Control type="text" placeholder="🔍 Search Order ID" className="mb-3" value={search} onChange={(e) => setSearch(e.target.value)} />

          {/* Orders Container with Scroll */}
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading orders...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-4">
                <p className="text-danger">Failed to load orders. Please try again.</p>
                <p className="text-muted small">Close and reopen the modal to retry.</p>
              </div>
            )}

            {/* Orders List */}
            {!isLoading && !error && (
              <>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No {activeTab} orders found for today.</p>
                  </div>
                ) : (
                  filteredOrders.map((order: any, index: number) => (
                    <div key={order._id || index} className="border rounded p-3 mb-3 shadow-sm" style={{ backgroundColor: '#fff' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Badge bg="dark" className="px-3 py-1 fs-6">
                          Order ID: {order.orderNo || order.invoiceNo}
                        </Badge>
                      </div>
                      <Row className="small mb-2">
                        <Col xs={6}>
                          <strong>Cashier:</strong> admin
                        </Col>
                        <Col xs={6}>
                          <strong>Customer:</strong> {order.customer?.name || 'Guest'}
                        </Col>
                        <Col xs={6}>
                          <strong>Total:</strong> AED {order.total}
                        </Col>
                        <Col xs={6}>
                          <strong>Date:</strong> {new Date(order.date).toLocaleString()}
                        </Col>
                      </Row>
                      
                      {/* Status Display */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-semibold">Status:</span>
                          <StatusDisplay status={order.status} />
                        </div>
                      </div>
                      {order.note && <div className="bg-primary-subtle text-primary text-center rounded py-2 px-2 small mb-2">{order.note}</div>}
                      <div className="d-flex gap-2">
                        {/* <Button size="sm" variant="danger">
                          <IconifyIcon icon="mdi:folder-open-outline" className="me-1" />
                          Open Order
                        </Button> */}
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setSelectedOrder(order) // Set the selected order
                            setShowModal(false) // Close Orders modal
                            setShowProducts(true) // Open Products modal
                          }}>
                          <IconifyIcon icon="mdi:eye-outline" className="me-1" />
                          View Details
                        </Button>

                        {onEditOrder && activeTab !== 'paid' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              onEditOrder(order) // Call the edit handler
                              setShowModal(false) // Close Orders modal
                            }}>
                            <IconifyIcon icon="mdi:pencil-outline" className="me-1" />
                            Edit Order
                          </Button>
                        )}

                        <Button size="sm" variant="dark">
                          <IconifyIcon icon="mdi:printer-outline" className="me-1" />
                          Print
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Product Details Modal */}
      <ProductDetailsModal
        show={showProducts}
        onHide={() => {
          setShowProducts(false) // Close product modal
          setSelectedOrder(null) // Clear selected order
          setShowModal(true) // Reopen main order modal if needed
        }}
        orderData={selectedOrder}
      />

    </>
  )
}

export default ViewOrder
