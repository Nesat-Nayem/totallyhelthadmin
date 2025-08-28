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
  const [vatPercent, setVatPercent] = useState<number>(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat')
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [shippingCharge, setShippingCharge] = useState<number>(0)
  const [rounding, setRounding] = useState<number>(0)
  const [receiveAmount, setReceiveAmount] = useState<number>(0)
  const [paymentMode, setPaymentMode] = useState<string>('Cash')
  const [note, setNote] = useState<string>('')

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
  const vatAmount = Number(((subTotal * (Number(vatPercent) || 0)) / 100).toFixed(2))
  const discountAmount = Number(
    (
      (discountType === 'percent'
        ? subTotal * ((Number(discountValue) || 0) / 100)
        : Number(discountValue) || 0) || 0
    ).toFixed(2)
  )
  const totalAmount = Math.max(0, Number((subTotal + vatAmount + (Number(shippingCharge) || 0) + (Number(rounding) || 0) - discountAmount).toFixed(2)))
  const payableAmount = totalAmount
  const changeAmount = Math.max(0, Number(((Number(receiveAmount) || 0) - payableAmount).toFixed(2)))
  const dueAmount = Math.max(0, Number((payableAmount - (Number(receiveAmount) || 0)).toFixed(2)))

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
        status: dueAmount > 0 ? 'unpaid' : 'paid',
        paymentMode,
        vatPercent: Number(vatPercent) || 0,
        vatAmount,
        discountType,
        discountAmount,
        shippingCharge: Number(shippingCharge) || 0,
        rounding: Number(rounding) || 0,
        payableAmount,
        receiveAmount: Number(receiveAmount) || 0,
        changeAmount,
        dueAmount,
        note: note?.trim() || undefined,
      }
      await apiFetch(`/orders`, { method: 'POST', body: JSON.stringify(payload) }, token)
      alert('Order saved')
      setSelected({})
      setVatPercent(0)
      setDiscountType('flat')
      setDiscountValue(0)
      setShippingCharge(0)
      setRounding(0)
      setReceiveAmount(0)
      setPaymentMode('Cash')
      setNote('')
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
            {/* <Link href="/dashboard" className="btn btn-sm btn-dark">
              <IconifyIcon icon="mdi:view-dashboard-outline" /> Dashboard
            </Link> */}
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
                  <Form.Control type="number" value={receiveAmount} onChange={(e) => setReceiveAmount(Number(e.target.value) || 0)} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Change Amount</Form.Label>
                  <Form.Control type="number" value={changeAmount} readOnly />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Due Amount </Form.Label>
                  <Form.Control type="number" value={dueAmount} readOnly />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Payment Mode</Form.Label>
                  <Form.Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    {paymentModes.map((mode, idx) => (
                      <option key={idx} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Control as="textarea" placeholder="Type note..." value={note} onChange={(e) => setNote(e.target.value)} />
              </Col>

              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Sub Total</Form.Label>
                  <Form.Control type="text" value={`AED ${subTotal}`} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>VAT (%)</Form.Label>
                  <InputGroup>
                    <Form.Select value={vatPercent} onChange={(e) => setVatPercent(Number(e.target.value) || 0)}>
                      <option value={0}>Select</option>
                      <option value={5}>5%</option>
                      <option value={9}>9%</option>
                      <option value={15}>15%</option>
                      <option value={18}>18%</option>
                    </Form.Select>
                    <FormControl type="number" placeholder="Custom %" value={vatPercent} onChange={(e) => setVatPercent(Number(e.target.value) || 0)} />
                  </InputGroup>
                  <div className="small text-muted">VAT Amount: AED {vatAmount}</div>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Discount</Form.Label>
                  <InputGroup>
                    <Form.Select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}>
                      <option value="flat">Flat (AED)</option>
                      <option value="percent">Percent (%)</option>
                    </Form.Select>
                    <FormControl type="number" placeholder="0" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value) || 0)} />
                  </InputGroup>
                  <div className="small text-muted">Discount Amount: AED {discountAmount}</div>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Shipping Charge</Form.Label>
                  <Form.Control type="number" value={shippingCharge} onChange={(e) => setShippingCharge(Number(e.target.value) || 0)} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control type="text" value={`AED ${totalAmount}`} disabled />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Rounding(+/-)</Form.Label>
                  <Form.Control type="number" value={rounding} onChange={(e) => setRounding(Number(e.target.value) || 0)} />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-between bg-light p-3 border">
              <h5>Payable Amount:</h5>
              <h5 className="text-primary fw-bold">AED {payableAmount}</h5>
            </div>
          </CardBody>

          <CardFooter className="d-flex justify-content-between flex-wrap gap-1">
            <Button variant="warning" size="sm" onClick={() => setSelected({})}>
              <IconifyIcon icon="mdi:restart" /> Reset
            </Button>
      
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
