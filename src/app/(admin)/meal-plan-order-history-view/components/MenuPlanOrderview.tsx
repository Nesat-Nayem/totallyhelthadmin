'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardBody, CardFooter, Carousel, CarouselItem, Col, ListGroup, Row } from 'react-bootstrap'
import m1 from '../../../../assets/images/order-view/1.webp'
import m2 from '../../../../assets/images/order-view/2.webp'
import m3 from '../../../../assets/images/order-view/3.webp'

const MenuPlanOrderViewPage = () => {
  const [activeIndex, setActiveIndex] = useState(0)

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

  const meal = [
    { id: 'meal1', image: m1 },
    { id: 'meal2', image: m2 },
    { id: 'meal3', image: m3 },
  ]
  return (
    <Row>
      <Col lg={6}>
        <Card>
          <CardBody>
            <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel">
              <Carousel activeIndex={activeIndex} onSelect={handleSelect} indicators={false} className="carousel-inner" role="listbox">
                {meal.map((item, idx) => (
                  <CarouselItem key={idx}>
                    <Image src={item.image} alt="productImg" className="img-fluid bg-light rounded w-100" />
                  </CarouselItem>
                ))}
              </Carousel>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h4 className="text-dark fw-medium mt-3">Basic Details :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Full Name</span> :<span>Suraj Jamdade</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Email Address</span> :<span>suraj@gmail.com</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Phone Number</span> :<span>+91 980987900</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Payment Status</span> :<span className="badge bg-success">Paid</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Payment Mode</span> :<span className="badge bg-success">Online</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Order Mode</span> :<span className="badge bg-success">Website</span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={6}>
        <Card>
          <CardBody>
            <h4 className="badge bg-success text-light fs-14 py-1 px-2">Active</h4>
            <p className="mb-1">
              <Link href="" className="fs-24 text-dark fw-medium">
                International Meal Plan
              </Link>
            </p>
            <div>
              <p>
                Weekly: <span className="fw-semibold text-success">AED 780 AED 625</span>
              </p>
              <p>
                TOTAL: <span className="fw-semibold text-success">AED 7,500</span>
              </p>
            </div>

            <h4 className="text-dark fw-medium mt-3">Plan Details :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Selected Meal Plan</span> :<span>International Meal Plan</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Calories per day</span> :<span>1,000 -1,400</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Days per week</span> :<span>5 Days</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>How many weeks</span> :<span>4 weeks</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Do you have any allergies?</span> :<span>No</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Would you like to meet with a nutritionist?</span> :<span>Yes</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Meal Includes</span> :<span>3 meal , 1 snack</span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>

            <h4 className="text-dark fw-medium mt-3">Arrange your consultation with a nutritionist (optional) :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>consultation </span> :<span>Call</span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>
            <h4 className="text-dark fw-medium mt-3">Delivery Location :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Selected Location </span> :<span>Home</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Door/House Number </span> :<span></span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Address </span> :<span></span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Building Cummunity name </span> :<span></span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Delivery instructions</span> :<span></span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Selected Prepared Delivery Time</span> :<span></span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Diet Plan Start Date</span> :<span></span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Diet Plan End Date</span> :<span></span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default MenuPlanOrderViewPage
