'use client'

import React from 'react'
import Link from 'next/link'
import { useForm, Control, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import TextFormInput from '@/components/form/TextFormInput'

/** ====== VALIDATION SCHEMA ====== **/

const menuDaySchema = yup.object({
  title: yup.string().required('Enter a dish title'),
  description: yup.string().required('Enter a description'),
  image: yup.mixed<FileList>().test('fileType', 'Only image files allowed', (value) => {
    if (!value || value.length === 0) return true
    return ['image/jpeg', 'image/png', 'image/webp'].includes(value[0]?.type)
  }),
})

const formSchema = yup.object({
  meal: yup.string().required('Enter meal name'),
  status: yup.string().required('Please select a status'),
  days: yup.object({
    day1: menuDaySchema,
    day2: menuDaySchema,
    day3: menuDaySchema,
    day4: menuDaySchema,
    day5: menuDaySchema,
  }),
})

type FormData = yup.InferType<typeof formSchema>

/** ====== FORM CARD COMPONENT ====== **/

const MenuDaysFormCard: React.FC<{ control: Control<FormData> }> = ({ control }) => {
  const days = ['day1', 'day2', 'day3', 'day4', 'day5'] as const
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">Meal Plan </CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6} className="mb-3">
            <select name="" id="" className="form-control form-select">
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Morning Snack</option>
              <option value="Lunch">Lunch</option>
              <option value="Afternoon Snack">Afternoon Snack</option>
              <option value="Dinner">Dinner</option>
              <option value="Evening Snack">Evening Snack</option>
              <option value="Supper">Supper</option>
            </select>
          </Col>
        </Row>

        {days.map((day, i) => (
          <div key={day} className="border rounded p-3 mb-3">
            <h5 className="mb-3">Day {i + 1}</h5>
            <Row>
              <Col lg={6} className="mb-3">
                <TextFormInput control={control} name={`days.${day}.title`} label="Title" />
              </Col>
              <Col lg={6} className="mb-3">
                <TextFormInput control={control} name={`days.${day}.description`} label="Description" />
              </Col>
              <Col lg={6} className="mb-3">
                <TextFormInput control={control} name={`days.${day}.image`} label="Image (optional)" type="file" />
              </Col>
            </Row>
          </div>
        ))}

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
                      onChange={() => field.onChange('active')}
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
                      onChange={() => field.onChange('inactive')}
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
      </CardBody>
    </Card>
  )
}

/** ====== MAIN COMPONENT ====== **/

const SampleMenuEdit: React.FC = () => {
  const { reset, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      meal: '',
      status: 'active',
      days: {
        day1: { title: '', description: '', image: undefined },
        day2: { title: '', description: '', image: undefined },
        day3: { title: '', description: '', image: undefined },
        day4: { title: '', description: '', image: undefined },
        day5: { title: '', description: '', image: undefined },
      },
    },
  })

  const onSubmit = (data: FormData) => {
    console.log('Form Submitted:', data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MenuDaysFormCard control={control} />
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

export default SampleMenuEdit
