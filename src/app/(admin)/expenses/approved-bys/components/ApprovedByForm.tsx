'use client'

import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateApprovedByMutation, useGetApprovedByIdQuery, useUpdateApprovedByMutation } from '@/services/approvedByApi'
import { toast } from 'react-toastify'

type FormData = {
  name: string
  status: 'active' | 'inactive'
}

const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter approved by name'),
  status: yup.string().oneOf(['active', 'inactive']).required('Please select status'),
})

const ApprovedByForm: React.FC<{ id?: string }> = ({ id }) => {
  const router = useRouter()
  const isEditMode = !!id
  const [createApprovedBy, { isLoading: isCreating }] = useCreateApprovedByMutation()
  const [updateApprovedBy, { isLoading: isUpdating }] = useUpdateApprovedByMutation()
  const { data: approvedByData, isLoading: isLoadingData } = useGetApprovedByIdQuery(id || '', { skip: !id })

  const { handleSubmit, control, reset } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      name: '',
      status: 'active',
    },
  })

  React.useEffect(() => {
    if (isEditMode && approvedByData?.data) {
      reset({
        name: approvedByData.data.name,
        status: approvedByData.data.status,
      })
    }
  }, [approvedByData, isEditMode, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && id) {
        await updateApprovedBy({ id, data }).unwrap()
        toast.success('Approved by updated successfully')
      } else {
        await createApprovedBy(data).unwrap()
        toast.success('Approved by created successfully')
      }
      router.push('/expenses/approved-bys')
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} approved by`)
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
          <CardTitle as={'h4'}>{isEditMode ? 'Edit Approved By' : 'Add Approved By'}</CardTitle>
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

export default ApprovedByForm

