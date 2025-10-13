'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  FormControl,
  InputGroup,
  Row,
  Modal,
  Form,
  Alert,
  Spinner,
} from 'react-bootstrap'
import { useGetOrdersQuery, useUpdateOrderMutation } from '@/services/orderApi'

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString()
}

function firstDayOfMonthISO() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function todayISO() {
  return new Date().toISOString()
}

function toCSV(rows: any[]) {
  const headers = [
    'Invoice No',
    'Date',
    'Customer',
    'Payment Mode',
    'Subtotal',
    'VAT',
    'Shipping',
    'Total',
    'Status',
  ]
  const lines = rows.map((o: any) => [
    o.invoiceNo,
    o.date,
    o.customer?.name || '',
    o.paymentMode || '',
    o.subTotal,
    o.vatAmount || 0,
    o.shippingCharge || 0,
    o.total,
    o.status,
  ])
  const csv = [headers, ...lines].map((r) => r.map((v) => `"${String(v ?? '')}"`).join(',')).join('\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}



// Edit Order Modal Component
const EditOrderModal = ({ 
  show, 
  onHide, 
  order, 
  onSave 
}: { 
  show: boolean; 
  onHide: () => void; 
  order: any; 
  onSave: (orderId: string, data: any) => void 
}) => {
  const [formData, setFormData] = React.useState({
    status: 'paid',
    paymentMode: '',
    note: '',
    total: 0,
    subTotal: 0,
    vatAmount: 0,
    shippingCharge: 0,
    discountAmount: 0,
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (order) {
      setFormData({
        status: order.status || 'paid',
        paymentMode: order.paymentMode || '',
        note: order.note || '',
        total: order.total || 0,
        subTotal: order.subTotal || 0,
        vatAmount: order.vatAmount || 0,
        shippingCharge: order.shippingCharge || 0,
        discountAmount: order.discountAmount || 0,
      })
    }
  }, [order])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await onSave(order._id, formData)
      onHide()
    } catch (err: any) {
      setError(err.message || 'Failed to update order')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Order - {order?.invoiceNo}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={formData.status} 
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Select 
                  value={formData.paymentMode} 
                  onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online Transfer">Online Transfer</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Sub Total</Form.Label>
                <FormControl
                  type="number"
                  step="0.01"
                  value={formData.subTotal}
                  onChange={(e) => handleInputChange('subTotal', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Total Amount</Form.Label>
                <FormControl
                  type="number"
                  step="0.01"
                  value={formData.total}
                  onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>VAT Amount</Form.Label>
                <FormControl
                  type="number"
                  step="0.01"
                  value={formData.vatAmount}
                  onChange={(e) => handleInputChange('vatAmount', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Shipping Charge</Form.Label>
                <FormControl
                  type="number"
                  step="0.01"
                  value={formData.shippingCharge}
                  onChange={(e) => handleInputChange('shippingCharge', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Discount Amount</Form.Label>
                <FormControl
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <FormControl
              as="textarea"
              rows={3}
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="Add order notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <><Spinner size="sm" className="me-2" />Saving...</> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

const AllIncomeList = () => {
  const [q, setQ] = React.useState('')
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [page, setPage] = React.useState(1)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null)
  const limit = 20

  const { data: ordersResp } = useGetOrdersQuery({ q: q || undefined, page, limit, startDate: startDate || undefined, endDate: endDate || undefined })
  const orders = ordersResp?.data ?? []
  const meta = ordersResp?.meta
  const summary = ordersResp?.summary

  // this month
  const { data: monthResp } = useGetOrdersQuery({ startDate: firstDayOfMonthISO(), endDate: todayISO(), page: 1, limit: 1 })
  const monthTotal = monthResp?.summary?.total ?? 0

  // Update order mutation
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation()


  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  const handleSaveOrder = async (orderId: string, data: any) => {
    try {
      await updateOrder({ id: orderId, data }).unwrap()
    } catch (error) {
      console.error('Failed to update order:', error)
      throw error
    }
  }

  const handleExportCSV = () => {
    const blob = toCSV(
      orders.map((o: any) => ({
        invoiceNo: o.invoiceNo,
        date: o.date,
        customer: o.customer?.name,
        paymentMode: o.paymentMode,
        subTotal: o.subTotal,
        vatAmount: o.vatAmount,
        shippingCharge: o.shippingCharge,
        total: o.total,
        status: o.status,
      }))
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'all-income.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Row>
        <Col lg={4}>
          <Card>
            <div className="p-3 text-center d-flex align-items-center gap-3">
              <div>
                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-24" />
              </div>
              <div>
                <h5>Total Income</h5>
                <h5>
                  <span className="text-success">AED {summary?.total ?? 0}</span>
                </h5>
              </div>
            </div>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <div className="p-3 text-center d-flex align-items-center gap-3">
              <div>
                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-24" />
              </div>
              <div>
                <h5>This Month Income</h5>
                <h5>
                  <span className="text-success">AED {monthTotal}</span>
                </h5>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                All Income List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search invoice No..." value={q} onChange={(e) => setQ(e.target.value)} />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>

              {/* Date Range */}
              <div className="d-flex gap-2">
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <Button variant="outline-success" onClick={handleExportCSV}>
                  <IconifyIcon icon="mdi:file-export-outline" /> Export CSV
                </Button>
              </div>
            </CardHeader>

            <div>
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck1" />
                          <label className="form-check-label" htmlFor="customCheck1" />
                        </div>
                      </th>
                      <th style={{ textWrap: 'nowrap' }}>Sr.No</th>
                      <th style={{ textWrap: 'nowrap' }}>Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Invoice No</th>
                      <th style={{ textWrap: 'nowrap' }}>Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Paid Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any, idx: number) => (
                      <tr key={o._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" />
                          </div>
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>{(page - 1) * limit + idx + 1}</td>
                        <td style={{ textWrap: 'nowrap' }}>{formatDate(o.date)}</td>
                        <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo}</td>
                        <td style={{ textWrap: 'nowrap' }}>AED {o.total}</td>
                        <td style={{ textWrap: 'nowrap' }}>
                          <span 
                            className={`badge ${o.status === 'paid' ? 'bg-success' : 'bg-warning'}`}
                            style={{ 
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {o.status === 'paid' ? 'PAID' : 'UNPAID'}
                          </span>
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>{o.paymentMode || '-'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditOrder(o)}
                              title="Edit Order"
                              className="p-1"
                            >
                              <IconifyIcon icon="solar:pen-2-bold" className="align-middle fs-16" />
                            </Button>
                            <Link href="#" className="btn btn-soft-danger btn-sm" title="Delete (coming soon)">
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">{page}</span>
                  </li>
                  <li className={`page-item ${meta && page * limit >= (meta.total || 0) ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Edit Order Modal */}
      <EditOrderModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        order={selectedOrder}
        onSave={handleSaveOrder}
      />

    </>
  )
}

export default AllIncomeList

