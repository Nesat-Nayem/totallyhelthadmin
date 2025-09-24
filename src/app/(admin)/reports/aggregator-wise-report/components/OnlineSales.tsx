"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
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
import { useGetAggregatorsQuery } from '@/services/aggregatorApi'

function fmt(d?: string | Date) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString() } catch { return '-' }
}

const OnlineSales = () => {
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const { data: ordersRes } = useGetOrdersQuery({ salesType: 'online', startDate: startDate || undefined, endDate: endDate || undefined, limit: 500 })
  const orders = React.useMemo(() => ordersRes?.data ?? [], [ordersRes])
  const { data: aggregators = [] } = useGetAggregatorsQuery()

  const aggrMap = React.useMemo(() => Object.fromEntries(aggregators.map((a: any) => [a._id, a])), [aggregators])
  const totalsByAgg: Record<string, number> = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of orders) {
      const id = o.aggregatorId || 'unknown'
      map[id] = (map[id] || 0) + (Number(o.total) || 0)
    }
    return map
  }, [orders])

  return (
    <>
      <Row>
        {(aggregators?.length ? aggregators : [{ _id: 'unknown', name: 'Unknown' } as any]).map((item: any) => (
          <Col xs={12} md={4} lg={4} xl={4} key={item._id}>
            <Card className="text-center p-2">
              {!!item.logo && (
                <div style={{ width: '100px', height: '50px', margin: '0 auto' }}>
                  <Image src={item.logo} alt={item.name} width={100} height={50} className="img-fluid rounded" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </div>
              )}
              <div className="mt-2">
                <h6 className="mb-0">{item.name}</h6>
              </div>
              <h5 className="text-info mt-2">AED {(totalsByAgg[item._id] || 0).toFixed(2)}</h5>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Online Sales Report
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
                      const items = Array.isArray(o.items) ? o.items.slice(0, 3) : []
                      const ag = aggrMap[o.aggregatorId] || { name: 'Unknown' }
                      const payments = Array.isArray(o.payments) ? o.payments : []
                      const payText = payments.length ? payments.map((p: any) => `${p.type} AED ${(Number(p.amount)||0).toFixed(2)}`).join(', ') : (o.paymentMode || '-')
                      return (
                        <tr key={o._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" />
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{fmt(o.date)}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.customer?.name || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <span className="badge bg-danger">{ag.name}</span>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>
                            {items.map((it: any, idx: number) => (
                              <span key={idx} className="badge bg-success me-1">{it.title}</span>
                            ))}
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{payText}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {(Number(o.subTotal)||0).toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {(Number(o.vatAmount)||0).toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {(Number(o.discountAmount)||0).toFixed(2)}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {(Number(o.shippingCharge)||0).toFixed(2)}</td>
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

export default OnlineSales
