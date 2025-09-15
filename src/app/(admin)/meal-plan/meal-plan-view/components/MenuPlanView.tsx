'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardBody, CardFooter, Carousel, CarouselItem, Col, ListGroup, Row } from 'react-bootstrap'
import m1 from '../../../../../assets/images/order-view/1.webp'
import m2 from '../../../../../assets/images/order-view/2.webp'
import m3 from '../../../../../assets/images/order-view/3.webp'

const MenuPlanView = () => {
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
      </Col>
      <Col lg={6}>
        <Card>
          <CardBody>
            <h4 className="badge bg-success text-light fs-14 py-1 px-2">30% off</h4>
            <p className="mb-1">
              <Link href="" className="fs-24 text-dark fw-medium">
                International Meal Plan
              </Link>
            </p>
            <div>
              <p>
                Price : <span className="fw-semibold text-success">AED 50</span>
              </p>
              <p>
                Del Price: <del className="fw-semibold text-success">AED 75</del>
              </p>
            </div>

            <h4 className="text-dark fw-medium mt-3">Plan Details :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Badge Title</span> :<span>Best Result</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Added Kcal</span> :<span className="badge bg-success">1,000 -1,400</span>{' '}
                  <span className="badge bg-success">1,000 -1,400</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Delivered daily</span> :<span className="badge bg-success">3 meal</span>{' '}
                  <span className="badge bg-success">2 Snacks</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Weeks</span> :<span className="badge bg-success">3 Week</span> <span className="badge bg-success">2 Week</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Offer</span> :<span className="badge bg-success">15% off</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Suitable for</span> :<span className="badge bg-success">Global test</span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>

            <h4 className="text-dark fw-medium mt-3">Description :</h4>
            <div className="mt-3">
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa maiores molestias laboriosam quas ullam dignissimos illo aliquid autem
                suscipit similique quaerat voluptate laborum, alias consequatur ipsam odit totam consectetur perspiciatis.
              </p>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default MenuPlanView
