'use client'
import React, { useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface PaymentModeChangeModalProps {
  show: boolean
  onHide: () => void
  order: any
  onConfirm: (newPaymentMode: string) => void
  isLoading?: boolean
}

const PaymentModeChangeModal: React.FC<PaymentModeChangeModalProps> = ({
  show,
  onHide,
  order,
  onConfirm,
  isLoading = false
}) => {
  const [selectedMode, setSelectedMode] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)

  // Available payment modes (matching backend schema)
  const paymentModes = ['Cash', 'Card', 'Gateway', 'Online Transfer', 'Payment Link']

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode)
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onConfirm(selectedMode)
    setShowConfirm(false)
    setSelectedMode('')
  }

  const handleClose = () => {
    setShowConfirm(false)
    setSelectedMode('')
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="solar:card-2-bold" className="me-2" />
          Change Payment Mode
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="mb-3">
          <h6>Order Details:</h6>
          <div className="bg-light p-3 rounded">
            <div><strong>Invoice:</strong> {order?.invoiceNo}</div>
            <div><strong>Amount:</strong> AED {order?.total}</div>
            <div><strong>Date:</strong> {order?.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>

        {!showConfirm ? (
          <>
            <Alert variant="info" className="mb-3">
              <IconifyIcon icon="solar:info-circle-bold" className="me-2" />
              <strong>Payment Mode Change Available for Current Date Only</strong><br/>
              Select the new payment mode for this order. Only the payment method will be changed. This feature is only available for orders from today's date.
            </Alert>
            
            <h6>Select Payment Mode:</h6>
            <div className="d-grid gap-2">
              {paymentModes.map((mode) => (
                <Button
                  key={mode}
                  variant="outline-primary"
                  size="lg"
                  onClick={() => handleModeSelect(mode)}
                  className="d-flex align-items-center justify-content-between"
                >
                  <span>{mode}</span>
                  <IconifyIcon icon="solar:arrow-right-bold" />
                </Button>
              ))}
            </div>
          </>
        ) : (
          <>
            <Alert variant="warning" className="mb-3">
              <IconifyIcon icon="solar:danger-triangle-bold" className="me-2" />
              <strong>Confirm Payment Mode Change</strong>
            </Alert>
            
            <div className="text-center mb-3">
              <div className="mb-2">
                <span className="text-muted">Change to:</span>
                <span className="badge bg-success ms-2">{selectedMode}</span>
              </div>
            </div>
            
            <Alert variant="light" className="mb-3">
              <small>
                <strong>Note:</strong> This will only change the payment method. 
                The order amount, items, and other details will remain unchanged.
              </small>
            </Alert>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        {showConfirm ? (
          <>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Back
            </Button>
            <Button 
              variant="success" 
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Updating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="solar:check-circle-bold" className="me-2" />
                  Confirm Change
                </>
              )}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default PaymentModeChangeModal
