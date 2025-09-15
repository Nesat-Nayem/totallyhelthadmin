'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import Select from 'react-select'
/** FORM DATA TYPE **/
type FormData = {
  title: string
  status: string
  description: string
  file: FileList
  NutritionFacts: string

  // ✅ changed from single string to multiple selections
  orderTypes: string[]
  dineinPrice?: string
  takeawayPrice?: string
  aggregatorPrice?: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
  register: ReturnType<typeof useForm<FormData>>['register']
}

/** VALIDATION SCHEMA **/
const messageSchema: yup.ObjectSchema<any> = yup.object({
  title: yup.string().required('Please enter title'),
  status: yup.string().required('Please select a status'),
  description: yup.string().required('Please enter description'),
  NutritionFacts: yup.string().required('Please enter Nutrition Facts'),
  file: yup
    .mixed<FileList>()
    .test('required', 'Please upload a banner image', (value) => value && value.length > 0)
    .required(),

  // ✅ at least one order type must be selected
  orderTypes: yup.array().of(yup.string()).min(1, 'Please select at least one order type'),

  // ✅ require price only if type is selected
  dineinPrice: yup.string().when('orderTypes', {
    is: (val: string[]) => val?.includes('dinein'),
    then: (schema) => schema.required('Please enter Restaurant price'),
    otherwise: (schema) => schema.notRequired(),
  }),
  takeawayPrice: yup.string().when('orderTypes', {
    is: (val: string[]) => val?.includes('takeaway'),
    then: (schema) => schema.required('Please enter Online price'),
    otherwise: (schema) => schema.notRequired(),
  }),
  aggregatorPrice: yup.string().when('orderTypes', {
    is: (val: string[]) => val?.includes('aggregator'),
    then: (schema) => schema.required('Please enter Membership price'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const brandOptions = [
  { value: 'payment-method', label: 'Payment Method' },
  { value: 'expanses', label: 'Expanses' },
]

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control, register }) => {
  const [selectedBrands, setSelectedBrands] = useState<any[]>([])

  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}> Role Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <label className="form-label"> Select Staff</label>
            <div className="mb-3">
              <select className="form-control form-select">
                <option value="0">Select Staff</option>
                <option value="1">Suraj jamdade</option>
                <option value="2">Suraj jamdade</option>
              </select>
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Role" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Username" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Password" />
            </div>
          </Col>

          {/* Brands multiselect */}
          <Col lg={4}>
            <label className="form-label">Menu Access</label>
            <div className="mb-3">
              <Select
                isMulti
                options={brandOptions}
                value={selectedBrands}
                onChange={(brands) => setSelectedBrands(brands as any[])}
                placeholder="Select "
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const RoleEdit: React.FC = () => {
  const { reset, handleSubmit, control, register } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active', orderTypes: [] },
  })

  const onSubmit = (data: FormData) => {
    console.log('Form Submitted:', data)
    reset({ status: 'active', orderTypes: [] })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} register={register} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100">
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

export default RoleEdit
