'use client'

import React, { useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Form, Button, InputGroup, FormControl, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import CustomerModal from './CustomerModal'
import Calculator from './Calculator'
import PrintOrder from './PrintOrder'
import ViewOrder from './ViewOrders'

// Product images
import product1 from '../../../../../assets/images/order-view/1.webp'
import product2 from '../../../../../assets/images/order-view/2.webp'
import product3 from '../../../../../assets/images/order-view/3.webp'
import product4 from '../../../../../assets/images/order-view/4.webp'

const products = [
  { id: 1, title: 'International Meal Plan', price: 100, image: product1 },
  { id: 2, title: 'Arabic Meal Plan', price: 120, image: product2 },
  { id: 3, title: 'Diabetic Meal Plan', price: 150, image: product3 },
  { id: 4, title: 'Pescatarian Meal Plan', price: 100, image: product4 },
  { id: 5, title: 'Vegan Meal Plan', price: 100, image: product1 },
  { id: 6, title: 'Vegetarian Meal Plan', price: 200, image: product2 },
]

const paymentModes = ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Cheque', 'PayPal', 'Stripe', 'Crypto', 'Others']
const POS = () => {
  const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: any }>({})

  const handleProductClick = (product: any) => {
    setSelectedProducts((prev) => {
      const existing = prev[product.id]
      if (existing) {
        return {
          ...prev,
          [product.id]: {
            ...existing,
            qty: existing.qty + 1,
          },
        }
      } else {
        return {
          ...prev,
          [product.id]: {
            ...product,
            qty: 1,
          },
        }
      }
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

  return (
    <Row className="g-3">
      <Col lg={3}>
        <Card>
          <CardBody>
            <InputGroup className="mb-2">
              <FormControl placeholder="Search Meal Plan..." />
              <Button variant="outline-secondary">
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>
            {/* category */}

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
            <Row className="g-3" style={{ height: 'auto', overflowY: 'auto' }}>
              {products.map((product) => (
                <Col xs={12} key={product.id}>
                  <div
                    className={`text-center p-2 border rounded-3 h-100 cursor-pointer 
                      ${selectedProducts[product.id] ? 'bg-success-subtle border-success' : 'bg-light'}`}
                    onClick={() => handleProductClick(product)}>
                    <Image src={product.image} alt={product.title} className="mb-2 rounded" width={60} height={60} />
                    <div className="fw-semibold small text-dark">{product.title}</div>
                    <div className="text-success fw-bold">AED {product.price}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      </Col>

      <Col lg={9}>
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
              <Col md={6}>
                <Form.Control placeholder="Invoice Number" defaultValue="S-001" />
              </Col>
              <Col md={6}>
                <Form.Control type="date" defaultValue="2025-08-02" />
              </Col>
              <Col md={9}>
                <Form.Select>
                  <option>Select Customer</option>
                  <option>Guest</option>
                  <option>Suraj Jamdade</option>
                </Form.Select>
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
                    <th>Sale Price</th>
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
                      <td>AED {product.price}</td>
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
                  <Form.Control type="text" value={`AED ${totalAmount}`} disabled />
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
                  <Form.Control type="text" defaultValue="AED 100" disabled />
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
            <Button variant="danger" size="sm">
              <IconifyIcon icon="mdi:pause" /> Hold
            </Button>
            <Button variant="warning" size="sm">
              <IconifyIcon icon="mdi:restart" /> Reset
            </Button>
            <PrintOrder />
            <ViewOrder />
            <Link href="/reports/transactions" className="btn btn-sm btn-light">
              <IconifyIcon icon="mdi:credit-card-outline" /> Transaction
            </Link>
            <Button variant="primary" size="sm">
              <IconifyIcon icon="mdi:content-save-outline" /> Save
            </Button>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default POS
