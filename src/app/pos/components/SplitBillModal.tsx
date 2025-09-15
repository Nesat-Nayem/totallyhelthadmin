// SplitBillModal.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Table } from 'react-bootstrap'

interface SplitBillModalProps {
  show: boolean
  onClose: () => void
  totalAmount: number
}

const SplitBillModal: React.FC<SplitBillModalProps> = ({ show, onClose, totalAmount }) => {
  const [numPeople, setNumPeople] = useState(1)
  const [splits, setSplits] = useState<string[]>(['']) // ✅ keep as strings for editable input

  // Sync number of people with inputs
  useEffect(() => {
    setSplits((prev) => {
      if (numPeople > prev.length) {
        return [...prev, ...Array(numPeople - prev.length).fill('')]
      } else {
        return prev.slice(0, numPeople)
      }
    })
  }, [numPeople])

  // Auto-fill full bill if only 1 person
  useEffect(() => {
    if (numPeople === 1) {
      setSplits([totalAmount.toFixed(2)])
    }
  }, [numPeople, totalAmount])

  // Split equally
  const handleSplitEqual = () => {
    const perPerson = (totalAmount / numPeople).toFixed(2)
    setSplits(Array(numPeople).fill(perPerson))
  }

  // Update individual share (editable input)
  const handleChange = (index: number, value: string) => {
    const updated = [...splits]
    updated[index] = value
    setSplits(updated)
  }

  // Calculate numeric total
  const totalSplit = splits.reduce((a, b) => a + (parseFloat(b) || 0), 0)

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Split Bill</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>No. of People</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={numPeople}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              setNumPeople(isNaN(val) || val < 1 ? 1 : val)
            }}
          />
        </Form.Group>

        <div className="mb-3">
          <Button variant="secondary" onClick={handleSplitEqual}>
            Split Equally
          </Button>
        </div>

        <Table bordered>
          <thead>
            <tr>
              <th>Person</th>
              <th>Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numPeople }).map((_, idx) => (
              <tr key={idx}>
                <td>Person {idx + 1}</td>
                <td>
                  <Form.Control type="number" value={splits[idx] ?? ''} onChange={(e) => handleChange(idx, e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between">
          <h6>Total Bill: AED {totalAmount.toFixed(2)}</h6>
          <h6>
            Split Total: AED <span className={totalSplit === totalAmount ? 'text-success' : 'text-danger'}>{totalSplit.toFixed(2)}</span>
          </h6>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" disabled={totalSplit !== totalAmount} onClick={onClose}>
          Confirm Split
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SplitBillModal
