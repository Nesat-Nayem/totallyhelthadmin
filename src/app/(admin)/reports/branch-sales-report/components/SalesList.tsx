"use client"

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
} from 'react-bootstrap'
import { useGetOrdersQuery } from '@/services/orderApi'
import { useGetBranchesQuery } from '@/services/branchApi'

function fmt(d?: string | Date) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString() } catch { return '-' }
}

const SalesList = () => {
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [branchId, setBranchId] = React.useState<string>('')
  const { data: ordersRes } = useGetOrdersQuery({ startDate: startDate || undefined, endDate: endDate || undefined, branchId: branchId || undefined, limit: 500 })
  const orders = ordersRes?.data ?? []
  const { data: branches = [] } = useGetBranchesQuery()
  const branchMap = React.useMemo(() => Object.fromEntries(branches.map((b: any) => [b._id, b])), [branches])

  const sumPayments = (o: any, type: 'Cash' | 'Card' | 'Gateway') => {
    const payments = Array.isArray(o.payments) ? o.payments : []
    return payments.filter((p: any) => (p.type || '').toLowerCase() === type.toLowerCase()).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Branch Wise Sales Report
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
              <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                <option value="">All Branches</option>
                {branches.map((b: any) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
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
                      <th style={{ textWrap: 'nowrap' }}>Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Branch</th>
                      <th style={{ textWrap: 'nowrap' }}>Cash Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Cr.Card Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Online Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Tawseel Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Total Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any) => {
                      const cashAmt = sumPayments(o, 'Cash')
                      const cardAmt = sumPayments(o, 'Card')
                      const onlineAmt = (o.salesType === 'online') ? (Number(o.total)||0) : 0
                      const branch = branchMap[o.branchId]
                      const tawseelAmt = (String(o.aggregatorId) && (branch?.name || '').toLowerCase() && false) ? 0 : 0 // placeholder if Tawseel aggregator exists
                      return (
                        <tr key={o._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" />
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{fmt(o.date)}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <span className="badge bg-success">{branch?.name || o.branchId || '-'}</span>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>AED {cashAmt.toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {cardAmt.toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {onlineAmt.toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {tawseelAmt.toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {(Number(o.total)||0).toFixed(2)}</td>
                          <td>
                            <div className="d-flex gap-2">
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

export default SalesList
