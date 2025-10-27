'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { useCreateUserMembershipMutation } from '@/services/userMembershipApi'
import { useGetCustomersQuery } from '@/services/customerApi'
import { useGetMealPlansQuery } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'

interface CreateUserMembershipModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
}

const CreateUserMembershipModal: React.FC<CreateUserMembershipModalProps> = ({ show, onHide, onSuccess }) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    userId: '',
    mealPlanId: '',
    totalMeals: 0,
    price: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })
  const [errors, setErrors] = useState<any>({})

  const [createUserMembership, { isLoading }] = useCreateUserMembershipMutation()
  const { data: customersRes, refetch: refetchCustomers } = useGetCustomersQuery({ limit: 1000 })
  const { data: mealPlansRes } = useGetMealPlansQuery({ limit: 1000 })

  // Refresh customer list when modal opens
  useEffect(() => {
    if (show) {
      // Small delay to ensure any previous customer creation is processed
      const timer = setTimeout(() => {
        refetchCustomers()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [show, refetchCustomers])

  const handleAddNewCustomer = () => {
    // Close current modal and redirect to customer management with add modal
    onHide()
    router.push('/membership/customers?openAddCustomerModal=true&fromUserMembership=true')
  }
  
  const customers = useMemo(() => {
    console.log('Customers response:', customersRes)
    console.log('Customers data:', customersRes?.data)
    return customersRes?.data || []
  }, [customersRes])
  
  const mealPlans = useMemo(() => {
    console.log('Meal plans response:', mealPlansRes)
    console.log('Meal plans data:', mealPlansRes?.data)
    // Handle different response structures
    const data = mealPlansRes?.data || mealPlansRes || []
    console.log('Processed meal plans:', data)
    return Array.isArray(data) ? data : []
  }, [mealPlansRes])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const handleMealPlanChange = (mealPlanId: string) => {
    const selectedPlan = (mealPlans as any[]).find((plan: any) => plan._id === mealPlanId)
    if (selectedPlan) {
      // Calculate end date based on start date and duration
      const startDate = new Date(formData.startDate)
      const durationDays = selectedPlan.durationDays || 30
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + durationDays)
      
      setFormData((prev: any) => ({
        ...prev,
        mealPlanId,
        totalMeals: selectedPlan.totalMeals || 0,
        price: selectedPlan.price || 0,
        endDate: endDate.toISOString().split('T')[0]
      }))
    } else {
      setFormData((prev: any) => ({ ...prev, mealPlanId, totalMeals: 0, price: 0 }))
    }
  }

  const handleStartDateChange = (startDate: string) => {
    const selectedPlan = (mealPlans as any[]).find((plan: any) => plan._id === formData.mealPlanId)
    if (selectedPlan && startDate) {
      // Recalculate end date when start date changes
      const start = new Date(startDate)
      const durationDays = selectedPlan.durationDays || 30
      const endDate = new Date(start)
      endDate.setDate(start.getDate() + durationDays)
      
      setFormData((prev: any) => ({
        ...prev,
        startDate,
        endDate: endDate.toISOString().split('T')[0]
      }))
    } else {
      setFormData((prev: any) => ({ ...prev, startDate }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    console.log('Validating form data:', formData)
    
    if (!formData.userId) {
      newErrors.userId = 'Customer is required'
    }
    if (!formData.mealPlanId) {
      newErrors.mealPlanId = 'Meal plan is required'
    }
    if (formData.totalMeals <= 0) {
      newErrors.totalMeals = 'Total meals must be greater than 0'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    console.log('Validation errors:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors)
      return
    }

    console.log('Form validation passed, calling API...')
    try {
      // Try JSON format first (User Memberships might not need FormData)
      const membershipData = {
        userId: formData.userId,
        mealPlanId: formData.mealPlanId,
        totalMeals: formData.totalMeals,
        price: formData.price,
        startDate: formData.startDate,
        endDate: formData.endDate
      }
      
      console.log('Creating user membership with data:', membershipData)
      
      const result = await createUserMembership(membershipData).unwrap()
      
      console.log('User membership created successfully:', result)
      showSuccess('User membership created successfully')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error creating user membership:', error)
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        originalStatus: error?.originalStatus
      })
      
      // Show detailed error message
      const errorMessage = error?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          `Failed to create user membership (Status: ${error?.status || 'Unknown'})`
      showError(errorMessage)
    }
  }

  const handleClose = () => {
    setFormData({
      userId: '',
      mealPlanId: '',
      totalMeals: 0,
      price: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    })
    setErrors({})
    onHide()
  }

  const selectedMealPlan = useMemo(() => {
    return mealPlans.find((plan: any) => plan._id === formData.mealPlanId)
  }, [mealPlans, formData.mealPlanId])

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create User Membership</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Customer *</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={handleAddNewCustomer}
                    className="d-flex align-items-center"
                  >
                    <i className="ri-add-line me-1"></i>
                    Add New Customer
                  </Button>
                </div>
                <Form.Select
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  isInvalid={!!errors.userId}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer: any) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.userId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Meal Plan *</Form.Label>
                <Form.Select
                  value={formData.mealPlanId}
                  onChange={(e) => handleMealPlanChange(e.target.value)}
                  isInvalid={!!errors.mealPlanId}
                >
                  <option value="">Select Meal Plan</option>
                  {mealPlans.length > 0 ? (
                    mealPlans.map((plan: any) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.title} - ₹{plan.price}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading meal plans...</option>
                  )}
                </Form.Select>
                <Form.Text className="text-muted">
                  {mealPlans.length} meal plans available
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.mealPlanId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            {selectedMealPlan && (
              <Col md={12}>
                <Alert variant="info" className="mb-0">
                  <strong>Selected Plan:</strong> {(selectedMealPlan as any).title}<br/>
                  <strong>Description:</strong> {(selectedMealPlan as any).description}<br/>
                  <strong>Price:</strong> ₹{(selectedMealPlan as any).price}<br/>
                  <strong>Category:</strong> {(selectedMealPlan as any).category || 'N/A'}<br/>
                  <strong>Brand:</strong> {(selectedMealPlan as any).brand || 'N/A'}<br/>
                  <strong>Duration:</strong> {(selectedMealPlan as any).durationDays} days
                </Alert>
              </Col>
            )}

            <Col md={6}>
              <Form.Group>
                <Form.Label>Total Meals *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.totalMeals}
                  onChange={(e) => handleInputChange('totalMeals', Number(e.target.value))}
                  isInvalid={!!errors.totalMeals}
                  min="1"
                  placeholder="Total number of meals"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.totalMeals}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Price (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  isInvalid={!!errors.price}
                  min="0"
                  step="0.01"
                  placeholder="Enter price for this membership"
                />
                <Form.Text className="text-muted">
                  Default: ₹{selectedMealPlan?.price || 0} (from selected plan)
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>End Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  isInvalid={!!errors.endDate}
                  min={formData.startDate}
                />
                <Form.Text className="text-muted">
                  {selectedMealPlan ? `Auto-calculated based on ${selectedMealPlan.durationDays || 30} days duration` : 'Enter end date manually'}
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.endDate}
                </Form.Control.Feedback>
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
            {isLoading ? 'Creating...' : 'Create User Membership'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateUserMembershipModal
