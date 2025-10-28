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
    // Payment fields
    totalPrice: 0,
    receivedAmount: 0,
    cumulativePaid: 0,
    paymentMode: '',
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
    const cumulativePaid = formData.cumulativePaid || 0
    const totalPrice = formData.totalPrice || 0
    if (cumulativePaid >= totalPrice) {
      return 'paid'
    } else {
      return 'unpaid'
    }
  }, [formData.cumulativePaid, formData.totalPrice])

  const remainingAmount = useMemo(() => {
    const totalPrice = formData.totalPrice || 0
    const cumulativePaid = formData.cumulativePaid || 0
    return Math.max(0, totalPrice - cumulativePaid)
  }, [formData.totalPrice, formData.cumulativePaid])

  // Update cumulative paid when received amount changes
  const handleReceivedAmountChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      receivedAmount: value,
      cumulativePaid: value // For new memberships, received amount = cumulative paid
    }))
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
    if (formData.cumulativePaid < 0) {
      newErrors.cumulativePaid = 'Cumulative paid amount cannot be negative'
    }
    if (formData.cumulativePaid > formData.totalPrice) {
      newErrors.cumulativePaid = 'Cumulative paid amount cannot exceed total price'
    }
    if (formData.paymentMode && !['cash', 'card', 'online', 'payment_link'].includes(formData.paymentMode)) {
      newErrors.paymentMode = 'Invalid payment mode'
    }

    console.log('Validation errors:', newErrors)
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
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors)
      return
    }

    console.log('Form validation passed, calling API...')
    setIsSubmitting(true)
    
    try {
      // Prepare the data exactly as the backend expects
            const membershipData = {
              userId: formData.userId,
              mealPlanId: formData.mealPlanId,
              totalMeals: formData.totalMeals,
              startDate: formData.startDate,
              endDate: formData.endDate,
              // Payment fields
              totalPrice: formData.totalPrice,
              receivedAmount: formData.receivedAmount,
              cumulativePaid: formData.cumulativePaid,
              paymentStatus: paymentStatus,
              paymentMode: formData.paymentMode || undefined,
              note: formData.note || ''
            }
      
      console.log('Creating user membership with data:', membershipData)
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
      
      // Show detailed error message
      const errorMessage = error?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          `Failed to create user membership (Status: ${error?.status || 'Unknown'})`
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
      // Payment fields
      totalPrice: 0,
      receivedAmount: 0,
      cumulativePaid: 0,
      paymentMode: '',
      note: ''
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
        <Modal.Body style={{ position: 'relative' }}>
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
                        {plan.title} - AED {plan.price}
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
                  <strong>Price:</strong> AED {(selectedMealPlan as any).price}<br/>
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
                <Form.Label>Meal Plan Price (AED)</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedMealPlan ? `AED ${selectedMealPlan.price || 0}` : 'Select a meal plan'}
                  readOnly
                  className="bg-light"
                  plaintext
                />
                <Form.Text className="text-muted">
                  Price from selected meal plan
                </Form.Text>
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

            {/* Payment Fields - POS Style */}
            <Col md={12}>
              <hr className="my-3" />
              <h6 className="text-primary mb-3">Payment Information</h6>
            </Col>
            
            {/* Left Column - Payment Inputs */}
            <Col md={6}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Total Price (AED) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.totalPrice}
                      onChange={(e) => handleInputChange('totalPrice', Number(e.target.value))}
                      isInvalid={!!errors.totalPrice}
                      min="0"
                      step="0.01"
                      placeholder="Enter total price"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.totalPrice}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Received Amount (AED)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.receivedAmount}
                      onChange={(e) => handleReceivedAmountChange(Number(e.target.value))}
                      isInvalid={!!errors.receivedAmount}
                      min="0"
                      step="0.01"
                      placeholder="Amount received now"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.receivedAmount}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Amount received in this payment
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Cumulative Paid (AED)</Form.Label>
                    <Form.Control
                      type="text"
                      value={`AED ${formData.cumulativePaid.toFixed(2)}`}
                      readOnly
                      className="bg-light"
                      plaintext
                    />
                    <Form.Text className="text-muted">
                      Total amount paid so far
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Payable Amount (AED)</Form.Label>
                    <Form.Control
                      type="text"
                      value={`AED ${remainingAmount.toFixed(2)}`}
                      readOnly
                      className="bg-light"
                      plaintext
                    />
                    <Form.Text className="text-muted">
                      Remaining amount to be paid
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Payment Mode</Form.Label>
                    <Form.Select
                      value={formData.paymentMode}
                      onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                      isInvalid={!!errors.paymentMode}
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
                    <Form.Label>Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.note}
                      onChange={(e) => handleInputChange('note', e.target.value)}
                      placeholder="Add any additional notes..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            
            {/* Right Column - Payment Summary (POS Style) */}
            <Col md={6}>
              <div className="border rounded p-3 bg-light">
                <h6 className="text-dark mb-3">Payment Summary</h6>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Total Amount:</span>
                    <span className="fw-bold">AED {formData.totalPrice.toFixed(2)}</span>
                  </div>
                  
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Received Amount:</span>
                <span className="fw-bold text-info">AED {(formData.receivedAmount || 0).toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Cumulative Paid:</span>
                <span className="fw-bold text-success">AED {(formData.cumulativePaid || 0).toFixed(2)}</span>
              </div>
                  
                  <hr className="my-2" />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Remaining Amount:</span>
                    <span className={`fw-bold ${(remainingAmount || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                      AED {(remainingAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Payable Amount:</span>
                    <span className={`fw-bold ${(remainingAmount || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                      AED {(remainingAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <small className="text-muted">Remaining amount to be paid</small>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Payment Status:</span>
                    <span className={`badge ${paymentStatus === 'paid' ? 'bg-success' : 'bg-danger'}`}>
                      {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
                
                {formData.paymentMode && (
                  <div className="mb-2">
                    <small className="text-muted">Payment Mode: </small>
                    <span className="badge bg-info">
                      {formData.paymentMode.charAt(0).toUpperCase() + formData.paymentMode.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={isLoading || isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isLoading || isSubmitting || !canManageMembership}
          >
            {(isLoading || isSubmitting) ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating User Membership...
              </>
            ) : (
              'Create User Membership'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateUserMembershipModal

