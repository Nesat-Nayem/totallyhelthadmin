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
  discountAmount?: number
  vatAmount?: number
  shippingCharge?: number
  payableAmount?: number
  startDate?: string
  endDate?: string
  status?: string
  paymentMode?: string
}

const MembershipList = () => {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv' | 'all'>('all')

  const filtered = React.useMemo(() => {
    if (!fromDate && !toDate) return orders
    const from = fromDate ? new Date(fromDate + 'T00:00:00') : null
    const to = toDate ? new Date(toDate + 'T23:59:59') : null
    return orders.filter((o) => {
      const d = new Date(o.date)
      if (isNaN(d.getTime())) return false
      if (from && d < from) return false
      if (to && d > to) return false
      return true
    })
  }, [orders, fromDate, toDate])

  const download = () => {
    const rows = filtered.map((o) => {
      const mode = (o.paymentMode || '').toLowerCase()
      const cashAmt = mode === 'cash' ? (o.payableAmount ?? o.total) : 0
      const cardAmt = mode === 'card' ? (o.payableAmount ?? o.total) : 0
      const meals = (o.items || []).map((it) => it.title).join(' | ')
      const total = o.subTotal ?? 0
      const disc = o.discountAmount ?? 0
      const vat = o.vatAmount ?? 0
      const deli = o.shippingCharge ?? 0
      const grand = o.total ?? (total - disc + vat + deli)
      return {
        'Invoice Date': fmt(o.date),
        'Bill Number': o.invoiceNo,
        'Customer Name': o.customer?.name || 'Guest',
        Meal: meals,
        Total: total,
        Disc: disc,
        Vat: vat,
        'Deli.Cha': deli,
        'Grand Total': grand,
        'Cash Amt': cashAmt,
        'Card Amt': cardAmt,
      }
    })

    const toCSV = (data: any[]) => {
      if (!data.length) return ''
      const headers = Object.keys(data[0])
      const esc = (v: any) => {
        const s = String(v ?? '')
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/"/g, '""') + '"'
        }
        return s
      }
      const lines = [headers.join(',')]
      for (const row of data) {
        lines.push(headers.map((h) => esc((row as any)[h])).join(','))
      }
      return lines.join('\n')
    }

    if (format === 'pdf') {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Membership Report</title>
        <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head>
        <body><h3>Membership Report</h3>
        <table><thead><tr><th>Invoice Date</th><th>Bill Number</th><th>Customer Name</th><th>Meal</th><th>Total</th><th>Disc</th><th>Vat</th><th>Deli.Cha</th><th>Grand Total</th><th>Cash Amt</th><th>Card Amt</th></tr></thead><tbody>
        ${rows
          .map(
            (r) => `<tr><td>${r['Invoice Date']}</td><td>${r['Bill Number']}</td><td>${r['Customer Name']}</td><td>${r['Meal']}</td><td>${r['Total']}</td><td>${r['Disc']}</td><td>${r['Vat']}</td><td>${r['Deli.Cha']}</td><td>${r['Grand Total']}</td><td>${r['Cash Amt']}</td><td>${r['Card Amt']}</td></tr>`
          )
          .join('')}
        </tbody></table>
        <script>window.onload=()=>{window.print();}</script>
        </body></html>`
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
      }
      return
    }

    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `membership-report-${fromDate || 'all'}-to-${toDate || 'all'}.${format === 'excel' ? 'xlsx' : 'csv'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
                Membership Report
              </CardTitle>
              <div className="mb-3">
                <label htmlFor="fromDate" className="form-label">From</label>
                <input id="fromDate" type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="toDate" className="form-label">To</label>
                <input id="toDate" type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1" value={format} onChange={(e) => setFormat(e.target.value as any)}>
                <option value="all">Select download</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <button className="btn btn-primary btn-sm ms-2" onClick={download} disabled={format==='all'}>Download</button>
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="text-center text-muted">
                          {loading ? 'Loading orders...' : 'No matching orders.'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((o) => {
                        const mode = (o.paymentMode || '').toLowerCase()
                        const cashAmt = mode === 'cash' ? (o.payableAmount ?? o.total) : 0
                        const cardAmt = mode === 'card' ? (o.payableAmount ?? o.total) : 0
                        const meals = (o.items || []).map((it, i) => (
                          <span key={i} className="badge bg-success me-1">{it.title}</span>
                        ))
                        const total = o.subTotal ?? 0
                        const disc = o.discountAmount ?? 0
                        const vat = o.vatAmount ?? 0
                        const deli = o.shippingCharge ?? 0
                        const grand = o.total ?? (total - disc + vat + deli)
                        return (
                          <tr key={o.id}>
                            <td>
                              <div className="form-check">
                                <input type="checkbox" className="form-check-input" id={`check-${o.id}`} />
                                <label className="form-check-label" htmlFor={`check-${o.id}`} />
                              </div>
                            </td>
                            <td style={{ textWrap: 'nowrap' }}>{fmt(o.date)}</td>
                            <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo}</td>
                            <td style={{ textWrap: 'nowrap' }}>{o.customer?.name || 'Guest'}</td>
                            <td style={{ textWrap: 'nowrap' }}>{meals}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {total}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {disc}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {vat}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {deli}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {grand}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {cashAmt}</td>
                            <td style={{ textWrap: 'nowrap' }}>AED {cardAmt}</td>
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

export default MembershipList