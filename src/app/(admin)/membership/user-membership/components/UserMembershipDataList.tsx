'use client'

import React, { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Table, Badge, Button, Dropdown, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { useGetUserMembershipsQuery, useGetUserMembershipByIdQuery, useUpdateUserMembershipMutation, useDeleteUserMembershipMutation, useSetMembershipStatusMutation } from '@/services/userMembershipApi'
import { useGetCustomersQuery } from '@/services/customerApi'
import { useGetMealPlansQuery } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { useAccessControl } from '@/hooks/useAccessControl'
import EditMealModal from './EditMealModal'

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
  const [showWeeksModal, setShowWeeksModal] = useState(false)
  const [showSingleWeekModal, setShowSingleWeekModal] = useState(false)
  const [showEditMealModal, setShowEditMealModal] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<any>(null)
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [selectedUserMembership, setSelectedUserMembership] = useState<any>(null)
  const [selectedUserMembershipId, setSelectedUserMembershipId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)

  const { data: userMembershipsRes, isLoading, error, refetch } = useGetUserMembershipsQuery({ page: currentPage, limit: limit })
  const { data: customersRes } = useGetCustomersQuery({ limit: 1000 })
  const { data: mealPlansRes } = useGetMealPlansQuery({ limit: 1000 })
  const { data: singleUserMembershipData, refetch: refetchSingleMembership } = useGetUserMembershipByIdQuery(selectedUserMembershipId || '', { skip: !selectedUserMembershipId })
  const [updateUserMembership, { isLoading: isUpdating }] = useUpdateUserMembershipMutation()
  const [setMembershipStatus, { isLoading: isSettingStatus }] = useSetMembershipStatusMutation()
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

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Update selected membership when single membership data is fetched
  useEffect(() => {
    if (singleUserMembershipData && selectedUserMembershipId) {
      setSelectedUserMembership(singleUserMembershipData)
    }
  }, [singleUserMembershipData, selectedUserMembershipId])

  const userMemberships = useMemo(() => {
    console.log('User memberships response:', userMembershipsRes)
    console.log('User memberships array:', userMembershipsRes?.memberships)
    return userMembershipsRes?.memberships || []
  }, [userMembershipsRes])

  const pagination = useMemo(() => {
    return userMembershipsRes?.pagination || null
  }, [userMembershipsRes])

  const totalPages = useMemo(() => {
    if (pagination?.totalPages) {
      return pagination.totalPages
    }
    return 1
  }, [pagination])
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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

  const handleViewHistory = async (userMembership: any) => {
    // Set the ID to trigger the query
    setSelectedUserMembershipId(userMembership._id)
    // Use existing data immediately, will update when query completes
    setSelectedUserMembership(userMembership)
    setShowHistoryModal(true)
    // Refetch the specific membership by ID
    if (userMembership._id) {
      try {
        const result = await refetchSingleMembership()
        if (result.data) {
          setSelectedUserMembership(result.data)
        }
      } catch (error: any) {
        console.error('Error fetching user membership by ID:', error)
      }
    }
  }

  const handleViewConsumedHistory = async (userMembership: any) => {
    // Set the ID to trigger the query
    setSelectedUserMembershipId(userMembership._id)
    // Use existing data immediately, will update when query completes
    setSelectedUserMembership(userMembership)
    setShowConsumedHistoryModal(true)
    // Refetch the specific membership by ID
    if (userMembership._id) {
      try {
        const result = await refetchSingleMembership()
        if (result.data) {
          setSelectedUserMembership(result.data)
        }
      } catch (error: any) {
        console.error('Error fetching user membership by ID:', error)
      }
    }
  }

  const handleViewWeekDetails = async (week: any) => {
    // Refresh the selected membership data if we have an ID
    if (selectedUserMembership?._id) {
      setSelectedUserMembershipId(selectedUserMembership._id)
      try {
        const result = await refetchSingleMembership()
        if (result.data) {
          const freshWeek = result.data.weeks?.find((w: any) => w.week === week.week)
          if (freshWeek) {
            setSelectedWeek(freshWeek)
            setSelectedUserMembership(result.data)
          } else {
            setSelectedWeek(week)
          }
        } else {
          setSelectedWeek(week)
        }
      } catch (error: any) {
        console.error('Error fetching user membership by ID:', error)
        setSelectedWeek(week)
      }
    } else {
      setSelectedWeek(week)
    }
    
    setShowSingleWeekModal(true)
  }

  const handleEditDayMeals = async (week: any, day: any) => {
    // Fetch fresh data for the selected membership by ID before editing
    if (selectedUserMembership?._id) {
      setSelectedUserMembershipId(selectedUserMembership._id)
      try {
        const result = await refetchSingleMembership()
        if (result.data) {
          const freshWeek = result.data.weeks?.find((w: any) => w.week === week.week)
          if (freshWeek) {
            const freshDay = freshWeek.days?.find((d: any) => d.day === day.day)
            if (freshDay) {
              week = freshWeek
              day = freshDay
              setSelectedUserMembership(result.data)
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching user membership by ID:', error)
        // Continue with existing data if fetch fails
      }
    }
    
    // Check if day/week is consumed
    if (day.isConsumed || week.isConsumed) {
      showError('Cannot edit consumed meals. This day/week has already been consumed.')
      return
    }

    // Check if any meal type in the day is consumed
    if (day.consumedMeals && (
      day.consumedMeals.breakfast || 
      day.consumedMeals.lunch || 
      day.consumedMeals.snacks || 
      day.consumedMeals.dinner
    )) {
      showError('Cannot edit consumed meals. Some meals for this day have already been consumed.')
      return
    }

    setSelectedWeek(week)
    setSelectedDay(day)
    setShowEditMealModal(true)
  }

  const handleMealEditSuccess = (updatedMembership?: any) => {
    // Close other modals if open
    setShowSingleWeekModal(false)
    setShowWeeksModal(false)
    
    // Update the selected membership with fresh data if provided
    if (updatedMembership) {
      setSelectedUserMembership(updatedMembership)
    }
    
    // Refetch the full list to ensure all data is fresh
    refetch()
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
      hold: { variant: 'warning', text: 'On Hold' },
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
      <div style={{ width: '100%', paddingBottom: '20px', paddingRight: '20px' }}>
        <style>{`
          .table-wrapper {
            overflow: visible !important;
          }
          .table-wrapper table {
            overflow: visible !important;
          }
          .dropdown-menu {
            z-index: 9999 !important;
            position: absolute !important;
            overflow: visible !important;
          }
          .card-body {
            overflow: visible !important;
          }
          .card {
            overflow: visible !important;
          }
          table {
            overflow: visible !important;
          }
          tbody {
            overflow: visible !important;
          }
          td {
            overflow: visible !important;
          }
        `}</style>
        <Table hover style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Customer</th>
              <th style={{ width: '12%' }}>Meal Plan</th>
              <th style={{ width: '8%' }}>Total Meals</th>
              <th style={{ width: '7%' }}>Remaining</th>
              <th style={{ width: '7%' }}>Consumed</th>
              <th style={{ width: '9%' }}>Start Date</th>
              <th style={{ width: '9%' }}>End Date</th>
              <th style={{ width: '7%' }}>Status</th>
              <th style={{ width: '9%' }}>Payment Status</th>
              <th style={{ width: '10%' }}>History</th>
              <th style={{ width: '10%', position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 100, boxShadow: '-2px 0 4px rgba(0,0,0,0.1)' }}>Actions</th>
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
                  {/* <td>
                    <div className="fw-semibold text-success">₹{userMembership.price || mealPlan?.price || 0}</div>
                    <small className="text-muted">
                      {userMembership.price ? 'Custom Price' : 'Plan Price'}
                    </small>
                  </td> */}
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
                  <td style={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 100, boxShadow: '-2px 0 4px rgba(0,0,0,0.1)' }}>
                    <Dropdown drop="start">
                      <Dropdown.Toggle variant="outline-secondary" size="sm" id={`actions-dropdown-${userMembership._id}`}>
                        Actions
                      </Dropdown.Toggle>
                      <Dropdown.Menu 
                        flip={false}
                        align="end"
                        style={{ 
                          minWidth: '160px', 
                          zIndex: 9999,
                          fontSize: '12px',
                          padding: '2px 0',
                          maxHeight: 'none'
                        }}
                      >
                        {/* History group - at the top */}
                        <Dropdown.Header style={{ fontSize: '10px', padding: '2px 10px', fontWeight: '600', lineHeight: '1.3' }}>History</Dropdown.Header>
                        <Dropdown.Item 
                          onClick={() => handleViewHistory(userMembership)}
                          style={{ fontSize: '12px', padding: '4px 10px', lineHeight: '1.3' }}
                        >
                          <i className="ri-history-line me-2" style={{ fontSize: '12px' }}></i>View History
                        </Dropdown.Item>
                        <Dropdown.Divider style={{ margin: '2px 0' }} />
                        {/* Manage group */}
                        {canManageMembership && (
                          <>
                            <Dropdown.Header style={{ fontSize: '10px', padding: '2px 10px', fontWeight: '600', lineHeight: '1.3' }}>Manage</Dropdown.Header>
                            <Dropdown.Item 
                              onClick={() => {
                                router.push(`/membership/membership-meal-selection?id=${userMembership._id}`)
                              }}
                              style={{ fontSize: '12px', padding: '4px 10px', lineHeight: '1.3' }}
                            >
                              <i className="ri-restaurant-line me-2" style={{ fontSize: '12px' }}></i>Punch
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleDelete(userMembership)}
                              className="text-danger"
                              style={{ fontSize: '12px', padding: '4px 10px', lineHeight: '1.3' }}
                            >
                              <i className="ri-delete-bin-line me-2" style={{ fontSize: '12px' }}></i>Delete
                            </Dropdown.Item>
                            <Dropdown.Divider style={{ margin: '2px 0' }} />
                            <Dropdown.Header style={{ fontSize: '10px', padding: '2px 10px', fontWeight: '600', lineHeight: '1.3' }}>Set Status</Dropdown.Header>
                            <Dropdown.Item 
                              disabled={isSettingStatus} 
                              onClick={async () => {
                                try {
                                  await setMembershipStatus({ id: userMembership._id, status: 'active' }).unwrap()
                                  showSuccess('Status updated to Active')
                                  refetch()
                                } catch (e: any) {
                                  showError(e?.data?.message || 'Failed to update status')
                                }
                              }}
                              style={{ fontSize: '12px', padding: '4px 10px', lineHeight: '1.3' }}
                            >
                              <i className="ri-checkbox-circle-line me-2 text-success" style={{ fontSize: '12px' }}></i>Active
                            </Dropdown.Item>
                            <Dropdown.Item 
                              disabled={isSettingStatus} 
                              onClick={async () => {
                                try {
                                  await setMembershipStatus({ id: userMembership._id, status: 'hold' }).unwrap()
                                  showSuccess('Status updated to Hold')
                                  refetch()
                                } catch (e: any) {
                                  showError(e?.data?.message || 'Failed to update status')
                                }
                              }}
                              style={{ fontSize: '12px', padding: '4px 10px', lineHeight: '1.3' }}
                            >
                              <i className="ri-pause-circle-line me-2 text-warning" style={{ fontSize: '12px' }}></i>Hold
                            </Dropdown.Item>
                            <Dropdown.Item 
                              disabled={isSettingStatus} 
                              onClick={async () => {
                                try {
                                  await setMembershipStatus({ id: userMembership._id, status: 'cancelled' }).unwrap()
                                  showSuccess('Status updated to Cancelled')
                                  refetch()
                                } catch (e: any) {
                                  showError(e?.data?.message || 'Failed to update status')
                                }
                              }}
                              style={{ fontSize: '12px', padding: '4px 10px', lineHeight: '1.3' }}
                            >
                              <i className="ri-close-circle-line me-2 text-danger" style={{ fontSize: '12px' }}></i>Cancelled
                            </Dropdown.Item>
                          </>
                        )}
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

      {/* Pagination */}
      {pagination && totalPages > 0 && (
        <div className="border-top mt-3 pt-3">
          <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-end mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <Button 
                  variant="link" 
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <Button 
                    variant="link" 
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <Button 
                  variant="link" 
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </li>
            </ul>
          </nav>
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
                    <option value="hold">Hold</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col lg={6} md={6}></Col>
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
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="xl">
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

              {/* Weeks Data Display - Compact View */}
              {selectedUserMembership.weeks && selectedUserMembership.weeks.length > 0 && (
                <div className="mb-4 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-primary mb-0">
                      <i className="ri-calendar-line me-2"></i>
                      Meal Plan Details ({selectedUserMembership.weeks.length} weeks)
                    </h6>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={async () => {
                        if (selectedUserMembership?._id) {
                          setSelectedUserMembershipId(selectedUserMembership._id)
                          try {
                            const result = await refetchSingleMembership()
                            if (result.data) {
                              setSelectedUserMembership(result.data)
                            }
                          } catch (error: any) {
                            console.error('Error fetching user membership by ID:', error)
                          }
                        }
                        setShowWeeksModal(true)
                      }}
                    >
                      <i className="ri-eye-line me-1"></i>
                      View All Weeks
                    </Button>
                  </div>
                  
                  {/* Compact week summary */}
                  <div className="row g-2">
                    {selectedUserMembership.weeks.slice(0, 4).map((week: any, weekIndex: number) => (
                      <div key={weekIndex} className="col-md-3 col-sm-6">
                        <div 
                          className="p-2 border rounded bg-white text-center cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleViewWeekDetails(week)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div className="fw-semibold">
                            Week {week.week}
                            {week.repeatFromWeek && (
                              <i className="ri-repeat-line ms-1 text-info" title={`Repeats from Week ${week.repeatFromWeek}`}></i>
                            )}
                          </div>
                          <div className="small text-muted">
                            {week.days ? week.days.length : 0} days
                          </div>
                          <div className="small text-primary mt-1">
                            <i className="ri-eye-line me-1"></i>
                            Click to view details
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedUserMembership.weeks.length > 4 && (
                      <div className="col-md-3 col-sm-6">
                        <div className="p-2 border rounded bg-light text-center">
                          <div className="fw-semibold text-muted">
                            +{selectedUserMembership.weeks.length - 4} more weeks
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

                          {/* Meal Changes Display - Show before/after for updated actions */}
                          {event.action === 'updated' && event.mealChanges && Array.isArray(event.mealChanges) && event.mealChanges.length > 0 && (
                            <div className="mb-3 p-3 bg-light rounded border-start border-warning border-3">
                              <h6 className="text-warning mb-3" style={{ fontSize: '15px', fontWeight: '600' }}>
                                <i className="ri-refresh-line me-2"></i>
                                Meal Changes
                                {event.week && event.day && (
                                  <span className="text-muted small ms-2">
                                    (Week {event.week}, {event.day.charAt(0).toUpperCase() + event.day.slice(1)})
                                  </span>
                                )}
                              </h6>
                              <div className="d-flex flex-column gap-2">
                                {event.mealChanges.map((change: any, changeIdx: number) => {
                                  const mealTypeLabels: { [key: string]: string } = {
                                    breakfast: 'Breakfast',
                                    lunch: 'Lunch',
                                    snacks: 'Snacks',
                                    dinner: 'Dinner'
                                  }
                                  const mealTypeColors: { [key: string]: string } = {
                                    breakfast: '#ff9800',
                                    lunch: '#2196f3',
                                    snacks: '#e91e63',
                                    dinner: '#4caf50'
                                  }
                                  const mealTypeIcons: { [key: string]: string } = {
                                    breakfast: 'ri-sun-line',
                                    lunch: 'ri-restaurant-line',
                                    snacks: 'ri-apple-line',
                                    dinner: 'ri-moon-line'
                                  }
                                  const mealType = change.mealType || 'general'
                                  const beforeItems = Array.isArray(change.before) ? change.before : []
                                  const afterItems = Array.isArray(change.after) ? change.after : []
                                  
                                  return (
                                    <div
                                      key={changeIdx}
                                      className="p-3 rounded"
                                      style={{
                                        backgroundColor: '#ffffff',
                                        border: `2px solid ${mealTypeColors[mealType] || '#6c757d'}`,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }}
                                    >
                                      <div className="d-flex align-items-center mb-2">
                                        <i className={`${mealTypeIcons[mealType] || 'ri-restaurant-2-line'} me-2`} style={{ fontSize: '18px', color: mealTypeColors[mealType] || '#6c757d' }}></i>
                                        <span className="fw-bold" style={{ fontSize: '15px', color: mealTypeColors[mealType] || '#6c757d' }}>
                                          {mealTypeLabels[mealType] || mealType}
                                        </span>
                                      </div>
                                      <div className="d-flex align-items-center flex-wrap gap-2">
                                        <div className="d-flex align-items-center">
                                          <span className="text-muted small me-2">Before:</span>
                                          {beforeItems.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                              {beforeItems.map((item: string, itemIdx: number) => (
                                                <span key={itemIdx} className="badge bg-secondary">
                                                  {item}
                                                </span>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-muted small fst-italic">No items</span>
                                          )}
                                        </div>
                                        <i className="ri-arrow-right-line mx-2" style={{ color: '#6c757d' }}></i>
                                        <div className="d-flex align-items-center">
                                          <span className="text-muted small me-2">After:</span>
                                          {afterItems.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                              {afterItems.map((item: string, itemIdx: number) => (
                                                <span key={itemIdx} className="badge bg-success">
                                                  {item}
                                                </span>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-muted small fst-italic">No items</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Meal Details */}
                          {(event.action === 'consumed' || event.mealsChanged > 0 || event.currentConsumed !== undefined) && (
                            <div className="mb-3 p-2 bg-light rounded">
                              <h6 className="text-info mb-2">
                                <i className="ri-restaurant-line me-1"></i>
                                Meal Details
                              </h6>
                              <div className="row">
                                <div className="col-md-4">
                                  <small className="text-muted d-block mb-1">Current Consumed:</small>
                                  <div className="fw-bold text-primary" style={{ fontSize: '18px' }}>{event.currentConsumed !== undefined && event.currentConsumed !== null ? event.currentConsumed : '-'}</div>
                                </div>
                                <div className="col-md-4">
                                  <small className="text-muted d-block mb-1">Total Consumed:</small>
                                  <div className="fw-bold text-info" style={{ fontSize: '18px' }}>{event.consumedMeals || 0}</div>
                                </div>
                                <div className="col-md-4">
                                  <small className="text-muted d-block mb-1">Remaining:</small>
                                  <div className="fw-bold text-success" style={{ fontSize: '18px' }}>{event.remainingMeals || 0}</div>
                                </div>
                              </div>
                              
                              {/* Display Consumed Meal Items with Quantities */}
                              {event.mealItems && Array.isArray(event.mealItems) && event.mealItems.length > 0 && (
                                <div className="mt-3">
                                  <h6 className="text-success mb-3" style={{ fontSize: '15px', fontWeight: '600' }}>
                                    <i className="ri-restaurant-2-line me-2"></i>
                                    Consumed Meal Items
                                  </h6>
                                  {(() => {
                                    // Group items by meal type
                                    const groupedByMealType: { [key: string]: any[] } = {}
                                    event.mealItems.forEach((item: any) => {
                                      const mealType = item.mealType || 'general'
                                      if (!groupedByMealType[mealType]) {
                                        groupedByMealType[mealType] = []
                                      }
                                      groupedByMealType[mealType].push(item)
                                    })
                                    
                                    const mealTypeLabels: { [key: string]: string } = {
                                      breakfast: 'Breakfast',
                                      lunch: 'Lunch',
                                      snacks: 'Snacks',
                                      dinner: 'Dinner',
                                      general: 'General'
                                    }
                                    
                                    const mealTypeIcons: { [key: string]: string } = {
                                      breakfast: 'ri-sun-line',
                                      lunch: 'ri-restaurant-line',
                                      snacks: 'ri-cake-line',
                                      dinner: 'ri-moon-line',
                                      general: 'ri-restaurant-2-line'
                                    }
                                    
                                    const mealTypeColors: { [key: string]: { bg: string; border: string; badge: string } } = {
                                      breakfast: { bg: '#fff8e1', border: '#ffc107', badge: '#ff9800' },
                                      lunch: { bg: '#e3f2fd', border: '#2196f3', badge: '#1976d2' },
                                      snacks: { bg: '#fce4ec', border: '#e91e63', badge: '#c2185b' },
                                      dinner: { bg: '#e8f5e9', border: '#4caf50', badge: '#388e3c' },
                                      general: { bg: '#f5f5f5', border: '#9e9e9e', badge: '#616161' }
                                    }
                                    
                                    return (
                                      <div className="row g-3">
                                        {Object.entries(groupedByMealType).map(([mealType, mealItems]) => {
                                          const colors = mealTypeColors[mealType] || mealTypeColors.general
                                          const totalQty = mealItems.reduce((sum: number, it: any) => sum + (it.qty || 0), 0)
                                          
                                          return (
                                            <div key={mealType} className="col-md-6 col-lg-3">
                                              <div 
                                                className="h-100 p-3 rounded shadow-sm"
                                                style={{ 
                                                  backgroundColor: colors.bg,
                                                  border: `2px solid ${colors.border}`,
                                                  borderTop: `4px solid ${colors.border}`,
                                                  transition: 'transform 0.2s, box-shadow 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.transform = 'translateY(-2px)'
                                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.transform = 'translateY(0)'
                                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                              >
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                  <div className="d-flex align-items-center">
                                                    <i className={`${mealTypeIcons[mealType] || 'ri-restaurant-2-line'} me-2`} style={{ fontSize: '18px', color: colors.badge }}></i>
                                                    <span className="fw-bold" style={{ fontSize: '14px', color: colors.badge }}>
                                                      {mealTypeLabels[mealType] || mealType}
                                                    </span>
                                                  </div>
                                                  <span className="badge rounded-pill" style={{ backgroundColor: colors.badge, fontSize: '11px' }}>
                                                    {totalQty} items
                                                  </span>
                                                </div>
                                                
                                                <div className="d-flex flex-column gap-2">
                                                  {mealItems.map((item: any, itemIdx: number) => (
                                                    <div
                                                      key={itemIdx}
                                                      className="d-flex align-items-center justify-content-between p-2 rounded"
                                                      style={{
                                                        backgroundColor: '#ffffff',
                                                        border: `1px solid ${colors.border}`,
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                      }}
                                                    >
                                                      <div className="d-flex align-items-center flex-grow-1">
                                                        <i className="ri-checkbox-circle-fill me-2" style={{ fontSize: '14px', color: colors.badge }}></i>
                                                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                                                          {item.title || 'N/A'}
                                                        </span>
                                                      </div>
                                                      <span 
                                                        className="badge rounded-pill"
                                                        style={{ 
                                                          backgroundColor: colors.badge,
                                                          fontSize: '11px',
                                                          fontWeight: '600',
                                                          minWidth: '35px'
                                                        }}
                                                      >
                                                        {item.qty || 0}
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )
                                  })()}
                                </div>
                              )}
                              
                              {event.mealType && (!event.mealItems || event.mealItems.length === 0) && (
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

      {/* Weeks Details Modal */}
      <Modal show={showWeeksModal} onHide={() => setShowWeeksModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-calendar-line me-2"></i>
            Meal Plan Details - All Weeks
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserMembership && selectedUserMembership.weeks && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {selectedUserMembership.weeks.map((week: any, weekIndex: number) => (
                <div key={weekIndex} className="mb-4 p-3 border rounded">
                  <div className="d-flex align-items-center mb-3">
                    <h6 className="mb-0 me-3">Week {week.week}</h6>
                    {week.repeatFromWeek && (
                      <span className="badge bg-info">
                        <i className="ri-repeat-line me-1"></i>
                        Repeats from Week {week.repeatFromWeek}
                      </span>
                    )}
                  </div>
                  
                  <div className="row g-3">
                    {week.days && week.days.map((day: any, dayIndex: number) => {
                      const isConsumed = day.isConsumed || week.isConsumed || 
                        (day.consumedMeals && (
                          day.consumedMeals.breakfast || 
                          day.consumedMeals.lunch || 
                          day.consumedMeals.snacks || 
                          day.consumedMeals.dinner
                        ))
                      
                      return (
                        <div key={dayIndex} className="col-lg-3 col-md-4 col-sm-6">
                          <div className="p-2 border rounded bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div className="fw-semibold text-capitalize">{day.day}</div>
                              {canManageMembership && !isConsumed && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWeek(week)
                                    handleEditDayMeals(week, day)
                                  }}
                                >
                                  <i className="ri-edit-line me-1"></i>
                                  Edit
                                </Button>
                              )}
                              {isConsumed && (
                                <Badge bg="warning" className="text-dark" style={{ fontSize: '10px' }}>
                                  Consumed
                                </Badge>
                              )}
                            </div>
                            <div className="small">
                              <div className="mb-1">
                                <strong>Breakfast:</strong> 
                                <div className="text-muted">
                                  {day.meals.breakfast && day.meals.breakfast.length > 0 
                                    ? day.meals.breakfast.join(', ') 
                                    : 'None selected'
                                  }
                                </div>
                              </div>
                              <div className="mb-1">
                                <strong>Lunch:</strong> 
                                <div className="text-muted">
                                  {day.meals.lunch && day.meals.lunch.length > 0 
                                    ? day.meals.lunch.join(', ') 
                                    : 'None selected'
                                  }
                                </div>
                              </div>
                              <div className="mb-1">
                                <strong>Snacks:</strong> 
                                <div className="text-muted">
                                  {day.meals.snacks && day.meals.snacks.length > 0 
                                    ? day.meals.snacks.join(', ') 
                                    : 'None selected'
                                  }
                                </div>
                              </div>
                              <div className="mb-1">
                                <strong>Dinner:</strong> 
                                <div className="text-muted">
                                  {day.meals.dinner && day.meals.dinner.length > 0 
                                    ? day.meals.dinner.join(', ') 
                                    : 'None selected'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWeeksModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Single Week Details Modal */}
      <Modal show={showSingleWeekModal} onHide={() => setShowSingleWeekModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-calendar-line me-2"></i>
            Week {selectedWeek?.week} Details
            {selectedWeek?.repeatFromWeek && (
              <span className="badge bg-info ms-2">
                <i className="ri-repeat-line me-1"></i>
                Repeats from Week {selectedWeek.repeatFromWeek}
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWeek && (
            <div>
              <div className="row g-3">
                {selectedWeek.days && selectedWeek.days.map((day: any, dayIndex: number) => {
                  const isConsumed = day.isConsumed || selectedWeek.isConsumed || 
                    (day.consumedMeals && (
                      day.consumedMeals.breakfast || 
                      day.consumedMeals.lunch || 
                      day.consumedMeals.snacks || 
                      day.consumedMeals.dinner
                    ))
                  
                  return (
                    <div key={dayIndex} className="col-lg-4 col-md-6">
                      <div className="p-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="fw-semibold text-capitalize text-primary">{day.day}</div>
                          {canManageMembership && !isConsumed && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditDayMeals(selectedWeek, day)}
                            >
                              <i className="ri-edit-line me-1"></i>
                              Edit
                            </Button>
                          )}
                          {isConsumed && (
                            <Badge bg="warning" className="text-dark">
                              <i className="ri-check-line me-1"></i>
                              Consumed
                            </Badge>
                          )}
                        </div>
                        <div className="row g-2">
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-2">
                              <i className="ri-sun-line me-2 text-warning"></i>
                              <strong>Breakfast:</strong>
                            </div>
                            <div className="text-muted ms-4">
                              {day.meals.breakfast && day.meals.breakfast.length > 0 
                                ? day.meals.breakfast.join(', ') 
                                : 'None selected'
                              }
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-2">
                              <i className="ri-sun-fill me-2 text-orange"></i>
                              <strong>Lunch:</strong>
                            </div>
                            <div className="text-muted ms-4">
                              {day.meals.lunch && day.meals.lunch.length > 0 
                                ? day.meals.lunch.join(', ') 
                                : 'None selected'
                              }
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-2">
                              <i className="ri-apple-line me-2 text-success"></i>
                              <strong>Snacks:</strong>
                            </div>
                            <div className="text-muted ms-4">
                              {day.meals.snacks && day.meals.snacks.length > 0 
                                ? day.meals.snacks.join(', ') 
                                : 'None selected'
                              }
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-2">
                              <i className="ri-moon-line me-2 text-info"></i>
                              <strong>Dinner:</strong>
                            </div>
                            <div className="text-muted ms-4">
                              {day.meals.dinner && day.meals.dinner.length > 0 
                                ? day.meals.dinner.join(', ') 
                                : 'None selected'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSingleWeekModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Meal Modal */}
      <EditMealModal
        show={showEditMealModal}
        onHide={() => setShowEditMealModal(false)}
        userMembership={selectedUserMembership}
        week={selectedWeek}
        day={selectedDay}
        onSuccess={handleMealEditSuccess}
        canManageMembership={canManageMembership}
      />
    </>
  )
})

UserMembershipDataList.displayName = 'UserMembershipDataList'

export default UserMembershipDataList
