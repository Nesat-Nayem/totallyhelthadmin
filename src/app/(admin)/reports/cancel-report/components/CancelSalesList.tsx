'use client'

import TextFormInput from '@/components/form/TextFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllOrders } from '@/helpers/data'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap'
import { Form } from 'react-hook-form'

const CancelSalesList = () => {
  const [showModal, setShowModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const handleCancelClick = () => {
    setShowModal(true)
  }

  const handleConfirmCancel = () => {
    if (!cancelReason) {
      alert('Please enter a reason for cancellation.')
      return
    }
    // 🔥 Call API here with cancelReason
    console.log('Order cancelled. Reason:', cancelReason)

    // reset + close modal
    setCancelReason('')
    setShowModal(false)
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Cancel Sales Report
              </CardTitle>

              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  From
                </label>
                <input type="date" name="stock" placeholder="Enter Stock" className="form-control" />
              </div>
              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  To
                </label>
                <input type="date" name="stock" placeholder="Enter Stock" className="form-control" />
              </div>

              {/* Month Filter Dropdown */}
              <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1">
                <option value="all">Select download</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
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
                      <th style={{ textWrap: 'nowrap' }}>Invoice No.</th>
                      <th style={{ textWrap: 'nowrap' }}>Order Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Customer Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Aggregators Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Order Items</th>
                      <th style={{ textWrap: 'nowrap' }}>Order Type</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>
                      <th style={{ textWrap: 'nowrap' }}>Shipping Charge</th>
                      <th style={{ textWrap: 'nowrap' }}>Total Amount</th>
                      <th style={{ textWrap: 'nowrap' }}>Cancel Reason</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck2" />
                          <label className="form-check-label" htmlFor="customCheck2">
                            &nbsp;
                          </label>
                        </div>
                      </td>
                      <td>#001</td>
                      <td style={{ textWrap: 'nowrap' }}>30 Aug 2025</td>
                      <td>Suraj jamdade</td>
                      <td>
                        <span className="badge bg-danger">Zomato</span>
                      </td>

                      <td>
                        <span className="badge bg-success">Biryani</span> <span className="badge bg-success">Chicken</span>{' '}
                        <span className="badge bg-success">Tandoor Chicken</span>
                      </td>
                      <td>
                        <span className="badge bg-success">Delivery</span>
                      </td>
                      <td>Cash</td>

                      <td>AED 0</td>
                      <td>AED 500</td>
                      <td>mistake order</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-soft-info btn-sm" onClick={() => setShowModal(true)}>
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </button>
                          <button onClick={handleCancelClick} className="btn btn-soft-danger btn-sm">
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cancel Modal */}
              {showModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Cancel Order</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <p>Please provide a reason for cancelling this order:</p>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Enter reason here..."
                        />
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                          Close
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleConfirmCancel}>
                          Confirm Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className="page-item">
                    <Link className="page-link" href="">
                      Previous
                    </Link>
                  </li>
                  <li className="page-item active">
                    <Link className="page-link" href="">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      3
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      Next
                    </Link>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CancelSalesList
