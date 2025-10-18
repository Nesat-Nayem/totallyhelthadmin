 'use client'

import React from 'react'
import { Modal, Button, Row, Col, Badge, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface OrderDetailsModalProps {
  show: boolean
  onHide: () => void
  order: any | null
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ show, onHide, order }) => {
  if (!order) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2)}`
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="mdi:receipt" className="me-2" />
          Order Details - {order.invoiceNo}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Row className="g-3">
          {/* Order Information */}
          <Col md={6}>
            <div className="card h-100">
              <div className="card-header bg-primary text-white" style={{ backgroundColor: '#0d6efd !important' }}>
                <h6 className="mb-0 text-white">
                  <IconifyIcon icon="mdi:information" className="me-2" />
                  Order Information
                </h6>
              </div>
              <div className="card-body">
                <Row className="mb-2">
                  <Col sm={4}><strong>Order No:</strong></Col>
                  <Col sm={8}>{order.orderNo}</Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={4}><strong>Invoice No:</strong></Col>
                  <Col sm={8}>{order.invoiceNo}</Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={4}><strong>Date:</strong></Col>
                  <Col sm={8}>{formatDate(order.date)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={4}><strong>Order Type:</strong></Col>
                  <Col sm={8}>
                    <Badge bg="info">{order.orderType}</Badge>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={4}><strong>Sales Type:</strong></Col>
                  <Col sm={8}>
                    <Badge bg="secondary">{order.salesType}</Badge>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={4}><strong>Status:</strong></Col>
                  <Col sm={8}>
                    <Badge bg={order.status === 'paid' ? 'success' : 'warning'}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </Col>
                </Row>
                {order.customer && (
                  <>
                    <hr />
                    <h6>Customer Information</h6>
                    <Row className="mb-2">
                      <Col sm={4}><strong>Name:</strong></Col>
                      <Col sm={8}>{order.customer.name || 'N/A'}</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm={4}><strong>Phone:</strong></Col>
                      <Col sm={8}>{order.customer.phone || 'N/A'}</Col>
                    </Row>
                  </>
                )}
              </div>
            </div>
          </Col>

          {/* Financial Summary */}
          <Col md={6}>
            <div className="card h-100">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <IconifyIcon icon="mdi:currency-usd" className="me-2" />
                  Financial Summary
                </h6>
              </div>
              <div className="card-body">
                <Row className="mb-2">
                  <Col sm={6}><strong>Sub Total:</strong></Col>
                  <Col sm={6} className="text-end">{formatCurrency(order.subTotal)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={6}><strong>Discount:</strong></Col>
                  <Col sm={6} className="text-end">{formatCurrency(order.discountAmount || 0)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={6}><strong>Shipping:</strong></Col>
                  <Col sm={6} className="text-end">{formatCurrency(order.shippingCharge || 0)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={6}><strong>Rounding:</strong></Col>
                  <Col sm={6} className="text-end">{formatCurrency(order.rounding || 0)}</Col>
                </Row>
                <hr />
                <Row className="mb-2">
                  <Col sm={6}><strong>Total Amount:</strong></Col>
                  <Col sm={6} className="text-end">
                    <strong>{formatCurrency(order.total)}</strong>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={6}><strong>Paid Amount:</strong></Col>
                  <Col sm={6} className="text-end">
                    <span className="text-success">{formatCurrency(order.cumulativePaid)}</span>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={6}><strong>Due Amount:</strong></Col>
                  <Col sm={6} className="text-end">
                    <span className="text-warning">{formatCurrency(order.dueAmount)}</span>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={6}><strong>Change Amount:</strong></Col>
                  <Col sm={6} className="text-end">
                    <span className="text-info">{formatCurrency(order.changeAmount || 0)}</span>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>

        {/* Order Items */}
        <div className="mt-4">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <IconifyIcon icon="mdi:food" className="me-2" />
                Order Items ({order.items?.length || 0})
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <Table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Sub Total</th>
                      <th>More Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item: any, index: number) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <strong>{item.title}</strong>
                            <br />
                            <small className="text-muted">ID: {item.productId}</small>
                          </div>
                        </td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>
                          <Badge bg="primary">{item.qty}</Badge>
                        </td>
                        <td>{formatCurrency(item.price * item.qty)}</td>
                        <td>
                          {item.moreOptions && item.moreOptions.length > 0 ? (
                            <div>
                              {item.moreOptions.map((option: any, optIndex: number) => (
                                <Badge key={optIndex} bg="secondary" className="me-1 mb-1">
                                  {option.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">No options</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {order.payments && order.payments.length > 0 && (
          <div className="mt-4">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <IconifyIcon icon="mdi:credit-card" className="me-2" />
                  Payment Information
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <Table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Payment Type</th>
                        <th>Method</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.payments.map((payment: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <Badge bg="info">{payment.type}</Badge>
                          </td>
                          <td>
                            <Badge bg="secondary">{payment.methodType}</Badge>
                          </td>
                          <td>{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Mode Change History */}
        {order.paymentHistory && order.paymentHistory.changeSequence && order.paymentHistory.changeSequence.length > 0 && (
          <div className="mt-4">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <IconifyIcon icon="mdi:swap-horizontal" className="me-2" />
                  Payment Mode Change History
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <Table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Timestamp</th>
                        <th>Changed From</th>
                        <th>Changed To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.paymentHistory.changeSequence.map((change: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <small>{formatDate(change.timestamp)}</small>
                          </td>
                          <td>
                            {change.from.map((paymentType: string, idx: number) => (
                              <Badge key={idx} bg="secondary" className="me-1">
                                {paymentType}
                              </Badge>
                            ))}
                          </td>
                          <td>
                            {change.to.map((paymentType: string, idx: number) => (
                              <Badge key={idx} bg="success" className="me-1">
                                {paymentType}
                              </Badge>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        {order.paymentHistory && order.paymentHistory.entries && order.paymentHistory.entries.length > 0 && (
          <div className="mt-4">
            <div className="card">
              <div className="card-header bg-dark text-white">
                <h6 className="mb-0">
                  <IconifyIcon icon="mdi:history" className="me-2" />
                  Payment History
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <Table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Timestamp</th>
                        <th>Action</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Remaining</th>
                        <th>Payment Details</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.paymentHistory.entries.map((entry: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <small>{formatDate(entry.timestamp)}</small>
                          </td>
                          <td>
                            <Badge bg="primary">{entry.action}</Badge>
                          </td>
                          <td>{formatCurrency(entry.total)}</td>
                          <td>{formatCurrency(entry.paid)}</td>
                          <td>{formatCurrency(entry.remaining)}</td>
                          <td>
                            {entry.payments && entry.payments.length > 0 ? (
                              <div>
                                {entry.payments.map((payment: any, payIndex: number) => (
                                  <div key={payIndex} className="mb-1">
                                    <Badge bg="info" className="me-1">
                                      {payment.type}
                                    </Badge>
                                    <small>{formatCurrency(payment.amount)}</small>
                                    <br />
                                    <small className="text-muted">({payment.methodType})</small>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <small>{entry.description}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-4">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0">
                <IconifyIcon icon="mdi:note-text" className="me-2" />
                Additional Information
              </h6>
            </div>
            <div className="card-body">
              <Row>
                <Col md={6}>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Start Date:</strong></Col>
                    <Col sm={8}>{order.startDate}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>End Date:</strong></Col>
                    <Col sm={8}>{order.endDate}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Branch ID:</strong></Col>
                    <Col sm={8}>{order.branchId}</Col>
                  </Row>
                </Col>
                <Col md={6}>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Created:</strong></Col>
                    <Col sm={8}>{order.createdAt}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Updated:</strong></Col>
                    <Col sm={8}>{order.updatedAt}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Canceled:</strong></Col>
                    <Col sm={8}>
                      <Badge bg={order.canceled ? 'danger' : 'success'}>
                        {order.canceled ? 'Yes' : 'No'}
                      </Badge>
                    </Col>
                  </Row>
                </Col>
              </Row>
              {order.note && (
                <>
                  <hr />
                  <Row>
                    <Col>
                      <strong>Notes:</strong>
                      <p className="mt-1">{order.note}</p>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderDetailsModal
