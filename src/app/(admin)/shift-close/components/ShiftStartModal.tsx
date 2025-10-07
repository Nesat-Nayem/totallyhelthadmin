'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap'
import { useStartShiftMutation } from '@/services/shiftApi'

interface ShiftStartModalProps {
  show: boolean
  onHide: () => void
  onSuccess?: () => void
  initialData?: {
    shiftNumber?: number | string
    loginDate?: string
    loginTime?: string
    logoutDate?: string
    logoutTime?: string
    loginName?: string
    note?: string
  }
  onDataChange?: (data: any) => void
}

const ShiftStartModal: React.FC<ShiftStartModalProps> = ({ show, onHide, onSuccess, initialData, onDataChange }) => {
  const [startShift, { isLoading, error }] = useStartShiftMutation()
  const [formData, setFormData] = useState({
    shiftNumber: initialData?.shiftNumber || '1',
    loginDate: initialData?.loginDate || new Date().toISOString().split('T')[0],
    loginTime: initialData?.loginTime || new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    logoutDate: initialData?.logoutDate || new Date().toISOString().split('T')[0],
    logoutTime: initialData?.logoutTime || new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    loginName: initialData?.loginName || 'CASH',
    note: initialData?.note || 'Starting new shift'
  })

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      const newFormData = {
        shiftNumber: initialData.shiftNumber || '1',
        loginDate: initialData.loginDate || new Date().toISOString().split('T')[0],
        loginTime: initialData.loginTime || new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        logoutDate: initialData.logoutDate || new Date().toISOString().split('T')[0],
        logoutTime: initialData.logoutTime || new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        loginName: initialData.loginName || 'CASH',
        note: initialData.note || 'Starting new shift'
      }
      setFormData(newFormData)
      
      // Debug: Log the received data
      if (process.env.NODE_ENV === 'development') {
        console.log('Modal received initialData:', initialData)
        console.log('Modal setting formData:', newFormData)
      }
    } else {
      // If no initialData, set default values for new shift
      const defaultFormData = {
        shiftNumber: '1',
        loginDate: new Date().toISOString().split('T')[0],
        loginTime: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        logoutDate: new Date().toISOString().split('T')[0],
        logoutTime: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        loginName: 'CASH',
        note: 'Starting new shift'
      }
      setFormData(defaultFormData)
      
      // Debug: Log default data
      if (process.env.NODE_ENV === 'development') {
        console.log('Modal using default values:', defaultFormData)
      }
    }
  }, [initialData])

  // Get current date for min attribute
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange?.(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all required fields
    if (!formData.shiftNumber) {
      alert('Shift number is required')
      return
    }
    if (!formData.loginDate) {
      alert('Login date is required')
      return
    }
    if (!formData.loginTime) {
      alert('Login time is required')
      return
    }
    if (!formData.logoutDate) {
      alert('Logout date is required')
      return
    }
    if (!formData.logoutTime) {
      alert('Logout time is required')
      return
    }
    if (!formData.loginName) {
      alert('Login name is required')
      return
    }
    if (!formData.note) {
      alert('Note is required')
      return
    }
    
    try {
      const submitData = {
        ...formData,
        shiftNumber: Number(formData.shiftNumber)
      }
      const result = await startShift(submitData).unwrap()
      if (result.message) {
        onSuccess?.()
        onHide()
        // Reset form with default values
        setFormData({
          shiftNumber: '1',
          loginDate: new Date().toISOString().split('T')[0],
          loginTime: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          logoutDate: new Date().toISOString().split('T')[0],
          logoutTime: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          loginName: 'CASH',
          note: 'Starting new shift'
        })
      }
    } catch (err) {
      console.error('Failed to start shift:', err)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Start New Shift</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {'data' in error ? (error.data as any)?.message || 'Failed to start shift' : 'Failed to start shift'}
            </Alert>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Shift Number</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.shiftNumber}
                  onChange={(e) => handleInputChange('shiftNumber', e.target.value)}
                  placeholder="Enter shift number"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Login Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.loginDate}
                  onChange={(e) => handleInputChange('loginDate', e.target.value)}
                  min={getCurrentDate()}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Login Time</Form.Label>
                <Form.Control
                  type="time"
                  value={formData.loginTime}
                  onChange={(e) => handleInputChange('loginTime', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Logout Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.logoutDate}
                  onChange={(e) => handleInputChange('logoutDate', e.target.value)}
                  min={getCurrentDate()}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Logout Time</Form.Label>
                <Form.Control
                  type="time"
                  value={formData.logoutTime}
                  onChange={(e) => handleInputChange('logoutTime', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Login Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.loginName}
                  onChange={(e) => handleInputChange('loginName', e.target.value)}
                  placeholder="Enter login name"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Enter shift notes (e.g., Opening shift, Special instructions, etc.)"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Starting...' : 'Start Shift'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ShiftStartModal
