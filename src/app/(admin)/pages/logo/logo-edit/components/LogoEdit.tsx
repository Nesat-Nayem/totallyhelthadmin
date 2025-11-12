'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useGetLogoByIdQuery, logoApi } from '@/services/logoApi'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'
import { useDispatch } from 'react-redux'
import Image from 'next/image'

/** FORM DATA TYPE **/
type LogoFormData = {
  file?: FileList
  status: 'active' | 'inactive'
  order: number
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<LogoFormData>
  existingImage?: string
}

interface LogoEditProps {
  id: string
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<LogoFormData> = yup.object({
  file: yup.mixed<FileList>().optional(),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select a status'),
  order: yup.number().min(0, 'Order must be 0 or greater').default(0),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control, existingImage }) => {
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
        <CardTitle as={'h4'}>Logo Information</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={12}>
            <div className="mb-3">
              <Controller
                control={control}
                name="file"
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                  <div>
                    <label className="form-label">Logo Image</label>
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
                    {fieldState.error && (
                      <div className="invalid-feedback">{fieldState.error.message}</div>
                    )}
                    {existingImage && (
                      <div className="mt-2">
                        <small className="text-muted">Current logo:</small>
                        <div className="mt-1">
                          <Image 
                            src={getImageUrl(existingImage)} 
                            alt="Current logo" 
                            width={100}
                            height={100}
                            style={{ objectFit: 'contain', borderRadius: '4px' }}
                          />
                        </div>
                        <small className="text-muted d-block mt-1">Leave empty to keep current image</small>
                      </div>
                    )}
                  </div>
                )}
              />
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
const LogoEdit: React.FC<LogoEditProps> = ({ id }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { data: logoResponse, isLoading } = useGetLogoByIdQuery(id)

  const { reset, handleSubmit, control, formState: { isSubmitting } } = useForm<LogoFormData>({
    resolver: yupResolver(messageSchema) as any,
    defaultValues: {
      order: 0,
      status: 'active',
    },
  })

  // Populate form when data is fetched
  useEffect(() => {
    if (logoResponse?.data) {
      const logo = logoResponse.data
      reset({
        order: logo.order || 0,
        status: logo.status || 'active',
      })
    }
  }, [logoResponse, reset])

  const onSubmit = async (data: LogoFormData) => {
    try {
      const fileList = data.file as FileList | undefined
      const logoFile = fileList && fileList.length > 0 ? fileList[0] : null

      const formDataObj = new FormData()
      
      // Only append file if a new one is selected
      if (logoFile && logoFile instanceof File) {
        formDataObj.append('file', logoFile, logoFile.name)
      }
      
      formDataObj.append('status', data.status)
      formDataObj.append('order', String(data.order || 0))
      
      const token = getAuthToken()
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/logos/${id}`, {
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
        throw new Error(responseData.message || 'Failed to update logo')
      }
      
      // Invalidate cache to refresh the list page
      dispatch(logoApi.util.invalidateTags([{ type: 'Logo', id: 'LIST' }, { type: 'Logo', id }]))
      
      toast.success(responseData.message || 'Logo updated successfully')
      router.push('/pages/logo')
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update logo'
      toast.error(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!logoResponse?.data) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <p className="text-danger">Logo not found</p>
          <Link href="/pages/logo" className="btn btn-primary">
            Back to Logos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} existingImage={logoResponse.data.image} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Save Change'}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/pages/logo" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default LogoEdit

