'use client'

import React from 'react'
import { Modal, Row, Col, Spinner, Badge } from 'react-bootstrap'
import Image from 'next/image'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { IncludedMeal } from '@/services/includedMealsApi'

interface ViewIncludedMealModalProps {
  show: boolean
  onHide: () => void
  meal: IncludedMeal | null
  isLoading: boolean
}

const ViewIncludedMealModal: React.FC<ViewIncludedMealModalProps> = ({ show, onHide, meal, isLoading }) => {
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.png'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    return imagePath
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
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="solar:document-bold" className="me-2" />
          Included Meal Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading meal details...</p>
          </div>
        ) : meal ? (
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Title</label>
                <p className="mb-0">{meal.title}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Meal Type</label>
                <div>
                  <Badge bg={getMealTypeBadgeColor(meal.meal_type)}>
                    {meal.meal_type}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Status</label>
                <div>
                  <Badge bg={meal.status === 'active' ? 'success' : 'danger'}>
                    {meal.status.charAt(0).toUpperCase() + meal.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Order</label>
                <p className="mb-0">{meal.order || 0}</p>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Meal Image</label>
                <div className="mt-2">
                  <Image 
                    src={getImageUrl(meal.image_url)} 
                    alt={meal.title} 
                    width={400}
                    height={200}
                    className="img-fluid rounded"
                    style={{ objectFit: 'cover', maxWidth: '100%' }}
                  />
                </div>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Nutrition Information</label>
                <div className="row g-2 mt-2">
                  <Col md={3}>
                    <div className="p-2 bg-light rounded">
                      <div className="small text-muted">Calories</div>
                      <div className="fw-semibold">{meal.nutrition.calories}</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-2 bg-light rounded">
                      <div className="small text-muted">Fat</div>
                      <div className="fw-semibold">{meal.nutrition.fat_g}g</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-2 bg-light rounded">
                      <div className="small text-muted">Carbs</div>
                      <div className="fw-semibold">{meal.nutrition.carbs_g}g</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-2 bg-light rounded">
                      <div className="small text-muted">Protein</div>
                      <div className="fw-semibold">{meal.nutrition.protein_g}g</div>
                    </div>
                  </Col>
                </div>
              </div>
            </Col>
            {meal.allergens && meal.allergens.length > 0 && (
              <Col md={12}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Allergens</label>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {meal.allergens.map((allergen, index) => (
                      <Badge key={index} bg="secondary">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Col>
            )}
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Created At</label>
                <p className="mb-0">{meal.createdAt ? new Date(meal.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Updated At</label>
                <p className="mb-0">{meal.updatedAt ? new Date(meal.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </Col>
          </Row>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">Meal not found</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
        {meal && (
          <Link 
            href={`/pages/included-meals/included-meals-edit/${meal._id}`} 
            className="btn btn-primary"
            onClick={onHide}
          >
            Edit Meal
          </Link>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ViewIncludedMealModal

