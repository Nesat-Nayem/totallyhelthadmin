'use client'

import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useMemo } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
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
  baseAmount: number
  taxPercent: number
  taxAmount?: number
  vatPercent: number
  vatAmount?: number
  grandTotal?: number
  paidBy: string
  approvedBy: string
  status: string
  notes: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
  watch: any
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
  baseAmount: yup.number().typeError('Please enter base amount').required('Please enter base amount').min(0, 'Base amount must be greater than or equal to 0'),
  taxPercent: yup.number().typeError('Please enter tax percentage').required('Please enter tax percentage').min(0, 'Tax percentage must be greater than or equal to 0').max(100, 'Tax percentage cannot exceed 100'),
  taxAmount: yup.number().default(0),
  vatPercent: yup.number().typeError('Please enter VAT percentage').required('Please enter VAT percentage').min(0, 'VAT percentage must be greater than or equal to 0').max(100, 'VAT percentage cannot exceed 100'),
  vatAmount: yup.number().default(0),
  grandTotal: yup.number().default(0),
  paidBy: yup.string().required('Please select staff'),
  approvedBy: yup.string().required('Please enter approved by'),
  status: yup.string().required('Please select status'),
  notes: yup.string().required('Please enter notes'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control, watch }) => {
  // Watch baseAmount, taxPercent, and vatPercent for automatic calculations
  const baseAmount = watch('baseAmount') || 0
  const taxPercent = watch('taxPercent') || 0
  const vatPercent = watch('vatPercent') || 0
  
  // Calculate Tax Amount
  const taxAmount = useMemo(() => {
    const base = parseFloat(String(baseAmount)) || 0
    const tax = parseFloat(String(taxPercent)) || 0
    return (base * tax) / 100
  }, [baseAmount, taxPercent])
  
  // Calculate VAT Amount
  const vatAmount = useMemo(() => {
    const base = parseFloat(String(baseAmount)) || 0
    const vat = parseFloat(String(vatPercent)) || 0
    return (base * vat) / 100
  }, [baseAmount, vatPercent])
  
  // Calculate Grand Total = Base Amount + Tax Amount + VAT Amount
  const grandTotal = useMemo(() => {
    const base = parseFloat(String(baseAmount)) || 0
    return base + taxAmount + vatAmount
  }, [baseAmount, taxAmount, vatAmount])
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Add Expense</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <TextFormInput control={control} name="expenseId" label="Invoice ID" />
          </Col>
          <Col lg={4}>
            <TextFormInput control={control} type="date" name="expenseDate" label="Invoice Date" />
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <label className="form-label">Expense Type</label>
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
            <label className="form-label">Supplier Name</label>
            <Controller
              control={control}
              name="paidBy"
              render={({ field }) => (
                <select {...field} className="form-control form-select mb-3" data-choices data-placeholder="Select Staff">
                  <option value="">Select Supplier</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Suraj Jamdade">Suraj Jamdade</option>
                </select>
              )}
            />
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
                    <option value="Credit">Credit</option>
                  </select>
                )}
              />
            </div>
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} name="paymentReference" label="Payment Reference No." className="mb-3" />
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} type="number" name="baseAmount" label="Base Amount" className="mb-3" step="0.01" min="0" />
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} type="number" name="taxPercent" label="Tax %" className="mb-3" step="0.01" min="0" max="100" defaultValue={0} />
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Tax Amount</label>
              <Form.Control 
                type="text" 
                value={`AED ${taxAmount.toFixed(2)}`} 
                disabled 
                className="bg-light"
              />
            </div>
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} type="number" name="vatPercent" label="VAT %" className="mb-3" step="0.01" min="0" max="100" defaultValue={5} />
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">VAT Amount</label>
              <Form.Control 
                type="text" 
                value={`AED ${vatAmount.toFixed(2)}`} 
                disabled 
                className="bg-light"
              />
            </div>
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Grand Total</label>
              <Form.Control 
                type="text" 
                value={`AED ${grandTotal.toFixed(2)}`} 
                disabled 
                className="bg-light fw-bold"
              />
            </div>
          </Col>

          <Col lg={6}>
            <label className="form-label">Approved By</label>
            <Controller
              control={control}
              name="approvedBy"
              render={({ field }) => (
                <select {...field} className="form-control form-select">
                  <option value="">Select Approved By</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              )}
            />
          </Col>

          <Col lg={6}>
            <TextFormInput control={control} name="notes" label="Notes / Remarks" className="mb-3" />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const ExpenseAdd: React.FC = () => {
  const { reset, handleSubmit, control, watch, setValue } = useForm<FormData>({
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
      baseAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      vatPercent: 5,
      vatAmount: 0,
      grandTotal: 0,
      paidBy: '',
      approvedBy: '',
      notes: '',
    },
  })

  // Watch baseAmount, taxPercent, and vatPercent for automatic calculations
  const baseAmount = watch('baseAmount') || 0
  const taxPercent = watch('taxPercent') || 0
  const vatPercent = watch('vatPercent') || 5
  
  // Calculate and update Tax Amount, VAT Amount, and Grand Total
  React.useEffect(() => {
    const base = parseFloat(String(baseAmount)) || 0
    const tax = parseFloat(String(taxPercent)) || 0
    const vat = parseFloat(String(vatPercent)) || 0
    
    const calculatedTaxAmount = (base * tax) / 100
    const calculatedVatAmount = (base * vat) / 100
    const calculatedGrandTotal = base + calculatedTaxAmount + calculatedVatAmount
    
    setValue('taxAmount', calculatedTaxAmount)
    setValue('vatAmount', calculatedVatAmount)
    setValue('grandTotal', calculatedGrandTotal)
  }, [baseAmount, taxPercent, vatPercent, setValue])

  const onSubmit = (data: FormData) => {
    console.log('Form Submitted:', data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} watch={watch} />
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

export default ExpenseAdd
