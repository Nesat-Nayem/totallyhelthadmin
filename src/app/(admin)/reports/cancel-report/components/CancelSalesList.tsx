"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
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
import { useGetOrdersQuery } from '@/services/orderApi'

function fmt(d?: string | Date) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString() } catch { return '-' }
}

const CancelSalesList = () => {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const { data } = useGetOrdersQuery({ canceled: true, startDate: startDate || undefined, endDate: endDate || undefined, limit: 500 })
  const orders = data?.data ?? []

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
                <label className="form-label">From</label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">To</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
                    {orders.map((o: any) => {
                      const items = Array.isArray(o.items) ? o.items.slice(0, 3) : []
                      const payments = Array.isArray(o.payments) ? o.payments : []
                      const payText = payments.length ? payments.map((p: any) => `${p.type} AED ${(Number(p.amount)||0).toFixed(2)}`).join(', ') : (o.paymentMode || '-')
                      return (
                        <tr key={o._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" id={`ord_${o._id}`} />
                              <label className="form-check-label" htmlFor={`ord_${o._id}`}></label>
                            </div>
                          </td>
                          <td>{o.invoiceNo || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{fmt(o.date)}</td>
                          <td>{o.customer?.name || '-'}</td>
                          <td>
                            <span className="badge bg-danger">{o.aggregatorId || '-'}</span>
                          </td>
                          <td>
                            {items.map((it: any, idx: number) => (
                              <span key={idx} className="badge bg-success me-1">{it.title}</span>
                            ))}
                          </td>
                          <td>
                            <span className="badge bg-success">{o.orderType || '-'}</span>
                          </td>
                          <td>{payText}</td>
                          <td>AED {(Number(o.shippingCharge)||0).toFixed(2)}</td>
                          <td>AED {(Number(o.total)||0).toFixed(2)}</td>
                          <td>{o.cancelReason || '-'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-soft-info btn-sm" disabled>
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </button>
                              <button className="btn btn-soft-danger btn-sm" disabled>
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </button>
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

export default CancelSalesList
