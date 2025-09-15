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
        <CardTitle as={'h4'}>Staff Master - edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="waiterId" label="Staff ID" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="name" label="Full Name" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="file" name="name" label="Profile Photo" />
            </div>
          </Col>
          <Col lg={4}>
            <label htmlFor="" className="form-label">
              Gender
            </label>
            <div className="mb-3">
              <select name="gender" id="" className="form-control form-select">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="date" name="dob" label="Date of Birth" />
            </div>
          </Col>
          <Col lg={4}>
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
              <TextFormInput control={control} name="address" label="Address" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="date" name="dateOfJoining" label="Date of Joining" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <label htmlFor="" className="form-label">
                Shift Type
              </label>
              <div className="mb-3">
                <select name="sift" id="" className="form-control form-select">
                  <option value="">Select Type</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <label htmlFor="" className="form-label">
                Select Branch
              </label>
              <div className="mb-3">
                <select name="sift" id="" className="form-control form-select">
                  <option value="">Select Branch</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                </select>
              </div>
            </div>
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="position" label="Position" placeholder="Waiter / Senior Waiter" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="reportingManager" label="Reporting Manager" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="salary" label="Salary" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="bankName" label="Bank Name" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="accountNumber" label="Account Number" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="ifscCode" label="IFSC Code" />
            </div>
          </Col>
          <Col lg={8}>
            <div className="mb-3">
              <TextFormInput control={control} name="languages" label="Languages Known" placeholder="English, Hindi" />
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
const WaiterEdit: React.FC = () => {
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
              Save Changes
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

export default WaiterEdit
