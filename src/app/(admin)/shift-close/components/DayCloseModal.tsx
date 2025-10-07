'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { useDayCloseMutation, useGenerateThermalReceiptQuery } from '@/services/shiftApi'
import { printThermalReceipt, printThermalReceiptIframe } from '@/utils/thermalPrint'
import { downloadThermalReceipt, downloadThermalPDFAdvanced } from '@/utils/thermalDownload'

interface DayCloseModalProps {
  show: boolean
  onHide: () => void
  onSuccess?: () => void
}

const DayCloseModal: React.FC<DayCloseModalProps> = ({ show, onHide, onSuccess }) => {
  const router = useRouter()
  const [dayClose, { isLoading, error }] = useDayCloseMutation()
  const [note, setNote] = useState('')
  const [showThermalReport, setShowThermalReport] = useState(false)
  const [thermalReport, setThermalReport] = useState('')
  const [dayCloseResult, setDayCloseResult] = useState<any>(null)
  const [showThermalButton, setShowThermalButton] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [isGeneratingThermal, setIsGeneratingThermal] = useState(false)
  const [thermalError, setThermalError] = useState<string | null>(null)
  const [isDayClosed, setIsDayClosed] = useState(false)
  
  // Thermal receipt query - only trigger when we have a date and day is closed
  const { data: thermalReceiptData, isLoading: isThermalLoading, error: thermalQueryError } = useGenerateThermalReceiptQuery(
    currentDate, 
    { skip: !currentDate || !isDayClosed }
  )
  
  // Denomination state
  const [denominations, setDenominations] = useState({
    denomination1000: 0,
    denomination500: 0,
    denomination200: 0,
    denomination100: 0,
    denomination50: 0,
    denomination20: 0,
    denomination10: 0,
    denomination5: 0,
    denomination2: 0,
    denomination1: 0,
  })
  
  // Numpad state
  const [activeField, setActiveField] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Set default current date when modal opens (no API call)
  useEffect(() => {
    if (show && !currentDate) {
      const today = new Date().toISOString().split('T')[0]
      setCurrentDate(today)
      console.log('Set default current date:', today)
    }
  }, [show, currentDate])

  // Auto-show thermal report when data is available
  useEffect(() => {
    if (thermalReceiptData && showThermalButton) {
      console.log('Thermal receipt data received, showing report')
      setThermalReport(thermalReceiptData)
      setShowThermalReport(true)
    }
  }, [thermalReceiptData, showThermalButton])

  // Denomination values
  const denominationValues = {
    denomination1000: 1000,
    denomination500: 500,
    denomination200: 200,
    denomination100: 100,
    denomination50: 50,
    denomination20: 20,
    denomination10: 10,
    denomination5: 5,
    denomination2: 2,
    denomination1: 1,
  }

  // Calculate total for a denomination
  const calculateTotal = (denomination: string) => {
    const count = denominations[denomination as keyof typeof denominations]
    const value = denominationValues[denomination as keyof typeof denominationValues]
    return (count * value).toFixed(2)
  }

  // Calculate grand total
  const calculateGrandTotal = () => {
    return Object.keys(denominations).reduce((total, denomination) => {
      const count = denominations[denomination as keyof typeof denominations]
      const value = denominationValues[denomination as keyof typeof denominationValues]
      return total + (count * value)
    }, 0).toFixed(2)
  }

  // Handle numpad input
  const handleNumpadInput = (value: string) => {
    console.log('Numpad clicked:', value, 'Active field:', activeField)
    
    if (value === 'C') {
      // Clear all denominations
      setInputValue('')
      setDenominations({
        denomination1000: 0,
        denomination500: 0,
        denomination200: 0,
        denomination100: 0,
        denomination50: 0,
        denomination20: 0,
        denomination10: 0,
        denomination5: 0,
        denomination2: 0,
        denomination1: 0,
      })
      setActiveField(null)
    } else if (value === '⌫') {
      if (activeField) {
        const newValue = inputValue.slice(0, -1)
        setInputValue(newValue)
        // Update the denomination immediately
        const numValue = parseInt(newValue) || 0
        setDenominations(prev => ({
          ...prev,
          [activeField]: numValue
        }))
      }
    } else {
      if (activeField) {
        const newValue = inputValue + value
        setInputValue(newValue)
        // Update the denomination immediately
        const numValue = parseInt(newValue) || 0
        setDenominations(prev => ({
          ...prev,
          [activeField]: numValue
        }))
        console.log('Updated denomination:', activeField, 'to', numValue)
      } else {
        console.log('No active field - numpad input ignored')
      }
    }
  }

  // Handle field focus
  const handleFieldFocus = (field: string) => {
    console.log('Field focused:', field)
    setActiveField(field)
    const currentValue = denominations[field as keyof typeof denominations]
    setInputValue(currentValue > 0 ? currentValue.toString() : '')
    console.log('Active field set to:', field, 'Current value:', currentValue)
  }

  // Handle field blur
  const handleFieldBlur = () => {
    // The denomination is already updated in real-time, so just clear the active state
    setActiveField(null)
    setInputValue('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only proceed with day close API call when user explicitly confirms
    try {
      // Filter out zero denominations to only send non-zero values
      const filteredDenominations = Object.fromEntries(
        Object.entries(denominations).filter(([_, value]) => value > 0)
      )
      
      console.log('Performing day close with user confirmation...')
      const result = await dayClose({ 
        note,
        denominations: Object.keys(filteredDenominations).length > 0 ? filteredDenominations : undefined
      }).unwrap()
      
      if (result.message) {
        setDayCloseResult(result)
        // Set current date for thermal receipt generation
        const today = new Date().toISOString().split('T')[0]
        setCurrentDate(today)
        setShowThermalButton(true)
        setIsDayClosed(true) // Mark day as closed
        // Show thermal report if available
        if (result.thermalReport) {
          setThermalReport(result.thermalReport)
          setShowThermalReport(true)
        }
      }
    } catch (err: any) {
      console.error('Failed to perform day close:', err)
      
      // Check if the error indicates day is already closed
      const errorMessage = err?.data?.message || err?.message || ''
      const isDayAlreadyClosed = errorMessage.toLowerCase().includes('already') && 
                                errorMessage.toLowerCase().includes('day') && 
                                errorMessage.toLowerCase().includes('close')
      
      if (isDayAlreadyClosed) {
        // Instead of showing error, show thermal receipt button
        console.log('Day already closed, showing thermal receipt option')
        const today = new Date().toISOString().split('T')[0]
        setCurrentDate(today)
        setShowThermalButton(true)
        setIsDayClosed(true) // Mark day as closed
        setDayCloseResult({
          message: 'Day close has already been performed for this date',
          closedCount: 0,
          dayCloseTime: new Date().toISOString()
        })
      }
    }
  }

  const handleGenerateThermalReceipt = async () => {
    console.log('Generate Thermal Receipt clicked')
    console.log('Current date:', currentDate)
    console.log('Is day closed:', isDayClosed)
    
    // Check if day has been closed
    if (!isDayClosed) {
      setThermalError('Cannot generate thermal receipt: Day has not been closed yet. Please close the day first.')
      return
    }
    
    setIsGeneratingThermal(true)
    setThermalError(null) // Clear any previous errors
    
    try {
      // Ensure we have a current date
      const dateToUse = currentDate || new Date().toISOString().split('T')[0]
      if (!currentDate) {
        setCurrentDate(dateToUse)
        console.log('Set current date to:', dateToUse)
      }
      
      // Make direct API call
      console.log('Making direct API call to thermal receipt endpoint...')
      const token = localStorage.getItem('backend_token')
      const response = await fetch(`http://localhost:5050/v1/api/day-close-report/thermal/${dateToUse}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html',
        },
      })
      
      console.log('API Response status:', response.status)
      console.log('API Response headers:', response.headers)
      
      // Get the response text regardless of status code
      const responseText = await response.text()
      console.log('Response text received:', responseText.substring(0, 200) + '...')
      console.log('Full response length:', responseText.length)
      console.log('Response status:', response.status)
      
      // Check if the response contains thermal receipt HTML (even if status is 404)
      const hasThermalReceipt = responseText.includes('thermal-receipt') || 
                               responseText.includes('TOTALLY HEALTHY') || 
                               responseText.includes('Shift Report') || 
                               responseText.includes('<!DOCTYPE html>') ||
                               responseText.includes('<html') ||
                               responseText.includes('Courier New') ||
                               responseText.includes('font-family') ||
                               responseText.includes('body')
      
      console.log('Has thermal receipt content:', hasThermalReceipt)
      console.log('Response contains TOTALLY HEALTHY:', responseText.includes('TOTALLY HEALTHY'))
      console.log('Response contains Shift Report:', responseText.includes('Shift Report'))
      console.log('Response contains DOCTYPE:', responseText.includes('<!DOCTYPE html>'))
      console.log('Response contains HTML tag:', responseText.includes('<html'))
      console.log('Response contains body tag:', responseText.includes('<body'))
      
      if (hasThermalReceipt) {
        console.log('Thermal receipt HTML detected in response, displaying report')
        setThermalReport(responseText)
        setShowThermalReport(true)
        // Don't show error alert if we successfully got the thermal receipt
        return
      } else if (response.ok) {
        console.log('Response OK, displaying content')
        setThermalReport(responseText)
        setShowThermalReport(true)
        return
      } else {
        console.error('API Error:', response.status, responseText)
        console.log('Response content preview:', responseText.substring(0, 500))
        
        // Check if the response contains any HTML content even with 404
        if (responseText.length > 0 && (responseText.includes('<') || responseText.includes('html'))) {
          console.log('Response contains HTML content despite 404, attempting to display')
          setThermalReport(responseText)
          setShowThermalReport(true)
          return
        }
        
        // Set error state instead of showing alert
        setThermalError(`Error generating thermal receipt: ${response.status} - ${responseText.substring(0, 100)}...`)
      }
    } catch (error) {
      console.error('Failed to generate thermal receipt:', error)
      setThermalError('Error generating thermal receipt: ' + (error as any)?.message || 'Unknown error')
    } finally {
      setIsGeneratingThermal(false)
    }
  }

  const handleOpenThermalReceiptPage = () => {
    const dateToUse = currentDate || new Date().toISOString().split('T')[0]
    router.push(`/thermal-receipt?date=${dateToUse}`)
  }

  const handlePrintThermalReport = () => {
    const reportData = thermalReceiptData || thermalReport
    if (reportData) {
      // Use backend thermal response directly without modification
      try {
        // Create blob with backend thermal HTML directly
        const blob = new Blob([reportData], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        
        // Create download link
        const link = document.createElement('a')
        link.href = url
        link.download = 'thermal-receipt.html'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
      } catch (error) {
        console.error('Direct thermal download failed:', error)
        
        // Fallback: Try to open in new window for printing
        try {
          const printWindow = window.open('', '_blank', 'width=200,height=800,scrollbars=no,resizable=no')
          if (printWindow) {
            printWindow.document.write(reportData)
            printWindow.document.close()
            printWindow.focus()
            printWindow.print()
            printWindow.close()
          }
        } catch (printError) {
          console.error('Print window failed:', printError)
          
          // Final fallback: Simple text download
          const textContent = reportData.replace(/<[^>]*>/g, '') // Remove HTML tags
          const blob = new Blob([textContent], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'thermal-receipt.txt'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }
    }
  }

  const handleCloseModal = () => {
    setShowThermalReport(false)
    setThermalReport('')
    setDayCloseResult(null)
    setShowThermalButton(false)
    setCurrentDate('')
    setActiveField(null)
    setInputValue('')
    setIsGeneratingThermal(false)
    setThermalError(null) // Clear thermal error state
    setIsDayClosed(false) // Reset day closed state
    onSuccess?.()
    onHide()
    setNote('')
    setDenominations({
      denomination1000: 0,
      denomination500: 0,
      denomination200: 0,
      denomination100: 0,
      denomination50: 0,
      denomination20: 0,
      denomination10: 0,
      denomination5: 0,
      denomination2: 0,
      denomination1: 0,
    })
  }

  return (
    <Modal show={show} onHide={showThermalReport ? handleCloseModal : onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {showThermalReport ? 'Day Close Report' : 'Day Close'}
        </Modal.Title>
      </Modal.Header>
      
      {!showThermalReport ? (
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && !dayCloseResult && (
              <Alert variant="danger" className="mb-3">
                {'data' in error ? (error.data as any)?.message || 'Failed to perform day close' : 'Failed to perform day close'}
              </Alert>
            )}

            {dayCloseResult && showThermalButton && (
              <Alert variant={dayCloseResult.message.includes('already') ? 'info' : 'success'} className="mb-3">
                <strong>{dayCloseResult.message.includes('already') ? 'Day Already Closed' : 'Day Close Successful!'}</strong> {dayCloseResult.message}
                <div className="mt-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleGenerateThermalReceipt}
                    disabled={isGeneratingThermal}
                  >
                    {isGeneratingThermal ? 'Generating...' : 'Generate Thermal Receipt'}
                  </Button>
                  {isGeneratingThermal && (
                    <div className="mt-2">
                      <small className="text-info">Loading thermal receipt data...</small>
                    </div>
                  )}
                </div>
              </Alert>
            )}

            {!dayCloseResult && (
            <Alert variant="warning" className="mb-3">
              <strong>Warning:</strong> This action will close all open shifts for today. This operation cannot be undone.
            </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Note (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter any notes for day close"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cash Denominations (Optional)</Form.Label>
              <Row>
                <Col lg={7}>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '20%' }}>Value</th>
                          <th style={{ width: '5%' }}>X</th>
                          <th style={{ width: '25%' }}>Count</th>
                          <th style={{ width: '5%' }}>=</th>
                          <th style={{ width: '20%' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(denominations).map((denomination) => {
                          const value = denominationValues[denomination as keyof typeof denominationValues]
                          const count = denominations[denomination as keyof typeof denominations]
                          const isActive = activeField === denomination
                          const displayValue = isActive ? inputValue : count.toString()
                          
                          return (
                            <tr key={denomination} style={{ height: '50px' }}>
                              <td className="align-middle">
                                <strong>{value} Denom</strong>
                              </td>
                              <td className="text-center align-middle">X</td>
                              <td>
                    <Form.Control
                                  type="text"
                                  value={displayValue}
                                  onClick={() => handleFieldFocus(denomination)}
                                  onFocus={() => handleFieldFocus(denomination)}
                                  onBlur={handleFieldBlur}
                                  onChange={(e) => {
                                    if (isActive) {
                                      const newValue = e.target.value
                                      setInputValue(newValue)
                                      // Update denomination immediately
                                      const numValue = parseInt(newValue) || 0
                                      setDenominations(prev => ({
                        ...prev,
                                        [denomination]: numValue
                                      }))
                                    }
                                  }}
                                  style={{
                                    backgroundColor: isActive ? '#fff3cd' : 'white',
                                    border: isActive ? '2px solid #ffc107' : '1px solid #ced4da',
                                    height: '35px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                      placeholder="0"
                                  readOnly={false}
                                />
                              </td>
                              <td className="text-center align-middle">=</td>
                              <td className="align-middle">
                                <strong>{calculateTotal(denomination)}</strong>
                              </td>
                            </tr>
                          )
                        })}
                        <tr style={{ backgroundColor: '#d4edda', height: '50px' }}>
                          <td colSpan={4} className="align-middle">
                            <strong>Total</strong>
                          </td>
                          <td className="align-middle">
                            <strong style={{ fontSize: '16px' }}>{calculateGrandTotal()}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Col>
                <Col lg={5}>
                  <div className="numpad" style={{ padding: '10px' }}>
                    <div className="row mb-2">
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('1')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          1
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('2')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          2
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('3')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          3
                        </Button>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('4')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          4
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('5')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          5
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('6')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          6
                        </Button>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('7')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          7
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('8')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          8
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('9')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          9
                        </Button>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-4">
                        <Button 
                          variant="danger" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('C')}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          C
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="outline-secondary" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('0')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField}
                        >
                          0
                        </Button>
                      </div>
                      <div className="col-4">
                        <Button 
                          variant="dark" 
                          className="w-100"
                          style={{ height: '45px', fontSize: '16px' }}
                          onClick={() => handleNumpadInput('⌫')}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={!activeField || inputValue === ''}
                        >
                          ⌫
                        </Button>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      {!activeField ? (
                        <small className="text-muted">Click on a count field to start entering values</small>
                      ) : (
                        <div>
                          <small className="text-info">Active: {activeField.replace('denomination', '')} Denom</small>
                          <br />
                          <small className="text-success">You can now use the numpad or type directly</small>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              {dayCloseResult ? 'Close' : 'Cancel'}
            </Button>
            {!dayCloseResult && !showThermalButton && (
            <Button variant="danger" type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Day Close'}
            </Button>
            )}
            {showThermalButton && !dayCloseResult && (
            <Button variant="primary" onClick={handleGenerateThermalReceipt} disabled={isGeneratingThermal}>
              {isGeneratingThermal ? 'Generating...' : 'Generate Thermal Receipt'}
            </Button>
            )}
          </Modal.Footer>
        </Form>
      ) : (
        <>
          <Modal.Body>
            {dayCloseResult && (
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Day Close Summary</h6>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Status:</strong> {dayCloseResult.message}</p>
                      <p><strong>Closed Shifts:</strong> {dayCloseResult.closedCount}</p>
                      <p><strong>Day Close Time:</strong> {new Date(dayCloseResult.dayCloseTime).toLocaleString()}</p>
                      {dayCloseResult.summary && (
                        <>
                          <p><strong>Day Total Orders:</strong> {dayCloseResult.summary.dayWise.totalOrders}</p>
                          <p><strong>Day Total Sales:</strong> {dayCloseResult.summary.dayWise.totalSales.toFixed(2)} AED</p>
                          <p><strong>Shift Total Orders:</strong> {dayCloseResult.summary.shiftWise.totalOrders}</p>
                          <p><strong>Shift Total Sales:</strong> {dayCloseResult.summary.shiftWise.totalSales.toFixed(2)} AED</p>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Thermal Report Preview</h6>
                    </Card.Header>
                    <Card.Body>
                      {thermalError ? (
                        <div 
                          style={{ 
                            maxHeight: '300px',
                            overflow: 'auto',
                            backgroundColor: '#f8f9fa',
                            padding: '10px',
                            border: '1px solid #dc3545',
                            textAlign: 'center',
                            color: '#dc3545'
                          }}
                        >
                          <p><strong>Error:</strong></p>
                          <p>{thermalError}</p>
                          <small>Please try again or contact support</small>
                        </div>
                      ) : thermalReceiptData || thermalReport ? (
                        <div 
                          style={{ 
                        maxHeight: '300px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        padding: '10px',
                        border: '1px solid #dee2e6'
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: thermalReceiptData || thermalReport 
                          }}
                        />
                      ) : (
                        <div 
                          style={{ 
                            maxHeight: '300px',
                            overflow: 'auto',
                            backgroundColor: '#f8f9fa',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            textAlign: 'center',
                            color: '#6c757d'
                          }}
                        >
                          <p>No thermal report available</p>
                          <small>
                            {isDayClosed 
                              ? 'Click "Generate Thermal Receipt" to create a report' 
                              : 'Please close the day first to generate thermal receipt'
                            }
                          </small>
                      </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            {!thermalReceiptData && !thermalReport && isDayClosed && (
              <Button 
                variant="success" 
                onClick={handleGenerateThermalReceipt}
                disabled={isGeneratingThermal}
              >
                {isGeneratingThermal ? 'Generating...' : 'Generate Thermal Receipt'}
              </Button>
            )}
            {(thermalReceiptData || thermalReport) && (
              <>
                <Button variant="info" onClick={handleOpenThermalReceiptPage} className="me-2">
                  📄 Open in New Page
                </Button>
                <Button variant="primary" onClick={handlePrintThermalReport}>
                  🖨️ Print Thermal Report
                </Button>
              </>
            )}
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default DayCloseModal
