'use client'
import React, { useState } from 'react'
import { Table, Button, Row, Col, Form, Alert, Badge, Spinner } from 'react-bootstrap'
import { useGetShiftsQuery } from '@/services/shiftApi'

const ShiftManagement: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    date: '',
    status: '' as '' | 'open' | 'closed' | 'day-close',
    shiftNumber: ''
  })

  const { data: shiftsData, isLoading, error, refetch } = useGetShiftsQuery({
    page: filters.page,
    limit: filters.limit,
    date: filters.date || undefined,
    status: filters.status || undefined,
    shiftNumber: filters.shiftNumber ? parseInt(filters.shiftNumber) : undefined
  })

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: field === 'status' ? (value as '' | 'open' | 'closed' | 'day-close') : value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge bg="success">Open</Badge>
      case 'closed':
        return <Badge bg="warning">Closed</Badge>
      case 'day-close':
        return <Badge bg="danger">Day Close</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="p-3 container-fluid">
      <h4 className="mb-4">Shift Management</h4>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="day-close">Day Close</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Shift Number</Form.Label>
            <Form.Control
              type="number"
              value={filters.shiftNumber}
              onChange={(e) => handleFilterChange('shiftNumber', e.target.value)}
              placeholder="Enter shift number"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Per Page</Form.Label>
            <Form.Select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-3">
          Failed to load shifts. Please try again.
        </Alert>
      )}

      {/* Shifts Table */}
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Shift #</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Login Name</th>
            <th>Status</th>
            <th>Total Cash</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {shiftsData?.data?.map((shift) => (
            <tr key={shift._id}>
              <td>{shift.shiftNumber}</td>
              <td>{shift.startDate}</td>
              <td>{new Date(shift.startTime).toLocaleTimeString()}</td>
              <td>
                {shift.endTime ? new Date(shift.endTime).toLocaleTimeString() : '-'}
              </td>
              <td>{shift.loginName}</td>
              <td>{getStatusBadge(shift.status)}</td>
              <td>
                {shift.denominations?.totalCash 
                  ? formatCurrency(shift.denominations.totalCash)
                  : '-'
                }
              </td>
              <td>{shift.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {shiftsData?.meta && (
        <Row className="mt-3">
          <Col md={6}>
            <p className="text-muted">
              Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
              {Math.min(filters.page * filters.limit, shiftsData.meta.total)} of{' '}
              {shiftsData.meta.total} shifts
            </p>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </Button>
              <span className="align-self-center mx-2">
                Page {filters.page} of {shiftsData.meta.pages}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={filters.page >= shiftsData.meta.pages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* No Data */}
      {shiftsData?.data?.length === 0 && (
        <Alert variant="info" className="text-center">
          No shifts found for the selected criteria.
        </Alert>
      )}
    </div>
  )
}

export default ShiftManagement
