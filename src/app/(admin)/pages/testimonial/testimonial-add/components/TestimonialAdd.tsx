'use client'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useCreateTestimonialMutation } from '@/services/testimonialApi'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

/** FORM DATA TYPE **/
type TestimonialFormData = {
  authorName: string
  authorProfession: string
  quote: string
  order: number
  status: 'active' | 'inactive'
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<TestimonialFormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<TestimonialFormData> = yup.object({
  authorName: yup.string().required('Please enter name'),
  authorProfession: yup.string().required('Please enter designation'),
  quote: yup.string().required('Please enter description'),
  order: yup.number().min(0, 'Order must be 0 or greater').default(0),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Testimonial</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="authorName" label="Author Name" placeholder="Enter author name" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="authorProfession" label="Author Profession" placeholder="Enter author profession" />
            </div>
          </Col>

          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput control={control} name="quote" label="Quote" placeholder="Enter quote" />
            </div>
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="order" label="Order" placeholder="Enter order (optional)" />
            </div>
          </Col>

          {/* STATUS FIELD */}
          <Col lg={6}>
            <label className="form-label">Status</label>
            <Controller
              control={control}
              name="status"
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
const TestimonialAdd: React.FC = () => {
  const router = useRouter()
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<TestimonialFormData>({
    resolver: yupResolver(messageSchema) as any,
    defaultValues: {
      authorName: '',
      authorProfession: '',
      quote: '',
      order: 0,
      status: 'active',
    },
  })

  const [createTestimonial] = useCreateTestimonialMutation()

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      console.log('Form data received:', data)
      
      const payload = {
        quote: data.quote.trim(),
        authorName: data.authorName.trim(),
        authorProfession: data.authorProfession.trim(),
        order: Number(data.order) || 0,
        status: data.status,
      }

      console.log('Payload being sent:', payload)

      const result = await createTestimonial(payload).unwrap()
      toast.success(result.message || 'Testimonial created successfully')
      router.push('/pages/testimonial')
    } catch (error: any) {
      console.error('Error creating testimonial:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to create testimonial')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Save Change'}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/pages/testimonial" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default TestimonialAdd
