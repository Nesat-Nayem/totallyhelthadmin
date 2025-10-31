'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Button, Form, InputGroup } from 'react-bootstrap'
import { useRouter, useSearchParams } from 'next/navigation'
import PageTitle from '@/components/PageTItle'
import UserMembershipDataList from './components/UserMembershipDataList'
import CreateUserMembershipModal from './components/CreateUserMembershipModal'

const UserMembershipPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dataListRef = useRef<any>(null)

  // Check for query parameter to open create modal
  useEffect(() => {
    const openCreateModal = searchParams.get('openCreateModal')
    if (openCreateModal === 'true') {
      setShowCreateModal(true)
      // Clean up the URL by removing the query parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('openCreateModal')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  const handleCreateUserMembership = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  return (
    <>
      <PageTitle title="User Membership Management" />

      <Row>
        <Col>
          <Card style={{ overflow: 'visible' }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">User Membership Management</h4>
              <Button variant="primary" onClick={handleCreateUserMembership}>
                <i className="ri-add-line me-1"></i>
                Create User Membership
              </Button>
            </Card.Header>
            <Card.Body style={{ overflow: 'visible', paddingRight: '0' }}>
              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search user memberships..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline-secondary">
                      <i className="ri-search-line"></i>
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
              
              <UserMembershipDataList ref={dataListRef} searchQuery={searchQuery} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CreateUserMembershipModal 
        show={showCreateModal} 
        onHide={handleCloseModal}
        onSuccess={() => {
          handleCloseModal()
          // Refetch the data list without page reload
          if (dataListRef.current?.refetch) {
            dataListRef.current.refetch()
          }
        }}
      />
    </>
  )
}

export default UserMembershipPage
