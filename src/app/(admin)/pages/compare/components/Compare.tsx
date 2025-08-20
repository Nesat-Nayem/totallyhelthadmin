'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'
import Link from 'next/link'

const Compare = () => {
  const { control, handleSubmit } = useForm()

  const [performers, setPerformers] = useState([{ name: '', status: 'active' }])

  const addPerformer = () => {
    setPerformers([...performers, { name: '', status: 'active' }])
  }

  const handleChange = (index: number, field: keyof (typeof performers)[number], value: any) => {
    const updated = [...performers]
    updated[index][field] = value
    setPerformers(updated)
  }

  const removePerformer = (index: number) => {
    const updated = [...performers]
    updated.splice(index, 1)
    setPerformers(updated)
  }

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
              <Col lg={4}>
                <label className="form-label">Title</label>
                <input type="text" className="form-control" name="title" />
              </Col>
              <Col lg={4}>
                <label className="form-label">Banner 1</label>
                <input type="file" className="form-control" name="banner1" />
              </Col>
              <Col lg={4}>
                <label className="form-label">Banner 2</label>
                <input type="file" className="form-control" name="banner2" />
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">Compare</CardTitle>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addPerformer}>
              +
            </button>
          </CardHeader>
          <CardBody>
            {performers.map((performer, index) => (
              <Row key={index} className="align-items-end mb-3">
                <Col lg={5}>
                  <label className="form-label">Title</label>
                  <input type="text" className="form-control" value={performer.name} onChange={(e) => handleChange(index, 'name', e.target.value)} />
                </Col>

                <Col lg={5}>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`status-${index}`}
                        value="active"
                        checked={performer.status === 'active'}
                        onChange={(e) => handleChange(index, 'status', e.target.value)}
                        id={`status-active-${index}`}
                      />
                      <label className="form-check-label" htmlFor={`status-active-${index}`}>
                        Yes
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`status-${index}`}
                        value="inactive"
                        checked={performer.status === 'inactive'}
                        onChange={(e) => handleChange(index, 'status', e.target.value)}
                        id={`status-inactive-${index}`}
                      />
                      <label className="form-check-label" htmlFor={`status-inactive-${index}`}>
                        No
                      </label>
                    </div>
                  </div>
                </Col>

                <Col lg={2}>
                  {performers.length > 1 && (
                    <button type="button" className="btn btn-outline-danger w-100" onClick={() => removePerformer(index)}>
                      Remove
                    </button>
                  )}
                </Col>
              </Row>
            ))}
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

export default Compare
