'use client'

import React from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm, Controller, Control } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'

/** FORM DATA TYPE **/
type FormData = {
  Name: string
  Phone: string
  Email: string
  MealPlanStartDate: string
  MealPlanEndDate: string
  MealPlanType: string
  NoOfMeals: string
  Price: string
  Discount: string
  Vat: string
  Address1: string
  Address2: string
  status: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  Name: yup.string().required('Please enter Name'),
  Phone: yup.string().required('Please enter Phone'),
  Email: yup.string().email('Invalid email').required('Please enter Email'),
  MealPlanStartDate: yup.string().required('Please select Start Date'),
  MealPlanEndDate: yup.string().required('Please select End Date'),
  MealPlanType: yup.string().required('Please enter Meal Plan Type'),
  NoOfMeals: yup.string().required('Please enter number of meals'),
  Price: yup.string().required('Please enter Price'),
  Discount: yup.string().required('Please enter Discount'),
  Vat: yup.string().required('Please enter VAT'),
  Address1: yup.string().required('Please enter Address 1'),
  Address2: yup.string().required('Please enter Address 2'),
  status: yup.string().required('Please select status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Customer Add</CardTitle>
      </CardHeader>
      <CardBody>
        <Row className="g-3">
          <Col md={6}>
            <Controller
              name="Name"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control {...field} placeholder="Enter Name" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="Phone"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control {...field} placeholder="Enter Phone" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="Email"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control {...field} placeholder="Enter Email" type="email" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="MealPlanStartDate"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Plan Start Date</Form.Label>
                  <Form.Control {...field} type="date" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="MealPlanEndDate"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Plan End Date</Form.Label>
                  <Form.Control {...field} type="date" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="MealPlanType"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Meal Plan Type</Form.Label>
                  <Form.Control {...field} placeholder="Plan Type" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="NoOfMeals"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>No Of Meals</Form.Label>
                  <Form.Control {...field} placeholder="Enter no of meals" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="Price"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Price</Form.Label>
                  <Form.Control {...field} placeholder="Enter price" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="Discount"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Discount</Form.Label>
                  <Form.Control {...field} placeholder="Enter discount" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              name="Vat"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>VAT</Form.Label>
                  <Form.Control {...field} placeholder="Enter VAT" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={12}>
            <Controller
              name="Address1"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Address 1</Form.Label>
                  <Form.Control {...field} as="textarea" rows={3} placeholder="Enter Address 1" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={12}>
            <Controller
              name="Address2"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Group>
                  <Form.Label>Address 2</Form.Label>
                  <Form.Control {...field} as="textarea" rows={3} placeholder="Enter Address 2" isInvalid={!!fieldState.error} />
                  <Form.Control.Feedback type="invalid">{fieldState.error?.message}</Form.Control.Feedback>
                </Form.Group>
              )}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const CustomerEdit: React.FC = () => {
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      status: 'active',
      Name: '',
      Phone: '',
      Email: '',
      MealPlanStartDate: '',
      MealPlanEndDate: '',
      MealPlanType: '',
      NoOfMeals: '',
      Price: '',
      Discount: '',
      Vat: '',
      Address1: '',
      Address2: '',
    },
  })

  const onSubmit = (data: FormData) => {
    console.log('Form Submitted:', data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100">
              Save
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default CustomerEdit
