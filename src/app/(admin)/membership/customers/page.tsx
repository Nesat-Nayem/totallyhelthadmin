'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Form, InputGroup } from 'react-bootstrap'
import { useRouter, useSearchParams } from 'next/navigation'
import PageTitle from '@/components/PageTItle'
import CustomerDataList from './components/CustomerDataList'
import CreateCustomerModal from './components/CreateCustomerModal'

const CustomerPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Check for query parameter to open add customer modal
  useEffect(() => {
    const openAddCustomerModal = searchParams.get('openAddCustomerModal')
    const fromUserMembership = searchParams.get('fromUserMembership')
    
    if (openAddCustomerModal === 'true') {
      setShowCreateModal(true)
      // Store if this came from user membership page
      if (fromUserMembership === 'true') {
        setRedirectAfterCreate('userMembership')
      }
      // Clean up the URL by removing the query parameters
      const url = new URL(window.location.href)
      url.searchParams.delete('openAddCustomerModal')
      url.searchParams.delete('fromUserMembership')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  // Store the source page for redirection after customer creation
  const [redirectAfterCreate, setRedirectAfterCreate] = useState<string | null>(null)

  const handleCreateCustomer = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  return (
    <>
      <PageTitle title="Customer Management" />

      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Customer Management</h4>
              <Button variant="primary" onClick={handleCreateCustomer}>
                <i className="ri-add-line me-1"></i>
                Add Customer
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline-secondary">
                      <i className="ri-search-line"></i>
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
              
              <CustomerDataList searchQuery={searchQuery} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CreateCustomerModal 
        show={showCreateModal} 
        onHide={handleCloseModal}
        onSuccess={() => {
          handleCloseModal()
          // Check where to redirect after customer creation
          if (redirectAfterCreate === 'userMembership') {
            // Redirect back to user membership page with create modal open
            router.push('/membership/user-membership?openCreateModal=true')
          } else {
            // Refresh the list for normal customer management
            window.location.reload()
          }
        }}
      />
    </>
  )
}

export default CustomerPage
