'use client'

import React, { useState } from 'react'
import { Modal, Button, Badge, Row, Col, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

// Dummy order data
const orderData = [
  {
    id: '#001',
    cashier: 'admin',
    customer: 'Suraj Jamdade',
    total: 500,
    date: '03 Aug 2025 13:39:11',
    note: 'Customer need to recheck the product once',
    status: 'onhold',
  },
  {
    id: '#002',
    cashier: 'admin',
    customer: 'Guest',
    total: 500,
    date: '03 Aug 2025 13:45:15',
    note: '',
    status: 'paid',
  },
  // Add more orders with various statuses
]

// Product modal component
const ProductDetailsModal = ({ show, onHide }: { show: boolean; onHide: () => void }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="bg-light rounded p-3">
          <div className="d-flex justify-content-between mb-3">
            <Badge bg="dark">Order ID : #001</Badge>
            <div className="fw-semibold">Number of Products : 02</div>
          </div>

          {/* Product 1 */}
          <div className="d-flex align-items-center justify-content-between border rounded mb-2 p-2">
            <div className="d-flex align-items-center gap-2">
              <div>
                <strong>International Meal Plan</strong>
                <div>Quantity : 02</div>
              </div>
            </div>
            <strong className="text-success">AED 200</strong>
          </div>

          {/* Product 2 */}
          <div className="d-flex align-items-center justify-content-between border rounded p-2">
            <div className="d-flex align-items-center gap-2">
              <div>
                <strong>Arabic Meal Plan</strong>
                <div>Quantity : 1</div>
              </div>
            </div>
            <strong className="text-success">AED 300</strong>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

// Main component
const ViewOrder = () => {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'onhold' | 'unpaid' | 'paid'>('onhold')
  const [search, setSearch] = useState('')
  const [showProducts, setShowProducts] = useState(false)

  const handleShow = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  const filteredOrders = orderData.filter((order) => order.status === activeTab && order.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      {/* Trigger Button */}
      <Button variant="dark" size="sm" onClick={handleShow}>
        <IconifyIcon icon="mdi:eye-outline" className="me-1" /> View Orders
      </Button>

      {/* Orders Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Orders</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Tabs */}
          <div className="d-flex gap-2 mb-3">
            {['onhold', 'unpaid', 'paid'].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'warning' : 'light'}
                size="sm"
                className="text-capitalize"
                onClick={() => setActiveTab(tab as any)}>
                {tab}
              </Button>
            ))}
          </div>

          {/* Search */}
          <Form.Control type="text" placeholder="🔍 Search Order ID" className="mb-3" value={search} onChange={(e) => setSearch(e.target.value)} />

          {/* Orders List */}
          {filteredOrders.map((order, index) => (
            <div key={index} className="border rounded p-3 mb-3 shadow-sm" style={{ backgroundColor: '#fff' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge bg="dark" className="px-3 py-1 fs-6">
                  Order ID: {order.id}
                </Badge>
              </div>
              <Row className="small mb-2">
                <Col xs={6}>
                  <strong>Cashier:</strong> {order.cashier}
                </Col>
                <Col xs={6}>
                  <strong>Customer:</strong> {order.customer}
                </Col>
                <Col xs={6}>
                  <strong>Total:</strong> AED {order.total}
                </Col>
                <Col xs={6}>
                  <strong>Date:</strong> {order.date}
                </Col>
              </Row>
              {order.note && <div className="bg-primary-subtle text-primary text-center rounded py-2 px-2 small mb-2">{order.note}</div>}
              <div className="d-flex gap-2">
                <Button size="sm" variant="danger">
                  <IconifyIcon icon="mdi:folder-open-outline" className="me-1" />
                  Open Order
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => {
                    setShowModal(false) // Close Orders modal
                    setShowProducts(true) // Open Products modal
                  }}>
                  <IconifyIcon icon="mdi:cart-outline" className="me-1" />
                  View Products
                </Button>

                <Button size="sm" variant="dark">
                  <IconifyIcon icon="mdi:printer-outline" className="me-1" />
                  Print
                </Button>
              </div>
            </div>
          ))}
        </Modal.Body>
      </Modal>

      {/* Product Details Modal */}
      <ProductDetailsModal
        show={showProducts}
        onHide={() => {
          setShowProducts(false) // Close product modal
          setShowModal(true) // Reopen main order modal if needed
        }}
      />
    </>
  )
}

export default ViewOrder
