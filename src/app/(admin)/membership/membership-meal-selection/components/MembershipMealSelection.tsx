'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Form, Button, Accordion, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Calculator from '@/app/pos/components/Calculator'
import MembershipHistoryModal from './MembershipHistoryModal'
import { useGetUserMembershipByIdQuery, usePunchMealsMutation, useSetMembershipStatusMutation } from '@/services/userMembershipApi'
import { showSuccess, showError, showMealError } from '@/utils/sweetAlert'
import { useAccessControl } from '@/hooks/useAccessControl'

type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

const dayLabels: Record<DayOfWeek, string> = {
  saturday: 'Saturday',
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
}

const MembershipMealSelection = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const membershipId = searchParams.get('id')
  const { hasAccessToPOSButton } = useAccessControl()

  // Selected meals for punching: { week: number, day: DayOfWeek, meals: { mealType: MealType, mealItemTitle: string, qty: number }[] }
  const [selectedMealsForPunch, setSelectedMealsForPunch] = useState<{
    week: number
    day: DayOfWeek
    meals: Array<{
      mealType: MealType
      mealItemTitle: string
      qty: number
    }>
  } | null>(null)

  const [totalMeals, setTotalMeals] = useState(0)
  const [consumedMeals, setConsumedMeals] = useState(0)
  const [remainingMeals, setRemainingMeals] = useState(0)
  const [status, setStatus] = useState<'active' | 'hold' | 'cancelled' | 'completed'>('active')
  const [showHistory, setShowHistory] = useState(false)

  const [punchMeals, { isLoading: isPunching }] = usePunchMealsMutation()
  const [setMembershipStatus, { isLoading: isSettingStatus }] = useSetMembershipStatusMutation()
  
  const { data: membershipData, isLoading: isLoadingMembership, refetch: refetchMembership } = useGetUserMembershipByIdQuery(membershipId || '', {
    skip: !membershipId
  })

  // Load membership data
  useEffect(() => {
    if (membershipData) {
      setTotalMeals(membershipData.totalMeals || 0)
      setConsumedMeals(membershipData.consumedMeals || 0)
      setRemainingMeals(membershipData.remainingMeals || 0)
      setStatus((membershipData.status as any) || 'active')
    }
  }, [membershipData])

  // Redirect if no membership ID
  useEffect(() => {
    if (!membershipId) {
      router.push('/membership/user-membership')
    }
  }, [membershipId, router])

  // Handle meal selection for punching
  const handleMealToggle = (week: number, day: DayOfWeek, mealType: MealType, mealItemTitle: string) => {
    // Check if day is already consumed
    const weekPlan = membershipData?.weeks?.find(w => w.week === week)
    if (!weekPlan) {
      showMealError('Week not found')
      return
    }
    
    const dayPlan = weekPlan.days?.find(d => d.day === day)
    if (!dayPlan) {
      showMealError('Day not found in this week')
      return
    }

    if (dayPlan.isConsumed) {
      showMealError('This day is already fully consumed')
      return
    }

    // Check if this specific meal type is already consumed
    if (dayPlan.consumedMeals?.[mealType]) {
      showMealError(`${mealTypeLabels[mealType]} is already consumed for this day`)
      return
    }

    // Initialize or update selected meals
    if (!selectedMealsForPunch || selectedMealsForPunch.week !== week || selectedMealsForPunch.day !== day) {
      // New day selected
      setSelectedMealsForPunch({
        week,
        day,
        meals: [{ mealType, mealItemTitle, qty: 1 }]
      })
    } else {
      // Same day, toggle meal
      const existingIndex = selectedMealsForPunch.meals.findIndex(
        m => m.mealType === mealType && m.mealItemTitle === mealItemTitle
      )

      if (existingIndex >= 0) {
        // Remove if already selected
        const newMeals = selectedMealsForPunch.meals.filter((_, idx) => idx !== existingIndex)
        setSelectedMealsForPunch(newMeals.length > 0 ? { ...selectedMealsForPunch, meals: newMeals } : null)
      } else {
        // Add new meal
        setSelectedMealsForPunch({
          ...selectedMealsForPunch,
          meals: [...selectedMealsForPunch.meals, { mealType, mealItemTitle, qty: 1 }]
        })
      }
    }
  }

  // Handle quantity change for selected meal
  const handleQtyChangeForSelectedMeal = (week: number, day: DayOfWeek, mealType: MealType, mealItemTitle: string, delta: number) => {
    if (!selectedMealsForPunch || selectedMealsForPunch.week !== week || selectedMealsForPunch.day !== day) {
      return
    }

    const updatedMeals = selectedMealsForPunch.meals.map(meal => {
      if (meal.mealType === mealType && meal.mealItemTitle === mealItemTitle) {
        return { ...meal, qty: Math.max(1, meal.qty + delta) }
      }
      return meal
    })

    setSelectedMealsForPunch({ ...selectedMealsForPunch, meals: updatedMeals })
  }

  // Check if meal is selected
  const isMealSelected = (week: number, day: DayOfWeek, mealType: MealType, mealItemTitle: string) => {
    return selectedMealsForPunch?.week === week &&
           selectedMealsForPunch?.day === day &&
           selectedMealsForPunch.meals.some(m => m.mealType === mealType && m.mealItemTitle === mealItemTitle)
  }

  // Get selected meal quantity
  const getSelectedMealQty = (week: number, day: DayOfWeek, mealType: MealType, mealItemTitle: string) => {
    if (!selectedMealsForPunch || selectedMealsForPunch.week !== week || selectedMealsForPunch.day !== day) {
      return 0
    }
    const meal = selectedMealsForPunch.meals.find(m => m.mealType === mealType && m.mealItemTitle === mealItemTitle)
    return meal?.qty || 0
  }

  // Generate and download Kitchen KOT Receipt
  const downloadKitchenKOT = (punchData: typeof selectedMealsForPunch, totalQty: number) => {
    if (!punchData || !membershipData) return

    const getCurrentDateTime = () => {
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    }

    // Get user details
    const userDetails = membershipData.userId && typeof membershipData.userId === 'object' 
      ? membershipData.userId as any 
      : null
    const memberName = userDetails?.name || 'N/A'
    const memberPhone = userDetails?.phone || ''
    const memberAddress1 = userDetails?.address1 || userDetails?.address || ''
    const memberAddress2 = userDetails?.address2 || ''
    const memberEmail = userDetails?.email || ''

    // Generate HTML content for kitchen receipt
    const receiptHTML = `
      <div class="thermal-receipt" style="width: 100%; max-width: 100%; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.2; padding: 4px; background-color: white; color: black;">
        <!-- Header with Logo -->
        <div style="text-align: center; margin-bottom: 6px;">
          <div class="logo-circle" style="border: 2px dashed #000; border-radius: 50%; width: 60px; height: 60px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 6px auto; padding: 6px;">
            <div style="font-size: 16px; margin-bottom: 2px;">🍴</div>
            <div style="font-size: 8px; font-weight: bold; text-align: center; line-height: 1.1;">Totally<br/>Healthy</div>
            <div style="font-size: 5px; text-align: center; margin-top: 2px; line-height: 1;">EAT CLEAN</div>
          </div>
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">NEW ORDER</div>
          <div style="font-size: 11px; font-weight: bold;">KITCHEN</div>
        </div>

        <hr style="border: none; border-top: 1px dashed #000; margin: 6px 0;" />

        <!-- Company Info -->
        <div style="text-align: center; margin-bottom: 6px;">
          <div style="font-weight: bold; font-size: 12px;">TOTALLY HEALTHY</div>
          <div style="font-size: 9px;">Company Name AL AKL AL SAHI</div>
          <div style="font-size: 9px;">Tel: 065392229 / 509632223</div>
          <div style="font-weight: bold; font-size: 9px;">TRN : 100512693100003</div>
        </div>

        <hr style="border: none; border-top: 1px dashed #000; margin: 6px 0;" />

        <!-- Order Type -->
        <div style="text-align: center; margin-bottom: 6px;">
          <div style="font-weight: bold; font-size: 12px;">MEMBERSHIP MEAL</div>
        </div>

        <hr style="border: none; border-top: 1px dashed #000; margin: 6px 0;" />

        <!-- Order Info -->
        <div style="margin-bottom: 8px; font-size: 10px;">
          <div>Date : ${getCurrentDateTime()}</div>
          <div>Member: ${memberName}</div>
          <div>Week: ${punchData.week} | Day: ${dayLabels[punchData.day]}</div>
        </div>

        <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />

        <!-- Items Header -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: bold; font-size: 10px;">
          <div style="width: 20%;">Qty</div>
          <div style="width: 80%;">Item</div>
        </div>

        <!-- Items -->
        ${punchData.meals.map((meal) => `
          <div style="margin-bottom: 4px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 20%; font-weight: bold;">${meal.qty}</div>
              <div style="width: 80%; word-wrap: break-word;">${meal.mealItemTitle} (${mealTypeLabels[meal.mealType]})</div>
            </div>
          </div>
        `).join('')}

        <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />

        <!-- User Details -->
        <div style="margin-bottom: 8px; font-size: 10px;">
          <div style="font-weight: bold; margin-bottom: 4px;">CUSTOMER DETAILS</div>
          ${memberName !== 'N/A' ? `<div><strong>Name:</strong> ${memberName}</div>` : ''}
          ${memberPhone ? `<div><strong>Phone:</strong> ${memberPhone}</div>` : ''}
          ${memberEmail ? `<div><strong>Email:</strong> ${memberEmail}</div>` : ''}
          ${memberAddress1 ? `<div><strong>Address 1:</strong> ${memberAddress1}</div>` : ''}
          ${memberAddress2 ? `<div><strong>Address 2:</strong> ${memberAddress2}</div>` : ''}
        </div>

        <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />

        <!-- Footer -->
        <div style="text-align: center; margin-top: 8px; font-size: 10px;">
          Thank You & Come Again
        </div>
      </div>
    `

    // Open print dialog with thermal receipt format
    const printWindow = window.open('', '_blank', 'width=300,height=800')
    if (!printWindow) {
      console.error('Failed to open print window')
      return
    }

    // Write the thermal receipt HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kitchen KOT Receipt</title>
          <meta charset="utf-8">
          <style>
            @media print {
              @page {
                size: 80mm 200mm;
                margin: 0;
                padding: 0;
              }
              html, body {
                width: 80mm !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              body {
                margin: 0 !important;
                padding: 2mm !important;
                font-family: 'Courier New', monospace !important;
                font-size: 10px !important;
                line-height: 1.2 !important;
                color: black !important;
                background: white !important;
              }
              .thermal-receipt {
                width: 100% !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 2px !important;
                border: none !important;
                background: white !important;
              }
              .thermal-receipt * {
                color: black !important;
                background: white !important;
                font-family: 'Courier New', monospace !important;
                max-width: 100% !important;
              }
              hr {
                border: none !important;
                border-top: 1px dashed #000 !important;
                margin: 3px 0 !important;
              }
              .logo-circle {
                border: 2px dashed #000 !important;
                border-radius: 50% !important;
                width: 60px !important;
                height: 60px !important;
                display: inline-flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 auto 3px auto !important;
                padding: 3px !important;
              }
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 80mm;
              max-width: 80mm;
            }
            body {
              padding: 2px;
              font-family: 'Courier New', monospace;
              font-size: 10px;
              line-height: 1.2;
              background: white;
              color: black;
              margin: 0 auto;
            }
            .thermal-receipt {
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
              background: white;
              color: black;
              padding: 4px;
            }
            * {
              box-sizing: border-box;
            }
            hr {
              border: none;
              border-top: 1px dashed #000;
              margin: 3px 0;
            }
            .logo-circle {
              border: 2px dashed #000;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              display: inline-flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin: 0 auto 3px auto;
              padding: 3px;
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
        </body>
      </html>
    `)

    printWindow.document.close()

    // Wait for content to load, then trigger print dialog
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      // Keep window open in case user wants to print again or save as PDF
      // printWindow.close() // Uncomment if you want to auto-close after printing
    }, 250)
  }

  // Handle Punch
  const handlePunch = async () => {
    if (!membershipId || !selectedMealsForPunch) {
      showMealError('Please select meals to punch')
      return
    }

    // Block punching based on status
    if (status === 'hold') {
      showMealError('This membership is on hold. You cannot punch meals while on hold.')
      return
    }
    if (status === 'cancelled') {
      showMealError('This membership is cancelled. Meal punching is not allowed.')
      return
    }
    if (status === 'completed') {
      showMealError('This membership is completed. No meals remaining to consume.')
      return
    }

    if (selectedMealsForPunch.meals.length === 0) {
      showMealError('Please select at least one meal')
      return
    }

    // Calculate total meals to consume
    const totalQty = selectedMealsForPunch.meals.reduce((sum, meal) => sum + meal.qty, 0)
    if (totalQty > remainingMeals) {
      showMealError(`Cannot consume ${totalQty} meals. Only ${remainingMeals} meals remaining.`)
      return
    }

    try {
      await punchMeals({
        id: membershipId,
        week: selectedMealsForPunch.week,
        day: selectedMealsForPunch.day,
        mealItems: selectedMealsForPunch.meals
      }).unwrap()

      showSuccess(`Successfully punched ${totalQty} meal(s) for ${dayLabels[selectedMealsForPunch.day]}`)
      
      // Download Kitchen KOT Receipt
      downloadKitchenKOT(selectedMealsForPunch, totalQty)
      
      // Reset selection
      setSelectedMealsForPunch(null)
      
      // Refresh membership data
      await refetchMembership()
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to punch meals'
      showMealError(errorMessage)
    }
  }

  // Handle Reset
  const handleReset = () => {
    setSelectedMealsForPunch(null)
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

  const weeks = membershipData.weeks || []

  return (
    <>
      <Row className="g-3">
        <Col lg={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <CardTitle as="h4" className="flex-grow-1 mb-0 text-primary">
                MEMBERSHIP MEAL SELECTION
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
              <Row className="g-2 mb-4">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Total Meals</Form.Label>
                    <Form.Control type="text" value={totalMeals} readOnly className="bg-light" />
                    <Form.Text className="text-muted">Total meals in membership</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Consumed Meals</Form.Label>
                    <Form.Control type="text" value={consumedMeals} readOnly className="bg-light" />
                    <Form.Text className="text-muted">Meals already consumed</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Remaining Meals</Form.Label>
                    <Form.Control type="text" value={remainingMeals} readOnly className="bg-light" />
                    <Form.Text className="text-muted">Calculated automatically</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                      >
                        <option value="active">Active</option>
                        <option value="hold">Hold</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </Form.Select>
                      <Button 
                        variant="outline-primary"
                        onClick={async () => {
                          if (!membershipId) return
                          try {
                            if (status === 'completed') {
                              showError('Completed status is system-managed and cannot be set manually')
                              return
                            }
                            await setMembershipStatus({ id: membershipId, status: status as 'active' | 'hold' | 'cancelled' }).unwrap()
                            showSuccess('Status updated successfully')
                            await refetchMembership()
                          } catch (e: any) {
                            showError(e?.data?.message || 'Failed to update status')
                          }
                        }}
                        disabled={isSettingStatus}
                      >
                        {isSettingStatus ? 'Updating...' : 'Update Status'}
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Weeks and Days Selection */}
              <div className="mb-4">
                <h5 className="mb-3 text-primary fw-semibold">
                  <IconifyIcon icon="mdi:calendar-week" className="me-2" />
                  Select Week and Day
                </h5>

                {weeks.length === 0 ? (
                  <div className="alert alert-info">
                    No meal plan weeks found for this membership.
                  </div>
                ) : (
                  <Accordion defaultActiveKey="0" flush>
                    {weeks.map((weekPlan, weekIndex) => {
                      const weekNum = weekPlan.week
                      const isWeekConsumed = weekPlan.isConsumed || false
                      
                      return (
                        <Accordion.Item 
                          key={weekNum} 
                          eventKey={weekIndex.toString()}
                          className={isWeekConsumed ? 'bg-light' : ''}
                        >
                          <Accordion.Header>
                            <div className="d-flex align-items-center gap-2 w-100">
                              <span className="fw-semibold">Week {weekNum}</span>
                              {isWeekConsumed && (
                                <Badge bg="success" className="ms-2">
                                  <IconifyIcon icon="mdi:check-circle" className="me-1" />
                                  Complete
                                </Badge>
                              )}
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <Row className="g-3">
                              {weekPlan.days && weekPlan.days.map((dayPlan) => {
                                const day = dayPlan.day
                                const isDayConsumed = dayPlan.isConsumed || false
                                const consumedMealsData = dayPlan.consumedMeals || {}
                                const isCurrentlySelected = selectedMealsForPunch?.week === weekNum && selectedMealsForPunch?.day === day
                                // Safely access meals object
                                const mealsData = dayPlan.meals || {
                                  breakfast: [],
                                  lunch: [],
                                  snacks: [],
                                  dinner: []
                                }

                                return (
                                  <Col md={6} lg={4} key={day}>
                                    <Card className={`h-100 ${isDayConsumed ? 'border-success bg-light' : isCurrentlySelected ? 'border-primary' : ''}`}>
                                      <CardHeader className={`py-2 ${isDayConsumed ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <span className="fw-semibold">{dayLabels[day]}</span>
                                          {isDayConsumed && (
                                            <Badge bg="light" text="success">
                                              <IconifyIcon icon="mdi:check" className="me-1" />
                                              Consumed
                                            </Badge>
                                          )}
                                        </div>
                                      </CardHeader>
                                      <CardBody className="p-2">
                                        {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((mealType) => {
                                          const mealItems = (mealsData[mealType] || []) as string[]
                                          const isMealTypeConsumed = consumedMealsData[mealType] || false

                                          return (
                                            <div key={mealType} className="mb-3">
                                              <div className="d-flex justify-content-between align-items-center mb-1">
                                                <small className="fw-semibold text-muted">
                                                  {mealTypeLabels[mealType]}
                                                </small>
                                                {isMealTypeConsumed && (
                                                  <Badge bg="success" className="small">
                                                    <IconifyIcon icon="mdi:check" className="me-1" />
                                                    Consumed
                                                  </Badge>
                                                )}
                                              </div>
                                              
                                              {mealItems.length === 0 ? (
                                                <div className="text-muted small">No items</div>
                                              ) : (
                                                <div className="d-flex flex-column gap-1">
                                                  {mealItems.map((mealItemTitle, idx) => {
                                                    const isSelected = !isDayConsumed && !isMealTypeConsumed && 
                                                                      isMealSelected(weekNum, day, mealType, mealItemTitle)
                                                    const qty = getSelectedMealQty(weekNum, day, mealType, mealItemTitle)

                                                    return (
                                                      <div 
                                                        key={idx}
                                                        className={`p-2 rounded border cursor-pointer small ${
                                                          isDayConsumed || isMealTypeConsumed 
                                                            ? 'bg-light text-muted border-secondary' 
                                                            : isSelected 
                                                            ? 'bg-primary text-white border-primary' 
                                                            : 'bg-white border-secondary'
                                                        }`}
                                                        onClick={() => {
                                                          if (!isDayConsumed && !isMealTypeConsumed) {
                                                            handleMealToggle(weekNum, day, mealType, mealItemTitle)
                                                          }
                                                        }}
                                                        style={{ 
                                                          cursor: isDayConsumed || isMealTypeConsumed ? 'not-allowed' : 'pointer',
                                                          opacity: isDayConsumed || isMealTypeConsumed ? 0.6 : 1
                                                        }}
                                                      >
                                                        <div className="d-flex justify-content-between align-items-center">
                                                          <span className="text-truncate">{mealItemTitle}</span>
                                                          {isSelected && qty > 0 && (
                                                            <div 
                                                              className="d-flex align-items-center gap-1 ms-2"
                                                              onClick={(e) => e.stopPropagation()}
                                                            >
                                                              <Button
                                                                size="sm"
                                                                variant="light"
                                                                className="p-0 px-1"
                                                                onClick={() => handleQtyChangeForSelectedMeal(weekNum, day, mealType, mealItemTitle, -1)}
                                                                disabled={qty <= 1}
                                                              >
                                                                -
                                                              </Button>
                                                              <span className="small">{qty}</span>
                                                              <Button
                                                                size="sm"
                                                                variant="light"
                                                                className="p-0 px-1"
                                                                onClick={() => handleQtyChangeForSelectedMeal(weekNum, day, mealType, mealItemTitle, 1)}
                                                              >
                                                                +
                                                              </Button>
                                                            </div>
                                                          )}
                                                        </div>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </CardBody>
                                    </Card>
                                  </Col>
                                )
                              })}
                            </Row>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                    })}
                  </Accordion>
                )}
              </div>

              {/* Selected Meals Summary */}
              {selectedMealsForPunch && (
                <Card className="mb-4 border-primary">
                  <CardHeader className="bg-primary text-white">
                    <CardTitle as="h6" className="mb-0">
                      Selected Meals for {dayLabels[selectedMealsForPunch.day]} - Week {selectedMealsForPunch.week}
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Meal Type</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMealsForPunch.meals.map((meal, idx) => (
                            <tr key={idx}>
                              <td>{mealTypeLabels[meal.mealType]}</td>
                              <td>{meal.mealItemTitle}</td>
                              <td>{meal.qty}</td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => {
                                    const updatedMeals = selectedMealsForPunch.meals.filter((_, i) => i !== idx)
                                    setSelectedMealsForPunch(updatedMeals.length > 0 ? { ...selectedMealsForPunch, meals: updatedMeals } : null)
                                  }}
                                >
                                  <IconifyIcon icon="mdi:delete" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="fw-bold">
                            <td colSpan={2}>Total Meals to Consume</td>
                            <td>{selectedMealsForPunch.meals.reduce((sum, meal) => sum + meal.qty, 0)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              )}
            </CardBody>

            <CardFooter className="d-flex justify-content-between flex-wrap gap-2">
              <Button variant="warning" size="lg" onClick={handleReset} disabled={!selectedMealsForPunch}>
                <IconifyIcon icon="mdi:restart" /> Reset
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setShowHistory(true)}>
                <IconifyIcon icon="mdi:history" /> View History
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handlePunch}
                disabled={isPunching || !selectedMealsForPunch || selectedMealsForPunch.meals.length === 0 || status !== 'active'}
              >
                {isPunching ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Punching...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="mdi:content-save-outline" /> Punch Meals
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </Col>
      </Row>
      <MembershipHistoryModal show={showHistory} onHide={() => setShowHistory(false)} membershipData={membershipData} />
    </>
  )
}

export default MembershipMealSelection
