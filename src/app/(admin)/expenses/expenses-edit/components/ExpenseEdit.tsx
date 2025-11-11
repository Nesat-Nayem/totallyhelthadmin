'use client'

import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useMemo } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useRouter, useParams } from 'next/navigation'
import { useGetExpenseTypesQuery } from '@/services/expenseTypeApi'
import { useGetSuppliersQuery } from '@/services/supplierApi'
import { useGetApprovedBysQuery } from '@/services/approvedByApi'
import { useGetPaymentMethodsQuery } from '@/services/paymentMethodApi'
import { useGetExpenseByIdQuery, useUpdateExpenseMutation } from '@/services/expenseApi'
import { toast } from 'react-toastify'

/** FORM DATA TYPE **/
type FormData = {
  expenseId: string
  expenseDate: string
  category: string
  description: string
  vendor: string
  invoiceNumber?: string
  paymentMethod: string
  paymentReference?: string
  baseAmount: number
  taxPercent: number
  taxAmount?: number
  vatPercent: number
  vatAmount?: number
  grandTotal?: number
  paidBy?: string
  approvedBy: string
  status?: string
  notes?: string
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
  vendor: yup.string().required('Please select supplier'),
  invoiceNumber: yup.string().optional(),
  paymentMethod: yup.string().required('Please select payment method'),
  paymentReference: yup.string().optional(),
  baseAmount: yup.number().typeError('Please enter base amount').required('Please enter base amount').min(0, 'Base amount must be greater than or equal to 0'),
  taxPercent: yup.number().typeError('Please enter tax percentage').required('Please enter tax percentage').min(0, 'Tax percentage must be greater than or equal to 0').max(100, 'Tax percentage cannot exceed 100'),
  taxAmount: yup.number().optional().default(0),
  vatPercent: yup.number().typeError('Please enter VAT percentage').required('Please enter VAT percentage').min(0, 'VAT percentage must be greater than or equal to 0').max(100, 'VAT percentage cannot exceed 100'),
  vatAmount: yup.number().optional().default(0),
  grandTotal: yup.number().optional().default(0),
  paidBy: yup.string().optional(),
  approvedBy: yup.string().required('Please select approved by'),
  status: yup.string().optional().default('active'),
  notes: yup.string().optional(),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control, watch }) => {
  // Watch baseAmount, taxPercent, and vatPercent for automatic calculations
  const baseAmount = watch('baseAmount') || 0
  const taxPercent = watch('taxPercent') || 0
  const vatPercent = watch('vatPercent') || 0
  
  // Fetch data dynamically
  const { data: expenseTypesData, isLoading: expenseTypesLoading } = useGetExpenseTypesQuery()
  const { data: suppliersData, isLoading: suppliersLoading } = useGetSuppliersQuery()
  const { data: approvedBysData, isLoading: approvedBysLoading } = useGetApprovedBysQuery()
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useGetPaymentMethodsQuery()
  
  const expenseTypes = expenseTypesData?.data || []
  const suppliers = suppliersData?.data || []
  const approvedBys = approvedBysData?.data || []
  const paymentMethods = paymentMethodsData || []
  
  // Filter only active items
  const activeExpenseTypes = expenseTypes
    .filter((et: any) => et.status === 'active')
    .sort((a: any, b: any) => {
      // Put "Travel" first, then sort others alphabetically
      if (a.name.toLowerCase() === 'travel') return -1
      if (b.name.toLowerCase() === 'travel') return 1
      return a.name.localeCompare(b.name)
    })
  const activeSuppliers = suppliers.filter((s: any) => s.status === 'active')
  const activeApprovedBys = approvedBys.filter((ab: any) => ab.status === 'active')
  // Filter payment methods to only show Cash and Credit
  const activePaymentMethods = paymentMethods.filter((pm: any) => 
    pm.status === 'active' && (pm.name.toLowerCase() === 'cash' || pm.name.toLowerCase() === 'credit')
  )
  
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
        <CardTitle as={'h4'}>Edit Expense</CardTitle>
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
                  <select {...field} className="form-control form-select" disabled={expenseTypesLoading}>
                    <option value="">Select Category</option>
                    {activeExpenseTypes.map((et: any) => (
                      <option key={et._id} value={et._id}>
                        {et.name}
                      </option>
                    ))}
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
              name="vendor"
              render={({ field }) => (
                <select {...field} className="form-control form-select mb-3" disabled={suppliersLoading}>
                  <option value="">Select Supplier</option>
                  {activeSuppliers.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
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
                  <select {...field} className="form-control form-select" disabled={paymentMethodsLoading}>
                    <option value="">Select Payment Method</option>
                    {activePaymentMethods.map((pm: any) => (
                      <option key={pm._id} value={pm.name}>
                        {pm.name}
                      </option>
                    ))}
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
                <select {...field} className="form-control form-select" disabled={approvedBysLoading}>
                  <option value="">Select Approved By</option>
                  {activeApprovedBys.map((ab: any) => (
                    <option key={ab._id} value={ab._id}>
                      {ab.name}
                    </option>
                  ))}
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
const ExpenseEdit: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const expenseId = params?.id as string
  const [updateExpense, { isLoading: isSubmitting }] = useUpdateExpenseMutation()
  const { data: expenseData, isLoading: isLoadingData } = useGetExpenseByIdQuery(expenseId || '', { skip: !expenseId })

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

  React.useEffect(() => {
    if (expenseData?.data) {
      const expense = expenseData.data
      reset({
        expenseId: expense.invoiceId || '',
        expenseDate: expense.invoiceDate ? new Date(expense.invoiceDate).toISOString().split('T')[0] : '',
        category: typeof expense.expenseType === 'object' ? expense.expenseType._id : expense.expenseType || '',
        description: expense.description || '',
        vendor: typeof expense.supplier === 'object' ? expense.supplier._id : expense.supplier || '',
        invoiceNumber: expense.invoiceId || '',
        paymentMethod: expense.paymentMethod || '',
        paymentReference: expense.paymentReferenceNo || expense.paymentReference || '',
        baseAmount: expense.baseAmount || 0,
        taxPercent: expense.taxPercent || 0,
        taxAmount: expense.taxAmount || 0,
        vatPercent: expense.vatPercent || 5,
        vatAmount: expense.vatAmount || 0,
        grandTotal: expense.grandTotal || 0,
        paidBy: '',
        approvedBy: typeof expense.approvedBy === 'object' ? expense.approvedBy._id : expense.approvedBy || '',
        status: expense.status || 'active',
        notes: expense.notes || '',
      })
    }
  }, [expenseData, reset])

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

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form data:', data)
      // Normalize payment method to match backend expectation (Cash or Credit)
      const paymentMethodNormalized = data.paymentMethod 
        ? data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1).toLowerCase()
        : 'Cash'
      
      const payload = {
        invoiceId: data.expenseId,
        invoiceDate: data.expenseDate,
        expenseType: data.category,
        description: data.description || '',
        supplier: data.vendor,
        paymentMethod: paymentMethodNormalized,
        paymentReferenceNo: data.paymentReference || '',
        baseAmount: data.baseAmount,
        taxPercent: data.taxPercent || 0,
        taxAmount: data.taxAmount || 0,
        vatPercent: data.vatPercent || 5,
        vatAmount: data.vatAmount || 0,
        grandTotal: data.grandTotal || 0,
        approvedBy: data.approvedBy,
        status: (data.status === 'active' || data.status === 'inactive' ? data.status : 'active') as 'active' | 'inactive',
        notes: data.notes || '',
      }
      
      console.log('Payload:', payload)
      const result = await updateExpense({ id: expenseId, data: payload }).unwrap()
      console.log('Success:', result)
      toast.success('Expense updated successfully')
      // Redirect based on payment method (Cash or Credit only)
      if (payload.paymentMethod.toLowerCase() === 'cash') {
        router.push('/expenses/cash-expense')
        router.refresh()
      } else if (payload.paymentMethod.toLowerCase() === 'credit') {
        router.push('/expenses/credit-expense')
        router.refresh()
      } else {
        // Default to cash expense if payment method is not recognized
        router.push('/expenses/cash-expense')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error updating expense:', error)
      const errorMessage = error?.data?.message || error?.message || 'Failed to update expense'
      toast.error(errorMessage)
    }
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    // Show first error message
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      toast.error(firstError.message)
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  if (isLoadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <GeneralInformationCard control={control} watch={watch} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="button" className="w-100" onClick={() => router.back()}>
              Cancel
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default ExpenseEdit
