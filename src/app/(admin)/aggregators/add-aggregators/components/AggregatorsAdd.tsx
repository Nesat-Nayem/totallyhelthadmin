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
import { useRouter } from 'next/navigation'
import { uploadSingle } from '@/services/upload'
import { useCreateAggregatorMutation } from '@/services/aggregatorApi'
import { toast } from 'react-toastify'

/** FORM DATA TYPE **/
type FormData = {
  name: string
  status: 'active' | 'inactive'
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter aggregator name'),
  status: yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required('Please select a status'),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType & { onFileChange: (f: File | null) => void }> = ({ control, onFileChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Aggregators Add</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="name" label="Aggregators Name" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <label className="form-label">Aggregators Logo</label>
              <input className="form-control" type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
            </div>
          </Col>

          {/* STATUS FIELD */}
          <Col lg={4}>
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
const AggregatorsAdd: React.FC = () => {
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active', name: '' },
  })
  const [file, setFile] = React.useState<File | null>(null)
  const router = useRouter()
  const [createAggregator, { isLoading }] = useCreateAggregatorMutation()

  const onSubmit = async (data: FormData) => {
    try {
      let logo: string | undefined
      if (file) {
        logo = await uploadSingle(file)
      }
      await createAggregator({ name: data.name, logo, status: data.status }).unwrap()
      toast.success('Aggregator created successfully')
      router.push('/aggregators/aggregators-list')
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to create aggregator')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} onFileChange={setFile} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/aggregators/aggregators-list" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default AggregatorsAdd

