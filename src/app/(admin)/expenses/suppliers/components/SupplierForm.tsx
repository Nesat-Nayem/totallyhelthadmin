'use client'

import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateSupplierMutation, useGetSupplierByIdQuery, useUpdateSupplierMutation } from '@/services/supplierApi'
import { toast } from 'react-toastify'

type FormData = {
  name: string
  status: 'active' | 'inactive'
}

const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter supplier name'),
  status: yup.string().oneOf(['active', 'inactive']).required('Please select status'),
})

const SupplierForm: React.FC<{ id?: string }> = ({ id }) => {
  const router = useRouter()
  const isEditMode = !!id
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation()
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation()
  const { data: supplierData, isLoading: isLoadingData } = useGetSupplierByIdQuery(id || '', { skip: !id })

  const { handleSubmit, control, reset } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      name: '',
      status: 'active',
    },
  })

  React.useEffect(() => {
    if (isEditMode && supplierData?.data) {
      reset({
        name: supplierData.data.name,
        status: supplierData.data.status,
      })
    }
  }, [supplierData, isEditMode, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && id) {
        await updateSupplier({ id, data }).unwrap()
        toast.success('Supplier updated successfully')
      } else {
        await createSupplier(data).unwrap()
        toast.success('Supplier created successfully')
      }
      router.push('/expenses/suppliers')
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} supplier`)
    }
  }

  if (isEditMode && isLoadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>{isEditMode ? 'Edit Supplier' : 'Add Supplier'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <TextFormInput control={control} name="name" label="Name" />
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <select {...field} className="form-control form-select">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  )}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="button" className="w-100" onClick={() => router.back()}>
              Cancel
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="primary" type="submit" className="w-100" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default SupplierForm

