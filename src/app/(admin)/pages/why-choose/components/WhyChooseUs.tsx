'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'
import Link from 'next/link'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'

const WhyChooseUs = () => {
  const { control, handleSubmit } = useForm()

  const [performers, setPerformers] = useState([{ name: '', status: 'active' }])

  const onSubmit = (data: any) => {
    console.log('Form Submitted:', {
      ...data,
      performers,
    })
  }

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Basic Details</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label className="form-label">Title</label>
                <input type="text" className="form-control" name="title" />
              </Col>
              <Col lg={6}>
                <label className="form-label">Sub Title</label>
                <input type="text" className="form-control" name="Sub Title" />
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Card 1</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label className="form-label">Icon</label>
                <input type="file" className="form-control" name="title" />
              </Col>
              <Col lg={6}>
                <label className="form-label"> Title</label>
                <input type="text" className="form-control" name=" Title" />
              </Col>
              <Col lg={12}>
                <div className="mt-3">
                  <TextAreaFormInput rows={4} control={control} type="text" name="description2" label="Description" placeholder="Type description" />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Card 2</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label className="form-label">Icon</label>
                <input type="file" className="form-control" name="title" />
              </Col>
              <Col lg={6}>
                <label className="form-label"> Title</label>
                <input type="text" className="form-control" name=" Title" />
              </Col>
              <Col lg={12}>
                <div className="mt-3">
                  <TextAreaFormInput rows={4} control={control} type="text" name="description2" label="Description" placeholder="Type description" />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Card 3</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label className="form-label">Icon</label>
                <input type="file" className="form-control" name="title" />
              </Col>
              <Col lg={6}>
                <label className="form-label"> Title</label>
                <input type="text" className="form-control" name=" Title" />
              </Col>
              <Col lg={12}>
                <div className="mt-3">
                  <TextAreaFormInput rows={4} control={control} type="text" name="description2" label="Description" placeholder="Type description" />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button type="submit" className="btn btn-outline-secondary w-100">
                Save
              </button>
            </Col>
            <Col lg={2}>
              <Link href="" className="btn btn-primary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </Container>
  )
}

export default WhyChooseUs
