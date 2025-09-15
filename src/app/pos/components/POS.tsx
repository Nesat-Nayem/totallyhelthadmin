'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Form, Button, InputGroup, FormControl, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import CustomerModal from './CustomerModal'
import Calculator from './Calculator'
import PrintOrder from './PrintOrder'
import ViewOrder from './ViewOrders'

// Product images
import product1 from '@/assets/images/order-view/1.webp'
import product2 from '@/assets/images/order-view/2.webp'
import product3 from '@/assets/images/order-view/3.webp'
import product4 from '@/assets/images/order-view/4.webp'
import DefaultModaal from './DefaultModaal'
import MoreOptions from './MoreOptions'
import SplitBillModal from './SplitBillModal'
import PaymentModeSelector from './PaymentModeSelector'
import DiscountModal from './DiscountModal'

const products = [
  { id: 1, title: 'International Meal Plan', price: 100, image: product1 },
  { id: 2, title: 'Arabic Meal Plan', price: 120, image: product2 },
  { id: 3, title: 'Diabetic Meal Plan', price: 150, image: product3 },
  { id: 4, title: 'Pescatarian Meal Plan', price: 100, image: product4 },
  { id: 5, title: 'Vegan Meal Plan', price: 100, image: product1 },
  { id: 6, title: 'Vegetarian Meal Plan', price: 200, image: product2 },
  { id: 7, title: 'International Meal Plan', price: 100, image: product1 },
  { id: 8, title: 'Arabic Meal Plan', price: 120, image: product2 },
  { id: 9, title: 'Diabetic Meal Plan', price: 150, image: product3 },
  { id: 10, title: 'Pescatarian Meal Plan', price: 100, image: product4 },
  { id: 11, title: 'Vegan Meal Plan', price: 100, image: product1 },
  { id: 12, title: 'Vegetarian Meal Plan', price: 200, image: product2 },
  { id: 13, title: 'International Meal Plan', price: 100, image: product1 },
  { id: 14, title: 'Arabic Meal Plan', price: 120, image: product2 },
  { id: 15, title: 'Diabetic Meal Plan', price: 150, image: product3 },
  { id: 16, title: 'Pescatarian Meal Plan', price: 100, image: product4 },
  { id: 17, title: 'Vegan Meal Plan', price: 100, image: product1 },
  { id: 18, title: 'Vegetarian Meal Plan', price: 200, image: product2 },
  { id: 19, title: 'International Meal Plan', price: 100, image: product1 },
  { id: 20, title: 'Arabic Meal Plan', price: 120, image: product2 },
  { id: 21, title: 'Diabetic Meal Plan', price: 150, image: product3 },
  { id: 22, title: 'Pescatarian Meal Plan', price: 100, image: product4 },
  { id: 23, title: 'Vegan Meal Plan', price: 100, image: product1 },
  { id: 24, title: 'Vegetarian Meal Plan', price: 200, image: product2 },
]

