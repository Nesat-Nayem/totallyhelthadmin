'use client'

import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm, useFieldArray } from 'react-hook-form'
import { useGetAboutUsDetailsQuery, useCreateOrUpdateAboutUsDetailsMutation, aboutUsDetailsApi } from '@/services/aboutUsDetailsApi'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import { useTitle } from '@/context/useTitleContext'

type AboutUsDetailsFormData = {
  image?: FileList | null
  imageUrl?: string
  headline: string
  description: string
  services: Array<{
    _id?: string
    title: string
    description: string
  }>
}

type ControlType = {
  control: Control<AboutUsDetailsFormData>
}

const aboutUsDetailsSchema: yup.ObjectSchema<AboutUsDetailsFormData> = yup.object({
  image: yup.mixed().nullable().optional(),
  imageUrl: yup.string().nullable().optional(),
  headline: yup.string().required('Headline is required'),
  description: yup.string().required('Description is required'),
  services: yup.array().of(
    yup.object({
      title: yup.string().required('Service title is required'),
      description: yup.string().required('Service description is required'),
    })
  ),
}) as yup.ObjectSchema<AboutUsDetailsFormData>

const AboutUsDetails: React.FC = () => {
  const dispatch = useDispatch()
  const { setTitle } = useTitle()
  const { data: existingData, isLoading: isLoadingData } = useGetAboutUsDetailsQuery()
  const [createOrUpdate] = useCreateOrUpdateAboutUsDetailsMutation()

  // Set page title
  useEffect(() => {
    setTitle('About Details')
    // Cleanup: reset to default when component unmounts
    return () => {
      setTitle('WELCOME TO TOTALLY HEALTH')
    }
  }, [setTitle])

  const { handleSubmit, control, reset, watch, formState: { isSubmitting } } = useForm<AboutUsDetailsFormData>({
    resolver: yupResolver(aboutUsDetailsSchema) as any,
    defaultValues: {
      image: null,
      headline: '',
      description: '',
      services: [],
    },
  })

  const watchedImageUrl = watch('imageUrl')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  })

  // Helper function to check if URL is a valid image (not placeholder)
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === '') return false
    // Filter out placeholder URLs
    if (url.includes('placeholder') || url.includes('placeholder/icon.png')) return false
    // Check if it's a valid URL format
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data
      reset({
        image: null, // Explicitly set to null for updates
        imageUrl: isValidImageUrl(data.image) ? data.image : '',
        headline: data.headline || '',
        description: data.description || '',
        services: data.services?.map((service: any) => ({
          _id: service._id || '', // Include _id for existing services
          title: service.title || '',
          description: service.description || '',
        })) || [],
      })
    }
  }, [existingData, reset])

  const onSubmit = async (data: AboutUsDetailsFormData) => {
    try {
      const formDataObj = new FormData()
      
      // Append headline and description (always send these)
      formDataObj.append('headline', data.headline)
      formDataObj.append('description', data.description)

      // Append image file if provided (optional for update, required for create)
      if (data.image && data.image.length > 0) {
        formDataObj.append('image', data.image[0])
      }

      // Build services data - CRITICAL: Send ONLY services you want to keep
      // Backend behavior:
      // - Services IN request: Updated (if has _id) or Created (if no _id)
      // - Services NOT in request: DELETED (removed from database)
      // 
      // So when user clicks "Remove" on a service:
      // - Service is removed from form array (via remove(index))
      // - Service won't be in data.services when submitted
      // - Backend will delete it automatically
      const servicesData = data.services
        .map((service) => {
          const hasId = service._id && service._id.trim() !== ''

          // Skip services without title or description
          if (!service.title || !service.description) {
            return null
          }

          const serviceData: any = {
            title: service.title || '',
            description: service.description || '',
          }

          // Include _id if it exists (for existing services) - CRITICAL for backend to match existing services
          // This ensures existing services are preserved and not treated as new ones
          if (hasId) {
            serviceData._id = service._id
          }

          return serviceData
        })
        .filter((service) => service !== null) // Filter out invalid services

      // Send services array - backend will:
      // 1. Keep/update services in this array
      // 2. Delete services NOT in this array (removed from form)
      formDataObj.append('services', JSON.stringify(servicesData))

      const token = getAuthToken()
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        return
      }

      const response = await fetch(`${API_BASE_URL}/about-us/details`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`)
      }

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to save About Us')
      }

      dispatch(aboutUsDetailsApi.util.invalidateTags([{ type: 'AboutUsDetails', id: 'SINGLE' }]))
      toast.success(responseData.message || 'About Us saved successfully')
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to save About Us'
      toast.error(errorMessage)
    }
  }

  if (isLoadingData) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>About Details</CardTitle>
            </CardHeader>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <Spinner animation="border" variant="primary" />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>About Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <Controller
                    control={control}
                    name="image"
                    render={({ field: { onChange, value, ...field }, fieldState }) => (
                      <div>
                        <label className="form-label">Image</label>
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
                        {watchedImageUrl && 
                         isValidImageUrl(watchedImageUrl) && 
                         !value && (
                          <div className="mt-2">
                            <small className="text-muted d-block mb-1">Current image:</small>
                            <Image
                              src={watchedImageUrl}
                              alt="About Us Image"
                              width={300}
                              height={200}
                              style={{ objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <small className="text-muted d-block mt-1">Leave empty to keep current image</small>
                          </div>
                        )}
                        {fieldState.error && (
                          <div className="invalid-feedback">{fieldState.error.message}</div>
                        )}
                      </div>
                    )}
                  />
                </Col>
                <Col lg={12}>
                  <TextFormInput control={control} name="headline" label="Headline" placeholder="Enter headline" />
                </Col>
                <Col lg={12}>
                  <TextAreaFormInput control={control} name="description" label="Description" placeholder="Enter description" rows={5} />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as={'h4'}>Services</CardTitle>
              <Button
                type="button"
                variant="primary"
                onClick={() => append({ title: '', description: '', _id: '' })}
              >
                Add Service
              </Button>
            </CardHeader>
            <CardBody>
              {fields.length === 0 ? (
                <p className="text-muted">No services added. Click "Add Service" to add one.</p>
              ) : (
                fields.map((field, index) => (
                  <Card key={field.id} className="mb-3">
                    <CardHeader className="d-flex justify-content-between align-items-center">
                      <CardTitle as={'h5'}>Service {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          // Remove service from form array
                          // When form is submitted, this service won't be in the array
                          // Backend will automatically delete it from database and Cloudinary
                          remove(index)
                        }}
                      >
                        Remove
                      </Button>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col lg={12}>
                          <TextFormInput
                            control={control}
                            name={`services.${index}.title`}
                            label="Service Title"
                            placeholder="Enter service title"
                          />
                        </Col>
                        <Col lg={12}>
                          <TextAreaFormInput
                            control={control}
                            name={`services.${index}.description`}
                            label="Service Description"
                            placeholder="Enter service description"
                            rows={3}
                          />
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                ))
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Save Changes'}
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default AboutUsDetails

