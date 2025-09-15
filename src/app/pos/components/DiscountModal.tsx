'use client'

import React, { useState } from 'react'
import { Modal, Button, Form, InputGroup, FormControl } from 'react-bootstrap'

interface DiscountModalProps {
  show: boolean
  onClose: () => void
  onApply: (type: string, amount: number, reason: string) => void
}

const DiscountModal: React.FC<DiscountModalProps> = ({ show, onClose, onApply }) => {
  const [discountType, setDiscountType] = useState<'Flat' | 'Percent'>('Flat')
  const [amount, setAmount] = useState<number>(0)
  const [reason, setReason] = useState<string>('')

  const handleApply = () => {
    if (!amount || !reason) {
      alert('Please enter discount amount and reason')
      return
    }
    onApply(discountType, amount, reason)
    setAmount(0)
    setReason('')
    setDiscountType('Flat')
    onClose()
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Apply Discount</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Discount Type</Form.Label>
          <Form.Select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'Flat' | 'Percent')}>
            <option value="Flat">Flat (AED)</option>
            <option value="Percent">Percent (%)</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Discount Amount</Form.Label>
          <FormControl type="number" placeholder="Enter discount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Reason</Form.Label>
          <FormControl type="text" placeholder="Enter discount reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Apply Discount
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DiscountModal
