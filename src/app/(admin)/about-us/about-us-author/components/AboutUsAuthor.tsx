'use client'

import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useGetAboutUsAuthorQuery, useCreateOrUpdateAboutUsAuthorMutation, aboutUsAuthorApi } from '@/services/aboutUsAuthorApi'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import { useTitle } from '@/context/useTitleContext'

type AboutUsAuthorFormData = {
  title: string
  name: string
  designation: string
  image?: FileList | null
  imageUrl?: string
  description: string
}

type ControlType = {
  control: Control<AboutUsAuthorFormData>
}

const aboutUsAuthorSchema: yup.ObjectSchema<AboutUsAuthorFormData> = yup.object({
  title: yup.string().required('Title is required'),
  name: yup.string().required('Name is required'),
  designation: yup.string().required('Designation is required'),
  description: yup.string().required('Description is required'),
  image: yup.mixed().nullable().optional(),
  imageUrl: yup.string().nullable().optional(),
}) as yup.ObjectSchema<AboutUsAuthorFormData>

const AboutUsAuthor: React.FC = () => {
  const dispatch = useDispatch()
  const { setTitle } = useTitle()
  const { data: existingData, isLoading: isLoadingData } = useGetAboutUsAuthorQuery()
  const [createOrUpdate] = useCreateOrUpdateAboutUsAuthorMutation()

  // Set page title
  useEffect(() => {
    setTitle('About Author')
    // Cleanup: reset to default when component unmounts
    return () => {
      setTitle('WELCOME TO TOTALLY HEALTH')
    }
  }, [setTitle])

  const { handleSubmit, control, reset, watch, formState: { isSubmitting } } = useForm<AboutUsAuthorFormData>({
    resolver: yupResolver(aboutUsAuthorSchema) as any,
    defaultValues: {
      title: '',
      name: '',
      designation: '',
      description: '',
      image: null,
    },
  })

  const watchedImageUrl = watch('imageUrl')

  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data
      reset({
        title: data.title || '',
        name: data.name || '',
        designation: data.designation || '',
        description: data.description || '',
        imageUrl: data.image || '',
      })
    }
  }, [existingData, reset])

  const onSubmit = async (data: AboutUsAuthorFormData) => {
    try {
      const formDataObj = new FormData()
      formDataObj.append('title', data.title)
      formDataObj.append('name', data.name)
      formDataObj.append('designation', data.designation)
      formDataObj.append('description', data.description)

      // Append image file if provided
      if (data.image && data.image.length > 0) {
        formDataObj.append('image', data.image[0])
      }

      const token = getAuthToken()
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        return
      }

      const response = await fetch(`${API_BASE_URL}/about-us/author`, {
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
        throw new Error(responseData.message || 'Failed to save About Us Author')
      }

      dispatch(aboutUsAuthorApi.util.invalidateTags([{ type: 'AboutUsAuthor', id: 'SINGLE' }]))
      toast.success(responseData.message || 'About Us Author saved successfully')
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to save About Us Author'
      toast.error(errorMessage)
    }
  }

  if (isLoadingData) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>About Us Author</CardTitle>
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
              <CardTitle as={'h4'}>About Us Author</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <TextFormInput control={control} name="title" label="Title" placeholder="Enter title" />
                </Col>
                <Col lg={6}>
                  <TextFormInput control={control} name="name" label="Name" placeholder="Enter name" />
                </Col>
                <Col lg={6}>
                  <TextFormInput control={control} name="designation" label="Designation" placeholder="Enter designation" />
                </Col>
                <Col lg={12}>
                  <Controller
                    control={control}
                    name="image"
                    render={({ field: { onChange, value, ...field }, fieldState }) => (
                      <div>
                        <label className="form-label">Author Image</label>
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
                        {watchedImageUrl && !value && (
                          <div className="mt-2">
                            <small className="text-muted d-block mb-1">Current image:</small>
                            <Image
                              src={watchedImageUrl}
                              alt="Author Image"
                              width={200}
                              height={200}
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
                <Col lg={12}>
                  <TextAreaFormInput control={control} name="description" label="Description" placeholder="Enter description" rows={5} />
                </Col>
              </Row>
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

export default AboutUsAuthor

