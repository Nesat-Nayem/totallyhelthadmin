'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Modal, Button, Alert, Row, Col, Form } from 'react-bootstrap'
import { useUpdateMealSelectionsMutation } from '@/services/userMembershipApi'
import { useGetMealPlanByIdQuery } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'

interface EditMealModalProps {
  show: boolean
  onHide: () => void
  userMembership: any
  week: any
  day: any
  onSuccess?: (updatedMembership?: any) => void
  canManageMembership?: boolean
}

const EditMealModal: React.FC<EditMealModalProps> = ({
  show,
  onHide,
  userMembership,
  week,
  day,
  onSuccess,
  canManageMembership = true
}) => {
  const [editingMealSelections, setEditingMealSelections] = useState<any>({
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: ''
  })

  const [updateMealSelections, { isLoading: isUpdating }] = useUpdateMealSelectionsMutation()
  
  // Get meal plan by ID
  const mealPlanId = userMembership?.mealPlanId?._id || userMembership?.mealPlanId
  const { data: mealPlanData } = useGetMealPlanByIdQuery(mealPlanId || '', { skip: !mealPlanId || !show })

  // Initialize selections when modal opens
  useEffect(() => {
    if (show && day) {
      setEditingMealSelections({
        breakfast: Array.isArray(day.meals?.breakfast) && day.meals.breakfast.length > 0 ? day.meals.breakfast[0] : '',
        lunch: Array.isArray(day.meals?.lunch) && day.meals.lunch.length > 0 ? day.meals.lunch[0] : '',
        snacks: Array.isArray(day.meals?.snacks) && day.meals.snacks.length > 0 ? day.meals.snacks[0] : '',
        dinner: Array.isArray(day.meals?.dinner) && day.meals.dinner.length > 0 ? day.meals.dinner[0] : ''
      })
    }
  }, [show, day])

  const handleSelectMeal = (mealType: string, mealItem: string) => {
    setEditingMealSelections((prev: any) => ({
      ...prev,
      [mealType]: prev[mealType] === mealItem ? '' : mealItem // Toggle: if already selected, deselect
    }))
  }

  const handleSaveMealEdits = async () => {
    if (!userMembership || !week || !day || !mealPlanData) {
      showError('Missing data for saving meal edits')
      return
    }

    if (!canManageMembership) {
      showError('You do not have permission to manage user memberships')
      return
    }

    try {
      // Send only the specific week, day, and meals that were edited
      const payload = {
        id: userMembership._id,
        week: week.week,
        day: day.day,
        meals: {
          breakfast: editingMealSelections.breakfast ? [editingMealSelections.breakfast] : [],
          lunch: editingMealSelections.lunch ? [editingMealSelections.lunch] : [],
          snacks: editingMealSelections.snacks ? [editingMealSelections.snacks] : [],
          dinner: editingMealSelections.dinner ? [editingMealSelections.dinner] : []
        }
      }

      console.log('Updating meal plan for specific day:', payload)

      const updatedMembership = await updateMealSelections(payload).unwrap()

      showSuccess('Meal plan updated successfully')
      onHide()
      if (onSuccess) {
        onSuccess(updatedMembership)
      }
    } catch (error: any) {
      console.error('Error updating meal plan:', error)
      const errorMessage = error?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          'Failed to update meal plan'
      showError(errorMessage)
    }
  }

  // Get available meal options from meal plan for the selected week and day
  const getAvailableMealOptions = useMemo(() => {
    if (!mealPlanData || !week || !day) {
      return {
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
      }
    }

    const mealPlanWeek = mealPlanData.weeks?.find((w: any) => w.week === week.week)
    if (!mealPlanWeek) {
      return {
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
      }
    }

    const mealPlanDay = mealPlanWeek.days?.find((d: any) => d.day === day.day)
    if (!mealPlanDay) {
      return {
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
      }
    }

    return {
      breakfast: mealPlanDay.meals?.breakfast || [],
      lunch: mealPlanDay.meals?.lunch || [],
      snacks: mealPlanDay.meals?.snacks || [],
      dinner: mealPlanDay.meals?.dinner || []
    }
  }, [mealPlanData, week, day])

  if (!week || !day) {
    return null
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="ri-edit-line me-2"></i>
          Edit Meals - Week {week?.week}, {day?.day?.charAt(0).toUpperCase() + day?.day?.slice(1)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mealPlanData && (
          <div>
            <Alert variant="info" className="mb-3">
              <i className="ri-information-line me-2"></i>
              Select meal items from the available options. Current selections are pre-ticked.
            </Alert>

            <Row className="g-4">
              {/* Breakfast */}
              <Col md={6}>
                <div className="p-3 border rounded" style={{ backgroundColor: '#fff8e1' }}>
                  <h6 className="mb-3 text-warning">
                    <i className="ri-sun-line me-2"></i>
                    Breakfast
                  </h6>
                  {getAvailableMealOptions.breakfast.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {getAvailableMealOptions.breakfast.map((item: string, idx: number) => {
                        const isSelected = editingMealSelections.breakfast === item
                        return (
                          <Form.Check
                            key={idx}
                            type="radio"
                            name="breakfast-option"
                            id={`breakfast-${idx}`}
                            label={item}
                            checked={isSelected}
                            onChange={() => handleSelectMeal('breakfast', item)}
                            className="p-2 border rounded"
                            style={{ 
                              backgroundColor: isSelected ? '#ffecb3' : 'white',
                              cursor: 'pointer'
                            }}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-muted">No breakfast options available</div>
                  )}
                </div>
              </Col>

              {/* Lunch */}
              <Col md={6}>
                <div className="p-3 border rounded" style={{ backgroundColor: '#e3f2fd' }}>
                  <h6 className="mb-3 text-primary">
                    <i className="ri-restaurant-line me-2"></i>
                    Lunch
                  </h6>
                  {getAvailableMealOptions.lunch.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {getAvailableMealOptions.lunch.map((item: string, idx: number) => {
                        const isSelected = editingMealSelections.lunch === item
                        return (
                          <Form.Check
                            key={idx}
                            type="radio"
                            name="lunch-option"
                            id={`lunch-${idx}`}
                            label={item}
                            checked={isSelected}
                            onChange={() => handleSelectMeal('lunch', item)}
                            className="p-2 border rounded"
                            style={{ 
                              backgroundColor: isSelected ? '#bbdefb' : 'white',
                              cursor: 'pointer'
                            }}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-muted">No lunch options available</div>
                  )}
                </div>
              </Col>

              {/* Snacks */}
              <Col md={6}>
                <div className="p-3 border rounded" style={{ backgroundColor: '#fce4ec' }}>
                  <h6 className="mb-3 text-danger">
                    <i className="ri-apple-line me-2"></i>
                    Snacks
                  </h6>
                  {getAvailableMealOptions.snacks.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {getAvailableMealOptions.snacks.map((item: string, idx: number) => {
                        const isSelected = editingMealSelections.snacks === item
                        return (
                          <Form.Check
                            key={idx}
                            type="radio"
                            name="snacks-option"
                            id={`snacks-${idx}`}
                            label={item}
                            checked={isSelected}
                            onChange={() => handleSelectMeal('snacks', item)}
                            className="p-2 border rounded"
                            style={{ 
                              backgroundColor: isSelected ? '#f8bbd0' : 'white',
                              cursor: 'pointer'
                            }}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-muted">No snacks options available</div>
                  )}
                </div>
              </Col>

              {/* Dinner */}
              <Col md={6}>
                <div className="p-3 border rounded" style={{ backgroundColor: '#e8f5e9' }}>
                  <h6 className="mb-3 text-success">
                    <i className="ri-moon-line me-2"></i>
                    Dinner
                  </h6>
                  {getAvailableMealOptions.dinner.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {getAvailableMealOptions.dinner.map((item: string, idx: number) => {
                        const isSelected = editingMealSelections.dinner === item
                        return (
                          <Form.Check
                            key={idx}
                            type="radio"
                            name="dinner-option"
                            id={`dinner-${idx}`}
                            label={item}
                            checked={isSelected}
                            onChange={() => handleSelectMeal('dinner', item)}
                            className="p-2 border rounded"
                            style={{ 
                              backgroundColor: isSelected ? '#c8e6c9' : 'white',
                              cursor: 'pointer'
                            }}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-muted">No dinner options available</div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSaveMealEdits}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="ri-save-line me-1"></i>
              Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EditMealModal

