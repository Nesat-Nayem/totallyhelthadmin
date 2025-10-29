'use client'

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Table, Badge, Button, Dropdown, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { useGetUserMembershipsQuery, useUpdateUserMembershipMutation, useDeleteUserMembershipMutation } from '@/services/userMembershipApi'
import { useGetCustomersQuery } from '@/services/customerApi'
import { useGetMealPlansQuery } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { useAccessControl } from '@/hooks/useAccessControl'

interface UserMembershipDataListProps {
  searchQuery: string
}

export interface UserMembershipDataListRef {
  refetch: () => void
}

const UserMembershipDataList = forwardRef<UserMembershipDataListRef, UserMembershipDataListProps>(({ searchQuery }, ref) => {
  const router = useRouter()
  const { hasAccessToSubModule, isAdmin } = useAccessControl()
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showConsumedHistoryModal, setShowConsumedHistoryModal] = useState(false)
  const [selectedUserMembership, setSelectedUserMembership] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  const { data: userMembershipsRes, isLoading, error, refetch } = useGetUserMembershipsQuery({ limit: 100 })
  const { data: customersRes } = useGetCustomersQuery({ limit: 1000 })
  const { data: mealPlansRes } = useGetMealPlansQuery({ limit: 1000 })
  const [updateUserMembership, { isLoading: isUpdating }] = useUpdateUserMembershipMutation()
  const [deleteUserMembership, { isLoading: isDeleting }] = useDeleteUserMembershipMutation()

  // Role-based access control
  const canManageMembership = isAdmin || hasAccessToSubModule('membership', 'user-membership')

  // Expose refetch function to parent component
  useImperativeHandle(ref, () => ({
    refetch: () => {
      console.log('Refetching user memberships...')
      refetch()
    }
  }), [refetch])


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
      // Handle populated userId (object) or string ID
      const customer = membership.userId && typeof membership.userId === 'object' 
        ? membership.userId 
        : customerMap[membership.userId]
      
      // Handle populated mealPlanId (object) or string ID
      const mealPlan = membership.mealPlanId && typeof membership.mealPlanId === 'object' 
        ? membership.mealPlanId 
        : mealPlanMap[membership.mealPlanId]
      
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
    if (!canManageMembership) {
      showError('You do not have permission to manage user memberships')
      return
    }
    
    console.log('Editing user membership:', userMembership)
    
    setSelectedUserMembership(userMembership)
    setEditFormData({
      totalMeals: userMembership.totalMeals || 0,
      consumedMeals: userMembership.consumedMeals || 0,
      remainingMeals: userMembership.remainingMeals || 0,
      status: userMembership.status || 'active',
      isActive: userMembership.isActive !== false,
      note: userMembership.note || ''
    })
    setShowEditModal(true)
  }

  const handleDelete = (userMembership: any) => {
    if (!canManageMembership) {
      showError('You do not have permission to manage user memberships')
      return
    }
    
    setSelectedUserMembership(userMembership)
    setShowDeleteModal(true)
  }

  const handleViewHistory = (userMembership: any) => {
    setSelectedUserMembership(userMembership)
    setShowHistoryModal(true)
  }

  const handleViewConsumedHistory = (userMembership: any) => {
    setSelectedUserMembership(userMembership)
    setShowConsumedHistoryModal(true)
  }

  const handleUpdateUserMembership = async () => {
    if (!canManageMembership) {
      showError('You do not have permission to manage user memberships')
      return
    }
    
    try {
      console.log('Updating user membership with data:', editFormData)
      
      // Only send fields that should be updated
      const updateData: any = {}
      
      if (editFormData.consumedMeals !== undefined) {
        updateData.consumedMeals = editFormData.consumedMeals
      }
      if (editFormData.status !== undefined) {
        updateData.status = editFormData.status
      }
      if (editFormData.isActive !== undefined) {
        updateData.isActive = editFormData.isActive
      }
      
      if (editFormData.note !== undefined) {
        updateData.note = editFormData.note
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
    if (!canManageMembership) {
      showError('You do not have permission to manage user memberships')
      return
    }
    
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

  const getPaymentStatusBadge = (paymentStatus: string, receivedAmount: number = 0, totalPrice: number = 0) => {
    // Determine payment status based on received amount
    let status = paymentStatus
    if (receivedAmount === totalPrice && totalPrice > 0) {
      status = 'paid'
    } else {
      status = 'unpaid'
    }

    const statusConfig = {
      paid: { variant: 'success', text: 'Paid' },
      unpaid: { variant: 'danger', text: 'Unpaid' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid
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
              <th>Payment Status</th>
              <th>History</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUserMemberships.map((userMembership: any) => {
              // Handle populated userId (object) or string ID
              const customer = userMembership.userId && typeof userMembership.userId === 'object' 
                ? userMembership.userId 
                : customerMap[userMembership.userId]
              
              // Handle both cases: mealPlanId as object or as string ID
              const mealPlan = userMembership.mealPlanId && typeof userMembership.mealPlanId === 'object' 
                ? userMembership.mealPlanId 
                : mealPlanMap[userMembership.mealPlanId]
              
              return (
                <tr key={userMembership._id}>
                  <td>
                    <div>
                      <div className="fw-semibold">
                        {customer?.name || 'No Customer Assigned'}
                      </div>
                      {customer?.phone && (
                      <small className="text-muted">
                          {customer.phone}
                      </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">{mealPlan?.title || 'Unknown Plan'}</div>
                    <small className="text-muted">Plan: ₹{mealPlan?.price || 0}</small>
                    {(mealPlan?.category || mealPlan?.brand) && (
                    <div className="small text-muted">
                        {mealPlan?.category && (
                          <span className="badge bg-secondary me-1">{mealPlan.category}</span>
                        )}
                        {mealPlan?.brand && (
                          <span className="badge bg-info">{mealPlan.brand}</span>
                        )}
                    </div>
                    )}
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
                    {getPaymentStatusBadge(
                      userMembership.paymentStatus, 
                      userMembership.receivedAmount || 0, 
                      userMembership.totalPrice || 0
                    )}
                  </td>

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
                        {canManageMembership && (
                          <>
                        <Dropdown.Item onClick={() => handleEdit(userMembership)}>
                          <i className="ri-edit-line me-2"></i>Punch
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => {
                            router.push(`/membership/membership-meal-selection?id=${userMembership._id}`)
                          }}
                        >
                          <i className="ri-restaurant-line me-2"></i>Membership Meal Selection
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => handleDelete(userMembership)}
                          className="text-danger"
                        >
                          <i className="ri-delete-bin-line me-2"></i>Delete
                            </Dropdown.Item>
                          </>
                        )}
                        <Dropdown.Item onClick={() => handleViewHistory(userMembership)}>
                          <i className="ri-history-line me-2"></i>View History
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleViewConsumedHistory(userMembership)}>
                          <i className="ri-restaurant-line me-2"></i>View Consumed Meals History
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
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title className="fw-semibold text-primary">
            <i className="ri-user-settings-line me-2"></i>
            Punch User Membership
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* Meal Information Section */}
          <div className="mb-4">
            <h6 className="text-primary mb-3 fw-semibold">
              <i className="ri-restaurant-line me-2"></i>
              Meal Information
            </h6>
            <Row className="g-3">
              <Col lg={4} md={6}>
                <Form.Group>
                  <Form.Label className="text-nowrap fw-medium">Total Meals</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.totalMeals}
                    readOnly
                    className="bg-light border-0"
                    plaintext
                  />
                  <Form.Text className="text-muted small">
                    Total meals in membership
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col lg={4} md={6}>
                <Form.Group>
                  <Form.Label className="text-nowrap fw-medium">Consumed Meals</Form.Label>
                  <Form.Control
                    type="number"
                    value={editFormData.consumedMeals}
                    onChange={(e) => setEditFormData({ ...editFormData, consumedMeals: Number(e.target.value) })}
                    min="0"
                    max={editFormData.totalMeals}
                    className="border-primary"
                  />
                  <Form.Text className="text-muted small">
                    Meals already consumed
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col lg={4} md={12}>
                <Form.Group>
                  <Form.Label className="text-nowrap fw-medium">Remaining Meals</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.remainingMeals}
                    readOnly
                    className="bg-light border-0"
                    plaintext
                  />
                  <Form.Text className="text-muted small">
                    Calculated automatically
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Status Section */}
          <div className="mb-4">
            <h6 className="text-primary mb-3 fw-semibold">
              <i className="ri-settings-3-line me-2"></i>
              Status
            </h6>
            <Row className="g-3">
              <Col lg={6} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Status</Form.Label>
                  <Form.Select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="border-primary"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    {/* <option value="cancelled">Cancelled</option> */}
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col lg={6} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Is Active</Form.Label>
                  <Form.Select
                    value={editFormData.isActive ? 'true' : 'false'}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'true' })}
                    className="border-primary"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>


          {/* History Section */}
          {selectedUserMembership?.history && selectedUserMembership.history.length > 0 && (
            <div className="mb-4">
              <h6 className="text-primary mb-3 fw-semibold">
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
                        {event.totalPrice && (
                          <span> • Total: AED {event.totalPrice}</span>
                        )}
                        {event.cumulativePaid && (
                          <span> • Cumulative Paid: AED {event.cumulativePaid}</span>
                        )}
                        {event.payableAmount && (
                          <span> • Payable: AED {event.payableAmount}</span>
                        )}
                        {event.paymentMode && (
                          <span> • Mode: {event.paymentMode}</span>
                        )}
                        {event.paymentStatus && (
                          <span> • Status: {event.paymentStatus}</span>
                        )}
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light border-top p-3">
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowEditModal(false)}
              className="px-4"
            >
              <i className="ri-close-line me-1"></i>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateUserMembership}
              disabled={isUpdating}
              className="px-4"
            >
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="ri-save-line me-1"></i>
                  Update Membership
                </>
              )}
            </Button>
          </div>
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
              <div className="mb-4">
                <h6>Membership Details</h6>
                <div className="row">
                  <div className="col-md-4">
                    <small className="text-muted">Customer:</small>
                    <div className="fw-semibold">
                      {selectedUserMembership.userId && typeof selectedUserMembership.userId === 'object' 
                        ? selectedUserMembership.userId.name 
                        : 'No Customer Assigned'}
                    </div>
                    {selectedUserMembership.userId && typeof selectedUserMembership.userId === 'object' && selectedUserMembership.userId.phone && (
                      <div className="small text-muted">
                        {selectedUserMembership.userId.phone}
                  </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted">Meal Plan:</small>
                    <div className="fw-semibold">
                      {selectedUserMembership.mealPlanId?.title || 'Unknown Plan'}
                    </div>
                    <div className="small text-muted">
                      AED {selectedUserMembership.mealPlanId?.price || 0}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted">Status:</small>
                    <div className="fw-semibold">
                      <span className={`badge ${selectedUserMembership.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {selectedUserMembership.status?.charAt(0).toUpperCase() + selectedUserMembership.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="text-primary mb-3">Payment Summary</h6>
                <div className="row">
                  <div className="col-md-3">
                    <small className="text-muted">Total Price:</small>
                    <div className="fw-bold">AED {selectedUserMembership.totalPrice || 0}</div>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Cumulative Paid:</small>
                    <div className="fw-bold text-success">AED {selectedUserMembership.cumulativePaid || 0}</div>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Payable Amount:</small>
                    <div className="fw-bold text-danger">AED {selectedUserMembership.payableAmount || 0}</div>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Payment Status:</small>
                    <div className="fw-bold">
                      {getPaymentStatusBadge(
                        selectedUserMembership.paymentStatus, 
                        selectedUserMembership.receivedAmount || 0, 
                        selectedUserMembership.totalPrice || 0
                      )}
                    </div>
                  </div>
                </div>
                {selectedUserMembership.paymentMode && (
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <small className="text-muted">Payment Mode:</small>
                      <div className="fw-semibold text-capitalize">{selectedUserMembership.paymentMode}</div>
                    </div>
                    {selectedUserMembership.note && (
                      <div className="col-md-6">
                        <small className="text-muted">Note:</small>
                        <div className="fw-semibold">{selectedUserMembership.note}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Meal Summary */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="text-info mb-3">Meal Summary</h6>
                <div className="row">
                  <div className="col-md-4">
                    <small className="text-muted">Total Meals:</small>
                    <div className="fw-bold">{(selectedUserMembership.totalMeals || 0).toLocaleString()}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted">Consumed Meals:</small>
                    <div className="fw-bold text-warning">{(selectedUserMembership.consumedMeals || 0).toLocaleString()}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted">Remaining Meals:</small>
                    <div className="fw-bold text-success">{(selectedUserMembership.remainingMeals || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <hr />

              <h6>Detailed History Events</h6>
              {selectedUserMembership.history && selectedUserMembership.history.length > 0 ? (
                <div className="detailed-history" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {[...selectedUserMembership.history]
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event: any, index: number) => (
                    <div key={event._id} className="history-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <div className={`badge me-2 ${
                              event.action === 'created' ? 'bg-success' :
                              event.action === 'consumed' ? 'bg-info' :
                              event.action === 'payment_updated' ? 'bg-primary' :
                              event.action === 'updated' ? 'bg-warning' :
                              'bg-secondary'
                            }`}>
                              {event.action === 'created' ? 'Created' :
                               event.action === 'consumed' ? 'Meal Consumed' :
                               event.action === 'payment_updated' ? 'Payment Updated' :
                               event.action === 'updated' ? 'Updated' : 'Event'}
                            </div>
                            <small className="text-muted">
                              {new Date(event.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </small>
                          </div>
                          
                          <div className="text-muted small mb-3">
                            {event.notes}
                          </div>

                          {/* Meal Details */}
                          {(event.action === 'consumed' || event.mealsChanged > 0) && (
                            <div className="mb-3 p-2 bg-light rounded">
                              <h6 className="text-info mb-2">
                              <i className="ri-restaurant-line me-1"></i>
                                Meal Details
                              </h6>
                              <div className="row">
                                <div className="col-md-4">
                                  <small className="text-muted">Meals Changed:</small>
                                  <div className="fw-bold text-warning">+{event.mealsChanged || 0}</div>
                                </div>
                                <div className="col-md-4">
                                  <small className="text-muted">Total Consumed:</small>
                                  <div className="fw-bold text-info">{event.consumedMeals || 0}</div>
                                </div>
                                <div className="col-md-4">
                                  <small className="text-muted">Remaining:</small>
                                  <div className="fw-bold text-success">{event.remainingMeals || 0}</div>
                                </div>
                              </div>
                              {event.mealType && (
                                <div className="mt-2">
                                  <small className="text-muted">Meal Type:</small>
                                  <span className="badge bg-secondary ms-1 text-capitalize">{event.mealType}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Payment Details */}
                          {(event.action === 'payment_updated' || event.action === 'created') && (event.totalPrice || event.cumulativePaid || event.payableAmount) && (
                            <div className="mb-3 p-2 bg-light rounded">
                              <h6 className="text-primary mb-2">
                                <i className="ri-money-dollar-circle-line me-1"></i>
                                Payment Details
                              </h6>
                              <div className="row">
                                {event.totalPrice && (
                                  <div className="col-md-3">
                                    <small className="text-muted">Total Price:</small>
                                    <div className="fw-bold">AED {event.totalPrice}</div>
                                  </div>
                                )}
                                {event.cumulativePaid !== undefined && (
                                  <div className="col-md-3">
                                    <small className="text-muted">Cumulative Paid:</small>
                                    <div className="fw-bold text-success">AED {event.cumulativePaid}</div>
                                  </div>
                                )}
                                {event.payableAmount !== undefined && (
                                  <div className="col-md-3">
                                    <small className="text-muted">Payable Amount:</small>
                                    <div className="fw-bold text-danger">AED {event.payableAmount}</div>
                                  </div>
                                )}
                                {event.receivedAmount && (
                                  <div className="col-md-3">
                                    <small className="text-muted">Received Amount:</small>
                                    <div className="fw-bold text-info">AED {event.receivedAmount}</div>
                                  </div>
                                )}
                              </div>
                              <div className="row mt-2">
                                {event.paymentMode && (
                                  <div className="col-md-4">
                                    <small className="text-muted">Payment Mode:</small>
                                    <div className="fw-semibold text-capitalize">{event.paymentMode}</div>
                                  </div>
                                )}
                                {event.paymentStatus && (
                                  <div className="col-md-4">
                                    <small className="text-muted">Payment Status:</small>
                                    <div className="fw-semibold">
                                      {getPaymentStatusBadge(
                                        event.paymentStatus, 
                                        event.receivedAmount || 0, 
                                        event.totalPrice || 0
                                      )}
                                    </div>
                                  </div>
                                )}
                                {event.amountPaid && (
                                  <div className="col-md-4">
                                    <small className="text-muted">Amount Paid:</small>
                                    <div className="fw-bold text-success">AED {event.amountPaid}</div>
                                  </div>
                                )}
                              </div>
                              {event.amountChanged && (
                                <div className="mt-2">
                                  <small className="text-muted">Amount Changed:</small>
                                  <span className="badge bg-info ms-1">AED {event.amountChanged}</span>
                                </div>
                              )}
                            </div>
                          )}
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

      {/* Consumed Meals History Modal */}
      <Modal show={showConsumedHistoryModal} onHide={() => setShowConsumedHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-restaurant-line me-2"></i>
            Consumed Meals History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserMembership && (
            <div>
              <div className="mb-4">
                <h6>Membership Details</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">Customer:</small>
                    <div className="fw-semibold">
                      {selectedUserMembership.userId && typeof selectedUserMembership.userId === 'object' 
                        ? selectedUserMembership.userId.name 
                        : 'No Customer Assigned'}
                    </div>
                    {selectedUserMembership.userId && typeof selectedUserMembership.userId === 'object' && selectedUserMembership.userId.phone && (
                      <div className="small text-muted">
                        {selectedUserMembership.userId.phone}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Meal Plan:</small>
                    <div className="fw-semibold">
                      {selectedUserMembership.mealPlanId?.title || 'Unknown Plan'}
                    </div>
                    <div className="small text-muted">
                      AED {selectedUserMembership.mealPlanId?.price || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meal Summary */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="text-info mb-3">Meal Summary</h6>
                <div className="row">
                  <div className="col-md-4">
                    <small className="text-muted">Total Meals:</small>
                    <div className="fw-bold">{(selectedUserMembership.totalMeals || 0).toLocaleString()}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted">Consumed Meals:</small>
                    <div className="fw-bold text-warning">{(selectedUserMembership.consumedMeals || 0).toLocaleString()}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted">Remaining Meals:</small>
                    <div className="fw-bold text-success">{(selectedUserMembership.remainingMeals || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <hr />

              <h6>Meal Consumption History</h6>
              {selectedUserMembership.history && selectedUserMembership.history.length > 0 ? (
                <div className="consumed-history" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {[...selectedUserMembership.history]
                    .filter((event: any) => event.action === 'consumed' && event.mealsChanged > 0)
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event: any, index: number) => (
                    <div key={event._id} className="consumed-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <div className="badge bg-info me-2">
                              <i className="ri-restaurant-line me-1"></i>
                              Meal Consumed
                            </div>
                            <small className="text-muted">
                              {new Date(event.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </small>
                          </div>
                          
                          <div className="text-muted small mb-3">
                            {event.notes}
                          </div>

                          {/* Meal Details */}
                          <div className="p-3 bg-light rounded">
                            <h6 className="text-info mb-2">
                              <i className="ri-restaurant-line me-1"></i>
                              Consumption Details
                            </h6>
                            <div className="row">
                              <div className="col-md-4">
                                <small className="text-muted">Meals Consumed:</small>
                                <div className="fw-bold text-warning fs-5">+{event.mealsChanged || 0}</div>
                              </div>
                              <div className="col-md-4">
                                <small className="text-muted">Total Consumed:</small>
                                <div className="fw-bold text-info fs-5">{event.consumedMeals || 0}</div>
                              </div>
                              <div className="col-md-4">
                                <small className="text-muted">Remaining:</small>
                                <div className="fw-bold text-success fs-5">{event.remainingMeals || 0}</div>
                              </div>
                            </div>
                            {event.mealType && (
                              <div className="mt-2">
                                <small className="text-muted">Meal Type:</small>
                                <span className="badge bg-secondary ms-1 text-capitalize">{event.mealType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show message if no consumed meals */}
                  {[...selectedUserMembership.history]
                    .filter((event: any) => event.action === 'consumed' && event.mealsChanged > 0)
                    .length === 0 && (
                    <div className="text-center py-4">
                      <i className="ri-restaurant-line text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-2">No meals consumed yet</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="ri-restaurant-line text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">No consumption history available</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConsumedHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
})

UserMembershipDataList.displayName = 'UserMembershipDataList'

export default UserMembershipDataList
