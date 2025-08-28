"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { apiFetch } from '@/utils/api'
import { useSession } from 'next-auth/react'

type OrderItem = { productId?: string; title: string; price: number; qty: number }
type Order = {
  id: string
  invoiceNo: string
  date: string
  customer?: { id?: string; name: string }
  items: OrderItem[]
  subTotal: number
  total: number
  startDate?: string
  endDate?: string
  status?: string
  paymentMode?: string
}

const SalesList = () => {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const token = (session as any)?.user?.token || (session as any)?.accessToken || (session as any)?.user?.accessToken
      const res = await apiFetch<{ data: any[] }>(`/orders?limit=200`, {}, token)
      const list: Order[] = (res.data || []).map((o: any) => ({
        id: o._id || o.id,
        invoiceNo: o.invoiceNo,
        date: o.date,
        customer: o.customer,
        items: o.items,
        subTotal: o.subTotal,
        total: o.total,
        startDate: o.startDate,
        endDate: o.endDate,
        status: o.status,
        paymentMode: o.paymentMode,
      }))
      setOrders(list)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const removeOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return
    try {
      const token = (session as any)?.user?.token || (session as any)?.accessToken || (session as any)?.user?.accessToken
      await apiFetch(`/orders/${id}`, { method: 'DELETE' }, token)
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } catch (e: any) {
      alert(e?.message || 'Failed to delete order')
    }
  }

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleString()
    } catch {
      return d
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Pay Type Wise Sales Summary-Report
              </CardTitle>
              <div className="mb-3">
                <label htmlFor="fromDate" className="form-label">
                  From
                </label>
                <input id="fromDate" type="date" className="form-control" />
              </div>
              <div className="mb-3">
                <label htmlFor="toDate" className="form-label">
                  To
                </label>
                <input id="toDate" type="date" className="form-control" />
              </div>
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
                      <th style={{ textWrap: 'nowrap' }}>Cash Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Cr.Card Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Online Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Tawseel Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Total Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted">
                          {loading ? 'Loading orders...' : 'No orders yet. Create one in POS.'}
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => {
                        const mode = (o.paymentMode || '').toLowerCase()
                        const cash = mode === 'cash' ? o.total : 0
                        const card = mode === 'card' ? o.total : 0
                        const online = mode === 'online' ? o.total : 0
                        const tawseel = mode === 'tawseel' ? o.total : 0
                        return (
                          <tr key={o.id}>
                            <td>
                              <div className="form-check">
                                <input type="checkbox" className="form-check-input" id={`check-${o.id}`} />
                                <label className="form-check-label" htmlFor={`check-${o.id}`} />
                              </div>
                            </td>
                            <td style={{ textWrap: 'nowrap' }}>{fmt(o.date)}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {cash}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {card}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {online}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {tawseel}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {o.total}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link href={`/sales/invoice/${o.id}`} className="btn btn-light btn-sm" title="Invoice">
                                  <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-18" />
                                </Link>
                                <button className="btn btn-soft-danger btn-sm" onClick={() => removeOrder(o.id)} title="Delete">
                                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
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