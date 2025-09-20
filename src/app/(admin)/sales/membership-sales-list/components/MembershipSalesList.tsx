'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetOrdersQuery } from '@/services/orderApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import {
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

const MembershipSalesList = () => {
  const [punchedIn, setPunchedIn] = useState(false)
  const { data, isLoading, error } = useGetOrdersQuery({ limit: 50, salesType: 'membership' })
  const orders = data?.data ?? []

  const handleToggle = () => {
    setPunchedIn(!punchedIn)
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
                <h5>Total Sales</h5>
                <h5>
                  <span className="text-success">AED 2000</span>
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
                <h5>Paid Sales</h5>
                <h5>
                  <span className="text-success">AED 1980</span>
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
                <h5>UnPaid Sales</h5>
                <h5>
                  <span className="text-success">AED 20</span>
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
                All Sales List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search invoice No..." />
              </InputGroup>

              {/* Month Filter Dropdown */}
              <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1">
                <option value="all">Select Month</option>
                <option value="january">January</option>
                <option value="february">February</option>
                <option value="march">March</option>
                <option value="april">April</option>
                <option value="may">May</option>
                <option value="june">June</option>
                <option value="july">July</option>
                <option value="august">August</option>
                <option value="september">September</option>
                <option value="october">October</option>
                <option value="november">November</option>
                <option value="december">December</option>
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
                      <th style={{ textWrap: 'nowrap' }}>Sr.No</th>
                      <th style={{ textWrap: 'nowrap' }}>Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Invoice No</th>
                      <th style={{ textWrap: 'nowrap' }}>Member Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Selecteed Meal Plan</th>
                      <th style={{ textWrap: 'nowrap' }}>Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Discount</th>
                      <th style={{ textWrap: 'nowrap' }}>Paid Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={11} className="text-center py-4">Loading...</td>
                      </tr>
                    )}
                    {error && !isLoading && (
                      <tr>
                        <td colSpan={11} className="text-center text-danger py-4">Failed to load orders</td>
                      </tr>
                    )}
                    {!isLoading && !error && orders.length === 0 && (
                      <tr>
                        <td colSpan={11} className="text-center py-4">No orders found</td>
                      </tr>
                    )}
                    {!isLoading && !error && orders.map((order, idx) => {
                      const paymentText = (order.payments && order.payments.length > 0)
                        ? order.payments.map(p => `${p.type} AED ${p.amount.toFixed(2)}`).join(', ')
                        : order.paymentMode || '-'
                      const selectedPlans = Array.isArray(order.items) && order.items.length > 0
                        ? order.items.map((i) => i.title).join(', ')
                        : '-'
                      return (
                        <tr key={order._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" id={`ord_${order._id}`} />
                              <label className="form-check-label" htmlFor={`ord_${order._id}`}>
                                &nbsp;
                              </label>
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{idx + 1}</td>
                          <td style={{ textWrap: 'nowrap' }}>{order.date ? new Date(order.date as any).toLocaleDateString() : '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{order.invoiceNo || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{order.customer?.name || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{selectedPlans}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {Number(order.total || 0).toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {Number(order.discountAmount || 0).toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <span className={`badge ${order.status === 'paid' ? 'bg-success' : 'bg-danger'}`}>{order.status === 'paid' ? 'Paid' : 'UnPaid'}</span>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{paymentText}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className={`btn btn-sm ${punchedIn ? 'bg-success text-white' : 'bg-danger text-white'}`}
                                onClick={handleToggle}>
                                <IconifyIcon icon={punchedIn ? 'solar:logout-2-broken' : 'solar:login-2-broken'} />
                              </button>
                              <Link href="/sales/invoice" className="btn btn-light btn-sm">
                                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-18" />
                              </Link>
                              <Link href="/sales/pos" className="btn btn-soft-primary btn-sm">
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Link>
                              <Link href="" className="btn btn-soft-danger btn-sm">
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
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

export default MembershipSalesList
