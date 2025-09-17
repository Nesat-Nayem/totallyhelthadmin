'use client'

import React, { useState } from 'react'
import { Modal, Button, Form, Row, Col, ListGroup, InputGroup } from 'react-bootstrap'
import { useLazyGetCustomersQuery, useCreateCustomerMutation } from '@/services/customerApi'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface CustomerModalProps {
  onCustomerSelect?: (customer: any) => void
  selectedCustomer?: any
}

const CustomerModal: React.FC<CustomerModalProps> = ({ onCustomerSelect, selectedCustomer }) => {
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Form fields for new customer
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  
  const [searchCustomers, { isLoading: isSearching }] = useLazyGetCustomersQuery()
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation()

  const handleShowModal = () => {
    setShowCustomerModal(true)
    setShowCreateForm(false)
    setSearchResults([])
  }
  
  const handleCloseModal = () => {
    setShowCustomerModal(false)
    setShowCreateForm(false)
    setSearchResults([])
    // Reset form
    setName('')
    setPhone('')
    setEmail('')
    setAddress1('')
    setAddress2('')
    setSearchPhone('')
  }
  
  const handleSearch = async () => {
    if (!searchPhone) return
    try {
      const result = await searchCustomers({ q: searchPhone }).unwrap()
      setSearchResults(result.data || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    }
  }
  
  const handleSelectCustomer = (customer: any) => {
    onCustomerSelect?.(customer)
    handleCloseModal()
  }
  
  const handleCreateCustomer = async () => {
    if (!name || !phone) {
      alert('Name and phone are required')
      return
    }
    
    try {
      const newCustomer = await createCustomer({
        name,
        phone,
        email,
        address: address1 + (address2 ? ', ' + address2 : '')
      }).unwrap()
      
      onCustomerSelect?.(newCustomer)
      handleCloseModal()
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to create customer')
    }
  }

  return (
    <>
      <div className="mb-3">
        {selectedCustomer ? (
          <div className="d-flex align-items-center gap-2">
            <div className="flex-grow-1">
              <div className="fw-bold">{selectedCustomer.name}</div>
              <small className="text-muted">{selectedCustomer.phone}</small>
            </div>
            <Button size="sm" variant="outline-primary" onClick={handleShowModal}>
              Change
            </Button>
          </div>
        ) : (
          <Button size="lg" variant="primary" onClick={handleShowModal} className="w-100">
            <IconifyIcon icon="mdi:account-plus" /> Select Customer
          </Button>
        )}
      </div>

      {/* Customer Modal */}
      <Modal show={showCustomerModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{showCreateForm ? 'Create Customer' : 'Search Customer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!showCreateForm ? (
            <>
              {/* Search Section */}
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Search by phone number..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="primary" onClick={handleSearch} disabled={isSearching}>
                  <IconifyIcon icon="mdi:magnify" /> Search
                </Button>
              </InputGroup>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h6>Search Results:</h6>
                  <ListGroup>
                    {searchResults.map((customer: any) => (
                      <ListGroup.Item 
                        key={customer._id} 
                        action 
                        onClick={() => handleSelectCustomer(customer)}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-bold">{customer.name}</div>
                          <small className="text-muted">{customer.phone} {customer.email && `• ${customer.email}`}</small>
                        </div>
                        <Button size="sm" variant="primary">
                          Select
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
              
              {searchPhone && searchResults.length === 0 && !isSearching && (
                <div className="text-center py-3">
                  <p className="text-muted">No customer found with this phone number</p>
                  <Button variant="success" onClick={() => {
                    setPhone(searchPhone)
                    setShowCreateForm(true)
                  }}>
                    <IconifyIcon icon="mdi:account-plus" /> Create New Customer
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Form>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Name *</Form.Label>
                    <Form.Control 
                      placeholder="Enter Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone *</Form.Label>
                    <Form.Control 
                      placeholder="Enter phone number" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      placeholder="Enter Email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Address 1</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter Address"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Address 2</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter Address (optional)"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {showCreateForm && (
            <Button variant="outline-secondary" onClick={() => setShowCreateForm(false)}>
              Back to Search
            </Button>
          )}
          <Button variant="outline-danger" onClick={handleCloseModal}>
            Cancel
          </Button>
          {showCreateForm && (
            <Button variant="success" onClick={handleCreateCustomer} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Customer'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomerModal
