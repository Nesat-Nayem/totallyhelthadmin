'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Alert, Spinner } from 'react-bootstrap'

const ThermalReceiptPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [thermalReport, setThermalReport] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState('')

  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      setDate(dateParam)
      generateThermalReceipt(dateParam)
    } else {
      // Default to today's date
      const today = new Date().toISOString().split('T')[0]
      setDate(today)
      generateThermalReceipt(today)
    }
  }, [searchParams])

  const generateThermalReceipt = async (dateToUse: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('backend_token')
      const response = await fetch(`http://localhost:5050/v1/api/day-close-report/thermal-json/${dateToUse}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html',
        },
      })
      
      const responseText = await response.text()
      
      // Check if the response contains thermal receipt HTML
      const hasThermalReceipt = responseText.includes('thermal-receipt') || 
                               responseText.includes('TOTALLY HEALTHY') || 
                               responseText.includes('Shift Report') || 
                               responseText.includes('<!DOCTYPE html>') ||
                               responseText.includes('<html') ||
                               responseText.includes('Courier New') ||
                               responseText.includes('font-family') ||
                               responseText.includes('body')
      
      if (hasThermalReceipt) {
        setThermalReport(responseText)
      } else if (response.ok) {
        setThermalReport(responseText)
      } else {
        setError(`Error generating thermal receipt: ${response.status} - ${responseText.substring(0, 100)}...`)
      }
    } catch (error) {
      console.error('Failed to generate thermal receipt:', error)
      setError('Error generating thermal receipt: ' + (error as any)?.message || 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (thermalReport) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=200,height=800,scrollbars=no,resizable=no')
      if (printWindow) {
        printWindow.document.write(thermalReport)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }
    }
  }

  const handleDownload = () => {
    if (thermalReport) {
      // Create blob with thermal HTML directly
      const blob = new Blob([thermalReport], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `thermal-receipt-${date}.html`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Thermal Receipt</h2>
              <small className="text-muted">Date: {date}</small>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleBack}>
                ← Back
              </Button>
              {thermalReport && (
                <>
                  <Button variant="success" onClick={handlePrint}>
                    🖨️ Print
                  </Button>
                  <Button variant="primary" onClick={handleDownload}>
                    📥 Download
                  </Button>
                </>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Generating thermal receipt...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {thermalReport && !isLoading && (
            <div className="thermal-receipt-container">
              <div 
                className="thermal-receipt-content"
                dangerouslySetInnerHTML={{ __html: thermalReport }}
                style={{
                  maxWidth: '400px',
                  margin: '0 auto',
                  backgroundColor: 'white',
                  padding: '20px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          )}

          {!thermalReport && !isLoading && !error && (
            <div className="text-center py-5">
              <p className="text-muted">No thermal receipt available for this date.</p>
              <Button variant="primary" onClick={() => generateThermalReceipt(date)}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ThermalReceiptPage
