'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useGetBrandByIdQuery, useUpdateBrandMutation } from '@/services/brandApi'
import { uploadSingle } from '@/services/upload'
import Image from 'next/image'

/** FORM DATA TYPE **/
type FormData = {
  name: string
  status: 'active' | 'inactive'
  logo?: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter brand name'),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Please select a status'),
  logo: yup.string().optional(),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType & { currentLogo?: string; onFileChange: (f: File | null) => void }> = ({ control, currentLogo, onFileChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Brands Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="name" label="Brand Name" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Brand Logo</label>
              <input className="form-control" type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
              {currentLogo && (
                <div className="mt-2">
                  <Image src={currentLogo} alt="Brand Logo" width={80} height={80} className="rounded border" unoptimized />
                </div>
              )}
            </div>
          </Col>

          {/* STATUS FIELD */}
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

/** MAIN COMPONENT **/
const BrandsEdit: React.FC = () => {
  const { reset, handleSubmit, control, setValue } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active', name: '' },
  })
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const router = useRouter()
  const { data: brand, isLoading } = useGetBrandByIdQuery(id, { skip: !id })
  const [updateBrand, { isLoading: isSaving }] = useUpdateBrandMutation()
  const [file, setFile] = React.useState<File | null>(null)

  React.useEffect(() => {
    if (brand) {
      reset({ name: brand.name, status: brand.status, logo: brand.logo })
    }
  }, [brand, reset])

  const onSubmit = async (data: FormData) => {
    if (!id) {
      alert('Missing brand id')
      return
    }
    try {
      let logo = data.logo
      if (file) {
        logo = await uploadSingle(file)
      }
      await updateBrand({ id, data: { name: data.name, status: data.status, logo } }).unwrap()
      alert('Brand updated')
      router.push('/brands/list-of-brands')
    } catch (e: any) {
      alert(e?.data?.message || e?.message || 'Failed to update brand')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} currentLogo={brand?.logo} onFileChange={setFile} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSaving}>
              Save Changes
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/brands/list-of-brands" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default BrandsEdit

