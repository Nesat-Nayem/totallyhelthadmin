'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, FieldPath, FieldValues, useForm } from 'react-hook-form'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { FormInputProps } from '@/types/component-props'
import Link from 'next/link'

type controlType = {
  control: Control<any>
}

const GeneralInformationCard = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Counter</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="title" label="Total Reviews" placeholder="" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="title" label="Total Meal Items" placeholder="" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="title" label="Happy Clients" placeholder="" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="title" label="Years Helping People" placeholder="" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const Counter = () => {
  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
  })

  const { reset, handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  })
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className=" w-100">
              Save Change
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

export default Counter
