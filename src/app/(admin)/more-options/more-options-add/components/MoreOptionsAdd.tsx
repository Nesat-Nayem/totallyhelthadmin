'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateMoreOptionMutation } from '@/services/moreOptionApi'
import { toast } from 'react-toastify'

/** FORM DATA TYPE **/
type FormData = {
  name: string
  category: 'more' | 'less' | 'without' | 'general'
  status: 'active' | 'inactive'
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  category: yup.mixed<'more' | 'less' | 'without' | 'general'>().oneOf(['more', 'less', 'without', 'general']).required('Please select a category'),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>More Options Add</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>

          {/* NAME FIELD */}
          <Col lg={6}>
            <label className="form-label">Name</label>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    type="text"
                    className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                    placeholder="Enter option name"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                </>
              )}
            />
          </Col>

          {/* CATEGORY FIELD */}
          <Col lg={6}>
            <label className="form-label">Category</label>
            <Controller
              control={control}
              name="category"
              rules={{ required: 'Please select a category' }}
              render={({ field, fieldState }) => (
                <>
                  <select className="form-select" value={field.value} onChange={field.onChange}>
                    <option value="">Select Category</option>
                    <option value="more">More Options</option>
                    <option value="less">Less Options</option>
                    <option value="without">Without Options</option>
                    <option value="general">General Options</option>
                  </select>
                  {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                </>
              )}
            />
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
const MoreOptionsAdd: React.FC = () => {
  const router = useRouter()
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { name: '', status: 'active', category: 'general' },
  })
  const [createMoreOption, { isLoading }] = useCreateMoreOptionMutation()

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        category: data.category,
        status: data.status,
      }
      await createMoreOption(payload).unwrap()
      toast.success('More option created successfully')
      router.push('/more-options')
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to create more option')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/more-options" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default MoreOptionsAdd

