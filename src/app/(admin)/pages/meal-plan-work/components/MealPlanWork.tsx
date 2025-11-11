'use client'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useGetMealPlanWorkQuery, useUpsertMealPlanWorkMutation } from '@/services/mealPlanWorkApi'
import { toast } from 'react-toastify'
import Image from 'next/image'

type controlType = {
  control: Control<any>
}

type MealPlanWorkFormData = {
  title: string
  subtitle: string
  banner1: FileList | null
  banner2: FileList | null
  step1Title: string
  step1SubTitle: string
  step2Title: string
  step2SubTitle: string
  step3Title: string
  step3SubTitle: string
  metaTitle: string
  metaTagKeyword: string
  description: string
  status: 'active' | 'inactive'
  // For existing banners (when editing)
  banner1Url?: string
  banner2Url?: string
}

const GeneralInformationCard = ({ control, banner1Url, banner2Url }: controlType & { banner1Url?: string; banner2Url?: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>General Information</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="title" label="Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="subtitle" label="Subtitle" placeholder="Enter Subtitle" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <Controller
                control={control}
                name="banner1"
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                  <div>
                    <label className="form-label">Banner 1</label>
                    <input
                      {...field}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files
                        onChange(files)
                      }}
                      className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                    />
                    {banner1Url && !value && (
                      <div className="mt-2">
                        <small className="text-muted d-block mb-1">Current banner:</small>
                        <Image 
                          src={banner1Url} 
                          alt="Banner 1" 
                          width={150}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                    {fieldState.error && (
                      <div className="invalid-feedback">{fieldState.error.message}</div>
                    )}
                  </div>
                )}
              />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <Controller
                control={control}
                name="banner2"
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                  <div>
                    <label className="form-label">Banner 2</label>
                    <input
                      {...field}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files
                        onChange(files)
                      }}
                      className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                    />
                    {banner2Url && !value && (
                      <div className="mt-2">
                        <small className="text-muted d-block mb-1">Current banner:</small>
                        <Image 
                          src={banner2Url} 
                          alt="Banner 2" 
                          width={150}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                    {fieldState.error && (
                      <div className="invalid-feedback">{fieldState.error.message}</div>
                    )}
                  </div>
                )}
              />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
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
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const InfoCard1 = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Step 1</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="step1Title" label="Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="step1SubTitle" label="Sub Title" placeholder="Enter Sub Title" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const InfoCard2 = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Step 2</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="step2Title" label="Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="step2SubTitle" label="Sub Title" placeholder="Enter Sub Title" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const InfoCard3 = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Step 3</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="step3Title" label="Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="step3SubTitle" label="Sub Title" placeholder="Enter Sub Title" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const MetaOptionsCard = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Meta Options</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="metaTitle" label="Meta Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="metaTagKeyword" label="Meta Tag Keyword" placeholder="Enter word" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} type="text" name="description" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const MealPlanWork = () => {
  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    subtitle: yup.string().required('Please enter subtitle'),
    banner1: yup.mixed().nullable().test('banner1-required', 'Please upload banner 1', function(value) {
      const parent = this.parent as MealPlanWorkFormData
      return (value && value instanceof FileList && value.length > 0) || !!parent.banner1Url
    }),
    banner2: yup.mixed().nullable().test('banner2-required', 'Please upload banner 2', function(value) {
      const parent = this.parent as MealPlanWorkFormData
      return (value && value instanceof FileList && value.length > 0) || !!parent.banner2Url
    }),
    step1Title: yup.string().required('Please enter step 1 title'),
    step1SubTitle: yup.string().required('Please enter step 1 subtitle'),
    step2Title: yup.string().required('Please enter step 2 title'),
    step2SubTitle: yup.string().required('Please enter step 2 subtitle'),
    step3Title: yup.string().required('Please enter step 3 title'),
    step3SubTitle: yup.string().required('Please enter step 3 subtitle'),
    metaTitle: yup.string().required('Please enter meta title'),
    metaTagKeyword: yup.string().required('Please enter meta tag keyword'),
    description: yup.string().required('Please enter description'),
    status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select status'),
    banner1Url: yup.string().optional(),
    banner2Url: yup.string().optional(),
  })

  const { reset, handleSubmit, control, formState: { isSubmitting } } = useForm<MealPlanWorkFormData>({
    resolver: yupResolver(messageSchema) as any,
    defaultValues: {
      title: '',
      subtitle: '',
      banner1: null,
      banner2: null,
      step1Title: '',
      step1SubTitle: '',
      step2Title: '',
      step2SubTitle: '',
      step3Title: '',
      step3SubTitle: '',
      metaTitle: '',
      metaTagKeyword: '',
      description: '',
      status: 'active',
    },
  })

  const { data: mealPlanWorkData, isLoading, refetch } = useGetMealPlanWorkQuery()
  const [upsertMealPlanWork] = useUpsertMealPlanWorkMutation()

  // Populate form when data is fetched
  useEffect(() => {
    if (mealPlanWorkData?.data) {
      const data = mealPlanWorkData.data
      reset({
        title: data.title || '',
        subtitle: data.subtitle || '',
        banner1: null,
        banner2: null,
        banner1Url: data.banner1 || '',
        banner2Url: data.banner2 || '',
        step1Title: data.step1?.title || '',
        step1SubTitle: data.step1?.subTitle || '',
        step2Title: data.step2?.title || '',
        step2SubTitle: data.step2?.subTitle || '',
        step3Title: data.step3?.title || '',
        step3SubTitle: data.step3?.subTitle || '',
        metaTitle: data.metaTitle || '',
        metaTagKeyword: data.metaTagKeyword || '',
        description: data.description || '',
        status: (data.status || 'active') as 'active' | 'inactive',
      } as MealPlanWorkFormData)
    }
  }, [mealPlanWorkData, reset])

  const onSubmit = async (data: MealPlanWorkFormData) => {
    try {
      const formDataObj = new FormData()

      // Add text fields
      formDataObj.append('title', data.title.trim())
      formDataObj.append('subtitle', data.subtitle.trim())
      formDataObj.append('step1Title', data.step1Title.trim())
      formDataObj.append('step1SubTitle', data.step1SubTitle.trim())
      formDataObj.append('step2Title', data.step2Title.trim())
      formDataObj.append('step2SubTitle', data.step2SubTitle.trim())
      formDataObj.append('step3Title', data.step3Title.trim())
      formDataObj.append('step3SubTitle', data.step3SubTitle.trim())
      formDataObj.append('metaTitle', data.metaTitle.trim())
      formDataObj.append('metaTagKeyword', data.metaTagKeyword.trim())
      formDataObj.append('description', data.description.trim())
      formDataObj.append('status', data.status)

      // Handle banner uploads
      if (data.banner1 && data.banner1.length > 0) {
        formDataObj.append('banner1', data.banner1[0])
      } else if (data.banner1Url) {
        formDataObj.append('banner1', data.banner1Url)
      }

      if (data.banner2 && data.banner2.length > 0) {
        formDataObj.append('banner2', data.banner2[0])
      } else if (data.banner2Url) {
        formDataObj.append('banner2', data.banner2Url)
      }

      const result = await upsertMealPlanWork(formDataObj).unwrap()
      toast.success(result.message || 'Meal plan work saved successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to save meal plan work')
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  const mealPlanWork = mealPlanWorkData?.data
  const banner1Url = mealPlanWork?.banner1
  const banner2Url = mealPlanWork?.banner2

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} banner1Url={banner1Url} banner2Url={banner2Url} />
      <InfoCard1 control={control} />
      <InfoCard2 control={control} />
      <InfoCard3 control={control} />
      <MetaOptionsCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Save Change'}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/pages/meal-plan-work" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default MealPlanWork
