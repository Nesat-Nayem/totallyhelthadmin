'use client'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'
import { bannerApi } from '@/services/bannerApi'

type FormData = {
  title: string
  file: FileList
  stock: string
  tag: FileList
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
  file: yup
    .mixed<FileList>()
    .test('required', 'Please upload a banner image', (value) => value && value.length > 0)
    .required(),
  stock: yup.string().required('Please enter stock'),
  tag: yup
    .mixed<FileList>()
    .test('required', 'Please upload certification logo', (value) => value && value.length > 0)
    .required(),
  description: yup.string().required('Please enter description'),
  description2: yup.string().required('Please enter meta description'),
  meta: yup.string().required('Please enter meta title'),
  metaTag: yup.string().required('Please enter meta tag'),
  status: yup.string().required('Please select a status'),
})

const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
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
                rules={{ required: 'Please upload a banner image' }}
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
                rules={{ required: 'Please upload a certification logo' }}
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

const HomeBannerAdd: React.FC = () => {
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active' },
  })
  
  const router = useRouter()
  const dispatch = useDispatch()

  const onSubmit = async (data: FormData) => {
    try {
      const fileList = data.file as FileList | undefined
      const tagList = data.tag as FileList | undefined
      
      if (!fileList || fileList.length === 0 || !fileList[0]) {
        showError('Please upload a banner image')
        return
      }
      if (!tagList || tagList.length === 0 || !tagList[0]) {
        showError('Please upload a certification logo')
        return
      }

      const bannerFile = fileList[0]
      const certLogoFile = tagList[0]
      
      if (!bannerFile || !(bannerFile instanceof File)) {
        showError('Invalid banner image file. Please select a valid image file.')
        return
      }
      if (!certLogoFile || !(certLogoFile instanceof File)) {
        showError('Invalid certification logo file. Please select a valid image file.')
        return
      }

      const formDataObj = new FormData()
      
      const title = String(data.title || '').trim()
      const description = String(data.description || '').trim()
      const meta = String(data.meta || '').trim()
      const description2 = String(data.description2 || '').trim()
      const metaTag = String(data.metaTag || '').trim()
      const stock = String(data.stock || '0').trim()
      const status = String(data.status || 'active').trim()
      
      if (!title) {
        showError('Please enter a title')
        return
      }
      if (!description) {
        showError('Please enter a description')
        return
      }
      if (!meta) {
        showError('Please enter a meta title')
        return
      }
      if (!description2) {
        showError('Please enter a meta description')
        return
      }
      if (!metaTag) {
        showError('Please enter meta tags')
        return
      }
      
      formDataObj.append('title', title)
      formDataObj.append('description', description)
      formDataObj.append('meta', meta)
      formDataObj.append('description2', description2)
      formDataObj.append('metaTag', metaTag)
      formDataObj.append('stock', stock)
      formDataObj.append('status', status)
      formDataObj.append('order', '0')
      
      formDataObj.append('file', bannerFile, bannerFile.name)
      formDataObj.append('tag', certLogoFile, certLogoFile.name)
      
      const token = getAuthToken()
      if (!token) {
        showError('Authentication token not found. Please login again.')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/banners`, {
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
        throw new Error(responseData.message || 'Failed to create banner')
      }
      
      dispatch(bannerApi.util.invalidateTags([{ type: 'Banner', id: 'LIST' }]))
      
      showSuccess('Banner created successfully')
      router.push('/pages/home-banner')
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to create banner'
      showError(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <MetaOptionsCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Save Change'}
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

export default HomeBannerAdd
