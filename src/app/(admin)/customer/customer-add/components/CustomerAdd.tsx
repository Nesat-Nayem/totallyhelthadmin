'use client'

import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'

/** FORM DATA TYPE **/
type FormData = {
  Name: string
  Phone: string
  Email: string
  MealPlanStartDate: string
  file: FileList
  status: string
  address: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  Name: yup.string().required('Please enter title'),
  Phone: yup.string().required('Please enter title'),
  Email: yup.string().required('Please enter title'),
  MealPlanStartDate: yup.string().required('Please enter title'),
  address: yup.string().required('Please enter title'),
  file: yup
    .mixed<FileList>()
    .test('required', 'Please upload a banner image', (value) => value && value.length > 0)
    .required(),
  status: yup.string().required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Customer Add</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="Name" label="Enter Name" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="Phone" label="Phone" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="email" name="Email" label="Email Address" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="address" label="Address" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="date" name="MealPlanStartDate" label="Meal Plan Start Date" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="date" name="MealPlanStartDate" label="Meal Plan End Date" />
            </div>
          </Col>

          {/* STATUS FIELD */}
          <Col lg={6}>
            <label className="form-label">Status</label>
            <Controller
              control={control}
              name="status"
              rules={{ required: 'Please select a status' }}
              render={({ field, fieldState }) => (
                <>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value="active"
                        id="statusActive"
                        checked={field.value === 'active'}
                        onChange={field.onChange}
                      />
                      <label className="form-check-label" htmlFor="statusActive">
                        Active
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value="inactive"
                        id="statusInactive"
                        checked={field.value === 'inactive'}
                        onChange={field.onChange}
                      />
                      <label className="form-check-label" htmlFor="statusInactive">
                        Inactive
                      </label>
                    </div>
                  </div>
                  {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                </>
              )}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const CustomerAdd: React.FC = () => {
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active' },
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

export default CustomerAdd
