'use client'

import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useRef } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm, useFieldArray } from 'react-hook-form'
import { useGetAboutUsFoodQuery, useCreateOrUpdateAboutUsFoodMutation, aboutUsFoodApi } from '@/services/aboutUsFoodApi'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import { useTitle } from '@/context/useTitleContext'

type AboutUsFoodFormData = {
  title: string
  subtitle: string
  description: string
  images: Array<{
    file?: FileList | null
    url?: string
  }>
  certifications: Array<{
    _id?: string
    name: string
    logo?: FileList | null
    logoUrl?: string
  }>
}

type ControlType = {
  control: Control<AboutUsFoodFormData>
}

const aboutUsFoodSchema: yup.ObjectSchema<AboutUsFoodFormData> = yup.object({
  title: yup.string().required('Title is required'),
  subtitle: yup.string().required('Subtitle is required'),
  description: yup.string().required('Description is required'),
  images: yup.array().min(1, 'At least one image is required'),
  certifications: yup.array().of(
    yup.object({
      name: yup.string().required('Certification name is required'),
    })
  ),
})

const AboutUsFood: React.FC = () => {
  const dispatch = useDispatch()
  const { setTitle } = useTitle()
  const { data: existingData, isLoading: isLoadingData } = useGetAboutUsFoodQuery()
  const [createOrUpdate] = useCreateOrUpdateAboutUsFoodMutation()
  const hasLoadedData = useRef(false)

  // Set page title
  useEffect(() => {
    setTitle('About Food')
    // Cleanup: reset to default when component unmounts
    return () => {
      setTitle('WELCOME TO TOTALLY HEALTH')
    }
  }, [setTitle])

  const { handleSubmit, control, reset, watch, formState: { isSubmitting } } = useForm<AboutUsFoodFormData>({
    resolver: yupResolver(aboutUsFoodSchema) as any,
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      images: [],
      certifications: [],
    },
  })

  const watchedImages = watch('images')
  const watchedCertifications = watch('certifications')

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: 'images',
  })

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control,
    name: 'certifications',
  })

  // Load existing data only once when component mounts or when data first arrives
  useEffect(() => {
    if (existingData?.data && !hasLoadedData.current) {
      const data = existingData.data
      reset({
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        images: data.images?.map((img) => ({ url: img, file: null })) || [],
        certifications: data.certifications?.map((cert) => ({
          _id: cert._id || '', // Include _id for existing certifications
          name: cert.name || '',
          logoUrl: cert.logo || '',
          logo: null,
        })) || [],
      })
      hasLoadedData.current = true
    }
  }, [existingData, reset])

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

  const onSubmit = async (data: AboutUsFoodFormData) => {
    try {
      const formDataObj = new FormData()
      formDataObj.append('title', data.title)
      formDataObj.append('subtitle', data.subtitle)
      formDataObj.append('description', data.description)

      // Handle images - Backend ADDS new images to existing ones (preserves existing)
      // So we only need to send NEW image files, not existing URLs
      // Backend logic: updateData.images = [...existingFood.images, ...newImagePaths]
      data.images.forEach((img, index) => {
        const hasNewFile = img.file && img.file.length > 0 && img.file[0] instanceof File

        if (hasNewFile) {
          // Only send NEW image files - backend will add them to existing images
          formDataObj.append('images', img.file[0])
        }
        // Don't send existing URLs - backend preserves them automatically
      })

      // Handle certifications - CRITICAL: Send ONLY certifications you want to keep
      // Backend behavior: 
      // - Preserves existing certifications NOT in request (this causes removal issue)
      // - Processes certifications IN request (updates by _id or creates new)
      // 
      // ISSUE: Backend preserves certifications not in request, so removed ones won't be deleted
      // This is a BACKEND issue - backend should replace entire array, not preserve ones not in request
      //
      // Frontend sends: Only certifications remaining in form (after removal)
      // Backend should: Replace entire array with what's sent
      // Backend currently: Preserves ones not sent + adds/updates ones sent
      //
      // Backend priority for logos: certLogos[index]?.path > cert.logo (if valid) > existing logo
      const certificationsData = data.certifications
        .map((cert, index) => {
          const hasNewFile = cert.logo && cert.logo.length > 0 && cert.logo[0] instanceof File
          const hasExistingLogo = cert.logoUrl && cert.logoUrl.trim() !== '' && isValidImageUrl(cert.logoUrl)
          const hasId = cert._id && cert._id.trim() !== ''

          // Skip certifications without any logo (no new file and no existing logo)
          if (!hasNewFile && !hasExistingLogo) {
            return null
          }

          const certData: any = {
            name: cert.name || '',
          }

          // Include _id if it exists (for existing certifications) - CRITICAL for backend to match
          if (hasId) {
            certData._id = cert._id
          }

          // Logo handling (backend priority: certLogos[index] > cert.logo > existing logo):
          // - If new file selected: send existing logoUrl (if any) to pass validation, backend uses uploaded file
          // - If no new file but existing logo: send existing logo URL
          // - If new file but no existing logo: send temp URL (backend will use uploaded file)
          if (hasNewFile) {
            // New file selected - send existing logoUrl if available, backend will use uploaded file
            certData.logo = hasExistingLogo 
              ? cert.logoUrl 
              : 'https://res.cloudinary.com/drulco0au/image/upload/v1/about-us/temp-logo'
          } else if (hasExistingLogo) {
            // No new file but existing logo - send existing logo URL to preserve it
            certData.logo = cert.logoUrl
          } else {
            // This shouldn't happen due to filter above
            return null
          }

          return certData
        })
        .filter((cert) => cert !== null) // Filter out certifications without logos

      formDataObj.append('certifications', JSON.stringify(certificationsData))

      // Append certification logo files in the SAME order as certifications array
      // Backend maps certLogos[index] to certifications[index]
      data.certifications.forEach((cert, index) => {
        if (cert.logo && cert.logo.length > 0 && cert.logo[0] instanceof File) {
          formDataObj.append('certLogos', cert.logo[0])
        }
      })

      const token = getAuthToken()
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        return
      }

      const response = await fetch(`${API_BASE_URL}/about-us/food`, {
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
        throw new Error(responseData.message || 'Failed to save About Us Food')
      }

      dispatch(aboutUsFoodApi.util.invalidateTags([{ type: 'AboutUsFood', id: 'SINGLE' }]))
      toast.success(responseData.message || 'About Us Food saved successfully')
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to save About Us Food'
      toast.error(errorMessage)
    }
  }

  if (isLoadingData) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>About Us Food</CardTitle>
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
              <CardTitle as={'h4'}>About Us Food</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <TextFormInput control={control} name="title" label="Title" placeholder="Enter title" />
                </Col>
                <Col lg={12}>
                  <TextFormInput control={control} name="subtitle" label="Subtitle" placeholder="Enter subtitle" />
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
              <CardTitle as={'h4'}>Images</CardTitle>
              <Button
                type="button"
                variant="primary"
                onClick={() => appendImage({ file: null })}
              >
                Add Image
              </Button>
            </CardHeader>
            <CardBody>
              {imageFields.length === 0 ? (
                <p className="text-muted">No images added. Click "Add Image" to add one.</p>
              ) : (
                imageFields.map((field, index) => (
                  <Card key={field.id} className="mb-3">
                    <CardHeader className="d-flex justify-content-between align-items-center">
                      <CardTitle as={'h5'}>Image {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        Remove
                      </Button>
                    </CardHeader>
                    <CardBody>
                      <Controller
                        control={control}
                        name={`images.${index}.file`}
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
                            {watchedImages?.[index]?.url && !value && (
                              <div className="mt-2">
                                <small className="text-muted d-block mb-1">Current image:</small>
                                <Image
                                  src={watchedImages[index].url}
                                  alt="Food Image"
                                  width={200}
                                  height={150}
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
                    </CardBody>
                  </Card>
                ))
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as={'h4'}>Certifications</CardTitle>
              <Button
                type="button"
                variant="primary"
                onClick={() => appendCert({ name: '', logo: null })}
              >
                Add Certification
              </Button>
            </CardHeader>
            <CardBody>
              {certFields.length === 0 ? (
                <p className="text-muted">No certifications added. Click "Add Certification" to add one.</p>
              ) : (
                certFields.map((field, index) => (
                  <Card key={field.id} className="mb-3">
                    <CardHeader className="d-flex justify-content-between align-items-center">
                      <CardTitle as={'h5'}>Certification {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeCert(index)}
                      >
                        Remove
                      </Button>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col lg={6}>
                          <TextFormInput
                            control={control}
                            name={`certifications.${index}.name`}
                            label="Certification Name"
                            placeholder="Enter certification name"
                          />
                        </Col>
                        <Col lg={6}>
                          <Controller
                            control={control}
                            name={`certifications.${index}.logo`}
                            render={({ field: { onChange, value, ...field }, fieldState }) => (
                              <div>
                                <label className="form-label">Certification Logo</label>
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
                                {watchedCertifications?.[index]?.logoUrl && !value && (
                                  <div className="mt-2">
                                    <small className="text-muted d-block mb-1">Current logo:</small>
                                    <Image
                                      src={watchedCertifications[index].logoUrl}
                                      alt="Certification Logo"
                                      width={80}
                                      height={80}
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

export default AboutUsFood

