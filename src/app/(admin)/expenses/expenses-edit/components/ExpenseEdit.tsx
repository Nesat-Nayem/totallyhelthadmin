'use client'

import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'

/** FORM DATA TYPE **/
type FormData = {
  expenseId: string
  expenseDate: string
  category: string
  description: string
  vendor: string
  invoiceNumber: string
  paymentMethod: string
  paymentReference: string
  totalAmount: number
  paidBy: string
  approvedBy: string
  status: string
  notes: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  expenseId: yup.string().required('Please enter expense ID'),
  expenseDate: yup.string().required('Please select expense date'),
  category: yup.string().required('Please select category'),
  description: yup.string().required('Please enter description'),
  vendor: yup.string().required('Please enter vendor name'),
  invoiceNumber: yup.string().required('Please enter invoice number'),
  paymentMethod: yup.string().required('Please select payment method'),
  paymentReference: yup.string().required('Please enter payment reference'),
  totalAmount: yup.number().typeError('Please enter total amount').required('Please enter total amount'),
  paidBy: yup.string().required('Please select staff'),
  approvedBy: yup.string().required('Please enter approved by'),
  status: yup.string().required('Please select status'),
  notes: yup.string().required('Please enter notes'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Edit Expense</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <TextFormInput control={control} name="expenseId" label="Expense ID" />
          </Col>
          <Col lg={4}>
            <TextFormInput control={control} type="date" name="expenseDate" label="Expense Date" />
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <select {...field} className="form-control form-select">
                    <option value="">Select Category</option>
                    <option value="Travel">Travel</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              />
            </div>
          </Col>

          <Col lg={12}>
            <TextFormInput control={control} name="description" label="Description / Purpose" className="mb-3" />
          </Col>

          <Col lg={6}>
            <label className="form-label">Staff Name</label>
            <Controller
              control={control}
              name="paidBy"
              render={({ field }) => (
                <ChoicesFormInput {...field} className="form-control" data-choices data-placeholder="Select Staff">
                  <option value="">Select Staff</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Suraj Jamdade">Suraj Jamdade</option>
                </ChoicesFormInput>
              )}
            />
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} name="invoiceNumber" label="Invoice / Bill Number" className="mb-3" />
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <select {...field} className="form-control form-select">
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                )}
              />
            </div>
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} name="paymentReference" label="Payment Reference No." className="mb-3" />
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} type="number" name="totalAmount" label="Total Amount" className="mb-3" />
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} name="approvedBy" label="Approved By" className="mb-3" />
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Upload Receipt</label>
              <input type="file" className="form-control" />
            </div>
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} name="notes" label="Notes / Remarks" className="mb-3" />
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
const ExpenseEdit: React.FC = () => {
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      status: 'active',
      expenseId: '',
      expenseDate: '',
      category: '',
      description: '',
      vendor: '',
      invoiceNumber: '',
      paymentMethod: '',
      paymentReference: '',
      totalAmount: 0,
      paidBy: '',
      approvedBy: '',
      notes: '',
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
            <Link href="#" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default ExpenseEdit
