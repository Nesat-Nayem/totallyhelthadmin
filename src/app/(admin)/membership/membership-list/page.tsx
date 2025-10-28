'use client'

import React from 'react'
import { Card, Row, Col, Button, Alert } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import PageTitle from '@/components/PageTItle'

const MembershipList = () => {
  const router = useRouter()

  const handleGoToMealPlans = () => {
    router.push('/meal-plan/meal-plan-list')
  }

  return (
    <>
      <PageTitle title="Membership Management" />

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Membership Management</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-4">
                <h5><i className="ri-information-line me-2"></i>Notice</h5>
                <p className="mb-3">
                  <strong>Membership Plans</strong> are now managed through the <strong>Meal Plans</strong> section. 
                  This provides a unified system for creating and managing all meal plan templates.
                </p>
                <p className="mb-3">
                  <strong>What you can do:</strong>
                </p>
                <ul className="mb-3">
                  <li><strong>Create Meal Plans:</strong> Define meal plan templates with all details (images, categories, brands, etc.)</li>
                  <li><strong>Create User Memberships:</strong> Subscribe customers to existing meal plans</li>
                </ul>
                <Button variant="primary" onClick={handleGoToMealPlans}>
                  <i className="ri-restaurant-line me-2"></i>
                  Go to Meal Plans
                </Button>
              </Alert>

              <Row>
                <Col md={4}>
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <i className="ri-restaurant-line text-primary" style={{ fontSize: '3rem' }}></i>
                      <h5 className="card-title mt-3">Meal Plans</h5>
                      <p className="card-text">
                        Create and manage meal plan templates with images, categories, brands, and all detailed information.
                      </p>
                      <Button variant="outline-primary" onClick={handleGoToMealPlans}>
                        Manage Meal Plans
                      </Button>
                    </div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <i className="ri-user-line text-success" style={{ fontSize: '3rem' }}></i>
                      <h5 className="card-title mt-3">User Memberships</h5>
                      <p className="card-text">
                        Subscribe customers to existing meal plans and track their membership details.
                      </p>
                      <Button 
                        variant="outline-success" 
                        onClick={() => router.push('/membership/user-membership')}
                      >
                        Manage User Memberships
                      </Button>
                    </div>
                  </div>
                </Col>
                
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default MembershipList
