'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGetMoreOptionByIdQuery, useUpdateMoreOptionMutation } from '@/services/moreOptionApi'
import { toast } from 'react-toastify'

/** FORM DATA TYPE **/
type FormData = {
  name: string
  price: number | string
  category: 'more' | 'less' | 'without' | 'general'
  status: 'active' | 'inactive'
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter name'),
  price: yup
    .number()
    .typeError('Please enter a valid price')
    .min(0, 'Price must be non-negative')
    .required('Please enter price'),
  category: yup.mixed<'more' | 'less' | 'without' | 'general'>().oneOf(['more', 'less', 'without', 'general']).required('Please select a category'),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>More Options Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="name" label="Item Name" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="price" label="Item Price" />
            </div>
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
const MoreOptionsEdit: React.FC = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const router = useRouter()
  
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active', name: '', price: '', category: 'general' },
  })
  
  const { data: moreOption, isLoading: loadingOption } = useGetMoreOptionByIdQuery(id, { skip: !id })
  const [updateMoreOption, { isLoading }] = useUpdateMoreOptionMutation()

  useEffect(() => {
    if (moreOption) {
      reset({
        name: moreOption.name,
        price: moreOption.price,
        category: moreOption.category || 'general',
        status: moreOption.status || 'active',
      })
    }
  }, [moreOption, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        price: typeof data.price === 'string' ? Number(data.price) : data.price,
        category: data.category,
        status: data.status,
      }
      
      await updateMoreOption({ 
        id, 
        data: payload 
      }).unwrap()
      toast.success('More option updated successfully')
      router.push('/more-options')
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to update more option')
    }
  }

  if (loadingOption) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        Loading more option...
      </div>
    )
  }

  if (!id || !moreOption) {
    return (
      <div className="text-center py-5">
        <p>More option not found</p>
        <Link href="/more-options" className="btn btn-primary">
          Back to More Options
        </Link>
      </div>
    )
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
                  Updating...
                </>
              ) : (
                'Update'
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

export default MoreOptionsEdit
