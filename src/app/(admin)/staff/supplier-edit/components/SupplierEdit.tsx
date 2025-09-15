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
  waiterId: string
  name: string
  gender: string
  dob: string
  phone: string
  email: string
  address: string
  dateOfJoining: string
  shiftType: string
  branch: string
  position: string
  reportingManager: string
  salary: number
  bankName: string
  accountNumber: string
  ifscCode: string
  languages: string
  status: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  waiterId: yup.string().required('Please enter waiter ID'),
  name: yup.string().required('Please enter name'),
  gender: yup.string().required('Please select gender'),
  dob: yup.string().required('Please select date of birth'),
  phone: yup.string().required('Please enter phone number'),
  email: yup.string().email('Invalid email').required('Please enter email'),
  address: yup.string().required('Please enter address'),
  dateOfJoining: yup.string().required('Please select joining date'),
  shiftType: yup.string().required('Please select shift'),
  branch: yup.string().required('Please enter branch'),
  position: yup.string().required('Please enter position'),
  reportingManager: yup.string().required('Please enter manager name'),
  salary: yup.number().typeError('Please enter salary').required('Please enter salary'),
  bankName: yup.string().required('Please enter bank name'),
  accountNumber: yup.string().required('Please enter account number'),
  ifscCode: yup.string().required('Please enter IFSC code'),
  languages: yup.string().required('Please enter languages'),
  status: yup.string().required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Supplier - Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="name" label="Supplier Name" />
            </div>
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="phone" label="Phone" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="email" name="email" label="Email" />
            </div>
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="address" label="Product Categories Supplied" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="dateOfJoining" label="Product Range & Availability" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="branch" label="Price" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="branch" label="Discounts" />
            </div>
          </Col>

          {/* STATUS */}
          <Col lg={6}>
            <label className="form-label">Status</label>
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value="active"
                        checked={field.value === 'active'}
                        onChange={field.onChange}
                        id="statusActive"
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
                        checked={field.value === 'inactive'}
                        onChange={field.onChange}
                        id="statusInactive"
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
const SupplierEdit: React.FC = () => {
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

export default SupplierEdit
