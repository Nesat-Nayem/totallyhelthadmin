'use client'

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Link from 'next/link'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import FileUpload from '@/components/FileUpload'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

/** FORM TYPES **/
type FormData = {
  title: string
  discount: string
  badge: string
  description: string
  price: number
  delPrice: number
}

type SingleValue = { value: string }
type WeekOffer = { week: string; offer: string }

const EditMealPlan = () => {
  const { register, handleSubmit } = useForm<FormData>()

  const [kcalList, setKcalList] = useState<SingleValue[]>([{ value: '' }])
  const [deliveredList, setDeliveredList] = useState<SingleValue[]>([{ value: '' }])
  const [suitableList, setSuitableList] = useState<SingleValue[]>([{ value: '' }])
  const [daysPerWeekList, setDaysPerWeekList] = useState<WeekOffer[]>([{ week: '', offer: '' }])
  const [weeksOfferList, setWeeksOfferList] = useState<WeekOffer[]>([{ week: '', offer: '' }])

  const handleChange = <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, index: number, key: keyof T, val: string) => {
    const updated = [...list]
    updated[index] = { ...updated[index], [key]: val }
    setList(updated)
  }

  const handleAdd = <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
    setList([...list, item])
  }

  const handleRemove = <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    const updated = [...list]
    updated.splice(index, 1)
    setList(updated)
  }

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log('Form Submitted:', {
      ...data,
      kcalList,
      deliveredList,
      suitableList,
      daysPerWeekList,
      weeksOfferList,
    })
  }

  return (
    <Col xl={12}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FileUpload title="Meal Plan Photos" />

        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Edit Meal Plan</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input {...register('title')} type="text" id="title" className="form-control" />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <label htmlFor="menuCategory" className="form-label">
                    Select Menu Category
                  </label>
                  <select id="menuCategory" className="form-control form-select">
                    <option value="">Breakfast</option>
                    <option value="">Lunch</option>
                    <option value="">Dinner</option>
                    <option value="">Snacks</option>
                  </select>
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <label htmlFor="brands" className="form-label">
                    Select Brands
                  </label>
                  <select id="brands" className="form-control form-select">
                    <option value="">Totally Health</option>
                    <option value="">Subway</option>
                    <option value="">Pizza Hut</option>
                    <option value="">Burger King</option>
                  </select>
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <label htmlFor="discount" className="form-label">
                    % Off
                  </label>
                  <input {...register('discount')} type="text" id="discount" className="form-control" />
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <label htmlFor="badge" className="form-label">
                    Badge Title
                  </label>
                  <input {...register('badge')} type="text" id="badge" className="form-control" />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    className="form-control bg-light-subtle"
                    id="description"
                    rows={5}
                    placeholder="Short description about the product"
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Dynamic Sections */}
        {[
          { title: 'Add Kcal', state: kcalList, setState: setKcalList },
          { title: 'Delivered Daily', state: deliveredList, setState: setDeliveredList },
          { title: 'Suitable For', state: suitableList, setState: setSuitableList },
        ].map(({ title, state, setState }, i) => (
          <Card key={i}>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4">{title}</CardTitle>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleAdd(state, setState, { value: '' })}>
                +
              </button>
            </CardHeader>
            <CardBody>
              {state.map((item, idx) => (
                <Row key={idx} className="align-items-end mb-3">
                  <Col lg={10}>
                    <label className="form-label">{title}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.value}
                      onChange={(e) => handleChange(state, setState, idx, 'value', e.target.value)}
                    />
                  </Col>
                  <Col lg={2}>
                    {state.length > 1 && (
                      <button type="button" className="btn btn-outline-danger w-100" onClick={() => handleRemove(state, setState, idx)}>
                        Remove
                      </button>
                    )}
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>
        ))}

        {/* Days Per Week */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">Days per week</CardTitle>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleAdd(daysPerWeekList, setDaysPerWeekList, { week: '', offer: '' })}>
              +
            </button>
          </CardHeader>
          <CardBody>
            {daysPerWeekList.map((item, index) => (
              <Row key={index} className="align-items-end mb-3">
                <Col lg={9}>
                  <label className="form-label">Add Days</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.week}
                    onChange={(e) => handleChange(daysPerWeekList, setDaysPerWeekList, index, 'week', e.target.value)}
                  />
                </Col>
                <Col lg={2}>
                  {daysPerWeekList.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => handleRemove(daysPerWeekList, setDaysPerWeekList, index)}>
                      Remove
                    </button>
                  )}
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>

        {/* How Many Weeks */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">How many weeks</CardTitle>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleAdd(weeksOfferList, setWeeksOfferList, { week: '', offer: '' })}>
              +
            </button>
          </CardHeader>
          <CardBody>
            {weeksOfferList.map((item, index) => (
              <Row key={index} className="align-items-end mb-3">
                <Col lg={5}>
                  <label className="form-label">Add Weeks</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.week}
                    onChange={(e) => handleChange(weeksOfferList, setWeeksOfferList, index, 'week', e.target.value)}
                  />
                </Col>
                <Col lg={5}>
                  <label className="form-label">Offer</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.offer}
                    onChange={(e) => handleChange(weeksOfferList, setWeeksOfferList, index, 'offer', e.target.value)}
                  />
                </Col>
                <Col lg={2}>
                  {weeksOfferList.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => handleRemove(weeksOfferList, setWeeksOfferList, index)}>
                      Remove
                    </button>
                  )}
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Pricing Details</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label htmlFor="product-price" className="form-label">
                  Price
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon icon="bx:dollar" />
                  </span>
                  <input type="number" id="product-price" className="form-control" {...register('price')} />
                </div>
              </Col>
              <Col lg={6}>
                <label htmlFor="product-discount" className="form-label">
                  Del Price
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon icon="bxs:discount" />
                  </span>
                  <input type="number" id="product-discount" className="form-control" {...register('delPrice')} />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Submit */}
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button type="submit" className="btn btn-outline-secondary w-100">
                Create Product
              </button>
            </Col>
            <Col lg={2}>
              <Link href="#" className="btn btn-primary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </Col>
  )
}

export default EditMealPlan
