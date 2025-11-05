'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner, Badge } from 'react-bootstrap'
import { useGetIncludedMealsQuery, useDeleteIncludedMealMutation, useGetIncludedMealByIdQuery } from '@/services/includedMealsApi'
import { confirmDelete } from '@/utils/sweetAlert'
import { toast } from 'react-toastify'
import ViewIncludedMealModal from './ViewIncludedMealModal'

const IncludedMeals = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [mealTypeFilter, setMealTypeFilter] = useState<string | undefined>(undefined)
  const [viewModalShow, setViewModalShow] = useState(false)
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)
  
  const { data: mealsResponse, isLoading, isFetching, refetch } = useGetIncludedMealsQuery(
    statusFilter || mealTypeFilter 
      ? { status: statusFilter, meal_type: mealTypeFilter } 
      : undefined
  )
  const [deleteMeal, { isLoading: isDeleting }] = useDeleteIncludedMealMutation()
  const { data: selectedMeal, isLoading: isLoadingMeal } = useGetIncludedMealByIdQuery(selectedMealId || '', { skip: !selectedMealId })
  
  const meals = mealsResponse?.data || []
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirmDelete(
      'Delete Included Meal?',
      `Are you sure you want to delete the meal "${title}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeletingId(id)
      await deleteMeal(id).unwrap()
      toast.success('Included meal deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete included meal')
    } finally {
      setDeletingId(null)
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.png'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    return imagePath
  }

  const handleView = (id: string) => {
    setSelectedMealId(id)
    setViewModalShow(true)
  }

  const handleCloseViewModal = () => {
    setViewModalShow(false)
    setSelectedMealId(null)
  }

  const getMealTypeBadgeColor = (mealType: string) => {
    switch (mealType) {
      case 'BREAKFAST':
        return 'warning'
      case 'LUNCH':
        return 'info'
      case 'DINNER':
        return 'primary'
      case 'SNACKS':
        return 'success'
      default:
        return 'secondary'
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Included Meals
            </CardTitle>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || undefined)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={mealTypeFilter || ''}
                onChange={(e) => setMealTypeFilter(e.target.value || undefined)}
              >
                <option value="">All Meal Types</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACKS">Snacks</option>
              </select>
              <Link href="/pages/included-meals/included-meals-add" className="btn btn-lg btn-primary">
                Add Included Meal
              </Link>
            </div>
          </CardHeader>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Title</th>
                    <th>Meal Type</th>
                    <th>Image</th>
                    <th>Nutrition</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading || isFetching ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-2">Loading meals...</span>
                      </td>
                    </tr>
                  ) : meals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No included meals found
                      </td>
                    </tr>
                  ) : (
                    meals.map((meal) => (
                      <tr key={meal._id}>
                        <td>
                          <div>
                            <div className="fw-medium">{meal.title}</div>
                            {meal.allergens && meal.allergens.length > 0 && (
                              <small className="text-muted">
                                Allergens: {meal.allergens.join(', ')}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge bg={getMealTypeBadgeColor(meal.meal_type)}>
                            {meal.meal_type}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              <Image 
                                src={getImageUrl(meal.image_url)} 
                                alt={meal.title} 
                                className="avatar-md"
                                width={60}
                                height={60}
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            <div>Calories: {meal.nutrition.calories}</div>
                            <div>Fat: {meal.nutrition.fat_g}g</div>
                            <div>Carbs: {meal.nutrition.carbs_g}g</div>
                            <div>Protein: {meal.nutrition.protein_g}g</div>
                          </div>
                        </td>
                        <td>
                          <span className={`fw-medium ${meal.status === 'active' ? 'text-success' : 'text-danger'}`}>
                            {meal.status.charAt(0).toUpperCase() + meal.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleView(meal._id)}
                              className="btn btn-soft-info btn-sm"
                              title="View Details"
                            >
                              <IconifyIcon icon="solar:eye-bold" className="align-middle fs-18" />
                            </button>
                            <Link 
                              href={`/pages/included-meals/included-meals-edit/${meal._id}`} 
                              className="btn btn-soft-primary btn-sm"
                              title="Edit"
                            >
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              onClick={() => handleDelete(meal._id, meal.title)}
                              className="btn btn-soft-danger btn-sm"
                              disabled={isDeleting && deletingId === meal._id}
                              title="Delete"
                            >
                              {isDeleting && deletingId === meal._id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {meals.length > 0 && (
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(1)}>
                      1
                    </button>
                  </li>
                  {meals.length > 10 && (
                    <li className={`page-item ${currentPage === 2 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(2)}>
                        2
                      </button>
                    </li>
                  )}
                  {meals.length > 20 && (
                    <li className={`page-item ${currentPage === 3 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(3)}>
                        3
                      </button>
                    </li>
                  )}
                  <li className={`page-item ${meals.length <= 10 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={meals.length <= 10}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          )}
        </Card>
      </Col>

      <ViewIncludedMealModal
        show={viewModalShow}
        onHide={handleCloseViewModal}
        meal={selectedMeal || null}
        isLoading={isLoadingMeal}
      />
    </Row>
  )
}

export default IncludedMeals

