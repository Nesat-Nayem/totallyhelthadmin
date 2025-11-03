'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardBody, CardFooter, CardHeader, Carousel, CarouselItem, Col, ListGroup, Row, Accordion, Badge } from 'react-bootstrap'
import { useGetMealPlanByIdQuery } from '@/services/mealPlanApi'
import m1 from '../../../../../assets/images/order-view/1.webp'
import m2 from '../../../../../assets/images/order-view/2.webp'
import m3 from '../../../../../assets/images/order-view/3.webp'

interface MenuPlanViewProps {
  id: string
}

const MenuPlanView = ({ id }: MenuPlanViewProps) => {
  const { data: mealPlan, isLoading, error, refetch } = useGetMealPlanByIdQuery(id)
  const [activeIndex, setActiveIndex] = useState(0)

  // Force refetch when component mounts to get latest data
  useEffect(() => {
    refetch()
  }, [id, refetch])

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex)
  }

  const handleThunkSelect = (index: number) => {
    setActiveIndex(index)
  }

  const [quantity, setQuantity] = useState<number>(1)

  const increment = () => {
    setQuantity((prevQuantity) => prevQuantity + 1)
  }

  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1)
    } else {
      setQuantity(1)
    }
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (error || !mealPlan) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <p className="text-danger">Error loading meal plan. Please try again.</p>
              <Link href="/meal-plan/meal-plan-list" className="btn btn-primary">
                Back to List
              </Link>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  // Use actual images from meal plan or fallback to default
  const mealImages = mealPlan.images && mealPlan.images.length > 0 
    ? mealPlan.images.map((img, idx) => ({ id: `meal${idx}`, image: img }))
    : [
        { id: 'meal1', image: m1 },
        { id: 'meal2', image: m2 },
        { id: 'meal3', image: m3 },
      ]
  return (
    <>
      <Row>
        <Col lg={6}>
          <Card>
            <CardBody>
              <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel">
                <Carousel activeIndex={activeIndex} onSelect={handleSelect} indicators={false} className="carousel-inner" role="listbox">
                  {mealImages.map((item, idx) => (
                    <CarouselItem key={idx}>
                      <Image src={item.image} alt="productImg" className="img-fluid bg-light rounded w-100" width={400} height={300} />
                    </CarouselItem>
                  ))}
                </Carousel>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <CardBody>
              {mealPlan.discount && (
                <h4 className="badge bg-success text-light fs-14 py-1 px-2">{mealPlan.discount}% off</h4>
              )}
              <p className="mb-1">
                <Link href="" className="fs-24 text-dark fw-medium">
                  {mealPlan.title}
                </Link>
              </p>
              <div>
                <p>
                  Price : <span className="fw-semibold text-success">AED {mealPlan.price}</span>
                </p>
                {mealPlan.delPrice && (
                  <p>
                    Del Price: <span className="fw-semibold text-success">AED {mealPlan.delPrice}</span>
                  </p>
                )}
              </div>

              <h4 className="text-dark fw-medium mt-3">Plan Details :</h4>
              <div className="mt-3">
                <ListGroup>
                  {mealPlan.badge && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Badge Title</span> :<span>{mealPlan.badge}</span>
                    </ListGroup.Item>
                  )}
                  {mealPlan.kcalList && mealPlan.kcalList.length > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Added Kcal</span> :
                      {mealPlan.kcalList.map((kcal, idx) => (
                        <span key={idx} className="badge bg-success me-1">{kcal}</span>
                      ))}
                    </ListGroup.Item>
                  )}
                  {mealPlan.deliveredList && mealPlan.deliveredList.length > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Delivered daily</span> :
                      {mealPlan.deliveredList.map((delivered, idx) => (
                        <span key={idx} className="badge bg-success me-1">{delivered}</span>
                      ))}
                    </ListGroup.Item>
                  )}
                  {mealPlan.daysPerWeek && mealPlan.daysPerWeek.length > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Days per week</span> :
                      {mealPlan.daysPerWeek.map((day, idx) => (
                        <span key={idx} className="badge bg-success me-1">{day}</span>
                      ))}
                    </ListGroup.Item>
                  )}
                  {mealPlan.weeksOffers && mealPlan.weeksOffers.length > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Weeks & Offers</span> :
                      {mealPlan.weeksOffers.map((offer, idx) => (
                        <span key={idx} className="badge bg-success me-1">{offer.week}: {offer.offer}</span>
                      ))}
                    </ListGroup.Item>
                  )}
                  {mealPlan.suitableList && mealPlan.suitableList.length > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Suitable for</span> :
                      {mealPlan.suitableList.map((suitable, idx) => (
                        <span key={idx} className="badge bg-success me-1">{suitable}</span>
                      ))}
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Category</span> :<span className="badge bg-info">{mealPlan.category || 'N/A'}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Brand</span> :<span className="badge bg-warning">{mealPlan.brand || 'N/A'}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Status</span> :<span className={`badge ${mealPlan.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>{mealPlan.status}</span>
                  </ListGroup.Item>
                </ListGroup>
              </div>

              <h4 className="text-dark fw-medium mt-3">Description :</h4>
              <div className="mt-3">
                <p>{mealPlan.description || 'No description available'}</p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
      {/* Weeks Data Display */}
      {mealPlan.weeks && mealPlan.weeks.length > 0 && (
        <Row className="mt-4">
          <Col xl={12}>
            <Card>
              <CardBody>
                <h4 className="text-dark fw-medium mb-4">
                  <i className="ri-calendar-line me-2"></i>
                  Meal Plan Weeks ({mealPlan.weeks.length} weeks)
                </h4>
                <Accordion defaultActiveKey="0" className="weeks-accordion">
                  {mealPlan.weeks.map((week, weekIndex) => (
                    <Accordion.Item eventKey={weekIndex.toString()} key={weekIndex}>
                      <Accordion.Header>
                        <div className="d-flex align-items-center w-100">
                          <span className="fw-semibold me-3">Week {week.week}</span>
                          {week.repeatFromWeek && (
                            <Badge bg="info" className="me-2">
                              <i className="ri-repeat-line me-1"></i>
                              Repeats from Week {week.repeatFromWeek}
                            </Badge>
                          )}
                          {week.days && (
                            <Badge bg="secondary" className="ms-auto">
                              {week.days.length} days
                            </Badge>
                          )}
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        {week.days && week.days.length > 0 ? (
                          <div className="row g-3">
                            {week.days.map((day, dayIndex) => {
                              // Get day name from day object and capitalize it properly
                              const dayName = day?.day || ''
                              let formattedDayName = `Day ${dayIndex + 1}`
                              
                              if (dayName && typeof dayName === 'string' && dayName.trim() !== '') {
                                // Capitalize first letter and lowercase the rest
                                formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase()
                              }
                              
                              return (
                              <Col md={6} lg={4} key={dayIndex} className="mb-3">
                                <Card className="h-100 border">
                                  <CardHeader className="bg-primary text-white" style={{ padding: '0.75rem 1rem', minHeight: '48px', display: 'flex', alignItems: 'center' }}>
                                    <span className="fw-semibold text-white" style={{ fontSize: '1rem', color: '#ffffff', whiteSpace: 'nowrap' }}>
                                      {formattedDayName}
                                    </span>
                                  </CardHeader>
                                  <CardBody className="p-3">
                                    {day.meals && (
                                      <>
                                        {day.meals.breakfast && day.meals.breakfast.length > 0 && (
                                          <div className="mb-3">
                                            <h6 className="text-success mb-2">
                                              <i className="ri-sun-fill me-1"></i>
                                              Breakfast
                                            </h6>
                                            <ul className="list-unstyled mb-0">
                                              {day.meals.breakfast.map((meal, mealIndex) => (
                                                <li key={mealIndex} className="mb-1">
                                                  <Badge bg="light" className="text-dark border border-success text-success me-1">
                                                    {meal}
                                                  </Badge>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {day.meals.lunch && day.meals.lunch.length > 0 && (
                                          <div className="mb-3">
                                            <h6 className="text-warning mb-2">
                                              <i className="ri-sun-line me-1"></i>
                                              Lunch
                                            </h6>
                                            <ul className="list-unstyled mb-0">
                                              {day.meals.lunch.map((meal, mealIndex) => (
                                                <li key={mealIndex} className="mb-1">
                                                  <Badge bg="light" className="text-dark border border-warning text-warning me-1">
                                                    {meal}
                                                  </Badge>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {day.meals.snacks && day.meals.snacks.length > 0 && (
                                          <div className="mb-3">
                                            <h6 className="text-info mb-2">
                                              <i className="ri-cookie-line me-1"></i>
                                              Snacks
                                            </h6>
                                            <ul className="list-unstyled mb-0">
                                              {day.meals.snacks.map((meal, mealIndex) => (
                                                <li key={mealIndex} className="mb-1">
                                                  <Badge bg="light" className="text-dark border border-info text-info me-1">
                                                    {meal}
                                                  </Badge>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {day.meals.dinner && day.meals.dinner.length > 0 && (
                                          <div>
                                            <h6 className="text-danger mb-2">
                                              <i className="ri-moon-fill me-1"></i>
                                              Dinner
                                            </h6>
                                            <ul className="list-unstyled mb-0">
                                              {day.meals.dinner.map((meal, mealIndex) => (
                                                <li key={mealIndex} className="mb-1">
                                                  <Badge bg="light" className="text-dark border border-danger text-danger me-1">
                                                    {meal}
                                                  </Badge>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </CardBody>
                                </Card>
                              </Col>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-muted">No days configured for this week.</p>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </>
  )
}

export default MenuPlanView
