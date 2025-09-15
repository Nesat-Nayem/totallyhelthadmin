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
          <Button size="lg" variant="primary" onClick={handleShowModal}>
            + Add Customers
          </Button>
        </Col>
      </Row>

      {/* Customer Modal */}
      <Modal show={showCustomerModal} onHide={handleCloseModal} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Create Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label>plan End Date</Form.Label>
                  <Form.Control placeholder="Enter Due" type="date" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Meal Plan Type</Form.Label>
                  <Form.Control placeholder="plan type" type="text" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>No Of Meals</Form.Label>
                  <Form.Control placeholder="Enter no of meal" type="text" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price</Form.Label>
                  <Form.Control placeholder="Enter price" type="text" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Discount</Form.Label>
                  <Form.Control placeholder="Enter Discount" type="text" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Vat</Form.Label>
                  <Form.Control placeholder="Enter VAT" type="text" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address 1</Form.Label>
                  <textarea name="" id="" cols={30} rows={4} placeholder="Enter Address" className="form-control"></textarea>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address 2</Form.Label>
                  <textarea name="" id="" cols={30} rows={4} placeholder="Enter Address" className="form-control"></textarea>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={handleCloseModal}>
            Reset
          </Button>
          <Button variant="success" onClick={() => alert('Customer Saved!')}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomerModal
