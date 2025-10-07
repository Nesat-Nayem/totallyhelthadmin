'use client'
import React, { useState, useEffect } from 'react'
import { Button, Form, Table, Row, Col, Alert, Spinner } from 'react-bootstrap'
import { useGetCurrentShiftQuery } from '@/services/shiftApi'
import ShiftStartModal from './ShiftStartModal'
import ShiftCloseModal from './ShiftCloseModal'
import DayCloseModal from './DayCloseModal'
import ExitConfirmModal from './ExitConfirmModal'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]

const ShiftClose: React.FC = () => {
  const router = useRouter()
  const [counts, setCounts] = useState<{ [key: number]: number }>(Object.fromEntries(denominations.map((d) => [d, 0])))
  const [activeDenom, setActiveDenom] = useState<number | null>(null)

  // Modal states
  const [showStartModal, setShowStartModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDayCloseModal, setShowDayCloseModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  // Get session for authentication
  const { data: session, status } = useSession()
  
  // Get current shift data - only fetch when authenticated
  const { data: currentShiftData, isLoading, error, refetch } = useGetCurrentShiftQuery(undefined, {
    skip: status !== 'authenticated' || !session,
    // Force fresh data to prevent 304 caching issues
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const currentShift = currentShiftData?.data

  // Shift form data - dynamic based on current shift status
  const [shiftNo, setShiftNo] = useState<number | ''>('')
  const [loginDate, setLoginDate] = useState<string>('')
  const [logoutDate, setLogoutDate] = useState<string>('')
  const [loginTime, setLoginTime] = useState<string>('')
  const [logoutTime, setLogoutTime] = useState<string>('')
  const [loginName, setLoginName] = useState<string>('CASH') // Always CASH for cash management

  // The query will automatically start when skip becomes false
  // No need for manual refetch - RTK Query handles this automatically

  // Update form data based on current shift status
  useEffect(() => {
    if (currentShift && currentShift.status === 'open') {
      // If shift is OPEN - show current shift details (read-only)
      setShiftNo(currentShift.shiftNumber)
      setLoginDate(currentShift.startDate)
      setLoginTime(new Date(currentShift.startTime).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
      if (currentShift.endDate) {
        setLogoutDate(currentShift.endDate)
      }
      if (currentShift.endTime) {
        setLogoutTime(new Date(currentShift.endTime).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }))
      }
      setLoginName(currentShift.loginName)
      
      // Load existing denominations if available
      if (currentShift.denominations) {
        const newCounts = { ...counts }
        newCounts[1000] = currentShift.denominations.denomination1000 || 0
        newCounts[500] = currentShift.denominations.denomination500 || 0
        newCounts[200] = currentShift.denominations.denomination200 || 0
        newCounts[100] = currentShift.denominations.denomination100 || 0
        newCounts[50] = currentShift.denominations.denomination50 || 0
        newCounts[20] = currentShift.denominations.denomination20 || 0
        newCounts[10] = currentShift.denominations.denomination10 || 0
        newCounts[5] = currentShift.denominations.denomination5 || 0
        newCounts[2] = currentShift.denominations.denomination2 || 0
        newCounts[1] = currentShift.denominations.denomination1 || 0
        setCounts(newCounts)
      }
    } else {
      // If shift is CLOSED or no shift - show current date/time for new shift entry
      const now = new Date()
      const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      setShiftNo('')
      setLoginDate(currentDate)
      setLogoutDate(currentDate)
      setLoginTime(currentTime)
      setLogoutTime('')
      setLoginName('CASH') // Always CASH for cash management
      setCounts(Object.fromEntries(denominations.map((d) => [d, 0])))
    }
  }, [currentShift])

  const handleChange = (value: string, denom: number) => {
    setCounts((prev) => ({
      ...prev,
      [denom]: Number(value) || 0,
    }))
  }

  const handleKeypadClick = (num: string) => {
    if (activeDenom === null) return
    setCounts((prev) => ({
      ...prev,
      [activeDenom]: Number(String(prev[activeDenom] || '') + num),
    }))
  }

  const handleClear = () => {
    if (activeDenom === null) {
      // If no denomination is selected, clear all denominations
      setCounts(Object.fromEntries(denominations.map((d) => [d, 0])))
    } else {
      // If a denomination is selected, clear only that one
      setCounts((prev) => ({
        ...prev,
        [activeDenom]: 0,
      }))
    }
  }

  const handleBackspace = () => {
    if (activeDenom === null) return
    const currentValue = counts[activeDenom] || 0
    const newValue = Math.floor(currentValue / 10) // Remove last digit
    setCounts((prev) => ({
      ...prev,
      [activeDenom]: newValue,
    }))
  }

  const total = denominations.reduce((sum, d) => sum + d * counts[d], 0)

  // Get current date for min attribute
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Success handlers for modals
  const handleStartSuccess = () => {
    refetch()
  }

  const handleCloseSuccess = () => {
    refetch()
  }

  const handleDayCloseSuccess = () => {
    refetch()
  }

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="p-3 container-fluid bg-light" style={{ minHeight: '100vh' }}>
      {/* Shift Info */}
      <Row className="mb-3">
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Shift No:</Form.Label>
          <Form.Control 
            value={shiftNo} 
            onChange={(e) => setShiftNo(e.target.value === '' ? '' : Number(e.target.value))}
            size="sm" 
            placeholder={currentShift?.status === 'open' ? `#${currentShift.shiftNumber}` : "Enter shift number (e.g., 1, 2, 3)"}
            readOnly={!!(currentShift && currentShift.status === 'open')}
          />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Login Date:</Form.Label>
          <Form.Control 
            type="date" 
            value={loginDate} 
            onChange={(e) => setLoginDate(e.target.value)} 
            size="sm" 
            min={getCurrentDate()}
            readOnly={!!(currentShift && currentShift.status === 'open')}
            placeholder="Select login date"
          />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Logout Date:</Form.Label>
          <Form.Control 
            type="date" 
            value={logoutDate} 
            onChange={(e) => setLogoutDate(e.target.value)} 
            size="sm" 
            min={getCurrentDate()}
            readOnly={!!(currentShift && currentShift.status === 'open')}
            placeholder="Select logout date"
          />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Login Time:</Form.Label>
          <Form.Control 
            type="time" 
            value={loginTime} 
            onChange={(e) => setLoginTime(e.target.value)} 
            size="sm" 
            readOnly={!!(currentShift && currentShift.status === 'open')}
            placeholder="Enter login time (e.g., 09:00)"
          />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Logout Time:</Form.Label>
          <Form.Control 
            type="time" 
            value={logoutTime} 
            onChange={(e) => setLogoutTime(e.target.value)} 
            size="sm" 
            readOnly={!!(currentShift && currentShift.status === 'open')}
            placeholder="Enter logout time (e.g., 17:00)"
          />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Login Name:</Form.Label>
          <Form.Control 
            value={loginName} 
            readOnly 
            size="sm" 
            placeholder="CASH"
          />
        </Col>
      </Row>

      <Row>
        {/* Denomination Table */}
        <Col md={8}>
          <h6 className="mb-2">Denomination</h6>
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
                <tr key={d} className={activeDenom === d ? 'table-info' : ''} onClick={() => setActiveDenom(d)} style={{ cursor: 'pointer' }}>
                  <td>{d} Denom</td>
                  <td>X</td>
                    <td>
                      <Form.Control
                        type="text"
                        value={counts[d] || ''}
                        onChange={(e) => handleChange(e.target.value, d)}
                        size="sm"
                        className="text-end"
                        placeholder="0"
                        readOnly={!!(currentShift && currentShift.status === 'open')}
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
                  <Button variant="outline-primary" className="w-100 py-3" onClick={() => handleKeypadClick(String(n))}>
                    {n}
                  </Button>
                </Col>
              ))}
            </Row>
            <Row>
              {[4, 5, 6].map((n) => (
                <Col key={n}>
                  <Button variant="outline-primary" className="w-100 py-3" onClick={() => handleKeypadClick(String(n))}>
                    {n}
                  </Button>
                </Col>
              ))}
            </Row>
            <Row>
              {[7, 8, 9].map((n) => (
                <Col key={n}>
                  <Button variant="outline-primary" className="w-100 py-3" onClick={() => handleKeypadClick(String(n))}>
                    {n}
                  </Button>
                </Col>
              ))}
            </Row>
            <Row>
              <Col>
                <Button variant="danger" className="w-100 py-3" onClick={handleClear}>
                  C
                </Button>
              </Col>
              <Col>
                <Button variant="outline-primary" className="w-100 py-3" onClick={() => handleKeypadClick('0')}>
                  0
                </Button>
              </Col>
              <Col>
                <Button variant="secondary" className="w-100 py-3" onClick={handleBackspace}>
                  ⌫
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>



      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-3">
          <strong>API Error:</strong> {
            'data' in error 
              ? (error.data as any)?.message || 'Failed to load shift data'
              : 'message' in error 
                ? error.message 
                : 'Failed to load shift data'
          }
        </Alert>
      )}

      {/* Current Shift Status */}
      {currentShift && currentShift.status === 'open' ? (
        <Alert variant="success" className="mb-3">
          <strong>Active Shift:</strong> Shift #{currentShift.shiftNumber} is currently open
          <span className="ms-2">
            Started: {new Date(currentShift.startTime).toLocaleString()}
          </span>
        </Alert>
      ) : (
        <Alert variant="info" className="mb-3">
          <strong>Ready for New Shift:</strong> Enter shift details below to start a new shift
        </Alert>
      )}

      {/* Bottom Action Buttons */}
      <div className="mt-4 d-flex justify-content-between">
        <Button 
          variant="secondary" 
          className="btn-lg"
          onClick={() => setShowStartModal(true)}
          disabled={currentShift?.status === 'open'}
        >
          Start Shift
        </Button>
        <Button 
          variant="primary" 
          className="btn-lg"
          onClick={() => setShowCloseModal(true)}
          disabled={!currentShift || currentShift.status !== 'open'}
        >
          Close Shift
        </Button>
        <Button 
          variant="info" 
          className="btn-lg"
          onClick={() => setShowDayCloseModal(true)}
        >
          Day Close
        </Button>
        <Button 
          variant="danger" 
          className="btn-lg"
          onClick={() => setShowExitModal(true)}
        >
          Exit
        </Button>
      </div>

      {/* Modals */}
      <ShiftStartModal
        show={showStartModal}
        onHide={() => setShowStartModal(false)}
        onSuccess={handleStartSuccess}
        initialData={(() => {
          const data = {
            shiftNumber: shiftNo || '',
            loginDate: loginDate || new Date().toISOString().split('T')[0],
            loginTime: loginTime || new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            logoutDate: logoutDate || new Date().toISOString().split('T')[0],
            logoutTime: logoutTime || '',
            loginName: loginName || 'CASH',
            note: 'Starting new shift'
          }
          
          // Debug: Log the data being passed to modal
          if (process.env.NODE_ENV === 'development') {
            console.log('Main form passing to modal:', data)
            console.log('Current form values:', { shiftNo, loginDate, loginTime, logoutDate, logoutTime, loginName })
          }
          
          return data
        })()}
        onDataChange={(data) => {
          if (data.shiftNumber) setShiftNo(data.shiftNumber)
          if (data.loginDate) setLoginDate(data.loginDate)
          if (data.loginTime) setLoginTime(data.loginTime)
          if (data.logoutDate) setLogoutDate(data.logoutDate)
          if (data.logoutTime) setLogoutTime(data.logoutTime)
          if (data.loginName) setLoginName(data.loginName)
        }}
      />
      
      <ShiftCloseModal
        show={showCloseModal}
        onHide={() => setShowCloseModal(false)}
        onSuccess={handleCloseSuccess}
        currentShift={currentShift}
        initialData={(() => {
          const data = {
            denominations: counts
          }
          
          // Debug: Log the denomination data being passed to modal
          if (process.env.NODE_ENV === 'development') {
            console.log('Main form passing denominations to close modal:', data)
            console.log('Current counts:', counts)
          }
          
          return data
        })()}
        onDataChange={(data) => {
          if (data.denominations) {
            setCounts(data.denominations)
          }
        }}
      />
      
      <DayCloseModal
        show={showDayCloseModal}
        onHide={() => setShowDayCloseModal(false)}
        onSuccess={handleDayCloseSuccess}
      />
      
      <ExitConfirmModal
        show={showExitModal}
        onHide={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false)
          router.push('/dashboard')
        }}
      />
    </div>
  )
}

export default ShiftClose
