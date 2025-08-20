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
              <TextFormInput control={control} type="text" name="file" label="Sutitle" placeholder="Enter Subtitle" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const InfoCard1 = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Section 1 </CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="meta" label=" Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="file" name="metaTag" label="Icon" placeholder="" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} type="text" name="description2" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const InfoCard2 = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Section 2 </CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="meta" label=" Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="file" name="metaTag" label="Icon" placeholder="" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} type="text" name="description2" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const InfoCard3 = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Section 3 </CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="meta" label=" Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="file" name="metaTag" label="Icon" placeholder="" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} type="text" name="description2" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const MetaOptionsCard = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Meta Options</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="meta" label="Meta Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="metaTag" label="Meta Tag Keyword" placeholder="Enter word" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} type="text" name="description2" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const Goal = () => {
  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    stock: yup.string().required('Please enter stock'),
    tag: yup.string().required('Please enter tag'),
    description: yup.string().required('Please enter description'),
    description2: yup.string().required('Please enter description'),
    meta: yup.string().required('Please enter meta title'),
    metaTag: yup.string().required('Please enter meta tag'),
  })

  const { reset, handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  })
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <GeneralInformationCard control={control} />
      <InfoCard1 control={control} />
      <InfoCard2 control={control} />
      <InfoCard3 control={control} />
      <MetaOptionsCard control={control} />
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

export default Goal
