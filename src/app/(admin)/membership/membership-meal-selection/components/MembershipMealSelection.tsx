'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Form, Button, InputGroup, FormControl, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Calculator from '@/app/pos/components/Calculator'
import PrintOrder from './PrintOrder'
import ItemMoreOptions from '@/app/pos/components/ItemMoreOptions'

// Product images
import product1 from '@/assets/images/order-view/1.webp'
import product2 from '@/assets/images/order-view/2.webp'
import product3 from '@/assets/images/order-view/3.webp'
import product4 from '@/assets/images/order-view/4.webp'

// Import API services
import { useGetMenusQuery } from '@/services/menuApi'
import { useGetBrandsQuery } from '@/services/brandApi'
import { useGetMenuCategoriesQuery } from '@/services/menuCategoryApi'
import { useGetUserMembershipByIdQuery, useUpdateUserMembershipMutation } from '@/services/userMembershipApi'
import { showSuccess, showError, showMealError } from '@/utils/sweetAlert'
import { useAccessControl } from '@/hooks/useAccessControl'

// Fallback images for menus
const fallbackImages = [product1, product2, product3, product4]

const MembershipMealSelection = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const membershipId = searchParams.get('id')
  const { hasAccessToPOSButton } = useAccessControl()

  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: any }>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [itemOptions, setItemOptions] = useState<{ [itemId: string]: string[] }>({})
  
  // Membership fields from punch form
  const [totalMeals, setTotalMeals] = useState(0)
  const [consumedMeals, setConsumedMeals] = useState(0)
  const [remainingMeals, setRemainingMeals] = useState(0)
  const [status, setStatus] = useState<'active' | 'expired' | 'cancelled' | 'completed'>('active')
  const [isActive, setIsActive] = useState(true)
  const [mealsToConsume, setMealsToConsume] = useState(0)

  const [updateUserMembership, { isLoading: isUpdating }] = useUpdateUserMembershipMutation()
  
  const { data: membershipData, isLoading: isLoadingMembership, refetch: refetchMembership } = useGetUserMembershipByIdQuery(membershipId || '', {
    skip: !membershipId
  })

  const { data: menusData } = useGetMenusQuery({ limit: 1000 })
  const { data: brandsData } = useGetBrandsQuery()
  const { data: categoriesData } = useGetMenuCategoriesQuery()

  // Load membership data
  useEffect(() => {
    if (membershipData) {
      setTotalMeals(membershipData.totalMeals || 0)
      setConsumedMeals(membershipData.consumedMeals || 0)
      setRemainingMeals(membershipData.remainingMeals || 0)
      setStatus(membershipData.status || 'active')
      setIsActive(membershipData.isActive !== false)
    }
  }, [membershipData])

  // Update remaining meals when consumed meals change
  useEffect(() => {
    setRemainingMeals(totalMeals - consumedMeals)
  }, [totalMeals, consumedMeals])

  // Redirect if no membership ID
  useEffect(() => {
    if (!membershipId) {
      router.push('/membership/user-membership')
    }
  }, [membershipId, router])

  const brands = brandsData || []
  const categories = categoriesData || []
  
  // Filter menus based on search, brand, and category
  const menus = (menusData?.data || []).filter((menu: any) => {
    const matchesSearch = !searchQuery || 
      menu.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = !selectedBrand || menu.brand === selectedBrand
    const matchesCategory = !selectedCategory || menu.category === selectedCategory
    
    return matchesSearch && matchesBrand && matchesCategory
  })

  const handleProductClick = (menu: any) => {
    const id = menu._id || menu.id
    // Use membership price if available, otherwise use restaurant price
    const price = menu.membershipTotalPrice || menu.restaurantTotalPrice || menu.onlineTotalPrice || 0
    
    setSelectedProducts(prev => {
      const uniqueId = `${id}_${Date.now()}`
      return {
        ...prev,
        [uniqueId]: {
          ...menu,
          price: price,
          qty: 1,
        },
      }
    })
  }

  const handleQtyChange = (id: string, delta: number) => {
    setSelectedProducts((prev) => {
      const updatedQty = Math.max(1, (prev[id]?.qty || 1) + delta)
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
    setItemOptions((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const handleItemOptionsChange = (itemId: string, options: string[]) => {
    setItemOptions((prev) => ({
      ...prev,
      [itemId]: options
    }))
  }

  // Calculate subtotal
  const subTotal = Object.values(selectedProducts).reduce((sum: number, product: any) => {
    return sum + (product.price * product.qty)
  }, 0)

  // Calculate meals to consume from selected products (for display)
  const calculatedMealsToConsume = Object.values(selectedProducts).reduce((sum: number, product: any) => {
    return sum + product.qty
  }, 0)

  // Update mealsToConsume when selected products change
  useEffect(() => {
    setMealsToConsume(calculatedMealsToConsume)
  }, [calculatedMealsToConsume])

  // Generate order number
  const generateOrderNumber = () => {
    return `#${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  }

  const [orderNo] = useState(generateOrderNumber())

  // Handle Punch (Save)
  const handlePunch = async () => {
    if (!membershipId) {
      showMealError('Membership ID is required')
      return
    }

    if (mealsToConsume === 0) {
      showMealError('Please select at least one meal item')
      return
    }

    if (mealsToConsume > remainingMeals) {
      showMealError(`Cannot consume ${mealsToConsume} meals. Only ${remainingMeals} meals remaining.`)
      return
    }

    try {
      // Prepare meal items from selected products
      const mealItems = Object.entries(selectedProducts).map(([uniqueId, product]: [string, any]) => ({
        productId: product._id || product.id || uniqueId,
        title: product.title || product.name,
        qty: product.qty,
        punchingTime: new Date().toISOString(),
        mealType: 'general',
        moreOptions: (itemOptions[uniqueId] || []).map((option: string) => ({ name: option })),
        branchId: '', // You can add branch ID if needed
        createdBy: '', // You can add staff ID if needed
      }))

      // Send only the increment (mealsToConsume) and let backend calculate totals
      await updateUserMembership({
        id: membershipId,
        consumedMeals: mealsToConsume, // Send only the increment, not total
        mealItems: mealItems,
        status: status,
        isActive: isActive
      } as any).unwrap()

      showSuccess('Membership meal selection punched successfully!')
      
      // Reset form
      setSelectedProducts({})
      setItemOptions({})
      setMealsToConsume(0)
      
      // Refresh membership data to get updated values from backend
      await refetchMembership()
    } catch (error: any) {
      // Show proper meal validation error instead of payment error
      const errorMessage = error?.data?.message || error?.message || 'Failed to punch membership meal selection'
      
      // Always show meal error popup for meal-related errors
      showMealError(errorMessage)
    }
  }

  // Handle Reset
  const handleReset = () => {
    setSelectedProducts({})
    setItemOptions({})
  }

  if (isLoadingMembership) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!membershipData) {
    return (
      <div className="alert alert-danger">
        Membership not found. Please select a valid membership.
      </div>
    )
  }

  return (
    <>
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
              
              <Row className="g-3" style={{ height: 'auto', overflowY: 'auto', maxHeight: '600px' }}>
                {menus.map((menu: any, index: number) => {
                  const menuId = menu._id || menu.id
                  const imageUrl = menu.image || fallbackImages[index % fallbackImages.length]
                  const price = menu.membershipTotalPrice || menu.restaurantTotalPrice || menu.onlineTotalPrice || 0
                  
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
                        <div className="fw-semibold small" style={{ fontSize: '10px' }}>
                          {menu.title}
                        </div>
                        <div className="text-muted" style={{ fontSize: '8px' }}>
                          MEMBERSHIP MEAL
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
              <Calculator />
              <Link href="/meal-plan/meal-plan-list" className="btn btn-lg btn-success">
                <IconifyIcon icon="mdi:food-variant" /> Meal Plan List
              </Link>
              <Link href="/dashboard" className="btn btn-lg btn-dark">
                <IconifyIcon icon="mdi:view-dashboard-outline" /> Dashboard
              </Link>
            </CardHeader>

            <CardBody>
              {/* Membership Information */}
              <Row className="g-2 mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Total Meals</Form.Label>
                    <Form.Control type="text" value={totalMeals} readOnly className="bg-light" />
                    <Form.Text className="text-muted">Total meals in membership</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Consumed Meals</Form.Label>
                    <Form.Control type="text" value={consumedMeals} readOnly className="bg-light" />
                    <Form.Text className="text-muted">Meals already consumed</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Remaining Meals</Form.Label>
                    <Form.Control type="text" value={remainingMeals} readOnly className="bg-light" />
                    <Form.Text className="text-muted">Calculated automatically</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Is Active</Form.Label>
                    <Form.Select
                      value={isActive ? 'true' : 'false'}
                      onChange={(e) => setIsActive(e.target.value === 'true')}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-end mb-2">
                <Badge bg="dark" className="px-3 py-1 fs-6">
                  Order ID: {orderNo}
                </Badge>
              </div>

              {/* Order Table */}
              <div className="table-responsive mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="table table-bordered">
                  <thead className="table-light" style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 10 }}>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Qty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedProducts).map(([uniqueId, product]: [string, any], index: number) => {
                      const imageUrl = product.image || fallbackImages[index % fallbackImages.length]
                      const itemSubTotal = product.price * product.qty
                      
                      return (
                        <tr key={uniqueId}>
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
                              <Button size="sm" variant="success" onClick={() => handleQtyChange(uniqueId, -1)}>
                                -
                              </Button>
                              <span className="px-2">{product.qty}</span>
                              <Button size="sm" variant="success" onClick={() => handleQtyChange(uniqueId, 1)}>
                                +
                              </Button>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-1 align-items-center">
                              <ItemMoreOptions
                                itemId={uniqueId}
                                itemName={product.title || product.name}
                                onOptionsChange={handleItemOptionsChange}
                                currentOptions={itemOptions[uniqueId] || []}
                              />
                              <Button size="sm" variant="danger" onClick={() => handleDelete(uniqueId)}>
                                <IconifyIcon icon="mdi:delete" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <Row className="g-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Meals to Consume</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={mealsToConsume} 
                      onChange={(e) => {
                        const newMealsToConsume = parseInt(e.target.value) || 0
                        setMealsToConsume(newMealsToConsume)
                      }}
                      min="0"
                      max={remainingMeals}
                      className="border-primary"
                    />
                    <Form.Text className={mealsToConsume > remainingMeals ? 'text-danger' : 'text-muted'}>
                      {mealsToConsume > remainingMeals 
                        ? `Exceeds remaining meals (${remainingMeals})` 
                        : `${remainingMeals - mealsToConsume} meals remaining after consumption`}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </CardBody>

            <CardFooter className="d-flex justify-content-between flex-wrap gap-1">
              <Button variant="warning" size="lg" onClick={handleReset}>
                <IconifyIcon icon="mdi:restart" /> Reset
              </Button>
              {hasAccessToPOSButton('print-order') && <PrintOrder 
                selectedProducts={selectedProducts}
                itemOptions={itemOptions}
                membershipData={membershipData}
                orderNo={orderNo}
              />}
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handlePunch}
                disabled={isUpdating || mealsToConsume === 0 || mealsToConsume > remainingMeals}
              >
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Punching...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="mdi:content-save-outline" /> Punch
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default MembershipMealSelection

