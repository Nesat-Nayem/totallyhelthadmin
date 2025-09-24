'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Button, Card, CardFooter, CardHeader, CardTitle, Col, FormControl, InputGroup, Row } from 'react-bootstrap'
import { useGetOrdersQuery } from '@/services/orderApi'

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString()
}

const MembershipList = () => {
  const [q, setQ] = React.useState('')
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [page, setPage] = React.useState(1)
  const limit = 20

  const { data: resp } = useGetOrdersQuery({ q: q || undefined, page, limit, startDate: startDate || undefined, endDate: endDate || undefined, salesType: 'membership' })
  const orders = resp?.data ?? []
  const meta = resp?.meta

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Membership Report
              </CardTitle>

              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search invoice or customer..." value={q} onChange={(e) => setQ(e.target.value)} />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>
              <div className="mb-3">
                <label className="form-label">From</label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">To</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
                      <th style={{ textWrap: 'nowrap' }}>Bill Number</th>
                      <th style={{ textWrap: 'nowrap' }}>Customer Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal</th>
                      <th style={{ textWrap: 'nowrap' }}>Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Disc</th>
                      <th style={{ textWrap: 'nowrap' }}>Vat</th>
                      <th style={{ textWrap: 'nowrap' }}>Deli.Cha</th>
                      <th style={{ textWrap: 'nowrap' }}>Grand Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Cash Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Card Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any) => {
                      // compute payment splits
                      const payments = Array.isArray(o.payments) ? o.payments : []
                      const sumBy = (type: string) => payments.filter((p: any) => (p.type || '').toLowerCase() === type.toLowerCase()).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
                      const cashAmt = payments.length > 0 ? sumBy('Cash') : ((o.paymentMode || '').toLowerCase() === 'cash' ? Number(o.total) || 0 : 0)
                      const cardAmt = payments.length > 0 ? sumBy('Card') : ((o.paymentMode || '').toLowerCase() === 'card' ? Number(o.total) || 0 : 0)
                      const mealTitles = Array.isArray(o.items) ? o.items.map((it: any) => it.title).slice(0, 3) : []
                      return (
                        <tr key={o._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" />
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{formatDate(o.date)}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.customer?.name || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            {mealTitles.map((t: string, i: number) => (
                              <span key={i} className="badge bg-success me-1">
                                {t}
                              </span>
                            ))}
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{o.subTotal?.toFixed?.(2) ?? o.subTotal}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.discountAmount?.toFixed?.(2) ?? o.discountAmount ?? 0}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.vatAmount?.toFixed?.(2) ?? o.vatAmount ?? 0}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.shippingCharge?.toFixed?.(2) ?? o.shippingCharge ?? 0}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.total?.toFixed?.(2) ?? o.total}</td>
                          <td style={{ textWrap: 'nowrap' }}>{cashAmt?.toFixed?.(2) ?? cashAmt}</td>
                          <td style={{ textWrap: 'nowrap' }}>{cardAmt?.toFixed?.(2) ?? cardAmt}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href="#" className="btn btn-soft-danger btn-sm" title="Delete (coming soon)">
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
    </>
  )
}

export default MembershipList

