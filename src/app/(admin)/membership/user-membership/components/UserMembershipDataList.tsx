'use client'

import React, { useState, useMemo } from 'react'
import { Table, Badge, Button, Dropdown, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useGetUserMembershipsQuery, useUpdateUserMembershipMutation, useDeleteUserMembershipMutation } from '@/services/userMembershipApi'
import { useGetCustomersQuery } from '@/services/customerApi'
import { useGetMealPlansQuery } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'

interface UserMembershipDataListProps {
  searchQuery: string
}

const UserMembershipDataList: React.FC<UserMembershipDataListProps> = ({ searchQuery }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedUserMembership, setSelectedUserMembership] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  const { data: userMembershipsRes, isLoading, error, refetch } = useGetUserMembershipsQuery({ limit: 100 })
  const { data: customersRes } = useGetCustomersQuery({ limit: 1000 })
  const { data: mealPlansRes } = useGetMealPlansQuery({ limit: 1000 })
  const [updateUserMembership, { isLoading: isUpdating }] = useUpdateUserMembershipMutation()
  const [deleteUserMembership, { isLoading: isDeleting }] = useDeleteUserMembershipMutation()

  const userMemberships = useMemo(() => {
    console.log('User memberships response:', userMembershipsRes)
    console.log('User memberships array:', userMembershipsRes?.memberships)
    return userMembershipsRes?.memberships || []
  }, [userMembershipsRes])
  const customers = useMemo(() => customersRes?.data || [], [customersRes])
  const mealPlans = useMemo(() => mealPlansRes?.data || [], [mealPlansRes])

  // Create lookup maps
  const customerMap = useMemo(() => {
    const map: any = {}
    customers.forEach((customer: any) => {
      map[customer._id] = customer
    })
    return map
  }, [customers])

  const mealPlanMap = useMemo(() => {
    const map: any = {}
    mealPlans.forEach((plan: any) => {
      map[plan._id] = plan
    })
    return map
  }, [mealPlans])

  const filteredUserMemberships = useMemo(() => {
    if (!searchQuery.trim()) return userMemberships
    const query = searchQuery.toLowerCase()
    return userMemberships.filter((membership: any) => {
      const customer = customerMap[membership.userId]
      const mealPlan = mealPlanMap[membership.mealPlanId]
      return (
        customer?.name?.toLowerCase().includes(query) ||
        customer?.phone?.toLowerCase().includes(query) ||
        customer?.email?.toLowerCase().includes(query) ||
        mealPlan?.title?.toLowerCase().includes(query) ||
        membership.status?.toLowerCase().includes(query)
      )
    })
  }, [userMemberships, searchQuery, customerMap, mealPlanMap])

  const handleEdit = (userMembership: any) => {
    setSelectedUserMembership(userMembership)
    setEditFormData({
      totalMeals: userMembership.totalMeals || 0,
      consumedMeals: userMembership.consumedMeals || 0,
      remainingMeals: userMembership.remainingMeals || 0, // Get from backend
      status: userMembership.status || 'active',
      isActive: userMembership.isActive !== false
    })
    setShowEditModal(true)
  }

  const handleDelete = (userMembership: any) => {
    setSelectedUserMembership(userMembership)
    setShowDeleteModal(true)
  }

  const handleViewHistory = (userMembership: any) => {
    setSelectedUserMembership(userMembership)
    setShowHistoryModal(true)
  }

  const handleUpdateUserMembership = async () => {
    try {
      console.log('Updating user membership with data:', editFormData)
      
      // Only send fields that should be updated
      // Let backend calculate remainingMeals automatically
      const updateData: any = {}
      
      if (editFormData.consumedMeals !== undefined) {
        updateData.consumedMeals = editFormData.consumedMeals
      }
      // Don't send totalMeals - it should not be editable
      if (editFormData.status !== undefined) {
        updateData.status = editFormData.status
      }
      if (editFormData.isActive !== undefined) {
        updateData.isActive = editFormData.isActive
      }
      
      console.log('Sending update data:', updateData)
      
      await updateUserMembership({
        id: selectedUserMembership._id,
        ...updateData
      }).unwrap()
      
      showSuccess('User membership updated successfully')
      setShowEditModal(false)
      refetch()
    } catch (error: any) {
      console.error('Error updating user membership:', error)
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message
      })
      
      const errorMessage = error?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          'Failed to update user membership'
      showError(errorMessage)
    }
  }

  const handleDeleteUserMembership = async () => {
    try {
      console.log('Deleting user membership:', selectedUserMembership._id)
      
      await deleteUserMembership(selectedUserMembership._id).unwrap()
      showSuccess('User membership deleted successfully')
      setShowDeleteModal(false)
      refetch()
    } catch (error: any) {
      console.error('Error deleting user membership:', error)
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message
      })
      
      const errorMessage = error?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          'Failed to delete user membership'
      showError(errorMessage)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      expired: { variant: 'warning', text: 'Expired' },
      cancelled: { variant: 'danger', text: 'Cancelled' },
      completed: { variant: 'info', text: 'Completed' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats from backend
      let date: Date
      
      if (dateString.includes(',')) {
        // Format: "27/10/2025, 5:30:00 am"
        const [datePart, timePart] = dateString.split(', ')
        const [day, month, year] = datePart.split('/')
        const [time, period] = timePart.split(' ')
        const [hours, minutes, seconds] = time.split(':')
        
        let hour24 = parseInt(hours)
        if (period === 'pm' && hour24 !== 12) hour24 += 12
        if (period === 'am' && hour24 === 12) hour24 = 0
        
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minutes), parseInt(seconds))
      } else {
        // Standard ISO format or other formats
        date = new Date(dateString)
      }
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Date parsing error:', error, 'for date:', dateString)
      return '-'
    }
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
        Failed to load user memberships. Please try again.
      </Alert>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Meal Plan</th>
              <th>Price</th>
              <th>Total Meals</th>
              <th>Remaining</th>
              <th>Consumed</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>History</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUserMemberships.map((userMembership: any) => {
              const customer = customerMap[userMembership.userId]
              // Handle both cases: mealPlanId as object or as string ID
              const mealPlan = userMembership.mealPlanId && typeof userMembership.mealPlanId === 'object' 
                ? userMembership.mealPlanId 
                : mealPlanMap[userMembership.mealPlanId]
              
              // Debug logging
              console.log('User Membership:', {
                id: userMembership._id,
                userId: userMembership.userId,
                mealPlanId: userMembership.mealPlanId,
                customer: customer,
                mealPlan: mealPlan
              })
              
              return (
                <tr key={userMembership._id}>
                  <td>
                    <div>
                      <div className="fw-semibold">
                        {customer?.name || (userMembership.userId ? 'Unknown Customer' : 'No Customer Assigned')}
                      </div>
                      <small className="text-muted">
                        {customer?.phone || (userMembership.userId ? 'ID: ' + userMembership.userId : 'N/A')}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">{mealPlan?.title || 'Unknown Plan'}</div>
                    <small className="text-muted">Plan: ₹{mealPlan?.price || 0}</small>
                    <div className="small text-muted">
                      <span className="badge bg-secondary me-1">{mealPlan?.category || 'N/A'}</span>
                      <span className="badge bg-info">{mealPlan?.brand || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold text-success">₹{userMembership.price || mealPlan?.price || 0}</div>
                    <small className="text-muted">
                      {userMembership.price ? 'Custom Price' : 'Plan Price'}
                    </small>
                  </td>
                  <td>
                    <Badge bg="primary">{userMembership.totalMeals}</Badge>
                  </td>
                  <td>
                    <Badge bg="success">{userMembership.remainingMeals}</Badge>
                  </td>
                  <td>
                    <Badge bg="info">{userMembership.consumedMeals}</Badge>
                  </td>
                  <td>{formatDate(userMembership.startDate)}</td>
                  <td>{formatDate(userMembership.endDate)}</td>
                  <td>{getStatusBadge(userMembership.status)}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <Badge bg="secondary" className="mb-1">
                        {userMembership.history?.length || 0} Events
                      </Badge>
                      <small className="text-muted">
                        {userMembership.history?.length > 0 
                          ? `Last: ${new Date(userMembership.history[userMembership.history.length - 1].timestamp).toLocaleDateString()}`
                          : 'No history'
                        }
                      </small>
                    </div>
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        Actions
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleEdit(userMembership)}>
                          <i className="ri-edit-line me-2"></i>Punch
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleViewHistory(userMembership)}>
                          <i className="ri-history-line me-2"></i>View History
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => handleDelete(userMembership)}
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

      {filteredUserMemberships.length === 0 && (
        <div className="text-center py-4">
          <div className="text-muted">No user memberships found</div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Membership</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col lg={4} md={6}>
              <Form.Group>
                <Form.Label className="text-nowrap">Total Meals</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.totalMeals}
                  readOnly
                  className="bg-light"
                  plaintext
                />
                <Form.Text className="text-muted">
                  Total meals in membership
                </Form.Text>
              </Form.Group>
            </Col>
            <Col lg={4} md={6}>
              <Form.Group>
                <Form.Label className="text-nowrap">Consumed Meals</Form.Label>
                <Form.Control
                  type="number"
                  value={editFormData.consumedMeals}
                  onChange={(e) => setEditFormData({ ...editFormData, consumedMeals: Number(e.target.value) })}
                  min="0"
                  max={editFormData.totalMeals}
                />
                <Form.Text className="text-muted">
                  Meals already consumed
                </Form.Text>
              </Form.Group>
            </Col>
            <Col lg={4} md={12}>
              <Form.Group>
                <Form.Label className="text-nowrap">Remaining Meals</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.remainingMeals}
                  readOnly
                  className="bg-light"
                  plaintext
                />
                <Form.Text className="text-muted">
                  Calculated automatically
                </Form.Text>
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
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Is Active</Form.Label>
                <Form.Select
                  value={editFormData.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* History Section */}
          {selectedUserMembership?.history && selectedUserMembership.history.length > 0 && (
            <>
              <hr className="my-4" />
              <h6>
                <i className="ri-history-line me-2"></i>
                Recent History
              </h6>
              <div className="history-preview" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {[...selectedUserMembership.history]
                  .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 3)
                  .map((event: any) => (
                  <div key={event._id} className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                    <div className={`badge me-2 ${
                      event.action === 'created' ? 'bg-success' :
                      event.action === 'consumed' ? 'bg-info' :
                      event.action === 'updated' ? 'bg-warning' :
                      'bg-secondary'
                    }`}>
                      {event.action === 'created' ? 'Created' :
                       event.action === 'consumed' ? 'Meal' :
                       event.action === 'updated' ? 'Updated' : 'Event'}
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold">
                        {event.action === 'consumed' 
                          ? `Consumed ${event.mealsChanged} meals`
                          : event.notes
                        }
                      </div>
                      <div className="small text-muted">
                        {new Date(event.timestamp).toLocaleDateString()} • 
                        Consumed: {event.consumedMeals} • 
                        Remaining: {event.remainingMeals}
                      </div>
                    </div>
                  </div>
                ))}
                {selectedUserMembership.history.length > 3 && (
                  <div className="text-center">
                    <small className="text-muted">
                      +{selectedUserMembership.history.length - 3} more events
                    </small>
                  </div>
                )}
              </div>
              <div className="text-center mt-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false)
                    handleViewHistory(selectedUserMembership)
                  }}
                >
                  <i className="ri-history-line me-1"></i>
                  View Full History
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateUserMembership}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Membership'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User Membership</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this user membership? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteUserMembership}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-history-line me-2"></i>
            Membership History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserMembership && (
            <div>
              <div className="mb-3">
                <h6>Membership Details</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">Customer:</small>
                    <div className="fw-semibold">
                      {selectedUserMembership.userId ? 'Customer ID: ' + selectedUserMembership.userId : 'No Customer Assigned'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Meal Plan:</small>
                    <div className="fw-semibold">
                      {selectedUserMembership.mealPlanId?.title || 'Unknown Plan'}
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <h6>History Events</h6>
              {selectedUserMembership.history && selectedUserMembership.history.length > 0 ? (
                <div className="simple-history">
                  {[...selectedUserMembership.history]
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event: any, index: number) => (
                    <div key={event._id} className="history-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <div className={`badge me-2 ${
                              event.action === 'created' ? 'bg-success' :
                              event.action === 'consumed' ? 'bg-info' :
                              event.action === 'updated' ? 'bg-warning' :
                              'bg-secondary'
                            }`}>
                              {event.action === 'created' ? 'Created' :
                               event.action === 'consumed' ? 'Meal Consumed' :
                               event.action === 'updated' ? 'Updated' : 'Event'}
                            </div>
                            <small className="text-muted">
                              {new Date(event.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </div>
                          <div className="text-muted small mb-2">
                            {event.action === 'consumed' 
                              ? `Consumed ${event.mealsChanged} meals`
                              : event.notes
                            }
                          </div>
                          <div className="d-flex gap-3">
                            <span className="text-info">
                              <i className="ri-restaurant-line me-1"></i>
                              Consumed: {event.consumedMeals}
                            </span>
                            <span className="text-success">
                              <i className="ri-time-line me-1"></i>
                              Remaining: {event.remainingMeals}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="ri-history-line text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">No history available</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default UserMembershipDataList
