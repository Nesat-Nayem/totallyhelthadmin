'use client'

import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useUpdateFAQMutation, useGetAllFAQsQuery } from '@/services/faqApi'
import { toast } from 'react-toastify'
import { useRouter, useSearchParams } from 'next/navigation'
import PageTItle from '@/components/PageTItle'

/** FORM DATA TYPE **/
type FAQFormData = {
  question: string
  answer: string
  order: number
  isActive: boolean
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FAQFormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FAQFormData> = yup.object({
  question: yup.string().required('Please enter question'),
  answer: yup.string().required('Please enter answer'),
  order: yup.number().min(0, 'Order must be 0 or greater').default(0),
  isActive: yup.boolean().required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Edit FAQS</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={12}>
            <div className="mb-3">
              <TextFormInput control={control} name="question" label="Question" placeholder="Enter question" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput control={control} name="answer" label="Answer" placeholder="Enter answer" />
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
              name="isActive"
              render={({ field, fieldState }) => (
                <>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value="true"
                        id="statusActive"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                      />
                      <label className="form-check-label" htmlFor="statusActive">
                        Active
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        value="false"
                        id="statusInactive"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
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
const FaqsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  
  const { data: faqsResponse, isLoading: isLoadingData } = useGetAllFAQsQuery()
  const [updateFAQ, { isLoading: isSubmitting }] = useUpdateFAQMutation()

  const { reset, handleSubmit, control } = useForm<FAQFormData>({
    resolver: yupResolver(messageSchema) as any,
    defaultValues: {
      question: '',
      answer: '',
      order: 0,
      isActive: true,
    },
  })

  // Find the FAQ by ID from the list
  const faq = faqsResponse?.data?.find((f) => f._id === id)

  // Populate form when data is fetched
  useEffect(() => {
    if (faq) {
      reset({
        question: faq.question || '',
        answer: faq.answer || '',
        order: faq.order || 0,
        isActive: faq.isActive ?? true,
      })
    }
  }, [faq, reset])

  const onSubmit = async (data: FAQFormData) => {
    if (!id) {
      toast.error('FAQ ID is missing')
      return
    }

    try {
      const payload = {
        question: data.question.trim(),
        answer: data.answer.trim(),
        order: Number(data.order) || 0,
        isActive: data.isActive,
      }

      const result = await updateFAQ({ id, data: payload }).unwrap()
      toast.success(result.message || 'FAQ updated successfully')
      router.push('/support/faqs')
    } catch (error: any) {
      console.error('Error updating FAQ:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to update FAQ')
    }
  }

  if (isLoadingData) {
    return (
      <>
        <PageTItle title="FAQS" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    )
  }

  if (!id || !faq) {
    return (
      <>
        <PageTItle title="FAQS" />
        <div className="text-center py-5">
          <p>FAQ not found</p>
          <Link href="/support/faqs" className="btn btn-primary">
            Back to FAQs
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTItle title="FAQS" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} />
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Update'}
              </Button>
            </Col>
            <Col lg={2}>
              <Link href="/support/faqs" className="btn btn-primary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </>
  )
}

export default FaqsPage
