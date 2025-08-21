'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Form, Button, InputGroup, FormControl, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import CustomerModal from './CustomerModal'
import Calculator from './Calculator'
import PrintOrder from './PrintOrder'
import ViewOrder from './ViewOrders'
import { apiFetch } from '@/utils/api'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

type MealPlan = {
  _id: string
  title: string
  price?: number
  brand?: string
  category?: string
  thumbnail?: any
  images?: any[]
}

type Customer = { id: string; name: string }
type Selected = { [key: string]: { id: string; title: string; price: number; img?: string; qty: number } }

const getImgUrl = (img: any): string => {
  if (!img) return ''
  if (typeof img === 'string') return img
  return img?.secure_url || img?.url || ''
}

const paymentModes = ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Cheque', 'PayPal']
const POS = () => {
  const { data: session } = useSession()
  const [items, setItems] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<Selected>({})
  const [invoiceNo, setInvoiceNo] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<{ data: MealPlan[] }>(`/meal-plans?limit=100${q ? `&search=${encodeURIComponent(q)}` : ''}`)
      setItems(res.data || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const res = await apiFetch<{ data: any[] }>(`/customers?limit=100`)
      const list: Customer[] = (res.data || []).map((c: any) => ({ id: c._id || c.id, name: c.name }))
      setCustomers(list)
    } catch {
      setCustomers([])
    }
  }

  useEffect(() => {
    load()
    loadCustomers()
    // default dates
    const today = new Date().toISOString().slice(0, 10)
    setStartDate(today)
    setEndDate(today)
    // invoice
    const inv = `S-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    setInvoiceNo(inv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchBrand = brand ? (it.brand || '').toLowerCase() === brand.toLowerCase() : true
      const matchCat = category ? (it.category || '').toLowerCase() === category.toLowerCase() : true
      const matchQ = q ? (it.title || '').toLowerCase().includes(q.toLowerCase()) : true
      return matchBrand && matchCat && matchQ
    })
  }, [items, brand, category, q])

  const onProductClick = (it: MealPlan) => {
    const id = it._id
    const price = Number(it.price || 0)
    setSelected((prev) => ({
      ...prev,
      [id]: prev[id]
        ? prev[id]
        : { id, title: it.title, price, img: getImgUrl(it.thumbnail) || getImgUrl((it.images || [])[0]), qty: 1 },
    }))
  }

  const handleQtyChange = (id: string, delta: number) => {
    setSelected((prev) => {
      const item = prev[id]
      if (!item) return prev
      const qty = Math.max(1, item.qty + delta)
      return { ...prev, [id]: { ...item, qty } }
    })
  }

  const handleDelete = (id: string) => {
    setSelected((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const subTotal = Object.values(selected).reduce((sum, p) => sum + p.price * p.qty, 0)
  const totalAmount = subTotal

  const onCustomerCreated = (c: Customer) => {
    setCustomers((prev) => [...prev, c])
    setCustomerId(c.id)
  }

  const saveOrder = async () => {
    const itemsArr = Object.values(selected)
    if (!itemsArr.length) return alert('Please add items')
    const token = (session as any)?.user?.token || (session as any)?.accessToken || (session as any)?.user?.accessToken
    try {
      const customer = customers.find((c) => c.id === customerId)
      const payload = {
        invoiceNo,
        date: new Date().toISOString(),
        customer: customer && customerId !== 'guest' ? { id: customer.id, name: customer.name } : undefined,
        items: itemsArr.map((i) => ({ productId: i.id, title: i.title, price: i.price, qty: i.qty })),
        subTotal,
        total: totalAmount,
        startDate,
        endDate,
        status: 'paid',
      }
      await apiFetch(`/orders`, { method: 'POST', body: JSON.stringify(payload) }, token)
      alert('Order saved')
      setSelected({})
      // regenerate invoice number for next order
      const inv = `S-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
      setInvoiceNo(inv)
    } catch (e: any) {
      alert(e?.message || 'Failed to save order')
    }
  }

  return (
    <Row className="g-3">
      <Col lg={6}>
        <Card>
          <CardBody>
            <InputGroup className="mb-2">
              <FormControl placeholder="Search Meal Plan..." value={q} onChange={(e) => setQ(e.target.value)} />
              <Button variant="outline-secondary" onClick={load} disabled={loading}>
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>
            {/* category */}

            <Row>
              <Col lg={6}>
                <div className="mb-2">
                  <select className="form-control form-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                    <option value="">All Brands</option>
                    {[...new Set(items.map((x) => x.brand).filter(Boolean) as string[])].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-2">
                  <select className="form-control form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {[...new Set(items.map((x) => x.category).filter(Boolean) as string[])].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </Col>
            </Row>
            <Row className="g-3" style={{ height: 'auto', overflowY: 'auto' }}>
              {filtered.map((it) => (
                <Col xs={3} key={it._id}>
                  <div
                    className={`text-center p-2 border rounded-3 h-100 cursor-pointer 
                      ${selected[it._id] ? 'bg-success-subtle border-success' : 'bg-light'}`}
                    onClick={() => onProductClick(it)}>
                    <Image src={getImgUrl(it.thumbnail) || getImgUrl((it.images || [])[0])} alt={it.title} className="mb-2 rounded" width={60} height={60} />
                    <div className="fw-semibold small " style={{ fontSize: '10px' }}>
                      {it.title}
                    </div>
                    <div className="text-success fw-bold" style={{ fontSize: '10px' }}>
                      AED {it.price ?? 0}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      </Col>

      <Col lg={6}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <CardTitle as="h4" className="flex-grow-1 mb-0 text-primary">
              Quick Action
            </CardTitle>
            <Link href="/meal-plan/meal-plan-list" className="btn btn-sm btn-success">
              <IconifyIcon icon="mdi:food-variant" /> Meal Plan List
            </Link>
            <Link href="/sales/sales-list" className="btn btn-sm btn-warning">
              <IconifyIcon icon="mdi:cash-register" /> Sales List
            </Link>
            <Calculator />
            <Link href="/dashboard" className="btn btn-sm btn-dark">
              <IconifyIcon icon="mdi:view-dashboard-outline" /> Dashboard
            </Link>
          </CardHeader>

          <CardBody>
            <Row className="g-2 mb-3">
              <Col md={4}>
                <label htmlFor="date">Invoice No.</label>
                <Form.Control placeholder="Invoice Number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
              </Col>
              <Col md={4}>
                <label htmlFor="date">Meal Plan Start Date</label>
                <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Col>
              <Col md={4}>
                <label htmlFor="date">Meal Plan End Date</label>
                <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Col>
              <Col md={9}>
                <Form.Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Select Customer</option>
                  <option value="guest">Guest</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <CustomerModal onCreated={onCustomerCreated} />
              </Col>
            </Row>
            <div className="text-end mb-2">
              <Badge bg="dark" className="px-3 py-1 fs-6">
                Order ID: {invoiceNo}
              </Badge>
            </div>
            {/* Order Table */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Qty</th>
                    <th>Sub Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(selected).map((p) => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>
                        <div className="d-flex gap-1 align-items-center">
                          <Button size="sm" onClick={() => handleQtyChange(p.id, -1)}>
                            -
                          </Button>
                          <span className="px-2">{p.qty}</span>
                          <Button size="sm" onClick={() => handleQtyChange(p.id, 1)}>
                            +
                          </Button>
                        </div>
                      </td>
                      <td>AED {p.price * p.qty}</td>
                      <td>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                          <IconifyIcon icon="mdi:delete" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Row className="g-2">
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Receive Amount</Form.Label>
                  <Form.Control type="number" defaultValue="0" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Change Amount</Form.Label>
                  <Form.Control type="number" defaultValue="0" min={1} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Payment Mode</Form.Label>
                  <Form.Select>
                    {paymentModes.map((mode, idx) => (
                      <option key={idx} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Control as="textarea" placeholder="Type note..." />
              </Col>

              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Sub Total</Form.Label>
                  <Form.Control type="text" value={`AED ${subTotal}`} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>VAT</Form.Label>
                  <InputGroup>
                    <Form.Select>
                      <option>Select</option>
                      <option>GST (18%)</option>
                      <option>IGST (9%)</option>
                      <option>CGST (9%)</option>
                      <option>TVA (15%)</option>
                    </Form.Select>
                    <FormControl type="number" placeholder="0.00" />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Discount</Form.Label>
                  <InputGroup>
                    <Form.Select>
                      <option>Flat (AED)</option>
                      <option>Percent (%)</option>
                    </Form.Select>
                    <FormControl type="number" placeholder="0" />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Shipping Charge</Form.Label>
                  <Form.Control type="number" defaultValue="0" min={1} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control type="text" value={`AED ${totalAmount}`} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Rounding(+/-)</Form.Label>
                  <Form.Control type="number" defaultValue="0" min={1} />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-between bg-light p-3 border">
              <h5>Payable Amount:</h5>
              <h5 className="text-primary fw-bold">AED {totalAmount}</h5>
            </div>
          </CardBody>

          <CardFooter className="d-flex justify-content-between flex-wrap gap-1">
            <Button variant="warning" size="sm" onClick={() => setSelected({})}>
              <IconifyIcon icon="mdi:restart" /> Reset
            </Button>
            <PrintOrder order={{ id: 'tmp', invoiceNo, date: new Date().toISOString(), customer: customers.find((c) => c.id === customerId), items: Object.values(selected).map((i) => ({ id: i.id, title: i.title, price: i.price, qty: i.qty })), subTotal, total: totalAmount }} />
            {/* <ViewOrder /> */}
            <Link href="/reports/all-income" className="btn btn-sm btn-dark">
              <IconifyIcon icon="mdi:document" /> Reports
            </Link>
            <Link href="/reports/transactions" className="btn btn-sm btn-light">
              <IconifyIcon icon="mdi:credit-card-outline" /> Transaction
            </Link>
            <Button variant="primary" size="sm" onClick={saveOrder}>
              <IconifyIcon icon="mdi:content-save-outline" /> Save
            </Button>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default POS
