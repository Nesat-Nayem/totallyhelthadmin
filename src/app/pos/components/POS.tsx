'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Form, Button, InputGroup, FormControl, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CustomerModal from './CustomerModal'
import Calculator from './Calculator'
import PrintOrder from './PrintOrder'
import ReportModal from '@/app/(admin)/reports/day-close-report/components/ReportModal'
import ViewOrder from './ViewOrders'
import ThermalReceipt from './ThermalReceipt'
import { printThermalReceipt } from '@/utils/thermalPrint'

// Product images
import product1 from '@/assets/images/order-view/1.webp'
import product2 from '@/assets/images/order-view/2.webp'
import product3 from '@/assets/images/order-view/3.webp'
import product4 from '@/assets/images/order-view/4.webp'
import DefaultModaal from './DefaultModaal'
import ItemMoreOptions from './ItemMoreOptions'
import SplitBillModal from './SplitBillModal'
import PaymentModeSelector from './PaymentModeSelector'
import DiscountModal from './DiscountModal'
import ShiftStartModal from './ShiftStartModal'
import ShiftCloseModal from './ShiftCloseModal'

// Import API services
import { useGetMenusQuery } from '@/services/menuApi'
import { useGetMealPlansQuery } from '@/services/mealPlanApi'
import { useGetBrandsQuery } from '@/services/brandApi'
import { useGetMenuCategoriesQuery } from '@/services/menuCategoryApi'
import { useGetAggregatorsQuery } from '@/services/aggregatorApi'
import { useGetPaymentMethodsQuery } from '@/services/paymentMethodApi'
import { useCreateOrderMutation, useUpdateOrderMutation } from '@/services/orderApi'
import { useDispatch as useRTKDispatch } from 'react-redux'
import { orderApi } from '@/services/orderApi'
import { useGetOpenDayCloseQuery, useStartDayCloseMutation, useCloseDayCloseMutation } from '@/services/dayCloseApi'
import { useCreateCustomerMutation } from '@/services/customerApi'
import { useGetCurrentShiftQuery, useStartShiftMutation, useCloseShiftMutation } from '@/services/shiftApi'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { showOrderTypeModal as showOrderTypeModalAction, hideOrderTypeModal, setEditMode, exitEditMode, updateCurrentOrderData, clearCurrentOrderData } from '@/store/slices/posSlice'
import { showCustomerRequiredAlert, showSuccess, showError } from '@/utils/sweetAlert'
import { useAccessControl } from '@/hooks/useAccessControl'

// Fallback images for menus
const fallbackImages = [product1, product2, product3, product4]

