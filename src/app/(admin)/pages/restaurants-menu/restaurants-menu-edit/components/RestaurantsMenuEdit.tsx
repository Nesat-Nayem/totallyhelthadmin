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
  price: string
  file: FileList
  NutritionFacts: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  title: yup.string().required('Please enter title'),
  status: yup.string().required('Please select a status'),
  description: yup.string().required('Please enter description'),
  price: yup.string().required('Please enter price'),
  NutritionFacts: yup.string().required('Please enter Nutrition Facts'),
  file: yup
    .mixed<FileList>()
    .test('required', 'Please upload a banner image', (value) => value && value.length > 0)
    .required(),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Restaurants Menu Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <label htmlFor="" className="form-label">
              category
            </label>
            <div className="mb-3">
              <select name="" id="" className="form-control  form-select">
                <option value="0">Select Restaurants</option>
                <option value="1">Breakfast</option>
                <option value="2">Soups & Bite</option>
                <option value="3">Bowls</option>
              </select>
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="price" label="Price" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="file" name="file" label="Banner" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput rows={4} control={control} type="text" name="description" label="Description" placeholder="Type description" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput
                rows={4}
                control={control}
                type="text"
                name="NutritionFacts"
                label="Nutrition Facts"
                placeholder="Type description"
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
const RestaurantsMenuEdit: React.FC = () => {
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active' },
  })

  const onSubmit = (data: FormData) => {
    console.log('Form Submitted:', data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100">
              Save Changes
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

export default RestaurantsMenuEdit
