'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, Carousel, CarouselItem, Col, ListGroup, Row } from 'react-bootstrap'
import { useSearchParams } from 'next/navigation'
import { apiFetch } from '@/utils/api'

type MealPlan = {
  _id: string
  title: string
  description?: string
  discount?: string
  badge?: string
  price?: number
  delPrice?: number
  category?: string
  brand?: string
  kcalList?: string[]
  deliveredList?: string[]
  suitableList?: string[]
  daysPerWeek?: string[]
  weeksOffers?: { week: string; offer: string }[]
  thumbnail?: { url?: string; secure_url?: string } | string
  images?: ({ _id?: string; url?: string; secure_url?: string } | string)[]
}

const MenuPlanView = () => {
  const params = useSearchParams()
  const id = params.get('id') || ''
  const [activeIndex, setActiveIndex] = useState(0)
  const [item, setItem] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const handleSelect = (selectedIndex: number) => setActiveIndex(selectedIndex)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await apiFetch<{ data: MealPlan }>(`/meal-plans/${id}`)
        setItem(res.data)
      } catch (e) {
        setItem(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const getImgUrl = (u?: any): string | undefined => {
    if (!u) return undefined
    if (typeof u === 'string') return u
    return u.url || u.secure_url
  }

  const gallery = useMemo(() => {
    if (!item) return [] as string[]
    const urls = [getImgUrl(item.thumbnail), ...(item.images?.map((i) => getImgUrl(i)) || [])].filter(Boolean) as string[]
    return urls.length ? urls : ['/placeholder.svg']
  }, [item])
  return (
    <Row>
      <Col lg={6}>
        <Card>
          <CardBody>
            <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel">
              <Carousel activeIndex={activeIndex} onSelect={handleSelect} indicators={false} className="carousel-inner" role="listbox">
                {gallery.map((url, idx) => (
                  <CarouselItem key={idx}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="meal" className="img-fluid bg-light rounded w-100" />
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
            {loading ? (
              <p>Loading...</p>
            ) : !item ? (
              <p>Meal plan not found</p>
            ) : (
              <>
                {item.discount && <h4 className="badge bg-success text-light fs-14 py-1 px-2">{item.discount} off</h4>}
                <p className="mb-1">
                  <span className="fs-24 text-dark fw-medium">{item.title}</span>
                </p>
                <div>
                  <p>
                    Price : <span className="fw-semibold text-success">{item.price ?? '-'}</span>
                  </p>
                  {item.delPrice !== undefined && (
                    <p>
                      Del Price: <del className="fw-semibold text-success">{item.delPrice}</del>
                    </p>
                  )}
                </div>

                <h4 className="text-dark fw-medium mt-3">Plan Details :</h4>
                <div className="mt-3">
                  <ListGroup>
                    {item.badge && (
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Badge Title</span> :<span>{item.badge}</span>
                      </ListGroup.Item>
                    )}
                    {item.kcalList && item.kcalList.length > 0 && (
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Added Kcal</span> :
                        <span className="d-flex gap-2 flex-wrap">
                          {item.kcalList.map((k, i) => (
                            <span key={i} className="badge bg-success">
                              {k}
                            </span>
                          ))}
                        </span>
                      </ListGroup.Item>
                    )}
                    {item.deliveredList && item.deliveredList.length > 0 && (
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Delivered daily</span> :
                        <span className="d-flex gap-2 flex-wrap">
                          {item.deliveredList.map((k, i) => (
                            <span key={i} className="badge bg-success">
                              {k}
                            </span>
                          ))}
                        </span>
                      </ListGroup.Item>
                    )}
                    {item.daysPerWeek && item.daysPerWeek.length > 0 && (
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Days per week</span> :
                        <span className="d-flex gap-2 flex-wrap">
                          {item.daysPerWeek.map((k, i) => (
                            <span key={i} className="badge bg-success">
                              {k}
                            </span>
                          ))}
                        </span>
                      </ListGroup.Item>
                    )}
                    {item.weeksOffers && item.weeksOffers.length > 0 && (
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Offers</span> :
                        <span className="d-flex gap-2 flex-wrap">
                          {item.weeksOffers.map((w, i) => (
                            <span key={i} className="badge bg-success">
                              {w.week}: {w.offer}
                            </span>
                          ))}
                        </span>
                      </ListGroup.Item>
                    )}
                    {item.suitableList && item.suitableList.length > 0 && (
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Suitable for</span> :
                        <span className="d-flex gap-2 flex-wrap">
                          {item.suitableList.map((k, i) => (
                            <span key={i} className="badge bg-success">
                              {k}
                            </span>
                          ))}
                        </span>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </div>

                <h4 className="text-dark fw-medium mt-3">Description :</h4>
                <div className="mt-3">
                  <p>{item.description || '-'}</p>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default MenuPlanView
