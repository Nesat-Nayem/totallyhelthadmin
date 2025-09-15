'use client'
import React, { useState } from 'react'
import { Button, Form, Table, Row, Col } from 'react-bootstrap'

const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]

const ShiftClose: React.FC = () => {
  const [counts, setCounts] = useState<{ [key: number]: number }>(Object.fromEntries(denominations.map((d) => [d, 0])))
  const [activeDenom, setActiveDenom] = useState<number | null>(null)

  // Editable shift info
  const [shiftNo] = useState(1)
  const [loginDate, setLoginDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [logoutDate, setLogoutDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loginTime, setLoginTime] = useState<string>('12:17')
  const [logoutTime, setLogoutTime] = useState<string>('23:52')
  const [loginName] = useState('CASH')

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
    if (activeDenom === null) return
    setCounts((prev) => ({
      ...prev,
      [activeDenom]: 0,
    }))
  }

  const total = denominations.reduce((sum, d) => sum + d * counts[d], 0)

  return (
    <div className="p-3 container-fluid bg-light" style={{ minHeight: '100vh' }}>
      {/* Shift Info */}
      <Row className="mb-3">
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Shift No:</Form.Label>
          <Form.Control value={shiftNo} readOnly size="sm" />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Login Date:</Form.Label>
          <Form.Control type="date" value={loginDate} onChange={(e) => setLoginDate(e.target.value)} size="sm" />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Logout Date:</Form.Label>
          <Form.Control type="date" value={logoutDate} onChange={(e) => setLogoutDate(e.target.value)} size="sm" />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Login Time:</Form.Label>
          <Form.Control type="time" value={loginTime} onChange={(e) => setLoginTime(e.target.value)} size="sm" />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Logout Time:</Form.Label>
          <Form.Control type="time" value={logoutTime} onChange={(e) => setLogoutTime(e.target.value)} size="sm" />
        </Col>
        <Col md={2} lg={6} className="mb-2">
          <Form.Label>Login Name:</Form.Label>
          <Form.Control value={loginName} readOnly size="sm" />
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
                <Button variant="secondary" className="w-100 py-3">
                  ⌫
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Bottom Action Buttons */}
      <div className="mt-4 d-flex justify-content-between">
        <Button variant="secondary" className="btn-lg">
          Close Shift
        </Button>
        <Button variant="primary" className="btn-lg">
          Day Close
        </Button>
        <Button variant="info" className="btn-lg">
          Email
        </Button>
        <Button variant="danger" className="btn-lg">
          Exit
        </Button>
      </div>
    </div>
  )
}

export default ShiftClose
