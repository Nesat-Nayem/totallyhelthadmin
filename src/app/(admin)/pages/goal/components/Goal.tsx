'use client'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useGetGoalQuery, useUpsertGoalMutation } from '@/services/goalApi'
import { toast } from 'react-toastify'

type controlType = {
  control: Control<any>
}

type GoalFormData = {
  title: string
  subtitle: string
  section1Title: string
  section1Description: string
  section1Icon: FileList | null
  section2Title: string
  section2Description: string
  section2Icon: FileList | null
  section3Title: string
  section3Description: string
  section3Icon: FileList | null
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  status: 'active' | 'inactive'
  // For existing icons (when editing)
  section1IconUrl?: string
  section2IconUrl?: string
  section3IconUrl?: string
}

const GeneralInformationCard = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>General Information</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="title" label="Category Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="subtitle" label="Subtitle" placeholder="Enter Subtitle" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const SectionCard = ({ 
  control, 
  sectionNumber, 
  existingIconUrl 
}: controlType & { sectionNumber: 1 | 2 | 3; existingIconUrl?: string }) => {
  const iconFieldName = `section${sectionNumber}Icon` as keyof GoalFormData
  const titleFieldName = `section${sectionNumber}Title` as keyof GoalFormData
  const descriptionFieldName = `section${sectionNumber}Description` as keyof GoalFormData

  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Section {sectionNumber}</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput 
                control={control} 
                type="text" 
                name={titleFieldName} 
                label="Title" 
                placeholder="Enter Title" 
              />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <Controller
                control={control}
                name={iconFieldName}
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                  <div>
                    <label className="form-label">Icon</label>
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
                    {existingIconUrl && !value && (
                      <div className="mt-2">
                        <small className="text-muted">Current icon: </small>
                        <a href={existingIconUrl} target="_blank" rel="noopener noreferrer" className="ms-1">
                          View
                        </a>
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
            <div className="mb-0">
              <TextAreaFormInput 
                rows={4} 
                control={control} 
                type="text" 
                name={descriptionFieldName} 
                label="Description" 
                placeholder="Type description" 
              />
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
              <TextFormInput control={control} type="text" name="metaKeywords" label="Meta Tag Keyword" placeholder="Enter word" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} type="text" name="metaDescription" label="Description" placeholder="Type description" />
            </div>
          </Col>
          <Col lg={6}>
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

const Goal = () => {
  const goalSchema = yup.object({
    title: yup.string().required('Please enter title'),
    subtitle: yup.string().required('Please enter subtitle'),
    section1Title: yup.string().required('Please enter section 1 title'),
    section1Description: yup.string().required('Please enter section 1 description'),
    section1Icon: yup.mixed().nullable().test('icon-required', 'Please upload section 1 icon', function(value) {
      const parent = this.parent as GoalFormData
      return (value && value instanceof FileList && value.length > 0) || !!parent.section1IconUrl
    }),
    section2Title: yup.string().optional(),
    section2Description: yup.string().optional(),
    section2Icon: yup.mixed().nullable().optional(),
    section3Title: yup.string().optional(),
    section3Description: yup.string().optional(),
    section3Icon: yup.mixed().nullable().optional(),
    metaTitle: yup.string().required('Please enter meta title'),
    metaDescription: yup.string().required('Please enter meta description'),
    metaKeywords: yup.string().required('Please enter meta keywords'),
    status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select status'),
    section1IconUrl: yup.string().optional(),
    section2IconUrl: yup.string().optional(),
    section3IconUrl: yup.string().optional(),
  })

  const { reset, handleSubmit, control } = useForm<GoalFormData>({
    resolver: yupResolver(goalSchema) as any,
    defaultValues: {
      title: '',
      subtitle: '',
      section1Title: '',
      section1Description: '',
      section1Icon: null,
      section2Title: '',
      section2Description: '',
      section2Icon: null,
      section3Title: '',
      section3Description: '',
      section3Icon: null,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      status: 'active',
    },
  })

  const { data: goalData, isLoading, refetch } = useGetGoalQuery()
  const [upsertGoal, { isLoading: isSubmitting }] = useUpsertGoalMutation()

  // Populate form when data is fetched
  useEffect(() => {
    if (goalData?.data) {
      const goal = goalData.data
      reset({
        title: goal.title || '',
        subtitle: goal.subtitle || '',
        section1Title: goal.sections[0]?.title || '',
        section1Description: goal.sections[0]?.description || '',
        section1Icon: null,
        section1IconUrl: goal.sections[0]?.icon || '',
        section2Title: goal.sections[1]?.title || '',
        section2Description: goal.sections[1]?.description || '',
        section2Icon: null,
        section2IconUrl: goal.sections[1]?.icon || '',
        section3Title: goal.sections[2]?.title || '',
        section3Description: goal.sections[2]?.description || '',
        section3Icon: null,
        section3IconUrl: goal.sections[2]?.icon || '',
        metaTitle: goal.metaTitle || '',
        metaDescription: goal.metaDescription || '',
        metaKeywords: goal.metaKeywords || '',
        status: goal.status || 'active',
      })
    }
  }, [goalData, reset])

  const onSubmit = async (data: GoalFormData) => {
    try {
      const formData = new FormData()

      // Add general fields
      formData.append('title', data.title.trim())
      formData.append('subtitle', data.subtitle.trim())
      formData.append('metaTitle', data.metaTitle.trim())
      formData.append('metaDescription', data.metaDescription.trim())
      formData.append('metaKeywords', data.metaKeywords.trim())
      formData.append('status', data.status)

      // Handle sections - at least section 1 is required
      const sections = [
        {
          title: data.section1Title?.trim(),
          description: data.section1Description?.trim(),
          icon: data.section1Icon?.[0] || data.section1IconUrl || '',
        },
        data.section2Title?.trim() && data.section2Description?.trim()
          ? {
              title: data.section2Title.trim(),
              description: data.section2Description.trim(),
              icon: data.section2Icon?.[0] || data.section2IconUrl || '',
            }
          : null,
        data.section3Title?.trim() && data.section3Description?.trim()
          ? {
              title: data.section3Title.trim(),
              description: data.section3Description.trim(),
              icon: data.section3Icon?.[0] || data.section3IconUrl || '',
            }
          : null,
      ].filter(Boolean) as Array<{ title: string; description: string; icon: File | string }>

      // Validate at least one section
      if (!sections[0]?.title || !sections[0]?.description || !sections[0]?.icon) {
        toast.error('Section 1 must have title, description, and icon')
        return
      }

      // Add section data
      sections.forEach((section, index) => {
        if (section) {
          const num = index + 1
          formData.append(`section${num}Title`, section.title)
          formData.append(`section${num}Description`, section.description)
          
          // If it's a File, append it; otherwise append the URL string
          if (section.icon instanceof File) {
            formData.append(`section${num}Icon`, section.icon)
          } else if (typeof section.icon === 'string' && section.icon) {
            formData.append(`section${num}Icon`, section.icon)
          }
        }
      })

      const result = await upsertGoal(formData).unwrap()
      toast.success(result.message || 'Goal saved successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to save goal')
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  const goal = goalData?.data
  const section1IconUrl = goal?.sections[0]?.icon
  const section2IconUrl = goal?.sections[1]?.icon
  const section3IconUrl = goal?.sections[2]?.icon

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <SectionCard control={control} sectionNumber={1} existingIconUrl={section1IconUrl} />
      <SectionCard control={control} sectionNumber={2} existingIconUrl={section2IconUrl} />
      <SectionCard control={control} sectionNumber={3} existingIconUrl={section3IconUrl} />
      <MetaOptionsCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Save Change'}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default Goal
