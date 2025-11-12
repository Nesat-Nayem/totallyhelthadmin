'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useCreateLogoMutation, logoApi } from '@/services/logoApi'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'
import { useDispatch } from 'react-redux'

/** FORM DATA TYPE **/
type LogoFormData = {
  file: FileList
  status: 'active' | 'inactive'
  order: number
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<LogoFormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<LogoFormData> = yup.object({
  file: yup
    .mixed<FileList>()
    .test('required', 'Please upload a logo image', (value) => value && value.length > 0)
    .required(),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select a status'),
  order: yup.number().min(0, 'Order must be 0 or greater').default(0),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
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
                rules={{ required: 'Please upload a logo image' }}
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
const LogoAdd: React.FC = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<LogoFormData>({
    resolver: yupResolver(messageSchema) as any,
    defaultValues: {
      order: 0,
      status: 'active',
    },
  })

  const [createLogo] = useCreateLogoMutation()

  const onSubmit = async (data: LogoFormData) => {
    try {
      const fileList = data.file as FileList | undefined
      
      if (!fileList || fileList.length === 0 || !fileList[0]) {
        toast.error('Please upload a logo image')
        return
      }

      const logoFile = fileList[0]
      
      if (!logoFile || !(logoFile instanceof File)) {
        toast.error('Invalid logo file. Please select a valid image file.')
        return
      }

      const formDataObj = new FormData()
      // Append file with filename (matching HomeBannerAdd pattern)
      formDataObj.append('file', logoFile, logoFile.name)
      formDataObj.append('status', data.status)
      formDataObj.append('order', String(data.order || 0))
      
      const token = getAuthToken()
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/logos`, {
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
        throw new Error(responseData.message || 'Failed to create logo')
      }
      
      // Invalidate cache to refresh the list page
      dispatch(logoApi.util.invalidateTags([{ type: 'Logo', id: 'LIST' }]))
      
      toast.success(responseData.message || 'Logo created successfully')
      
      // Navigate to list page - RTK Query will automatically refetch due to cache invalidation
      router.push('/pages/logo')
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to create logo'
      toast.error(errorMessage)
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
            <Link href="/pages/logo" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default LogoAdd

