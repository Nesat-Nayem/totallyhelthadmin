'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Card, CardFooter, CardTitle, Col, Row } from 'react-bootstrap'
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

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0)
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
        <Col lg={4}>
          <Card>
            
            <div className="p-3 text-center d-flex align-items-center gap-3">
              <div>
                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-24" />
              </div>
              <div>
                <h5>Total Sales</h5>
                <h5>
                  <span className="text-success">AED {totalSales}</span>
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
                <h5>This Month Sales</h5>
                <h5>
                  <span className="text-success">AED {totalSales}</span>
                </h5>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <div className="d-flex card-header justify-content-between align-items-center">
              <div>
                <CardTitle as={'h4'}>Sales List </CardTitle>
              </div>
            </div>
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
                      <th style={{ textWrap: 'nowrap' }}>Full Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Discount</th>
                      <th style={{ textWrap: 'nowrap' }}>Paid Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted">
                          {loading ? 'Loading orders...' : 'No orders yet. Create one in POS.'}
                        </td>
                      </tr>
                    ) : (
                      orders.map((o, idx) => (
                        <tr key={o.id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" id={`check-${o.id}`} />
                              <label className="form-check-label" htmlFor={`check-${o.id}`} />
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{idx + 1}</td>
                          <td style={{ textWrap: 'nowrap' }}>{fmt(o.date)}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo}</td>
                          <td style={{ textWrap: 'nowrap' }}>{o.customer?.name || 'Guest'}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED {o.total}</td>
                          <td style={{ textWrap: 'nowrap' }}>AED 0</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <span className="badge bg-success">Paid</span>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{o.paymentMode || 'Cash'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href={`/sales/invoice/${o.id}`} className="btn btn-light btn-sm" title="Invoice">
                                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-18" />
                              </Link>
                              <Link href="/pos" className="btn btn-soft-primary btn-sm" title="Open POS">
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Link>
                              <button className="btn btn-soft-danger btn-sm" onClick={() => removeOrder(o.id)} title="Delete">
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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
