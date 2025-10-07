'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col, Alert, Table } from 'react-bootstrap'
import { useCloseShiftMutation } from '@/services/shiftApi'

interface ShiftCloseModalProps {
  show: boolean
  onHide: () => void
  onSuccess?: () => void
  currentShift?: any
  initialData?: {
    denominations?: { [key: number]: number }
  }
  onDataChange?: (data: any) => void
}

const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]

const ShiftCloseModal: React.FC<ShiftCloseModalProps> = ({ show, onHide, onSuccess, currentShift, initialData, onDataChange }) => {
  const [closeShift, { isLoading, error }] = useCloseShiftMutation()
  const [counts, setCounts] = useState<{ [key: number]: number }>(
    initialData?.denominations || Object.fromEntries(denominations.map((d) => [d, 0]))
  )
  const [activeDenom, setActiveDenom] = useState<number | null>(null)
  const [warningMessage, setWarningMessage] = useState<string>('')

  // Update counts when initialData changes
  useEffect(() => {
    if (initialData?.denominations) {
      setCounts(initialData.denominations)
      
      // Debug: Log the received data
      if (process.env.NODE_ENV === 'development') {
        console.log('Close Modal received initialData:', initialData)
        console.log('Close Modal setting counts:', initialData.denominations)
      }
    }
  }, [initialData])

  const handleChange = (value: string, denom: number) => {
    const newCounts = {
      ...counts,
      [denom]: Number(value) || 0,
    }
    setCounts(newCounts)
    onDataChange?.({ denominations: newCounts })
  }

  const handleKeypadClick = (num: string) => {
    if (activeDenom === null) return
    const newCounts = {
      ...counts,
      [activeDenom]: Number(String(counts[activeDenom] || '') + num),
    }
    setCounts(newCounts)
    onDataChange?.({ denominations: newCounts })
  }

  const handleClear = () => {
    if (activeDenom === null) {
      // If no denomination is selected, clear all denominations
      const newCounts = Object.fromEntries(denominations.map((d) => [d, 0]))
      setCounts(newCounts)
      onDataChange?.({ denominations: newCounts })
    } else {
      // If a denomination is selected, clear only that one
      const newCounts = {
        ...counts,
        [activeDenom]: 0,
      }
      setCounts(newCounts)
      onDataChange?.({ denominations: newCounts })
    }
  }

  const handleBackspace = () => {
    if (activeDenom === null) return
    const currentValue = counts[activeDenom] || 0
    const newValue = Math.floor(currentValue / 10) // Remove last digit
    const newCounts = {
      ...counts,
      [activeDenom]: newValue,
    }
    setCounts(newCounts)
    onDataChange?.({ denominations: newCounts })
  }

  const total = denominations.reduce((sum, d) => sum + d * counts[d], 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWarningMessage('') // Clear previous warnings
    
    // Check if this would be an early closure using current shift data
    if (currentShift && currentShift.logoutTime) {
      const scheduledEndTime = new Date(currentShift.logoutTime)
      const currentTime = new Date()
      

      // If current time is before scheduled end time, it's an early closure
      if (currentTime < scheduledEndTime) {
        const timeDiff = scheduledEndTime.getTime() - currentTime.getTime()
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        
        const warningMsg = `Scheduled end time was ${scheduledEndTime.toLocaleString()}`
        setWarningMessage(warningMsg)
        return // Don't proceed with closing, show warning first
      }
    }
    
    // If not early closure or no scheduled time, proceed with normal close
    await handleActualClose()
  }

  const handleActualClose = async () => {
    try {
      const denominationsData = {
        denomination1000: counts[1000] || 0,
        denomination500: counts[500] || 0,
        denomination200: counts[200] || 0,
        denomination100: counts[100] || 0,
        denomination50: counts[50] || 0,
        denomination20: counts[20] || 0,
        denomination10: counts[10] || 0,
        denomination5: counts[5] || 0,
        denomination2: counts[2] || 0,
        denomination1: counts[1] || 0,
      }

      const result = await closeShift({ denominations: denominationsData }).unwrap()
      if (result.message) {
        onSuccess?.()
        onHide()
        // Reset form
        setCounts(Object.fromEntries(denominations.map((d) => [d, 0])))
        setWarningMessage('')
      }
    } catch (err) {
      console.error('Failed to close shift:', err)
    }
  }

  const handleConfirmEarlyClosure = async () => {
    // User confirmed early closure, now actually close the shift
    await handleActualClose()
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Close Shift</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {'data' in error ? (error.data as any)?.message || 'Failed to close shift' : 'Failed to close shift'}
            </Alert>
          )}

          {warningMessage && (
            <Alert variant="warning" className="mb-3">
              <strong>⚠️ Early Closure Warning:</strong> {warningMessage}
            </Alert>
          )}

          {currentShift && (
            <Alert variant="info" className="mb-3">
              <strong>Current Shift:</strong> #{currentShift.shiftNumber} - Started: {new Date(currentShift.startTime).toLocaleString()}
            </Alert>
          )}

          <Row>
            {/* Denomination Table */}
            <Col md={8}>
              <h6 className="mb-2">Cash Denomination</h6>
              <Table bordered hover size="sm" className="text-center align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Value</th>
                    <th>X</th>
                    <th>Count</th>
                    <th>=</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {denominations.map((d) => (
                    <tr 
                      key={d} 
                      className={activeDenom === d ? 'table-info' : ''} 
                      onClick={() => setActiveDenom(d)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{d} Denom</td>
                      <td>X</td>
                      <td>
                        <Form.Control
                          type="text"
                          value={counts[d] || ''}
                          onChange={(e) => handleChange(e.target.value, d)}
                          size="sm"
                          className="text-end"
                        />
                      </td>
                      <td>=</td>
                      <td>{(d * counts[d]).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold table-success">
                    <td colSpan={4}>Total</td>
                    <td>{total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            {/* Keypad */}
            <Col md={4}>
              <div className="keypad d-grid gap-2">
                <Row>
                  {[1, 2, 3].map((n) => (
                    <Col key={n}>
                      <Button 
                        variant="outline-primary" 
                        className="w-100 py-3" 
                        onClick={() => handleKeypadClick(String(n))}
                        type="button"
                      >
                        {n}
                      </Button>
                    </Col>
                  ))}
                </Row>
                <Row>
                  {[4, 5, 6].map((n) => (
                    <Col key={n}>
                      <Button 
                        variant="outline-primary" 
                        className="w-100 py-3" 
                        onClick={() => handleKeypadClick(String(n))}
                        type="button"
                      >
                        {n}
                      </Button>
                    </Col>
                  ))}
                </Row>
                <Row>
                  {[7, 8, 9].map((n) => (
                    <Col key={n}>
                      <Button 
                        variant="outline-primary" 
                        className="w-100 py-3" 
                        onClick={() => handleKeypadClick(String(n))}
                        type="button"
                      >
                        {n}
                      </Button>
                    </Col>
                  ))}
                </Row>
                <Row>
                  <Col>
                    <Button 
                      variant="danger" 
                      className="w-100 py-3" 
                      onClick={handleClear}
                      type="button"
                    >
                      C
                    </Button>
                  </Col>
                  <Col>
                    <Button 
                      variant="outline-primary" 
                      className="w-100 py-3" 
                      onClick={() => handleKeypadClick('0')}
                      type="button"
                    >
                      0
                    </Button>
                  </Col>
                  <Col>
                    <Button 
                      variant="secondary" 
                      className="w-100 py-3"
                      type="button"
                      onClick={handleBackspace}
                    >
                      ⌫
                    </Button>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          {warningMessage ? (
            <>
              <Button variant="warning" onClick={handleConfirmEarlyClosure}>
                Confirm Early Closure
              </Button>
              <Button variant="secondary" onClick={() => setWarningMessage('')}>
                Go Back
              </Button>
            </>
          ) : (
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Closing...' : 'Close Shift'}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ShiftCloseModal
