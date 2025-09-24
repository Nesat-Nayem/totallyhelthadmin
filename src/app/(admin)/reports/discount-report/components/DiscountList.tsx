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

function fmt(d?: string | Date) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString() } catch { return '-' }
}

const DiscountList = () => {
  const [q, setQ] = React.useState('')
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const { data } = useGetOrdersQuery({ q: q || undefined, startDate: startDate || undefined, endDate: endDate || undefined, limit: 500 })
  const orders = React.useMemo(() => (data?.data ?? []).filter((o: any) => (Number(o.discountAmount)||0) > 0), [data])
  const totalDiscount = React.useMemo(() => orders.reduce((s: number, o: any) => s + (Number(o.discountAmount)||0), 0), [orders])
  const monthDiscount = React.useMemo(() => {
    const now = new Date()
    return orders.filter((o: any) => {
      const d = new Date(o.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).reduce((s: number, o: any) => s + (Number(o.discountAmount)||0), 0)
  }, [orders])
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
                <h5>Total Discount</h5>
                <h5>
                  <span className="text-success">AED {totalDiscount.toFixed(2)}</span>
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
                <h5>This Month Discount</h5>
                <h5>
                  <span className="text-success">AED {monthDiscount.toFixed(2)}</span>
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
                Discount Report
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search invoice or customer..." value={q} onChange={(e) => setQ(e.target.value)} />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>

              {/* Month Filter Dropdown */}
              <div className="d-flex align-items-end gap-2">
                <div>
                  <label className="form-label">From</label>
                  <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">To</label>
                  <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
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
                      <th style={{ textWrap: 'nowrap' }}>Invoice Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Invoice Number</th>
                      <th style={{ textWrap: 'nowrap' }}>Customer Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Discount Type</th>
                      <th style={{ textWrap: 'nowrap' }}>Discount Amount</th>
                      <th style={{ textWrap: 'nowrap' }}>Total Invoice Amount</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any) => (
                      <tr key={o._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`ord_${o._id}`} />
                            <label className="form-check-label" htmlFor={`ord_${o._id}`}></label>
                          </div>
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>{fmt(o.date)}</td>
                        <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo || '-'}</td>
                        <td style={{ textWrap: 'nowrap' }}>{o.customer?.name || '-'}</td>
                        <td style={{ textWrap: 'nowrap' }}>
                          <span className="badge bg-success">{o.discountType || '-'}</span>
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>AED {(Number(o.discountAmount)||0).toFixed(2)}</td>
                        <td style={{ textWrap: 'nowrap' }}>AED {(Number(o.total)||0).toFixed(2)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href="" className="btn btn-soft-danger btn-sm">
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

export default DiscountList
