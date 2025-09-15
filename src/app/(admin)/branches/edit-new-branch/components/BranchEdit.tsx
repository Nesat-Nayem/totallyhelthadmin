'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useGetBranchByIdQuery, useUpdateBranchMutation } from '@/services/branchApi'
import { useSearchParams, useRouter } from 'next/navigation'

/** FORM DATA TYPE **/
type FormData = {
  name: string
  location?: string
  brand?: string
  logo?: string
  status: 'active' | 'inactive'
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter branch name'),
  location: yup.string().optional(),
  brand: yup.string().optional(),
  logo: yup.string().url('Please provide a valid URL').optional(),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Branch Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="name" label="Branch Name" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="logo" label="Branch Logo URL" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="location" label="Branch Location" />
            </div>
          </Col>
          <Col lg={6}>
            <label htmlFor="">Brand</label>
            <div className="mb-3">
              <Controller
                control={control}
                name="brand"
                render={({ field }) => (
                  <select {...field} className="form-control form-select">
                    <option value="">Select Brand</option>
                    <option value="Totally Health">Totally Health</option>
                    <option value="Healthy Living">Healthy Living</option>
                  </select>
                )}
              />
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
const BranchEdit: React.FC = () => {
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active' },
  })
  const params = useSearchParams()
  const id = params.get('id') as string
  const { data } = useGetBranchByIdQuery(id!, { skip: !id })
  const [updateBranch, { isLoading }] = useUpdateBranchMutation()
  const { push } = useRouter()

  React.useEffect(() => {
    if (data) {
      reset({
        name: (data as any).name,
        location: (data as any).location,
        brand: (data as any).brand,
        logo: (data as any).logo,
        status: (data as any).status || 'active',
      })
    }
  }, [data, reset])

  const onSubmit = async (form: FormData) => {
    if (!id) return
    await updateBranch({ id, data: form }).unwrap()
    push('/branches/list-of-branches')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isLoading}>
              Save
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

export default BranchEdit

