'use client'

import React, { useState } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { useCreateMealPlanMutation } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'

interface CreateMembershipModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
}

const CreateMembershipModal: React.FC<CreateMembershipModalProps> = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    delPrice: 0,
    category: '',
    brand: '',
    totalMeals: 0,
    durationDays: 0,
    status: 'active',
    images: [] as string[],
    badge: '',
    discount: '',
    kcalList: '',
    deliveredList: '',
    suitableList: '',
    daysPerWeek: '',
    weeksOffers: ''
  })
  const [errors, setErrors] = useState<any>({})
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [createMealPlan, { isLoading }] = useCreateMealPlanMutation()

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.brand) {
      newErrors.brand = 'Brand is required'
    }
    if (formData.totalMeals <= 0) {
      newErrors.totalMeals = 'Total meals must be greater than 0'
    }
    if (formData.durationDays <= 0) {
      newErrors.durationDays = 'Duration must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // Create FormData for multipart/form-data upload
      const formDataToSend = new FormData()
      
      // Add all form fields (matching backend field names)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('delPrice', formData.delPrice.toString())
      formDataToSend.append('category', formData.category)
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('totalMeals', formData.totalMeals.toString())
      formDataToSend.append('durationDays', formData.durationDays.toString())
      formDataToSend.append('status', formData.status)
      
      // Add optional fields (always send, even if empty)
      formDataToSend.append('badge', formData.badge || '')
      formDataToSend.append('discount', formData.discount || '')
      formDataToSend.append('kcalList', formData.kcalList || '')
      formDataToSend.append('deliveredList', formData.deliveredList || '')
      formDataToSend.append('suitableList', formData.suitableList || '')
      formDataToSend.append('daysPerWeek', formData.daysPerWeek || '')
      formDataToSend.append('weeksOffers', formData.weeksOffers || '')
      
      // Add images as files (multiple files with same field name 'images')
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file)
      })
      
      // Add thumbnail if exists (single file with field name 'thumbnail')
      if (imageFiles.length > 0) {
        formDataToSend.append('thumbnail', imageFiles[0]) // Use first image as thumbnail
      }
      
      console.log('FormData contents:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value)
      }
      
      // Debug: Log the actual form data being sent
      console.log('Sending FormData with fields:', {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        delPrice: formData.delPrice,
        category: formData.category,
        brand: formData.brand,
        totalMeals: formData.totalMeals,
        durationDays: formData.durationDays,
        status: formData.status,
        imageCount: imageFiles.length
      })
      
      // Test with minimal data first
      console.log('Testing API call...')
      const result = await createMealPlan(formDataToSend).unwrap()
      console.log('Success response:', result)
      showSuccess('Membership created successfully')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Create membership error:', error)
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        originalStatus: error?.originalStatus
      })
      
      // Show more detailed error message
      const errorMessage = error?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          `Failed to create membership (Status: ${error?.status || 'Unknown'})`
      showError(errorMessage)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      delPrice: 0,
      category: '',
      brand: '',
      totalMeals: 0,
      durationDays: 0,
      status: 'active',
      images: [],
      badge: '',
      discount: '',
      kcalList: '',
      deliveredList: '',
      suitableList: '',
      daysPerWeek: '',
      weeksOffers: ''
    })
    setErrors({})
    setImageFiles([])
    setImagePreviews([])
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create New Membership</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  isInvalid={!!errors.category}
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
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  isInvalid={!!errors.description}
                  placeholder="Describe the membership plan..."
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Price (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  isInvalid={!!errors.price}
                  min="0"
                  step="0.01"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Del Price (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.delPrice}
                  onChange={(e) => handleInputChange('delPrice', Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="Original price if different"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  isInvalid={!!errors.brand}
                >
                  <option value="">Select Brand</option>
                  <option value="Totally Health">Totally Health</option>
                  <option value="Subway">Subway</option>
                  <option value="Pizza Hut">Pizza Hut</option>
                  <option value="Burger King">Burger King</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.brand}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Badge</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.badge}
                  onChange={(e) => handleInputChange('badge', e.target.value)}
                  placeholder="e.g., Popular, New, Limited"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Discount</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  placeholder="e.g., 20% OFF, Buy 2 Get 1"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Calorie List</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.kcalList}
                  onChange={(e) => handleInputChange('kcalList', e.target.value)}
                  placeholder="e.g., 1200, 1500, 1800 (comma separated)"
                />
                <Form.Text className="text-muted">
                  Enter calorie options separated by commas
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Days Per Week</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.daysPerWeek}
                  onChange={(e) => handleInputChange('daysPerWeek', e.target.value)}
                  placeholder="e.g., 5, 6, 7 (comma separated)"
                />
                <Form.Text className="text-muted">
                  Enter available days separated by commas
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Meal Plan Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-2"
                />
                <Form.Text className="text-muted">
                  Upload images of the meal plan (multiple images allowed)
                  <br />
                  <small className="text-success">
                    <i className="ri-check-line me-1"></i>
                    Images will be uploaded to Cloudinary automatically
                  </small>
                </Form.Text>
                
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <h6>Image Previews:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="img-thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute"
                            style={{ top: '-5px', right: '-5px' }}
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Total Meals *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.totalMeals}
                  onChange={(e) => handleInputChange('totalMeals', Number(e.target.value))}
                  isInvalid={!!errors.totalMeals}
                  min="1"
                  placeholder="Total number of meals in this plan"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.totalMeals}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Duration (Days) *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => handleInputChange('durationDays', Number(e.target.value))}
                  isInvalid={!!errors.durationDays}
                  min="1"
                  placeholder="Plan duration in days"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.durationDays}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
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
            {isLoading ? 'Creating...' : 'Create Membership'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateMembershipModal
