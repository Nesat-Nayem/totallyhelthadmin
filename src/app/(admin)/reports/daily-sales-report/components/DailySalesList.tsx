'use client'
import TextFormInput from '@/components/form/TextFormInput'
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

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString()
}

const DailySalesList = () => {
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [page, setPage] = React.useState(1)
  const limit = 20
  const { data } = useGetOrdersQuery({ page, limit, startDate: startDate || undefined, endDate: endDate || undefined })
  const orders = data?.data ?? []
  const meta = data?.meta

  // Placeholder counts; adjust when orderType is available
  const totalDineIn = 0
  const totalTakeAway = 0
  const totalDelivery = orders.length

  return (
    <>
      <Row>
        <Col xs={12} md={4} lg={4} xl={4}>
          <Card className="text-center p-2">
            <h4>Total DineIn</h4>
            <h5 className="text-info">{totalDineIn}</h5>
          </Card>
        </Col>
        <Col xs={12} md={4} lg={4} xl={4}>
          <Card className="text-center p-2">
            <h4>Total Takeway</h4>
            <h5 className="text-info">{totalTakeAway}</h5>
          </Card>
        </Col>
        <Col xs={12} md={4} lg={4} xl={4}>
          <Card className="text-center p-2">
            <h4>Total Delivery</h4>
            <h5 className="text-info">{totalDelivery}</h5>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Daily Sales Report
              </CardTitle>

              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  From
                </label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  To
                </label>
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
                      <th style={{ textWrap: 'nowrap' }}>Phone</th>
                      <th style={{ textWrap: 'nowrap' }}>Order Items</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>
                      <th style={{ textWrap: 'nowrap' }}>Subtotal</th>
                      <th style={{ textWrap: 'nowrap' }}>Vat</th>
                      <th style={{ textWrap: 'nowrap' }}>Discount</th>
                      <th style={{ textWrap: 'nowrap' }}>Shipping Charge</th>
                      <th style={{ textWrap: 'nowrap' }}>Total Amount</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any) => {
                      const items = Array.isArray(o.items) ? o.items.map((it: any) => it.title).slice(0, 3) : []
                      return (
                        <tr key={o._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" id={`sel-${o._id}`} />
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo}</td>
                          <td style={{ textWrap: 'nowrap' }}>{formatDate(o.date)}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.customer?.name || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.customer?.phone || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            {items.map((t: string, i: number) => (
                              <span key={i} className="badge bg-success me-1">
                                {t}
                              </span>
                            ))}
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{o.paymentMode || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {o.subTotal}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {o.vatAmount || 0}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {o.discountAmount || 0}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {o.shippingCharge || 0}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {o.total}</td>
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

export default DailySalesList