const orderTypes = ['DineIn', 'TakeAway', 'Delivery']
const POS = () => {
  const dispatch = useDispatch()
  const rtkDispatch = useRTKDispatch()
  const router = useRouter()
  const { selectedOrderType, selectedPriceType, showOrderTypeModal, editingOrder, isEditMode } = useSelector((state: RootState) => state.pos)
  const { hasAccessToPOSButton } = useAccessControl()
  
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: any }>({})
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discount, setDiscount] = useState<{ type: string; amount: number; reason: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [itemOptions, setItemOptions] = useState<{ [itemId: string]: string[] }>({})
  const [selectedAggregator, setSelectedAggregator] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('Cash')
  const [receiveAmount, setReceiveAmount] = useState(0)
  const [cumulativePaid, setCumulativePaid] = useState(0)
  const [originalCumulativePaid, setOriginalCumulativePaid] = useState(0) // Track original cumulative paid when editing
  const [payments, setPayments] = useState<Array<{ type: 'Cash' | 'Card' | 'Gateway'; methodType: 'direct' | 'split'; amount: number }>>([])
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [newPaymentType, setNewPaymentType] = useState<'Cash' | 'Card' | 'Gateway'>('Cash')
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>('')
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [rounding, setRounding] = useState(0)
  const [vatPercent, setVatPercent] = useState(5) // Default VAT% is 5%
  const [notes, setNotes] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('S-001')
  const [orderNo, setOrderNo] = useState('#001')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [orderToPrint, setOrderToPrint] = useState<any>(null) // For automatic printing after save

  // Helper to generate a unique bill number
  const generateUniqueBillNumber = () => {
    const prefix = 'INV-';
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}-${random}`;
  };

  // Calculate totals first
  const subTotal = Object.values(selectedProducts).reduce((sum, p: any) => sum + (p.price || 0) * p.qty, 0)
  
  // VAT calculations - Sub Total already includes VAT, so we extract it
  // Formula: Base Price = Sub Total / (1 + VAT%/100)
  // Example: If Sub Total = 315 and VAT = 5%, then Base Price = 315 / 1.05 = 300
  const totalWithVAT = subTotal // Sub Total already includes VAT
  const basePriceWithoutVAT = subTotal / (1 + vatPercent / 100) // Extract base price from total that includes VAT
  const vatAmount = totalWithVAT - basePriceWithoutVAT // VAT amount = Total with VAT - Base Price
  
  // Discount is applied on the total amount (with VAT)
  const discountAmountApplied = discount
    ? (discount.type?.toLowerCase?.() === 'percent'
        ? (totalWithVAT * (discount.amount || 0)) / 100
        : (discount.amount || 0))
    : 0
  
  // Total calculation: total with VAT - discount + delivery charge + rounding
  const totalBeforeRounding = totalWithVAT - discountAmountApplied + deliveryCharge
  const totalAmount = totalBeforeRounding + rounding
  
  const payableAmount = Math.max(0, totalAmount - cumulativePaid)
  const changeAmount = Math.max(0, cumulativePaid - totalAmount)

  // Function to sync current order data with Redux and localStorage
  const syncOrderData = () => {
    const orderData = {
      selectedProducts,
      itemOptions,
      customer,
      discount,
      deliveryCharge,
      rounding,
      vatPercent,
      basePriceWithoutVAT,
      vatAmount,
      totalWithVAT,
      notes,
      receiveAmount,
      cumulativePaid,
      payments,
      selectedAggregator,
      invoiceNo,
      orderNo,
      startDate,
      endDate,
      subTotal,
      totalAmount,
      payableAmount,
      changeAmount,
      discountAmountApplied,
      selectedOrderType,
      selectedPriceType,
    }
    
    // Update Redux state
    dispatch(updateCurrentOrderData(orderData))
    
    // Update localStorage for persistence
    localStorage.setItem('currentOrderData', JSON.stringify(orderData))
  }
  
  // Reset filters when switching between different order types
  useEffect(() => {
    // Reset to default values when switching order types
    setSelectedBrand('')
    setSelectedCategory('')
  }, [selectedOrderType])

  // Sync order data whenever any order-related state changes
  useEffect(() => {
    syncOrderData()
  }, [
    selectedProducts,
    itemOptions,
    customer,
    discount,
    deliveryCharge,
    rounding,
    vatPercent,
    notes,
    receiveAmount,
    cumulativePaid,
    payments,
    selectedAggregator,
    invoiceNo,
    orderNo,
    startDate,
    endDate,
    subTotal,
    totalAmount,
    payableAmount,
    changeAmount,
    discountAmountApplied,
    selectedOrderType,
    selectedPriceType,
  ])

  // Load order data from localStorage on component mount
  useEffect(() => {
    const savedOrderData = localStorage.getItem('currentOrderData')
    if (savedOrderData && !isEditMode) {
      try {
        const parsedData = JSON.parse(savedOrderData)
        // Only load if we're not in edit mode to avoid conflicts
        if (parsedData && Object.keys(parsedData).length > 0) {
          dispatch(updateCurrentOrderData(parsedData))
          // Restore invoice number if it exists
          if (parsedData.invoiceNo) {
            setInvoiceNo(parsedData.invoiceNo)
          } else {
            // Generate new invoice number if none exists
            setInvoiceNo(generateUniqueBillNumber())
          }
          // Restore VAT% if it exists
          if (parsedData.vatPercent !== undefined) {
            setVatPercent(parsedData.vatPercent)
          }
        }
      } catch (error) {
        console.error('Error parsing saved order data:', error)
        localStorage.removeItem('currentOrderData')
        // Generate new invoice number on error
        setInvoiceNo(generateUniqueBillNumber())
      }
    } else {
      // Generate new invoice number for fresh order or when no saved data
      setInvoiceNo(generateUniqueBillNumber())
    }
  }, [dispatch, isEditMode])

  // Ensure we always have a unique invoice number on component mount
  useEffect(() => {
    // Generate invoice number if it's still the default 'S-001'
    if (invoiceNo === 'S-001') {
      setInvoiceNo(generateUniqueBillNumber())
    }
  }, [])

  // Handle edit mode - populate form with existing order data
  useEffect(() => {
    if (isEditMode && editingOrder) {
      // Set order type and price type
      const orderType = editingOrder.orderType || 'DineIn'
      const priceType = editingOrder.salesType === 'membership' ? 'membership' : 
                       editingOrder.salesType === 'restaurant' ? 'restaurant' : 'online'
      
      // Populate selected products and item options
      const products: { [key: string]: any } = {}
      const options: { [itemId: string]: string[] } = {}
      
      if (editingOrder.items && editingOrder.items.length > 0) {
        editingOrder.items.forEach((item: any, index: number) => {
          const uniqueId = `${item.productId}_${Date.now()}_${index}`
          products[uniqueId] = {
            _id: item.productId,
            title: item.title,
            price: item.price,
            qty: item.qty,
          }
          
          // Load existing more options for this item
          if (item.moreOptions && item.moreOptions.length > 0) {
            options[uniqueId] = item.moreOptions.map((option: any) => option.name)
          }
        })
      }
      
      setSelectedProducts(products)
      setItemOptions(options) // Set the existing more options
      
      // Set other form fields
      setCustomer(editingOrder.customer || null)
      setSelectedPaymentMode(editingOrder.paymentMode || 'Cash')
      setReceiveAmount(editingOrder.receiveAmount || 0)
      setCumulativePaid(editingOrder.cumulativePaid || 0)
      setOriginalCumulativePaid(editingOrder.cumulativePaid || 0) // Store original cumulative paid amount
      setDeliveryCharge(editingOrder.shippingCharge || 0)
      setRounding(editingOrder.rounding || 0)
      setVatPercent(editingOrder.vatPercent || 5) // Load VAT% from order or default to 5%
      setNotes(editingOrder.note || '')
      setInvoiceNo(editingOrder.invoiceNo || 'S-001')
      setOrderNo(editingOrder.orderNo || '#001')
      setStartDate(editingOrder.startDate || new Date().toISOString().split('T')[0])
      setEndDate(editingOrder.endDate || new Date().toISOString().split('T')[0])
      
      // Set discount if exists
      if (editingOrder.discountAmount && editingOrder.discountAmount > 0) {
        setDiscount({
          type: 'amount',
          amount: editingOrder.discountAmount,
          reason: 'Edit mode discount'
        })
      }
    }
  }, [isEditMode, editingOrder])

  // Handle order data from sessionStorage (when navigating from reports)
  useEffect(() => {
    const checkForEditOrderData = () => {
      try {
        const editOrderData = sessionStorage.getItem('editOrderData')
        if (editOrderData) {
          const orderData = JSON.parse(editOrderData)
          
          // Determine order type and price type from the order data
          const orderType = orderData.orderType || 'DineIn'
          const priceType = orderData.salesType === 'membership' ? 'membership' : 
                           orderData.salesType === 'restaurant' ? 'restaurant' : 'online'
          
          // Set edit mode in Redux
          dispatch(setEditMode({ orderData, orderType, priceType }))
          
          // Clear the sessionStorage data
          sessionStorage.removeItem('editOrderData')
        }
      } catch (error) {
        console.error('Error parsing edit order data:', error)
        sessionStorage.removeItem('editOrderData')
      }
    }

    // Check for edit order data on component mount
    checkForEditOrderData()
  }, [dispatch])
  
  // Fetch data from APIs
  const { data: brandsData } = useGetBrandsQuery()
  const { data: categoriesData } = useGetMenuCategoriesQuery()
  const { data: aggregatorsData } = useGetAggregatorsQuery()
  const { data: paymentMethodsData } = useGetPaymentMethodsQuery()
  const [createOrder] = useCreateOrderMutation()
  const [updateOrder] = useUpdateOrderMutation()
  const { data: openDayRes, refetch: refetchOpenDay } = useGetOpenDayCloseQuery()
  const [startDayClose, { isLoading: isStartingDay }] = useStartDayCloseMutation()
  const [closeDayClose] = useCloseDayCloseMutation()
  const openDay = openDayRes?.data
  const [showDayReportModal, setShowDayReportModal] = useState(false)
  const [dayReportData, setDayReportData] = useState<any>(null)
  
  // Shift-related state
  const [showShiftStartModal, setShowShiftStartModal] = useState(false)
  const [showShiftCloseModal, setShowShiftCloseModal] = useState(false)
  const { data: currentShiftData, refetch: refetchCurrentShift } = useGetCurrentShiftQuery()
  const [startShift] = useStartShiftMutation()
  const [closeShift] = useCloseShiftMutation()
  const currentShift = currentShiftData?.data
  
  // Get menus with filters - using proper menu API with search, brand, category, and price type filtering
  // For membershipMeal orders, use master menu API; for regular membership (New Membership), use meal plan API
  const { data: menusData } = useGetMenusQuery(
    selectedOrderType !== 'NewMembership' && (searchQuery || selectedBrand || selectedCategory || selectedPriceType)
      ? {
          q: searchQuery || undefined,
          brand: selectedBrand || undefined,
          category: selectedCategory || undefined,
          priceType: selectedPriceType || undefined,
          limit: 100
        }
      : selectedOrderType !== 'NewMembership' ? { limit: 100 } : undefined
  )

  // Get meal plans for New Membership orders (orderType: 'membership')
  const { data: mealPlansData } = useGetMealPlansQuery(
    selectedOrderType === 'NewMembership'
      ? {
          q: searchQuery || undefined,
          brand: selectedBrand || undefined,
          category: selectedCategory || undefined,
          limit: 100
        }
      : undefined
  )
  
  // Use meal plan brands and categories for New Membership orders, master menu ones for others
  const brands = selectedOrderType === 'NewMembership' 
    ? [
        { _id: 'Totally Health', name: 'Totally Health' },
        { _id: 'Subway', name: 'Subway' },
        { _id: 'Pizza Hut', name: 'Pizza Hut' },
        { _id: 'Burger King', name: 'Burger King' }
      ]
    : (brandsData ?? [])
    
  const categories = selectedOrderType === 'NewMembership'
    ? [
        { _id: 'Weight Loss', title: 'Weight Loss' },
        { _id: 'Weight Gain', title: 'Weight Gain' },
        { _id: 'Fat Loss', title: 'Fat Loss' },
        { _id: 'Muscle Gain', title: 'Muscle Gain' },
        { _id: 'Healthy Diet', title: 'Healthy Diet' },
        { _id: 'Healthy Lifestyle', title: 'Healthy Lifestyle' },
        { _id: 'Healthy Eating', title: 'Healthy Eating' }
      ]
    : (categoriesData ?? [])
    
  const aggregators = aggregatorsData ?? []
  const paymentMethods = paymentMethodsData ?? []
  
  // Use meal plans for New Membership orders, master menu data for others including Membership Meal
  const menus = selectedOrderType === 'NewMembership'
    ? (mealPlansData?.data ?? []).map((mealPlan: any) => ({
        ...mealPlan,
        // Map meal plan fields to menu fields for compatibility
        title: mealPlan.title,
        image: mealPlan.thumbnail || (mealPlan.images && mealPlan.images[0]),
        // Use delPrice (discounted price) for new membership if available, otherwise fallback to regular price
        membershipTotalPrice: mealPlan.delPrice || mealPlan.price,
        membershipPrice: mealPlan.delPrice || mealPlan.price,
        // Set other price types to 0 or undefined for membership-only items
        restaurantTotalPrice: 0,
        restaurantPrice: 0,
        onlineTotalPrice: 0,
        onlinePrice: 0,
        // Add category and brand info
        category: mealPlan.category,
        brands: mealPlan.brand ? [mealPlan.brand] : [],
      }))
    : (menusData?.data ?? [])

  const handleProductClick = (menu: any) => {
    const id = menu._id || menu.id
    // Use total price (including VAT) based on selected price type
    const price = selectedPriceType === 'restaurant' ? menu.restaurantTotalPrice :
                  selectedPriceType === 'online' ? menu.onlineTotalPrice :
                  selectedPriceType === 'membership' ? menu.membershipTotalPrice :
                  menu.restaurantTotalPrice || menu.onlineTotalPrice || menu.membershipTotalPrice || 0
    
    setSelectedProducts(prev => {
      // Always create a new separate record for each click
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
    // Also remove item options when item is deleted
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

  // Payment split handlers
  const handleAddPayment = () => {
    const amt = parseFloat(newPaymentAmount)
    if (isNaN(amt) || amt <= 0) return
    setPayments((prev) => [...prev, { type: newPaymentType, methodType: 'split', amount: amt }])
    setNewPaymentAmount('')
    setShowAddPayment(false)
  }

  const handleRemovePayment = (index: number) => {
    setPayments((prev) => {
      const newPayments = prev.filter((_, i) => i !== index)
      // If all payments are removed, keep the current cumulativePaid value
      // Don't reset it to 0
      return newPayments
    })
  }

  // If there are split payments, keep receiveAmount and cumulativePaid in sync as the sum
  // Only update when payments array changes, not when it's empty
  useEffect(() => {
    if (payments.length > 0) {
      const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      setReceiveAmount(total)
      
      if (isEditMode) {
        // In edit mode, cumulative paid = original cumulative + new split payments
        setCumulativePaid(originalCumulativePaid + total)
      } else {
        // In create mode, cumulative paid equals split payments total
        setCumulativePaid(total)
      }
    }
    // Don't reset to 0 when payments array is empty - preserve manual input
  }, [payments, isEditMode, originalCumulativePaid])

  // VAT% logic - COMMENTED OUT (VAT calculation disabled)
  // const vatPercent = 5
  // const vatAmount = ((subTotal + moreOptionsTotal) * vatPercent) / 100

  const [showDefaultModal, setShowDefaultModal] = useState(false)

  useEffect(() => {
    setShowDefaultModal(true)
  }, [])

  const handleStartDay = async () => {
    try {
      const result = await startDayClose({
        startTime: new Date().toISOString(),
        note: 'Day started from POS system'
      }).unwrap()
      
      await refetchOpenDay()
      showSuccess('Day started successfully')
    } catch (e: any) {
      console.error('Start day error:', e)
      
      // Check if it's a network error
      if (e?.status === 'FETCH_ERROR' || e?.error === 'FETCH_ERROR') {
        showError('Unable to connect to server. Please check your internet connection and try again.')
      } else if (e?.status === 404) {
        showError('Day start endpoint not found. Please contact support.')
      } else if (e?.status === 500) {
        showError('Server error occurred. Please try again later.')
      } else {
        showError(e?.data?.message || e?.message || 'Failed to start day. Please try again.')
      }
    }
  }

  const handleCloseDay = async () => {
    try {
      if (!openDay?._id) {
        showError('No open day found')
        return
      }
      const res = await closeDayClose({ id: String(openDay._id), endTime: new Date().toISOString() }).unwrap()
      setDayReportData(res?.data)
      setShowDayReportModal(true)
      await refetchOpenDay()
    } catch (e: any) {
      showError(e?.data?.message || 'Failed to close day')
    }
  }

  // Shift handlers
  const handleStartShift = () => {
    setShowShiftStartModal(true)
  }

  const handleCloseShift = () => {
    setShowShiftCloseModal(true)
  }

  const handleShiftStartSuccess = async () => {
    await refetchCurrentShift()
    // Invalidate order cache to refresh paid/unpaid lists
    rtkDispatch(orderApi.util.invalidateTags([{ type: 'Order', id: 'PAID_TODAY' }, { type: 'Order', id: 'UNPAID_TODAY' }]))
    showSuccess('Shift started successfully')
  }

  const handleShiftCloseSuccess = async () => {
    await refetchCurrentShift()
    // Invalidate order cache to refresh paid/unpaid lists
    rtkDispatch(orderApi.util.invalidateTags([{ type: 'Order', id: 'PAID_TODAY' }, { type: 'Order', id: 'UNPAID_TODAY' }]))
    showSuccess('Shift closed successfully')
  }
  
  const handleSaveOrder = async () => {
    try {
      // Check if this is a membership order and customer is required
      if ((selectedOrderType === 'NewMembership' || selectedOrderType === 'MembershipMeal') && !customer) {
        const shouldProceed = await showCustomerRequiredAlert()
        if (!shouldProceed) {
          return // User cancelled, don't proceed with save
        }
        // If user clicked "Select Customer", we still need to wait for them to select one
        if (!customer) {
          return // Don't proceed without customer
        }
      }

      const orderData = {
        // customer object - now optional for non-membership orders, required for membership
        customer: customer ? {
          id: customer._id || customer.id,
          name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          phone: customer.phone || customer.mobile || '',
        } : undefined,
        items: Object.entries(selectedProducts).map(([uniqueId, p]: [string, any]) => ({
          productId: p._id || p.id,
          title: p.title || p.name,
          price: p.price,
          qty: p.qty,
          moreOptions: (itemOptions[uniqueId] || []).map(optionName => ({ name: optionName }))
        })),
        date: startDate,  // Required field
        subTotal,
        total: totalAmount,  // Required field
        vatPercent,
        vatAmount,
        basePriceWithoutVAT,
        totalWithVAT,
        discountType: discount ? (discount.type?.toLowerCase?.() === 'percent' ? 'percent' : 'flat') as 'flat' | 'percent' : undefined,
        discountAmount: discountAmountApplied,
        shippingCharge: deliveryCharge,
        rounding,
        payableAmount,
        receiveAmount,
        cumulativePaid,
        changeAmount,
        dueAmount: payableAmount,
        note: notes,  // Field is 'note' not 'notes'
        payments: payments.length === 0 
          ? [{ type: selectedPaymentMode as 'Cash' | 'Card' | 'Gateway', methodType: 'direct' as const, amount: receiveAmount }]
          : payments,
        salesType: ((selectedOrderType === 'NewMembership' || selectedOrderType === 'MembershipMeal') ? 'membership' : selectedPriceType === 'online' ? 'online' : selectedPriceType === 'restaurant' ? 'restaurant' : undefined) as 'restaurant' | 'online' | 'membership' | undefined,
        orderType: selectedOrderType as 'DineIn' | 'TakeAway' | 'Delivery' | 'online' | 'NewMembership' | 'MembershipMeal' | undefined,
        aggregatorId: selectedAggregator || undefined,
        brand: selectedBrand || undefined,
        startDate,
        endDate,
        status: (cumulativePaid >= totalAmount ? 'paid' : 'unpaid') as 'paid' | 'unpaid'  // Ensure correct type
      }
      
      let result
      const isPaid = cumulativePaid >= totalAmount || payableAmount === 0
      
      if (isEditMode && editingOrder) {
        // Update existing order (called from Settle Bill button)
        result = await updateOrder({ id: editingOrder._id, data: orderData }).unwrap()
        showSuccess(`Order updated successfully! Invoice: ${result.invoiceNo}, Order: ${result.orderNo || ''}`)
        
        // Exit edit mode after successful update
        dispatch(exitEditMode())
        
        // Invalidate order cache to refresh paid/unpaid lists
        rtkDispatch(orderApi.util.invalidateTags([{ type: 'Order', id: 'PAID_TODAY' }, { type: 'Order', id: 'UNPAID_TODAY' }]))
        
        // Auto-print receipts if order is paid (Settle Bill)
        if (isPaid) {
          // Prepare order data for printing (merge result with current order data)
          const printData = {
            ...orderData,
            ...result,
            invoiceNo: result.invoiceNo || invoiceNo,
            orderNo: result.orderNo || orderNo,
            selectedProducts,
            itemOptions,
            customer,
            discount,
            deliveryCharge,
            rounding,
            vatPercent,
            basePriceWithoutVAT,
            vatAmount,
            totalWithVAT,
            notes,
            receiveAmount,
            cumulativePaid,
            payments,
            selectedAggregator,
            startDate,
            endDate,
            subTotal,
            totalAmount,
            payableAmount,
            changeAmount,
            discountAmountApplied,
            selectedOrderType,
            selectedPriceType,
          }
          setOrderToPrint(printData)
          
          // Wait for ThermalReceipt components to render, then print
          setTimeout(() => {
            printThermalReceipt('customer')
            setTimeout(() => {
              printThermalReceipt('kitchen')
              // Clear print data after printing
              setTimeout(() => setOrderToPrint(null), 1000)
            }, 500)
          }, 300)
        }
        
        // Optionally navigate back to reports after successful update
        // Uncomment the line below if you want automatic navigation back to reports
        // setTimeout(() => router.push('/reports/all-income'), 2000)
      } else {
        // Create new order (called from Save button)
        result = await createOrder(orderData).unwrap()
        showSuccess(`Order created successfully! Invoice: ${result.invoiceNo}, Order: ${result.orderNo || ''}`)
        
        // Invalidate order cache to refresh paid/unpaid lists
        rtkDispatch(orderApi.util.invalidateTags([{ type: 'Order', id: 'PAID_TODAY' }, { type: 'Order', id: 'UNPAID_TODAY' }]))
        
        // Auto-print receipts if order is paid (Save button)
        if (isPaid) {
          // Prepare order data for printing (merge result with current order data)
          const printData = {
            ...orderData,
            ...result,
            invoiceNo: result.invoiceNo || invoiceNo,
            orderNo: result.orderNo || orderNo,
            selectedProducts,
            itemOptions,
            customer,
            discount,
            deliveryCharge,
            rounding,
            vatPercent,
            basePriceWithoutVAT,
            vatAmount,
            totalWithVAT,
            notes,
            receiveAmount,
            cumulativePaid,
            payments,
            selectedAggregator,
            startDate,
            endDate,
            subTotal,
            totalAmount,
            payableAmount,
            changeAmount,
            discountAmountApplied,
            selectedOrderType,
            selectedPriceType,
          }
          setOrderToPrint(printData)
          
          // Wait for ThermalReceipt components to render, then print
          setTimeout(() => {
            printThermalReceipt('customer')
            setTimeout(() => {
              printThermalReceipt('kitchen')
              // Clear print data after printing
              setTimeout(() => setOrderToPrint(null), 1000)
            }, 500)
          }, 300)
        }
      }
      
      // Reset form
      setSelectedProducts({})
      setItemOptions({})
      setCustomer(null)
      setDiscount(null)
      setDeliveryCharge(0)
      setRounding(0)
      setVatPercent(5) // Reset VAT% to default 5%
      setNotes('')
      setReceiveAmount(0)
      setCumulativePaid(0)
      setOriginalCumulativePaid(0)
      setPayments([])
      
      // Clear Redux state and localStorage after successful save
      dispatch(clearCurrentOrderData())
      localStorage.removeItem('currentOrderData')
    } catch (error: any) {
      const action = isEditMode ? 'update' : 'create'
      showError(error?.data?.message || `Failed to ${action} order`)
    }
  }

  const handleEditOrder = (orderData: any) => {
    // Determine order type and price type from the order data
    const orderType = orderData.orderType || 'DineIn'
    const priceType = orderData.salesType === 'membership' ? 'membership' : 
                     orderData.salesType === 'restaurant' ? 'restaurant' : 'online'
    
    // Add source identifier for ViewOrders
    const orderDataWithSource = {
      ...orderData,
      editSource: 'viewOrders'
    }
    
    // Set edit mode in Redux
    dispatch(setEditMode({ orderData: orderDataWithSource, orderType, priceType }))
  }
  
  const handleReset = () => {
    setSelectedProducts({})
    setItemOptions({})
    setCustomer(null)
    setDiscount(null)
    setDeliveryCharge(0)
    setRounding(0)
    setVatPercent(5) // Reset VAT% to default 5%
    setNotes('')
    setReceiveAmount(0)
    setCumulativePaid(0)
    setOriginalCumulativePaid(0)
    setSelectedAggregator('')
    setSelectedPaymentMode('Cash')
    setPayments([])
    setShowAddPayment(false)
    setNewPaymentType('Cash')
    setNewPaymentAmount('')
    
    // Generate new invoice number for new order
    setInvoiceNo(generateUniqueBillNumber())
    
    // Clear Redux state and localStorage
    dispatch(clearCurrentOrderData())
    localStorage.removeItem('currentOrderData')
    
    // Exit edit mode if in edit mode
    if (isEditMode) {
      dispatch(exitEditMode())
    }
  }

  return (
    <>
      <DefaultModaal show={showOrderTypeModal} onClose={() => dispatch(hideOrderTypeModal())} />
      <ReportModal show={showDayReportModal} onClose={() => setShowDayReportModal(false)} data={dayReportData || undefined} />
      
      {/* Hidden Thermal Receipt Components for Auto-Printing */}
      {orderToPrint && (
        <>
          <ThermalReceipt orderData={orderToPrint} receiptType="customer" />
          <ThermalReceipt orderData={orderToPrint} receiptType="kitchen" />
        </>
      )}
      
      {/* Shift Modals */}
      <ShiftStartModal
        show={showShiftStartModal}
        onHide={() => setShowShiftStartModal(false)}
        onSuccess={handleShiftStartSuccess}
      />
      
      <ShiftCloseModal
        show={showShiftCloseModal}
        onHide={() => setShowShiftCloseModal(false)}
        onSuccess={handleShiftCloseSuccess}
        currentShift={currentShift}
      />
      
      {/* Edit Mode Indicator */}
      {isEditMode && editingOrder && (
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <IconifyIcon icon="mdi:pencil-outline" className="me-2" />
            <strong>Editing Order:</strong> {editingOrder.orderNo || editingOrder.invoiceNo}
            <span className={`badge ms-2 ${editingOrder.editSource === 'reports' ? 'bg-success' : 'bg-primary'}`}>
              From {editingOrder.editSource === 'reports' ? 'Reports' : 'View Orders'}
            </span>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => {
                if (editingOrder.editSource === 'reports') {
                  window.history.back()
                } else {
                  // For View Orders, we need to trigger the ViewOrders modal
                  // We'll use a custom event to communicate with ViewOrders component
                  window.dispatchEvent(new CustomEvent('reopenViewOrders'))
                  dispatch(exitEditMode())
                }
              }}
            >
              <IconifyIcon icon="mdi:arrow-left" className="me-1" />
              Back to {editingOrder.editSource === 'reports' ? 'Reports' : 'View Orders'}
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => dispatch(exitEditMode())}
            >
              <IconifyIcon icon="mdi:close" className="me-1" />
              Exit Edit Mode
            </Button>
          </div>
        </div>
      )}

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
                {!selectedPriceType && (
                  <Col xs={12} className="text-center py-4">
                    <p className="text-muted">Please select an order type to view menus</p>
                    <Button variant="primary" onClick={() => dispatch(showOrderTypeModalAction())}>
                      Select Order Type
                    </Button>
                  </Col>
                )}
                
                {selectedPriceType && menus.map((menu: any, index: number) => {
                  const menuId = menu._id || menu.id
                  const imageUrl = menu.image || fallbackImages[index % fallbackImages.length]
                  // Use total price (including VAT) based on selected price type
                  const price = selectedPriceType === 'restaurant' ? menu.restaurantTotalPrice :
                                selectedPriceType === 'online' ? menu.onlineTotalPrice :
                                selectedPriceType === 'membership' ? menu.membershipTotalPrice :
                                menu.restaurantTotalPrice || menu.onlineTotalPrice || menu.membershipTotalPrice || 0
                  
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
                        <div className="text-muted" style={{ fontSize: '8px' }}>
                          {selectedOrderType?.toUpperCase()} - {selectedPriceType?.toUpperCase()}
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
              {hasAccessToPOSButton('meal-plan-list') && (
                <Link href="/meal-plan/meal-plan-list" className="btn btn-lg btn-success">
                  <IconifyIcon icon="mdi:food-variant" /> Meal Plan List
                </Link>
              )}
              {hasAccessToPOSButton('sales-list') && (
                <Link href="/sales/sales-list" className="btn btn-lg btn-warning">
                  <IconifyIcon icon="mdi:cash-register" /> Sales List
                </Link>
              )}
              {hasAccessToPOSButton('calculator') && <Calculator />}
              <Link href="/dashboard" className="btn btn-lg btn-dark">
                <IconifyIcon icon="mdi:view-dashboard-outline" /> Dashboard
              </Link>
              <div className="d-flex align-items-center gap-2">
                {/* <span className="badge bg-secondary">
                  Day Status: {openDay ? 'Open' : 'Closed'}
                </span> */}
                {hasAccessToPOSButton('start-shift') && (
                  <Button 
                    variant={currentShift ? "danger" : "success"}
                    className="btn" 
                    onClick={currentShift ? handleCloseShift : handleStartShift}
                  >
                    <IconifyIcon icon={currentShift ? "mdi:clock-out" : "mdi:clock-in"} /> 
                    {currentShift ? "Close Shift" : "Start Shift"}
                  </Button>
                )}
                {openDay && (
                  <Button variant="warning" className="btn" onClick={handleCloseDay}>
                    <IconifyIcon icon="mdi:calendar-check" /> Close Day
                  </Button>
                )}
              </div>
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
                      {/* VAT columns commented out - VAT calculation disabled */}
                      {/* <th>VAT (5%)</th> */}
                      {/* <th>Total with VAT</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedProducts).map(([uniqueId, product]: [string, any], index: number) => {
                      const imageUrl = product.image || fallbackImages[index % fallbackImages.length]
                      const itemSubTotal = product.price * product.qty
                      
                      // VAT calculation commented out - VAT logic disabled
                      // const itemVAT = (itemSubTotal * vatPercent) / 100
                      // const itemTotalWithVAT = itemSubTotal + itemVAT
                      
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
                              <Button size="sm" onClick={() => handleQtyChange(uniqueId, -1)}>
                                -
                              </Button>
                              <span className="px-2">{product.qty}</span>
                              <Button size="sm" onClick={() => handleQtyChange(uniqueId, 1)}>
                                +
                              </Button>
                            </div>
                          </td>
                          <td>AED {itemSubTotal.toFixed(2)}</td>
                          {/* VAT columns commented out - VAT calculation disabled */}
                          {/* <td>AED {itemVAT.toFixed(2)}</td> */}
                          {/* <td>AED {itemTotalWithVAT.toFixed(2)}</td> */}
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
                <Form.Group className="mb-3">
                  <Form.Label>Sub Total</Form.Label>
                  <Form.Control type="text" value={`AED ${subTotal.toFixed(2)}`} disabled />
                </Form.Group>

                {/* VAT Fields */}
                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>VAT %</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="Enter VAT %" 
                        value={vatPercent} 
                        onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                      />
                      <Form.Text className="text-muted">Default: 5%</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Base Price (Without VAT)</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={`AED ${basePriceWithoutVAT.toFixed(2)}`} 
                        disabled 
                      />
                      <Form.Text className="text-muted">Total price without VAT</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>VAT Amount</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={`AED ${vatAmount.toFixed(2)}`} 
                        disabled 
                      />
                      <Form.Text className="text-muted">VAT amount ({vatPercent}%)</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Total Price (With VAT)</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={`AED ${totalWithVAT.toFixed(2)}`} 
                        disabled 
                      />
                      <Form.Text className="text-muted">Base price + VAT</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Left Side */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Receive Amount (AED)</Form.Label>
                    <InputGroup>
                      <Form.Control 
                        type="number" 
                        placeholder="Enter received amount" 
                        value={receiveAmount} 
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0
                          setReceiveAmount(amount)
                          
                          // Only update cumulativePaid if there are no split payments
                          // If there are split payments, cumulativePaid should be managed by the payments array
                          if (payments.length === 0) {
                            if (isEditMode) {
                              // In edit mode, treat the receive amount as additional payment
                              // New cumulative = original cumulative + new receive amount
                              const newCumulative = originalCumulativePaid + amount
                              setCumulativePaid(newCumulative)
                            } else {
                              // In create mode, receive amount equals cumulative paid
                              setCumulativePaid(amount)
                            }
                          }
                        }}
                        min={0} 
                        disabled={payments.length > 0}
                      />
                      <Button variant="outline-primary" onClick={() => setShowAddPayment((v) => !v)} title="Add split payment">
                        <IconifyIcon icon="mdi:plus" />
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      {isEditMode 
                        ? "Additional amount received (will be added to existing payments)" 
                        : "Amount received from customer"
                      }
                    </Form.Text>

                    {showAddPayment && (
                      <Row className="mt-2 g-2 align-items-end">
                        <Col xs={6} md={6}>
                          <Form.Label className="mb-1">Payment Type</Form.Label>
                          <Form.Select 
                            value={newPaymentType}
                            onChange={(e) => setNewPaymentType(e.target.value as 'Cash' | 'Card' | 'Gateway')}
                          >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Gateway">Gateway</option>
                          </Form.Select>
                        </Col>
                        <Col xs={6} md={4}>
                          <Form.Label className="mb-1">Amount (AED)</Form.Label>
                          <Form.Control 
                            type="number" 
                            placeholder="0.00" 
                            value={newPaymentAmount}
                            onChange={(e) => setNewPaymentAmount(e.target.value)}
                            min={0}
                          />
                        </Col>
                        <Col xs={12} md={2}>
                          <Button variant="success" onClick={handleAddPayment} className="w-100">
                            Add
                          </Button>
                        </Col>
                      </Row>
                    )}

                    {payments.length > 0 && (
                      <>
                        <div className="mt-2">
                          {payments.map((p, idx) => (
                            <Badge bg="secondary" key={idx} className="me-2 mb-2">
                              {p.type}: AED {p.amount.toFixed(2)}{' '}
                              <Button size="sm" variant="light" onClick={() => handleRemovePayment(idx)}>
                                <IconifyIcon icon="mdi:close" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="small text-muted mt-1">Total received from splits: AED {receiveAmount.toFixed(2)}</div>
                      </>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Cumulative Paid (AED)</Form.Label>
                    <Form.Control 
                      type="number" 
                      placeholder="Enter cumulative paid amount" 
                      value={cumulativePaid} 
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0
                        setCumulativePaid(amount)
                        
                        // If there are no split payments, also update receiveAmount to match
                        if (payments.length === 0) {
                          if (isEditMode) {
                            // In edit mode, receive amount = new cumulative - original cumulative
                            const newReceiveAmount = amount - originalCumulativePaid
                            setReceiveAmount(Math.max(0, newReceiveAmount))
                          } else {
                            // In create mode, receive amount equals cumulative paid
                            setReceiveAmount(amount)
                          }
                        }
                      }}
                      min={0} 
                    />
                    <Form.Text className="text-muted">
                      {isEditMode 
                        ? "Total amount paid so far (original + additional payments)" 
                        : "Total amount paid so far (for tracking payment history)"
                      }
                    </Form.Text>
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
                  {hasAccessToPOSButton('split-bill') && (
                    <Button variant="info" size="lg" onClick={() => setShowSplitModal(true)}>
                      <IconifyIcon icon="mdi:account-multiple-outline" /> Split Bill
                    </Button>
                  )}
                  {hasAccessToPOSButton('apply-discount') && (
                    <Button variant="success" size="lg" onClick={() => setShowDiscountModal(true)} className="mx-3">
                      <IconifyIcon icon="mdi:ticket-percent-outline" /> Apply Discount
                    </Button>
                  )}

                  <DiscountModal
                    show={showDiscountModal}
                    onClose={() => setShowDiscountModal(false)}
                    onApply={(type, amount, reason) => setDiscount({ type, amount, reason })}
                  />

                  <SplitBillModal show={showSplitModal} onClose={() => setShowSplitModal(false)} totalAmount={totalAmount} />
                  
                  {/* Show split payments indicator when active */}
                  {payments.length > 0 && (
                    <div className="alert alert-info mb-3">
                      <IconifyIcon icon="mdi:information" className="me-2" />
                      <strong>Split Payments Active:</strong> Payment modes are managed through individual payment entries above.
                    </div>
                  )}
                  
                  {/* Only show Payment Mode when no split payments are active */}
                  {payments.length === 0 && (
                    <PaymentModeSelector 
                      selectedMode={selectedPaymentMode}
                      onModeChange={setSelectedPaymentMode}
                      paymentMethods={paymentMethods}
                    />
                  )}
                </Col>

                {/* Right Side */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payable Amount (AED)</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={`AED ${payableAmount.toFixed(2)}`} 
                      disabled 
                    />
                    <Form.Text className="text-muted">Remaining amount to be paid</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Change Amount (AED)</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={`AED ${changeAmount.toFixed(2)}`} 
                      disabled 
                    />
                    <Form.Text className="text-muted">Change to return (auto-calculated)</Form.Text>
                  </Form.Group>
                  
                  {/* VAT form field commented out - VAT calculation disabled */}
                  {/* <Form.Group className="mb-3">
                    <Form.Label>VAT (5%)</Form.Label>
                    <Form.Control type="text" value={`AED ${vatAmount.toFixed(2)}`} disabled />
                  </Form.Group> */}

                  <Form.Group className="mb-3">
                    <Form.Label>Discount</Form.Label>
                    <Form.Control type="text" value={`AED ${discountAmountApplied.toFixed(2)}`} disabled />
                    {discount && (
                      <Form.Text className="text-muted">
                        Type: {discount.type} {discount.reason ? `| Reason: ${discount.reason}` : ''}
                      </Form.Text>
                    )}
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
                <h5 className="text-primary fw-bold">AED {payableAmount.toFixed(2)}</h5>
              </div>
            </CardBody>

            <CardFooter className="d-flex justify-content-between flex-wrap gap-1">
              <Button variant="warning" size="lg" onClick={handleReset}>
                <IconifyIcon icon="mdi:restart" /> Reset
              </Button>
              {hasAccessToPOSButton('settle-bill') && (
                <Button 
                  variant="info" 
                  size="lg"
                  onClick={isEditMode ? handleSaveOrder : undefined}
                  disabled={!isEditMode}
                  style={{ opacity: !isEditMode ? 0.5 : 1 }}
                >
                  <IconifyIcon icon="mdi:restart" /> Settle Bill
                </Button>
              )}
              {hasAccessToPOSButton('print-order') && <PrintOrder />}
              {hasAccessToPOSButton('view-orders') && <ViewOrder onEditOrder={handleEditOrder} />}
              {hasAccessToPOSButton('pos-reports') && (
                <Link href="/reports/all-income" className="btn btn-lg btn-dark">
                  <IconifyIcon icon="mdi:document" /> Reports
                </Link>
              )}
              {hasAccessToPOSButton('transaction-history') && (
                <Link href="/reports/transactions" className="btn btn-lg btn-light">
                  <IconifyIcon icon="mdi:credit-card-outline" /> Transaction
                </Link>
              )}
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleSaveOrder}
                disabled={isEditMode}
                style={{ opacity: isEditMode ? 0.5 : 1 }}
              >
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
