'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Button, Badge, Row, Col, Form, Spinner, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetOrdersQuery, useUpdateOrderMutation } from '@/services/orderApi'

// Professional Confirmation Modal Component
const ConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  isLoading = false 
}: { 
  show: boolean; 
  onHide: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
  isLoading?: boolean;
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <div className="text-center">
          <div className="mb-3">
            <IconifyIcon 
              icon="solar:danger-triangle-bold" 
              className="text-warning" 
              style={{ fontSize: '48px' }}
            />
          </div>
          <p className="mb-0 text-muted">{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <div className="d-flex gap-2 w-100">
          <Button 
            variant="outline-secondary" 
            onClick={onHide} 
            disabled={isLoading}
            className="flex-fill"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-fill"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

// Professional Success Notification Modal
const SuccessModal = ({ 
  show, 
  onHide, 
  title, 
  message 
}: { 
  show: boolean; 
  onHide: () => void; 
  title: string; 
  message: string;
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold text-success">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <div className="text-center">
          <div className="mb-3">
            <IconifyIcon 
              icon="solar:check-circle-bold" 
              className="text-success" 
              style={{ fontSize: '48px' }}
            />
          </div>
          <p className="mb-0 text-muted">{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="success" 
          onClick={onHide} 
          className="w-100"
        >
          <IconifyIcon icon="solar:check-bold" className="me-2" />
          Got it!
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// Professional Status Toggle Component
const StatusToggle = ({ order, onStatusChange }: { order: any; onStatusChange: (orderId: string, newStatus: 'paid' | 'unpaid') => void }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showConfirmModal, setShowConfirmModal] = React.useState(false)
  const [pendingStatus, setPendingStatus] = React.useState<'paid' | 'unpaid' | null>(null)
  
  const handleToggle = () => {
    const newStatus = order.status === 'paid' ? 'unpaid' : 'paid'
    setPendingStatus(newStatus)
    setShowConfirmModal(true)
  }

  const handleConfirm = async () => {
    if (!pendingStatus) return
    
    setIsLoading(true)
    setShowConfirmModal(false)
    
    try {
      await onStatusChange(order._id, pendingStatus)
    } finally {
      setIsLoading(false)
      setPendingStatus(null)
    }
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setPendingStatus(null)
  }

  return (
    <div className="d-flex align-items-center justify-content-center">
      {/* Modern Professional Toggle Switch */}
      <div 
        className="position-relative d-flex align-items-center professional-toggle"
        style={{
          width: '100px',
          height: '32px',
          backgroundColor: order.status === 'paid' ? '#10b981' : '#f59e0b',
          borderRadius: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: order.status === 'paid' 
            ? '0 2px 8px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
            : '0 2px 8px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          opacity: isLoading ? 0.7 : 1,
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={isLoading ? undefined : handleToggle}
      >
        {/* Toggle Circle */}
        <div
          className="position-absolute d-flex align-items-center justify-content-center"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            left: order.status === 'paid' ? '4px' : '72px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            zIndex: 2,
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <IconifyIcon 
              icon={order.status === 'paid' ? 'solar:check-bold' : 'solar:close-bold'} 
              style={{ 
                fontSize: '12px',
                color: order.status === 'paid' ? '#10b981' : '#f59e0b'
              }}
            />
          )}
        </div>
        
        {/* Status Text */}
        <div className="position-absolute w-100 text-center" style={{ zIndex: 1 }}>
          <span 
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          >
            {order.status === 'paid' ? 'PAID' : 'UNPAID'}
          </span>
        </div>
      </div>

      {/* Professional Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmModal}
        onHide={handleCancel}
        onConfirm={handleConfirm}
        title="Confirm Status Change"
        message={`Are you sure you want to mark invoice ${order.invoiceNo} as ${pendingStatus?.toUpperCase()}?\n\nThis action will change the payment status of the order.`}
        isLoading={isLoading}
      />
    </div>
  )
}

// Product modal component
const ProductDetailsModal = ({ show, onHide, orderData }: { show: boolean; onHide: () => void; orderData?: any }) => {
  return (
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

          {/* Order Summary */}
          <hr className="my-3" />
          <div className="row">
            <div className="col-6">
              <strong>Sub Total:</strong> AED {orderData?.subTotal || 0}
            </div>
            <div className="col-6">
              <strong>Total:</strong> AED {orderData?.total || 0}
            </div>
          </div>
          {orderData?.note && (
            <div className="mt-2">
              <strong>Note:</strong> {orderData.note}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

// Main component
const ViewOrder = () => {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid')
  const [search, setSearch] = useState('')
  const [showProducts, setShowProducts] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Get current date for filtering
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Fetch orders from API with current date filter - only when modal is open
  const { data: ordersData, isLoading, error } = useGetOrdersQuery({
    startDate: currentDate,
    endDate: currentDate,
    limit: 100
  }, {
    skip: !showModal // Only fetch when modal is open
  })

  // Update order mutation
  const [updateOrder] = useUpdateOrderMutation()

  const handleShow = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  const handleStatusChange = async (orderId: string, newStatus: 'paid' | 'unpaid') => {
    try {
      await updateOrder({ id: orderId, data: { status: newStatus } }).unwrap()
      
      // Automatic tab switching based on status change
      setActiveTab(newStatus)
      
      // Show professional success modal
      setSuccessMessage(`Order status updated to ${newStatus.toUpperCase()} successfully!`)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Failed to update order status:', error)
      setSuccessMessage('Failed to update order status. Please try again.')
      setShowSuccessModal(true)
    }
  }


  // Filter orders by status and search
  const filteredOrders = ordersData?.data?.filter((order: any) => {
    const matchesStatus = order.status === activeTab
    const matchesSearch = order.invoiceNo?.toLowerCase().includes(search.toLowerCase()) || 
                         order.orderNo?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
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
                      
                      {/* Status Toggle */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-semibold">Status:</span>
                          <StatusToggle order={order} onStatusChange={handleStatusChange} />
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

      {/* Success Notification Modal */}
      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        title="Status Updated"
        message={successMessage}
      />
    </>
  )
}

export default ViewOrder
