'use client'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useGetBannerByIdQuery, bannerApi } from '@/services/bannerApi'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'

type FormData = {
  title: string
  file?: FileList
  stock: string
  tag?: FileList
  description: string
  description2: string
  meta: string
  metaTag: string
  status: string
}

type ControlType = {
  control: Control<FormData>
}

const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  title: yup.string().required('Please enter title'),
  file: yup.mixed<FileList>().optional(),
  stock: yup.string().required('Please enter stock'),
  tag: yup.mixed<FileList>().optional(),
  description: yup.string().required('Please enter description'),
  description2: yup.string().required('Please enter meta description'),
  meta: yup.string().required('Please enter meta title'),
  metaTag: yup.string().required('Please enter meta tag'),
  status: yup.string().required('Please select a status'),
})

const GeneralInformationCard: React.FC<ControlType & { existingImage?: string; existingCertLogo?: string }> = ({ control, existingImage, existingCertLogo }) => {
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.png'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    return imagePath
  }

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
              <Controller
                control={control}
                name="file"
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                  <div>
                    <label className="form-label">Banner Image</label>
                    <input
                      {...field}
                      type="file"
                      onChange={(e) => {
                        const files = e.target.files
                        onChange(files)
                      }}
                      className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                    />
                    {fieldState.error && (
                      <div className="invalid-feedback">{fieldState.error.message}</div>
                    )}
                    {existingImage && (
                      <div className="mt-2">
                        <small className="text-muted">Current image:</small>
                        <div className="mt-1">
                          <Image 
                            src={getImageUrl(existingImage)} 
                            alt="Current banner" 
                            width={100}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </Col>

          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="stock" label="Google Review Count" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <Controller
                control={control}
                name="tag"
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                  <div>
                    <label className="form-label">Certification Logo</label>
                    <input
                      {...field}
                      type="file"
                      onChange={(e) => {
                        const files = e.target.files
                        onChange(files)
                      }}
                      className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                    />
                    {fieldState.error && (
                      <div className="invalid-feedback">{fieldState.error.message}</div>
                    )}
                    {existingCertLogo && (
                      <div className="mt-2">
                        <small className="text-muted">Current logo:</small>
                        <div className="mt-1">
                          <Image 
                            src={getImageUrl(existingCertLogo)} 
                            alt="Current logo" 
                            width={100}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput control={control} name="description" label="Description" placeholder="Type description" />
            </div>
          </Col>

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

const MetaOptionsCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Meta Options</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="meta" label="Meta Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="metaTag" label="Meta Tag Keyword" placeholder="Enter word" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} name="description2" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

interface HomeBannerEditProps {
  id: string
}

const HomeBannerEdit: React.FC<HomeBannerEditProps> = ({ id }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { data: banner, isLoading: isLoadingBanner, error } = useGetBannerByIdQuery(id)
  
  const { handleSubmit, control, formState: { isSubmitting }, setValue } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active' },
  })

  useEffect(() => {
    if (banner) {
      setValue('title', banner.title)
      setValue('description', banner.description)
      setValue('meta', banner.metaTitle)
      setValue('description2', banner.metaDescription)
      setValue('metaTag', banner.metaKeywords)
      setValue('stock', banner.googleReviewCount.toString())
      setValue('status', banner.status)
    }
  }, [banner, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      const formDataObj = new FormData()
      
      formDataObj.append('title', String(data.title || '').trim())
      formDataObj.append('description', String(data.description || '').trim())
      formDataObj.append('meta', String(data.meta || '').trim())
      formDataObj.append('description2', String(data.description2 || '').trim())
      formDataObj.append('metaTag', String(data.metaTag || '').trim())
      formDataObj.append('stock', String(data.stock || '0').trim())
      formDataObj.append('status', String(data.status || 'active').trim())
      
      if (banner?.order !== undefined) {
        formDataObj.append('order', String(banner.order))
      }
      
      if (data.file && data.file.length > 0 && data.file[0] instanceof File) {
        formDataObj.append('file', data.file[0], data.file[0].name)
      }
      if (data.tag && data.tag.length > 0 && data.tag[0] instanceof File) {
        formDataObj.append('tag', data.tag[0], data.tag[0].name)
      }
      
      const token = getAuthToken()
      if (!token) {
        showError('Authentication token not found. Please login again.')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'PUT',
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
        throw new Error(responseData.message || 'Failed to update banner')
      }
      
      dispatch(bannerApi.util.invalidateTags([{ type: 'Banner', id }, { type: 'Banner', id: 'LIST' }]))
      
      showSuccess('Banner updated successfully')
      router.push('/pages/home-banner')
    } catch (error: any) {
      showError(error?.message || error?.data?.message || 'Failed to update banner')
    }
  }

  if (isLoadingBanner) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading banner data...</p>
        </div>
      </div>
    )
  }

  if (error || !banner) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <h5 className="text-danger">Error Loading Banner</h5>
          <p>Banner not found or failed to load.</p>
          <Link href="/pages/home-banner" className="btn btn-outline-primary">
            Back to List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard 
        control={control} 
        existingImage={banner.image}
        existingCertLogo={banner.certLogo}
      />
      <MetaOptionsCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Change'}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/pages/home-banner" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default HomeBannerEdit
