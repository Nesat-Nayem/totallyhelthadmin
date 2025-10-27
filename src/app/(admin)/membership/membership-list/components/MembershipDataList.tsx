'use client'

import React, { useState, useMemo } from 'react'
import { Table, Badge, Button, Dropdown, Modal, Form, Row, Col, Alert } from 'react-bootstrap'
import { useGetMealPlansQuery, useCreateMealPlanMutation, useUpdateMealPlanMutation, useDeleteMealPlanMutation } from '@/services/mealPlanApi'
import { useGetCustomersQuery } from '@/services/customerApi'
import { showSuccess, showError } from '@/utils/sweetAlert'

interface MembershipDataListProps {
  searchQuery: string
}

const MembershipDataList: React.FC<MembershipDataListProps> = ({ searchQuery }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  const { data: mealPlansRes, isLoading, error, refetch } = useGetMealPlansQuery({ limit: 100 })
  const { data: customersRes } = useGetCustomersQuery({ limit: 1000 })
  const [createMealPlan, { isLoading: isCreating }] = useCreateMealPlanMutation()
  const [updateMealPlan, { isLoading: isUpdating }] = useUpdateMealPlanMutation()
  const [deleteMealPlan, { isLoading: isDeleting }] = useDeleteMealPlanMutation()

  const mealPlans = useMemo(() => mealPlansRes?.data || [], [mealPlansRes])
  const customers = useMemo(() => customersRes?.data || [], [customersRes])

  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return mealPlans
    const query = searchQuery.toLowerCase()
    return mealPlans.filter((plan: any) =>
      plan.title?.toLowerCase().includes(query) ||
      plan.description?.toLowerCase().includes(query) ||
      plan.category?.toLowerCase().includes(query) ||
      plan.brand?.toLowerCase().includes(query)
    )
  }, [mealPlans, searchQuery])

  const handleEdit = (membership: any) => {
    setSelectedMembership(membership)
    setEditFormData({
      title: membership.title || '',
      description: membership.description || '',
      price: membership.price || 0,
      delPrice: membership.delPrice || 0,
      category: membership.category || '',
      brand: membership.brand || '',
      totalMeals: membership.totalMeals || 0,
      durationDays: membership.durationDays || 0,
      status: membership.status || 'active'
    })
    setShowEditModal(true)
  }

  const handleDelete = (membership: any) => {
    setSelectedMembership(membership)
    setShowDeleteModal(true)
  }

  const handleUpdateMembership = async () => {
    try {
      // Create FormData for multipart/form-data upload
      const formDataToSend = new FormData()
      
      // Add all form fields
      formDataToSend.append('title', editFormData.title)
      formDataToSend.append('description', editFormData.description)
      formDataToSend.append('price', editFormData.price.toString())
      formDataToSend.append('delPrice', editFormData.delPrice.toString())
      formDataToSend.append('category', editFormData.category)
      formDataToSend.append('brand', editFormData.brand)
      formDataToSend.append('totalMeals', editFormData.totalMeals.toString())
      formDataToSend.append('durationDays', editFormData.durationDays.toString())
      formDataToSend.append('status', editFormData.status)
      
      await updateMealPlan({
        id: selectedMembership._id,
        data: formDataToSend
      }).unwrap()
      
      showSuccess('Membership updated successfully')
      setShowEditModal(false)
      refetch()
    } catch (error: any) {
      showError(error?.data?.message || 'Failed to update membership')
    }
  }

  const handleDeleteMembership = async () => {
    try {
      await deleteMealPlan(selectedMembership._id).unwrap()
      showSuccess('Membership deleted successfully')
      setShowDeleteModal(false)
      refetch()
    } catch (error: any) {
      showError(error?.data?.message || 'Failed to delete membership')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
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
        Failed to load memberships. Please try again.
      </Alert>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Total Meals</th>
              <th>Duration (Days)</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMemberships.map((membership: any) => (
              <tr key={membership._id}>
                <td>
                  {membership.images && membership.images.length > 0 ? (
                    <img
                      src={membership.images[0]}
                      alt={membership.title}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      className="img-thumbnail"
                    />
                  ) : (
                    <div 
                      className="bg-light d-flex align-items-center justify-content-center"
                      style={{ width: '50px', height: '50px' }}
                    >
                      <i className="ri-image-line text-muted"></i>
                    </div>
                  )}
                </td>
                <td>
                  <div className="fw-semibold">{membership.title}</div>
                </td>
                <td>
                  <div className="text-muted" style={{ maxWidth: '200px' }}>
                    {membership.description?.substring(0, 100)}
                    {membership.description?.length > 100 && '...'}
                  </div>
                </td>
                <td>
                  <div>
                    <span className="fw-semibold">₹{membership.price}</span>
                    {membership.delPrice && membership.delPrice !== membership.price && (
                      <div className="text-muted small">
                        <del>₹{membership.delPrice}</del>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <Badge bg="info">{membership.totalMeals || 0}</Badge>
                </td>
                <td>
                  <Badge bg="primary">{membership.durationDays || 0}</Badge>
                </td>
                <td>{membership.category || '-'}</td>
                <td>{membership.brand || '-'}</td>
                <td>{getStatusBadge(membership.status)}</td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEdit(membership)}>
                        <i className="ri-edit-line me-2"></i>Edit
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleDelete(membership)}
                        className="text-danger"
                      >
                        <i className="ri-delete-bin-line me-2"></i>Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {filteredMemberships.length === 0 && (
        <div className="text-center py-4">
          <div className="text-muted">No memberships found</div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Membership</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Weight Gain">Weight Gain</option>
                  <option value="Fat Loss">Fat Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Healthy Diet">Healthy Diet</option>
                  <option value="Healthy Lifestyle">Healthy Lifestyle</option>
                  <option value="Healthy Eating">Healthy Eating</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Price *</Form.Label>
                <Form.Control
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Del Price</Form.Label>
                <Form.Control
                  type="number"
                  value={editFormData.delPrice}
                  onChange={(e) => setEditFormData({ ...editFormData, delPrice: Number(e.target.value) })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={editFormData.brand}
                  onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                >
                  <option value="">Select Brand</option>
                  <option value="Totally Health">Totally Health</option>
                  <option value="Subway">Subway</option>
                  <option value="Pizza Hut">Pizza Hut</option>
                  <option value="Burger King">Burger King</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Total Meals *</Form.Label>
                <Form.Control
                  type="number"
                  value={editFormData.totalMeals}
                  onChange={(e) => setEditFormData({ ...editFormData, totalMeals: Number(e.target.value) })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Duration (Days) *</Form.Label>
                <Form.Control
                  type="number"
                  value={editFormData.durationDays}
                  onChange={(e) => setEditFormData({ ...editFormData, durationDays: Number(e.target.value) })}
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
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateMembership}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Membership'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Membership</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedMembership?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteMembership}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default MembershipDataList
