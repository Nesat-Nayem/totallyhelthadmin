'use client'

import React, { useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'

const CustomerModal = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  const handleShowModal = () => setShowCustomerModal(true)
  const handleCloseModal = () => setShowCustomerModal(false)

  return (
    <>
      <Row className="mb-3">
        <Col md={12}>
          {/* Open Modal Button */}
          <Button size="sm" variant="primary" onClick={handleShowModal}>
            Add Customers
          </Button>
        </Col>
      </Row>

      {/* Customer Modal */}
      <Modal show={showCustomerModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control placeholder="Enter Name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control placeholder="Enter phone number" />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control placeholder="Enter Email" />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>plan Start Date</Form.Label>
                  <Form.Control placeholder="Enter Due" type="date" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={handleCloseModal}>
            Reset
          </Button>
          <Button variant="danger" onClick={() => alert('Customer Saved!')}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomerModal
