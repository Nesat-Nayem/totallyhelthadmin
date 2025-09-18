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

// Import API services
import { useGetMenusQuery } from '@/services/menuApi'
import { useGetBrandsQuery } from '@/services/brandApi'
import { useGetMenuCategoriesQuery } from '@/services/menuCategoryApi'
import { useGetAggregatorsQuery } from '@/services/aggregatorApi'
import { useGetPaymentMethodsQuery } from '@/services/paymentMethodApi'
import { useCreateOrderMutation } from '@/services/orderApi'
import { useCreateCustomerMutation } from '@/services/customerApi'

// Fallback images for menus
const fallbackImages = [product1, product2, product3, product4]

const orderTypes = ['DineIn', 'TakeAway', 'Delivery']
const POS = () => {
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: any }>({})
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discount, setDiscount] = useState<{ type: string; amount: number; reason: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [moreOptions, setMoreOptions] = useState<any[]>([])
  const [selectedAggregator, setSelectedAggregator] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('Cash')
  const [receiveAmount, setReceiveAmount] = useState(0)
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [rounding, setRounding] = useState(0)
  const [notes, setNotes] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('S-001')
  const [orderNo, setOrderNo] = useState('#001')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  
  // Fetch data from APIs
  const { data: brandsData } = useGetBrandsQuery()
  const { data: categoriesData } = useGetMenuCategoriesQuery()
  const { data: aggregatorsData } = useGetAggregatorsQuery()
  const { data: paymentMethodsData } = useGetPaymentMethodsQuery()
  const [createOrder] = useCreateOrderMutation()
  
  // Get menus with filters - using proper menu API with search, brand, and category filtering
  const { data: menusData } = useGetMenusQuery(
    searchQuery || selectedBrand || selectedCategory
      ? {
          q: searchQuery || undefined,
          brand: selectedBrand || undefined,
          category: selectedCategory || undefined,
          limit: 100
        }
      : { limit: 100 }
  )
  
  const brands = brandsData ?? []
  const categories = categoriesData ?? []
  const aggregators = aggregatorsData ?? []
  const paymentMethods = paymentMethodsData ?? []
  const menus = menusData?.data ?? []

  const handleProductClick = (menu: any) => {
    const id = menu._id || menu.id
    // Use restaurant price as default, fallback to online price, then membership price
    const price = menu.restaurantPrice || menu.onlinePrice || menu.membershipPrice || 0
    
    setSelectedProducts(prev => {
      if (prev[id]) {
        // If already selected, increase quantity
        return {
          ...prev,
          [id]: {
            ...prev[id],
            qty: prev[id].qty + 1,
          },
        }
      } else {
        // Add new menu item
        return {
          ...prev,
          [id]: {
            ...menu,
            price: price, // Store the calculated price
            qty: 1,
          },
        }
      }
    })
  }

  const handleQtyChange = (id: string, delta: number) => {
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

  const handleDelete = (id: string) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  // Calculate totals
  const subTotal = Object.values(selectedProducts).reduce((sum, p: any) => sum + (p.price || 0) * p.qty, 0)
  const moreOptionsTotal = moreOptions.reduce((sum, opt: any) => sum + (opt.price || 0) * (opt.qty || 1), 0)
  const vatAmount = ((subTotal + moreOptionsTotal) * 5) / 100
  const totalBeforeRounding = subTotal + moreOptionsTotal + vatAmount + deliveryCharge - (discount?.amount || 0)
  const totalAmount = totalBeforeRounding + rounding
  const changeAmount = receiveAmount - totalAmount

  const [showDefaultModal, setShowDefaultModal] = useState(false)

  useEffect(() => {
    setShowDefaultModal(true)
  }, [])
  
  const handleSaveOrder = async () => {
    try {
      if (!customer) {
        alert('Please select a customer')
        return
      }
      
      const orderData = {
        customer: customer._id,  // Send just the ID string
        items: Object.values(selectedProducts).map((p: any) => ({
          productId: p._id || p.id,
          title: p.title || p.name,
          price: p.price,
          qty: p.qty
        })),
        extraItems: moreOptions.map((opt: any) => ({
          name: opt.name,
          price: opt.price,
          qty: opt.qty || 1
        })),
        date: startDate,  // Required field
        subTotal,
        total: totalAmount,  // Required field
        vatAmount,
        discountAmount: discount?.amount || 0,
        shippingCharge: deliveryCharge,
        paymentMode: selectedPaymentMode,
        aggregatorId: selectedAggregator || undefined,
        startDate,
        endDate,
        note: notes,  // Field is 'note' not 'notes'
        status: 'paid' as 'paid' | 'unpaid'  // Ensure correct type
      }
      
      const result = await createOrder(orderData).unwrap()
      alert(`Order created successfully! Invoice: ${result.invoiceNo}, Order: ${result.orderNo || ''}`)
      
      // Reset form
      setSelectedProducts({})
      setMoreOptions([])
      setCustomer(null)
      setDiscount(null)
      setDeliveryCharge(0)
      setRounding(0)
      setNotes('')
      setReceiveAmount(0)
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to create order')
    }
  }
  
  const handleReset = () => {
    setSelectedProducts({})
    setMoreOptions([])
    setCustomer(null)
    setDiscount(null)
    setDeliveryCharge(0)
    setRounding(0)
    setNotes('')
    setReceiveAmount(0)
    setSelectedAggregator('')
    setSelectedPaymentMode('Cash')
  }

  return (
    <>
      <DefaultModaal show={showDefaultModal} onClose={() => setShowDefaultModal(false)} />

      <Row className="g-3">
        <Col lg={4}>
          <Card>
            <CardBody>
              <InputGroup className="mb-2">
                <FormControl 
                  placeholder="Search Menu..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>
              {/* category */}

              <Row>
                <Col lg={6}>
                  <div className="mb-2">
                    <select 
                      className="form-control form-select"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                      <option value="">Select Brands</option>
                      {brands.map((brand: any) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-2">
                    <select 
                      className="form-control form-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </Col>
              </Row>
              <Row className="g-3" style={{ height: 'auto', overflowY: 'auto' }}>
                {menus.map((menu: any, index: number) => {
                  const menuId = menu._id || menu.id
                  const imageUrl = menu.image || fallbackImages[index % fallbackImages.length]
                  // Use restaurant price as default, fallback to online price, then membership price
                  const price = menu.restaurantPrice || menu.onlinePrice || menu.membershipPrice || 0
                  return (
                    <Col xs={4} key={menuId}>
                      <div
                        className={`text-center p-2 border rounded-3 h-100 cursor-pointer 
                        ${selectedProducts[menuId] ? 'bg-success-subtle border-success' : 'bg-light'}`}
                        onClick={() => handleProductClick(menu)}>
                        <Image 
                          src={menu.image || imageUrl} 
                          alt={menu.title} 
                          className="mb-2 rounded" 
                          width={60} 
                          height={60} 
                          unoptimized={!!menu.image}
                        />
                        <div className="fw-semibold small " style={{ fontSize: '10px' }}>
                          {menu.title}
                        </div>
                        <div className="text-success fw-bold" style={{ fontSize: '10px' }}>
                          AED {price}
                        </div>
                      </div>
                    </Col>
                  )
                })}
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
                  <InputGroup>
                    <FormControl placeholder="Search..." />
                    <Button variant="outline-secondary">
                      <IconifyIcon icon="mdi:magnify" />
                    </Button>
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <CustomerModal 
                    onCustomerSelect={setCustomer}
                    selectedCustomer={customer}
                  />
                </Col>
              </Row>
              <div className="text-end mb-2">
                <Badge bg="dark" className="px-3 py-1 fs-6">
                  Order ID: {orderNo}
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
                    {Object.values(selectedProducts).map((product: any, index: number) => {
                      const productId = product._id || product.id
                      const imageUrl = product.image || fallbackImages[index % fallbackImages.length]
                      return (
                        <tr key={productId}>
                          <td>
                            <Image 
                              src={product.image || imageUrl} 
                              alt={product.title || product.name} 
                              width={40} 
                              height={40}
                              unoptimized={!!product.image}
                            />
                          </td>
                          <td>{product.title || product.name}</td>

                          <td>
                            <div className="d-flex gap-1 align-items-center">
                              <Button size="sm" onClick={() => handleQtyChange(productId, -1)}>
                                -
                              </Button>
                              <span className="px-2">{product.qty}</span>
                              <Button size="sm" onClick={() => handleQtyChange(productId, 1)}>
                                +
                              </Button>
                            </div>
                          </td>
                          <td>AED {(product.price * product.qty).toFixed(2)}</td>
                          <td>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(productId)}>
                              <IconifyIcon icon="mdi:delete" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="text-end">
                  <MoreOptions onOptionsChange={setMoreOptions} />
                </div>
              </div>

              <Row className="g-3">
                <Form.Group className="mb-3">
                  <Form.Label>Sub Total</Form.Label>
                  <Form.Control type="text" value={`AED ${subTotal.toFixed(2)}`} disabled />
                </Form.Group>

                {/* Left Side */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Receive Amount (AED)</Form.Label>
                    <Form.Control 
                      type="number" 
                      placeholder="Enter received amount" 
                      value={receiveAmount} 
                      onChange={(e) => setReceiveAmount(parseFloat(e.target.value) || 0)}
                      min={0} 
                    />
                    <Form.Text className="text-muted">Amount received from customer</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Aggregator</Form.Label>
                    <Form.Select 
                      value={selectedAggregator}
                      onChange={(e) => setSelectedAggregator(e.target.value)}
                    >
                      <option value="">Select aggregator</option>
                      {aggregators.map((agg: any) => (
                        <option key={agg._id} value={agg._id}>
                          {agg.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      placeholder="Add order notes..." 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
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
                  <PaymentModeSelector 
                    selectedMode={selectedPaymentMode}
                    onModeChange={setSelectedPaymentMode}
                    paymentMethods={paymentMethods}
                  />
                </Col>

                {/* Right Side */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Change Amount (AED)</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={`AED ${changeAmount > 0 ? changeAmount.toFixed(2) : '0.00'}`} 
                      disabled 
                    />
                    <Form.Text className="text-muted">Change to return (auto-calculated)</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>VAT (5%)</Form.Label>
                    <Form.Control type="text" value={`AED ${vatAmount.toFixed(2)}`} disabled />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Delivery Charge (AED)</Form.Label>
                    <Form.Control 
                      type="number" 
                      placeholder="Enter shipping charge" 
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                      min={0} 
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Total Amount</Form.Label>
                    <Form.Control type="text" value={`AED ${totalAmount.toFixed(2)}`} disabled />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Rounding (+/-)</Form.Label>
                    <Form.Control 
                      type="number" 
                      placeholder="Enter rounding adjustment" 
                      value={rounding}
                      onChange={(e) => setRounding(parseFloat(e.target.value) || 0)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-between bg-light p-3 border">
                <h5>Payable Amount:</h5>
                <h5 className="text-primary fw-bold">AED {totalAmount.toFixed(2)}</h5>
              </div>
            </CardBody>

            <CardFooter className="d-flex justify-content-between flex-wrap gap-1">
              <Button variant="warning" size="lg" onClick={handleReset}>
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
              <Button variant="primary" size="lg" onClick={handleSaveOrder}>
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
