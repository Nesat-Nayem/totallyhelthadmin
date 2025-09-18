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
import { useGetPaymentMethodByIdQuery, useUpdatePaymentMethodMutation } from '@/services/paymentMethodApi'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

/** FORM DATA TYPE **/
type FormData = {
  name: string
  status: 'active' | 'inactive'
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter method name'),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}> Payment Method Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="name" label="Method Name" />
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
const EditNewPaymentMethod: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''

  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active', name: '' },
  })

  const { data, isLoading: isFetching, isError: isFetchError, error: fetchError } = useGetPaymentMethodByIdQuery(id, { skip: !id })
  const [updatePaymentMethod, { isLoading: isUpdating, isError, error, isSuccess }] = useUpdatePaymentMethodMutation()

  useEffect(() => {
    if (isFetchError) {
      const msg = (fetchError as any)?.data?.message || (fetchError as any)?.error || 'Failed to load payment method'
      toast.error(msg)
    }
  }, [isFetchError, fetchError])

  useEffect(() => {
    if (data) {
      reset({ name: data.name, status: data.status })
    }
  }, [data, reset])

  useEffect(() => {
    if (isError) {
      const msg = (error as any)?.data?.message || (error as any)?.error || 'Failed to update payment method'
      toast.error(msg)
    }
    if (isSuccess) {
      toast.success('Payment method updated')
      router.push('/payment-method/list-of-payment-method')
    }
  }, [isError, error, isSuccess, router])

  const onSubmit = async (form: FormData) => {
    try {
      await updatePaymentMethod({ id, data: { name: form.name, status: form.status } }).unwrap()
    } catch (err) {
      // handled by effect
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isUpdating || isFetching || !id}>
              {isUpdating ? 'Updating...' : 'Save'}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/payment-method/list-of-payment-method" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default EditNewPaymentMethod