const paymentModes = ['Credit Card', 'Cash', 'Bank Transfer', 'Others']
const orderTypes = ['DineIn', 'TakeAway', 'Delivery']
const aggregatorsTypes = ['Zomato', 'Swiggy', 'Talabat', 'Deliveroo', 'Careem Food']
const POS = () => {
  const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: any }>({})
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discount, setDiscount] = useState<{ type: string; amount: number; reason: string } | null>(null)

  const handleProductClick = (product: any) => {
    setSelectedProducts({
      [product.id]: {
        ...product,
        qty: 1,
      },
    })
  }

  const handleQtyChange = (id: number, delta: number) => {
    setSelectedProducts((prev) => {
      const updatedQty = Math.max(1, prev[id].qty + delta)
      return {
        ...prev,
        [id]: {
          ...prev[id],
          qty: updatedQty,
        },
      }
    })
  }

  const handleDelete = (id: number) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const totalAmount = Object.values(selectedProducts).reduce((sum, p: any) => sum + p.price * p.qty, 0)

  const [showDefaultModal, setShowDefaultModal] = useState(false)

  useEffect(() => {
    setShowDefaultModal(true)
  }, [])

  return (
    <>
      <DefaultModaal show={showDefaultModal} onClose={() => setShowDefaultModal(false)} />

      <Row className="g-3">
        <Col lg={4}>
          <Card>
            <CardBody>
              <InputGroup className="mb-2">
                <FormControl placeholder="Search Meal Plan..." />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>
              {/* category */}

              <Row>
                <Col lg={6}>
                  <div className="mb-2">
                    <select name="" id="" className="form-control form-select">
                      <option value="">Select Brands</option>
                      <option value="">Totally Health</option>
                      <option value="">Subway</option>
                      <option value=""> Burger King</option>
                      <option value="">Pizzahut</option>
                    </select>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-2">
                    <select name="" id="" className="form-control form-select">
                      <option value="">Select Meal Category</option>
                      <option value="">Summer Selections</option>
                      <option value="">Breakfast</option>
                      <option value="">Soups & Bites</option>
                      <option value="">Lunch</option>
                      <option value="">Dinner</option>
                      <option value="">Snacks</option>
                    </select>
                  </div>
                </Col>
              </Row>
              <Row className="g-3" style={{ height: 'auto', overflowY: 'auto' }}>
                {products.map((product) => (
                  <Col xs={4} key={product.id}>
                    <div
                      className={`text-center p-2 border rounded-3 h-100 cursor-pointer 
                      ${selectedProducts[product.id] ? 'bg-success-subtle border-success' : 'bg-light'}`}
                      onClick={() => handleProductClick(product)}>
                      <Image src={product.image} alt={product.title} className="mb-2 rounded" width={60} height={60} />
                      <div className="fw-semibold small " style={{ fontSize: '10px' }}>
                        {product.title}
                      </div>
                      <div className="text-success fw-bold" style={{ fontSize: '10px' }}>
                        AED {product.price}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <CardTitle as="h4" className="flex-grow-1 mb-0 text-primary">
                Quick Action
              </CardTitle>
              <Link href="/meal-plan/meal-plan-list" className="btn btn-lg btn-success">
                <IconifyIcon icon="mdi:food-variant" /> Meal Plan List
              </Link>
              <Link href="/sales/sales-list" className="btn btn-lg btn-warning">
                <IconifyIcon icon="mdi:cash-register" /> Sales List
              </Link>
              <Calculator />
              <Link href="/dashboard" className="btn btn-lg btn-dark">
                <IconifyIcon icon="mdi:view-dashboard-outline" /> Dashboard
              </Link>
            </CardHeader>

            <CardBody>
              <Row className="g-2 mb-3">
                <Col md={4}>
                  <label htmlFor="date">Invoice No.</label>
                  <Form.Control placeholder="Invoice Number" defaultValue="S-001" />
                </Col>
                <Col md={4}>
                  <label htmlFor="date">Meal Plan Start Date</label>
                  <Form.Control type="date" defaultValue="2025-08-02" />
                </Col>
                <Col md={4}>
                  <label htmlFor="date">Meal Plan End Date</label>
                  <Form.Control type="date" defaultValue="2025-08-02" />
                </Col>
                <Col md={9}>
                  <InputGroup>
                    <FormControl placeholder="Search..." />
                    <Button variant="outline-secondary">
                      <IconifyIcon icon="mdi:magnify" />
                    </Button>
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <CustomerModal />
                </Col>
              </Row>
              <div className="text-end mb-2">
                <Badge bg="dark" className="px-3 py-1 fs-6">
                  Order ID: #001
                </Badge>
              </div>
              {/* Order Table */}
              <div className="table-responsive mb-4">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Qty</th>
                      <th>Sub Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(selectedProducts).map((product: any) => (
                      <tr key={product.id}>
                        <td>
                          <Image src={product.image} alt={product.title} width={40} height={40} />
                        </td>
                        <td>{product.title}</td>

                        <td>
                          <div className="d-flex gap-1 align-items-center">
                            <Button size="sm" onClick={() => handleQtyChange(product.id, -1)}>
                              -
                            </Button>
                            <span className="px-2">{product.qty}</span>
                            <Button size="sm" onClick={() => handleQtyChange(product.id, 1)}>
                              +
                            </Button>
                          </div>
                        </td>
                        <td>AED {product.price * product.qty}</td>
                        <td>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>
                            <IconifyIcon icon="mdi:delete" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-end">
                  <MoreOptions />
                </div>
              </div>

              <Row className="g-3">
                <Form.Group className="mb-3">
                  <Form.Label>Sub Total</Form.Label>
                  <Form.Control type="text" value={`AED ${totalAmount}`} disabled />
                </Form.Group>

                {/* Left Side */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Receive Amount (AED)</Form.Label>
                    <Form.Control type="number" placeholder="Enter received amount" defaultValue="0" min={0} />
                    <Form.Text className="text-muted">Amount received from customer</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Aggregator</Form.Label>
                    <Form.Select defaultValue="">
                      <option value="" disabled>
                        Select aggregator
                      </option>
                      {aggregatorsTypes.map((mode, idx) => (
                        <option key={idx} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Add order notes..." />
                  </Form.Group>

                  {/* Split Bill Button */}
                  <Button variant="info" size="lg" onClick={() => setShowSplitModal(true)}>
                    <IconifyIcon icon="mdi:account-multiple-outline" /> Split Bill
                  </Button>
                  <Button variant="success" size="lg" onClick={() => setShowDiscountModal(true)} className="mx-3">
                    <IconifyIcon icon="mdi:ticket-percent-outline" /> Apply Discount
                  </Button>

                  <DiscountModal
                    show={showDiscountModal}
                    onClose={() => setShowDiscountModal(false)}
                    onApply={(type, amount, reason) => setDiscount({ type, amount, reason })}
                  />

                  <SplitBillModal show={showSplitModal} onClose={() => setShowSplitModal(false)} totalAmount={totalAmount} />
                  <PaymentModeSelector />
                </Col>

                {/* Right Side */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Change Amount (AED)</Form.Label>
                    <Form.Control type="number" placeholder="Auto calculated" defaultValue="0" disabled />
                    <Form.Text className="text-muted">Change to return (auto-calculated)</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>VAT (5%)</Form.Label>
                    <Form.Control type="text" value={`AED ${(totalAmount * 5) / 100}`} disabled />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Delivery Charge (AED)</Form.Label>
                    <Form.Control type="number" placeholder="Enter shipping charge" defaultValue="0" min={0} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Total Amount</Form.Label>
                    <Form.Control type="text" value={`AED ${totalAmount}`} disabled />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Rounding (+/-)</Form.Label>
                    <Form.Control type="number" placeholder="Enter rounding adjustment" defaultValue="0" />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-between bg-light p-3 border">
                <h5>Payable Amount:</h5>
                <h5 className="text-primary fw-bold">AED {totalAmount}</h5>
              </div>
            </CardBody>

            <CardFooter className="d-flex justify-content-between flex-wrap gap-1">
              <Button variant="warning" size="lg">
                <IconifyIcon icon="mdi:restart" /> Reset
              </Button>
              <Button variant="info" size="lg">
                <IconifyIcon icon="mdi:restart" /> Settle Bill
              </Button>
              <PrintOrder />
              <ViewOrder />
              <Link href="/reports/all-income" className="btn btn-lg btn-dark">
                <IconifyIcon icon="mdi:document" /> Reports
              </Link>
              <Link href="/reports/transactions" className="btn btn-lg btn-light">
                <IconifyIcon icon="mdi:credit-card-outline" /> Transaction
              </Link>
              <Button variant="primary" size="lg">
                <IconifyIcon icon="mdi:content-save-outline" /> Save
              </Button>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default POS
