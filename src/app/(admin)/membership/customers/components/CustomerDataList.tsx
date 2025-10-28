'use client'

import React, { useState, useMemo } from 'react'
import { Table, Badge, Button, Dropdown, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useGetCustomersQuery, useUpdateCustomerMutation, useDeleteCustomerMutation } from '@/services/customerApi'
import { useGetUserMembershipsQuery } from '@/services/userMembershipApi'
import { showSuccess, showError } from '@/utils/sweetAlert'

interface CustomerDataListProps {
  searchQuery: string
}

const CustomerDataList: React.FC<CustomerDataListProps> = ({ searchQuery }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  const { data: customersRes, isLoading, error, refetch } = useGetCustomersQuery({ limit: 100 })
  const { data: userMembershipsRes } = useGetUserMembershipsQuery({ limit: 1000 })
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation()
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation()

  const customers = useMemo(() => customersRes?.data || [], [customersRes])
  const userMemberships = useMemo(() => userMembershipsRes?.memberships || [], [userMembershipsRes])

  // Create a map of active memberships by customer
  const activeMembershipsByCustomer = useMemo(() => {
    const map: any = {}
    userMemberships.forEach((membership: any) => {
      if (membership.status === 'active' && membership.remainingMeals > 0) {
        if (!map[membership.userId]) {
          map[membership.userId] = []
        }
        map[membership.userId].push(membership)
      }
    })
    return map
  }, [userMemberships])

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const query = searchQuery.toLowerCase()
    return customers.filter((customer: any) =>
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.address?.toLowerCase().includes(query)
    )
  }, [customers, searchQuery])

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer)
    setEditFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      status: customer.status || 'active'
    })
    setShowEditModal(true)
  }

  const handleDelete = (customer: any) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  const handleUpdateCustomer = async () => {
    try {
      await updateCustomer({
        id: selectedCustomer._id,
        ...editFormData
      }).unwrap()
      
      showSuccess('Customer updated successfully')
      setShowEditModal(false)
      refetch()
    } catch (error: any) {
      showError(error?.data?.message || 'Failed to update customer')
    }
  }

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer(selectedCustomer._id).unwrap()
      showSuccess('Customer deleted successfully')
      setShowDeleteModal(false)
      refetch()
    } catch (error: any) {
      showError(error?.data?.message || 'Failed to delete customer')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        Failed to load customers. Please try again.
      </Alert>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Active Memberships</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer: any) => {
              const activeMemberships = activeMembershipsByCustomer[customer._id] || []
              
              return (
                <tr key={customer._id}>
                  <td>
                    <div className="fw-semibold">{customer.name}</div>
                  </td>
                  <td>
                    <div>{customer.phone || '-'}</div>
                  </td>
                  <td>
                    <div>{customer.email || '-'}</div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      {customer.address ? (
                        <span className="text-muted">
                          {customer.address.length > 50 
                            ? `${customer.address.substring(0, 50)}...` 
                            : customer.address
                          }
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {activeMemberships.length > 0 ? (
                      <div>
                        <Badge bg="success">{activeMemberships.length} Active</Badge>
                        <div className="small text-muted mt-1">
                          {activeMemberships.reduce((total: number, m: any) => total + m.remainingMeals, 0)} meals remaining
                        </div>
                      </div>
                    ) : (
                      <Badge bg="secondary">No Active</Badge>
                    )}
                  </td>
                  <td>{getStatusBadge(customer.status)}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        Actions
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleEdit(customer)}>
                          <i className="ri-edit-line me-2"></i>Edit
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => handleDelete(customer)}
                          className="text-danger"
                        >
                          <i className="ri-delete-bin-line me-2"></i>Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-4">
          <div className="text-muted">No customers found</div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
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
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateCustomer}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Customer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete &quot;{selectedCustomer?.name}&quot;? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCustomer}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomerDataList
