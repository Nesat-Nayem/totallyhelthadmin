'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { useCreateUserMembershipMutation } from '@/services/userMembershipApi'
import { useGetCustomersQuery } from '@/services/customerApi'
import { useGetMealPlansQuery } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { useAccessControl } from '@/hooks/useAccessControl'

interface CreateUserMembershipModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
}

const CreateUserMembershipModal: React.FC<CreateUserMembershipModalProps> = ({ show, onHide, onSuccess }) => {
  const router = useRouter()
  const { hasAccessToSubModule, isAdmin } = useAccessControl()
  
  const [formData, setFormData] = useState({
    userId: '',
    mealPlanId: '',
    totalMeals: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    // Payment fields (only fields that backend stores)
    totalPrice: 0,
    receivedAmount: 0,
    paymentMode: 'cash', // Default to cash
    note: ''
  })
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [createUserMembership, { isLoading }] = useCreateUserMembershipMutation()
  const { data: customersRes, refetch: refetchCustomers } = useGetCustomersQuery({ limit: 1000 })
  const { data: mealPlansRes } = useGetMealPlansQuery({ limit: 1000 })

  // Role-based access control
  const canManageMembership = isAdmin || hasAccessToSubModule('membership', 'user-membership')

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
        endDate: endDate.toISOString().split('T')[0],
        totalPrice: selectedPlan.price || 0
      }))
    } else {
      setFormData((prev: any) => ({ ...prev, mealPlanId, totalMeals: 0, totalPrice: 0 }))
    }
  }

  // Calculate payment status and remaining amount
  const paymentStatus = useMemo(() => {
    const receivedAmount = parseFloat((formData.receivedAmount || 0).toString())
    const totalPrice = parseFloat((formData.totalPrice || 0).toString())
    
    // If received amount equals total price, status is always paid (even if both are 0)
    // Use Math.abs to handle floating point precision issues
    if (Math.abs(receivedAmount - totalPrice) < 0.01) {
      return 'paid'
    } else {
      return 'unpaid'
    }
  }, [formData.receivedAmount, formData.totalPrice])

  const remainingAmount = useMemo(() => {
    const totalPrice = formData.totalPrice || 0
    const receivedAmount = formData.receivedAmount || 0
    return Math.max(0, totalPrice - receivedAmount)
  }, [formData.totalPrice, formData.receivedAmount])

  // Update received amount when changed
  const handleReceivedAmountChange = (value: number) => {
    const receivedAmount = parseFloat((value || 0).toString())
    const totalPrice = parseFloat((formData.totalPrice || 0).toString())
    
    setFormData(prev => ({
      ...prev,
      receivedAmount: value
    }))
    
    // If received amount equals total price, ensure status is paid (even if both are 0)
    if (Math.abs(receivedAmount - totalPrice) < 0.01) {
      console.log('Received amount equals total price - status will be paid')
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
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }
    
    // Payment validation
    if (formData.totalPrice <= 0) {
      newErrors.totalPrice = 'Total price must be greater than 0'
    }
    if (formData.receivedAmount < 0) {
      newErrors.receivedAmount = 'Received amount cannot be negative'
    }
    if (formData.receivedAmount > formData.totalPrice) {
      newErrors.receivedAmount = 'Received amount cannot exceed total price'
    }
    if (formData.paymentMode && !['cash', 'card', 'online', 'payment_link'].includes(formData.paymentMode)) {
      newErrors.paymentMode = 'Invalid payment mode'
    }

    // Payment status validation
    const currentPaymentStatus = paymentStatus
    if (!['paid', 'unpaid'].includes(currentPaymentStatus)) {
      newErrors.paymentStatus = 'Invalid payment status'
    }

    console.log('Validation errors:', newErrors)
    console.log('Current payment status:', currentPaymentStatus)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!canManageMembership) {
      showError('You do not have permission to manage user memberships')
      return
    }
    
    console.log('Form submitted with data:', formData)
    console.log('Current payment status:', paymentStatus)
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors)
      return
    }

    // Additional payment status validation
    // Recalculate to ensure accuracy
    const validationReceivedAmount = parseFloat((formData.receivedAmount || 0).toString())
    const validationTotalPrice = parseFloat((formData.totalPrice || 0).toString())
    const validatedPaymentStatus = (Math.abs(validationReceivedAmount - validationTotalPrice) < 0.01) ? 'paid' : 'unpaid'
    
    if (!validatedPaymentStatus || !['paid', 'unpaid'].includes(validatedPaymentStatus)) {
      showError('Invalid payment status. Please refresh the page and try again.')
      return
    }

    // Validate payment amounts
    if (formData.receivedAmount > formData.totalPrice) {
      showError('Received amount cannot exceed total price. Please adjust the amounts.')
      return
    }

    if (formData.totalPrice <= 0) {
      showError('Total price must be greater than 0. Please select a valid meal plan.')
      return
    }

    // Mandatory payment validation - must be fully paid to create membership
    if (Math.abs(validationReceivedAmount - validationTotalPrice) >= 0.01) {
      showError('Please enter total price in receive amount so it is paid')
      return
    }

    // Recalculate payment status to ensure it's correct before sending
    const receivedAmount = parseFloat((formData.receivedAmount || 0).toString())
    const totalPrice = parseFloat((formData.totalPrice || 0).toString())
    const finalPaymentStatus = (Math.abs(receivedAmount - totalPrice) < 0.01) ? 'paid' : 'unpaid'
    
    console.log('Form validation passed, calling API...')
    console.log('Payment status being sent:', finalPaymentStatus)
    console.log('Received Amount:', receivedAmount, 'Total Price:', totalPrice)
    setIsSubmitting(true)
    
    try {
      // Prepare the data exactly as the backend expects (only fields that backend stores)
            const membershipData = {
              userId: formData.userId,
              mealPlanId: formData.mealPlanId,
              totalMeals: formData.totalMeals,
              startDate: formData.startDate,
              endDate: formData.endDate,
              // Payment fields (only fields backend stores: totalPrice, receivedAmount, paymentMode, paymentStatus, note)
              totalPrice: formData.totalPrice,
              receivedAmount: formData.receivedAmount,
              paymentStatus: finalPaymentStatus, // Always 'paid' or 'unpaid' - paid when receivedAmount equals totalPrice
              paymentMode: formData.paymentMode || undefined,
              note: formData.note || ''
            }
      
      console.log('Creating user membership with data:', membershipData)
      console.log('Payment status type:', typeof finalPaymentStatus)
      console.log('Payment status value:', JSON.stringify(finalPaymentStatus))
      console.log('API call starting...')
      console.log('Network request will be visible in browser dev tools...')
      
      // Add a small delay to ensure network request is visible
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('Making API call now...')
      const result = await createUserMembership(membershipData).unwrap()
      
      console.log('User membership created successfully:', result)
      console.log('API response received:', result)
      console.log('Network request completed - check browser dev tools for full details')
      
      // Show success message
      showSuccess('User membership created successfully')
      
      // Wait a moment for the success message to show
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Close modal and refresh list (without page reload)
      handleClose()
      onSuccess()
      
    } catch (error: any) {
      console.error('Error creating user membership:', error)
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        originalStatus: error?.originalStatus
      })
      
      // Parse and show detailed error message
      let errorMessage = 'Failed to create user membership'
      
      if (error?.data?.message) {
        // Handle validation errors from backend
        if (error.data.message.includes('paymentStatus')) {
          errorMessage = 'Payment status validation failed. Please check your payment details.'
        } else if (error.data.message.includes('Invalid input data')) {
          errorMessage = 'Invalid data provided. Please check all required fields and try again.'
        } else {
          errorMessage = error.data.message
        }
      } else if (error?.data?.error) {
        errorMessage = error.data.error
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.status) {
        errorMessage = `Server error (${error.status}). Please try again.`
      }
      
      showError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      userId: '',
      mealPlanId: '',
      totalMeals: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      // Payment fields (only fields that backend stores)
      totalPrice: 0,
      receivedAmount: 0,
      paymentMode: 'cash', // Reset to cash default
      note: ''
    })
    setErrors({})
    onHide()
  }

  const selectedMealPlan = useMemo(() => {
    return mealPlans.find((plan: any) => plan._id === formData.mealPlanId)
  }, [mealPlans, formData.mealPlanId])

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white border-0">
        <Modal.Title className="fw-bold">
          <i className="ri-user-add-line me-2"></i>
          Create User Membership
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ position: 'relative', maxHeight: '70vh', overflowY: 'auto' }} className="p-3">
          {(isLoading || isSubmitting) && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                zIndex: 1000,
                borderRadius: '0.375rem'
              }}
            >
              <div className="text-center">
                <div className="spinner-border text-primary mb-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="text-muted">
                  {isSubmitting ? 'Creating User Membership...' : 'Loading...'}
                </div>
                <div className="text-muted small mt-1">
                  Please wait while we process your request
                </div>
              </div>
            </div>
          )}
          {/* Customer & Meal Plan Section */}
          <div className="mb-3">
            <h6 className="text-primary mb-2 fw-semibold border-bottom pb-1">
              <i className="ri-user-line me-2"></i>
              Customer & Meal Plan Details
            </h6>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark">Customer *</Form.Label>
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
                    className="form-control"
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
                  <Form.Label className="fw-semibold text-dark">Meal Plan *</Form.Label>
                  <Form.Select
                    value={formData.mealPlanId}
                    onChange={(e) => handleMealPlanChange(e.target.value)}
                    isInvalid={!!errors.mealPlanId}
                    className="form-control"
                  >
                    <option value="">Select Meal Plan</option>
                    {mealPlans.length > 0 ? (
                      mealPlans.map((plan: any) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.title} - AED {plan.price}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading meal plans...</option>
                    )}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    <i className="ri-restaurant-line me-1"></i>
                    {mealPlans.length} meal plans available
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.mealPlanId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
            
          {/* Selected Plan Information */}
          {selectedMealPlan && (
            <div className="mb-3">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light py-2">
                  <h6 className="mb-0 text-primary fw-semibold">
                    <i className="ri-information-line me-2"></i>
                    Selected Plan Details
                  </h6>
                </div>
                <div className="card-body py-2">
                  <Row>
                    <Col md={6}>
                      <div className="mb-1">
                        <strong className="text-dark">Plan:</strong>
                        <span className="ms-2 text-primary">{(selectedMealPlan as any).title}</span>
                      </div>
                      <div className="mb-1">
                        <strong className="text-dark">Price:</strong>
                        <span className="ms-2 text-success fw-bold">AED {(selectedMealPlan as any).price}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-1">
                        <strong className="text-dark">Category:</strong>
                        <span className="ms-2 badge bg-secondary">{(selectedMealPlan as any).category || 'N/A'}</span>
                      </div>
                      <div className="mb-1">
                        <strong className="text-dark">Duration:</strong>
                        <span className="ms-2 text-warning fw-bold">{(selectedMealPlan as any).durationDays} days</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          )}

          {/* Meals & Dates Section */}
          <div className="mb-3">
            <h6 className="text-primary mb-2 fw-semibold border-bottom pb-1">
              <i className="ri-calendar-line me-2"></i>
              Meals & Duration
            </h6>
            <Row className="g-2">

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark">Total Meals *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.totalMeals}
                    onChange={(e) => handleInputChange('totalMeals', Number(e.target.value))}
                    isInvalid={!!errors.totalMeals}
                    min="1"
                    placeholder="Total number of meals"
                    className="form-control"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.totalMeals}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark">Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark">End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    isInvalid={!!errors.endDate}
                    min={formData.startDate}
                    className="form-control"
                  />
                  <Form.Text className="text-muted">
                    <i className="ri-calendar-check-line me-1"></i>
                    {selectedMealPlan ? `Auto-calculated based on ${selectedMealPlan.durationDays || 30} days duration` : 'Enter end date manually'}
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Payment Information Section */}
          <div className="mb-3">
            <h6 className="text-primary mb-2 fw-semibold border-bottom pb-1">
              <i className="ri-money-dollar-circle-line me-2"></i>
              Payment Information
            </h6>
            <Row className="g-2">
              {/* Left Column - Payment Inputs */}
              <Col md={6}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-light py-2">
                    <h6 className="mb-0 text-dark fw-semibold">
                      <i className="ri-edit-line me-2"></i>
                      Payment Details
                    </h6>
                  </div>
                  <div className="card-body py-2">
                    <Row className="g-2">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-dark">Total Price (AED) *</Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.totalPrice}
                            onChange={(e) => handleInputChange('totalPrice', Number(e.target.value))}
                            isInvalid={!!errors.totalPrice}
                            min="0"
                            step="0.01"
                            placeholder="Enter total price"
                            className="form-control"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.totalPrice}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-dark">Received Amount (AED) *</Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.receivedAmount}
                            onChange={(e) => handleReceivedAmountChange(Number(e.target.value))}
                            isInvalid={!!errors.receivedAmount}
                            min="0"
                            step="0.01"
                            placeholder="Amount received now"
                            className="form-control"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.receivedAmount}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            <i className="ri-information-line me-1"></i>
                            Enter total price to make it paid
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-dark">Payment Mode</Form.Label>
                          <Form.Select
                            value={formData.paymentMode}
                            onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                            isInvalid={!!errors.paymentMode}
                            className="form-control"
                          >
                            <option value="">Select Payment Mode</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="online">Online Transfer</option>
                            <option value="payment_link">Payment Link</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.paymentMode}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-dark">Note</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={formData.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            placeholder="Add any additional notes..."
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
            
              {/* Right Column - Payment Summary */}
              <Col md={6}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-success text-white py-2">
                    <h6 className="mb-0 fw-semibold">
                      <i className="ri-calculator-line me-2"></i>
                      Payment Summary
                    </h6>
                  </div>
                  <div className="card-body py-2">
                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                        <span className="text-muted fw-semibold">Total Amount:</span>
                        <span className="fw-bold text-dark">AED {formData.totalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-info bg-opacity-10 rounded">
                        <span className="text-muted fw-semibold">Received Amount:</span>
                        <span className="fw-bold text-info">AED {(formData.receivedAmount || 0).toFixed(2)}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-warning bg-opacity-10 rounded">
                        <span className="text-muted fw-semibold">Remaining Amount:</span>
                        <span className={`fw-bold ${(remainingAmount || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                          AED {(remainingAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <hr className="my-2" />
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted fw-semibold">Payment Status:</span>
                        <span className="badge bg-success px-2 py-1">
                          <i className="ri-check-line me-1"></i>
                          Paid
                        </span>
                      </div>
                      
                      {/* Payment Status Alert */}
                      <div className="alert alert-success mb-2 py-2">
                        <div className="d-flex align-items-center">
                          <i className="ri-check-circle-line me-2"></i>
                          <div>
                            <strong>Fully Paid</strong><br/>
                            <small>Membership will be created as paid</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {formData.paymentMode && (
                      <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted fw-semibold">Payment Mode: </small>
                        <span className="badge bg-primary ms-2">
                          <i className="ri-bank-card-line me-1"></i>
                          {formData.paymentMode.charAt(0).toUpperCase() + formData.paymentMode.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0 p-4">
          <div className="d-flex justify-content-end gap-3 w-100">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose} 
              disabled={isLoading || isSubmitting}
              className="px-4 py-2"
            >
              <i className="ri-close-line me-2"></i>
              Cancel
            </Button>
            <Button 
              variant="success" 
              type="submit"
              disabled={isLoading || isSubmitting || !canManageMembership}
              className="px-4 py-2 fw-semibold"
            >
              {(isLoading || isSubmitting) ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Membership...
                </>
              ) : (
                <>
                  <i className="ri-user-add-line me-2"></i>
                  Create User Membership
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateUserMembershipModal

