'use client'

import React, { useState } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { useCreateCustomerMutation } from '@/services/customerApi'
import { showSuccess, showError } from '@/utils/sweetAlert'

interface CreateCustomerModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'active' as 'active' | 'inactive'
  })
  const [errors, setErrors] = useState<any>({})

  const [createCustomer, { isLoading }] = useCreateCustomerMutation()

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await createCustomer(formData).unwrap()
      showSuccess('Customer created successfully')
      onSuccess()
      handleClose()
    } catch (error: any) {
      showError(error?.data?.message || 'Failed to create customer')
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'active'
    })
    setErrors({})
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Customer</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  placeholder="Enter customer name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  isInvalid={!!errors.phone}
                  placeholder="Enter phone number"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  isInvalid={!!errors.email}
                  placeholder="Enter email address"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter customer address"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Customer'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateCustomerModal
