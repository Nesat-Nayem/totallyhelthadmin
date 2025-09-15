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

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control, register }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}> Menu Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Menu Name" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="file" name="file" label="Menu Banner" />
            </div>
          </Col>
          {/* Category */}
          <Col lg={4}>
            <label className="form-label">Category</label>
            <div className="mb-3">
              <select className="form-control form-select">
                <option value="0">Select Category</option>
                <option value="1">Breakfast</option>
                <option value="2">Lunch</option>
                <option value="3">Dinner</option>
                <option value="4">Snacks</option>
                <option value="5">Salads</option>
                <option value="6">Soups</option>
                <option value="7">Smoothies & Juices</option>
                <option value="8">Fruits</option>
                <option value="9">Vegetables</option>
                <option value="10">Whole Grains</option>
                <option value="11">Low-Carb</option>
                <option value="12">High-Protein</option>
                <option value="13">Vegan</option>
                <option value="14">Vegetarian</option>
                <option value="15">Gluten-Free</option>
                <option value="16">Keto</option>
                <option value="17">Desserts (Healthy)</option>
              </select>
            </div>
          </Col>

          {/* Brands */}
          <Col lg={4}>
            <label className="form-label">Brands</label>
            <div className="mb-3">
              <select className="form-control form-select">
                <option value="0">Select Brands</option>
                <option value="1">Totally Health</option>
                <option value="2">KFC</option>
                <option value="3">Pizza Hut</option>
              </select>
            </div>
          </Col>

          {/* Branch */}
          <Col lg={4}>
            <label className="form-label">Restaurant Branch</label>
            <div className="mb-3">
              <select className="form-control form-select">
                <option value="0">Select Branch</option>
                <option value="1">Dubai</option>
                <option value="2">Abu Dhabi</option>
                <option value="3">Sharjah</option>
              </select>
            </div>
          </Col>

          {/* ✅ Price with checkboxes */}
          <Col lg={4}>
            <label className="form-label">Price</label>
            <Controller
              control={control}
              name="orderTypes"
              render={({ field, fieldState }) => {
                const handleChange = (value: string) => {
                  let newValue = [...(field.value || [])]
                  if (newValue.includes(value)) {
                    newValue = newValue.filter((v) => v !== value)
                  } else {
                    newValue.push(value)
                  }
                  field.onChange(newValue)
                }

                return (
                  <>
                    <div className="d-flex gap-4 align-items-center mb-3">
                      {/* DineIn */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="dineIn"
                          checked={field.value?.includes('dinein')}
                          onChange={() => handleChange('dinein')}
                        />
                        <label className="form-check-label" htmlFor="dineIn">
                          Restaurant
                        </label>
                      </div>

                      {/* Takeaway */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="takeaway"
                          checked={field.value?.includes('takeaway')}
                          onChange={() => handleChange('takeaway')}
                        />
                        <label className="form-check-label" htmlFor="takeaway">
                          Online
                        </label>
                      </div>

                      {/* Aggregators */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="aggregator"
                          checked={field.value?.includes('aggregator')}
                          onChange={() => handleChange('aggregator')}
                        />
                        <label className="form-check-label" htmlFor="aggregator">
                          Membership
                        </label>
                      </div>
                    </div>

                    {/* Conditional price inputs */}
                    {field.value?.includes('dinein') && (
                      <div className="mb-3">
                        <input type="number" className="form-control" placeholder="Enter Restaurant price" {...register('dineinPrice')} />
                      </div>
                    )}
                    {field.value?.includes('takeaway') && (
                      <div className="mb-3">
                        <input type="number" className="form-control" placeholder="Enter online price" {...register('takeawayPrice')} />
                      </div>
                    )}
                    {field.value?.includes('aggregator') && (
                      <div className="mb-3">
                        <input type="number" className="form-control" placeholder="Enter Membership price" {...register('aggregatorPrice')} />
                      </div>
                    )}

                    {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                  </>
                )
              }}
            />
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="calories (kcal)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Protein (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Carbs (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Fibre (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="sugars (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="sodium (mg)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="iron (mg)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="calcium (mg)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="vitaminC (mg)" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput rows={4} control={control} type="text" name="description" label="Description" placeholder="Type description" />
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
const MenuEdit: React.FC = () => {
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

export default MenuEdit
