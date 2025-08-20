'use client'

import React from 'react'
import Link from 'next/link'
import * as yup from 'yup'
import { useForm, Control } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import TextFormInput from '@/components/form/TextFormInput'

/** VALIDATION SCHEMA **/
const schema = yup.object({
  file: yup
    .mixed<FileList>()
    .required('Brand Logo is required')
    .test('fileExists', 'Please select a file', (value) => {
      return value && value.length > 0
    }),
  videoUrl: yup.string().required('Video URL is required').url('Please enter a valid URL'),
})

/** FORM FIELD TYPES (derived from schema) **/
type FormData = yup.InferType<typeof schema>

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<{ control: Control<FormData> }> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">General Information</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="file" name="file" label="Brand Logo" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="url" name="videoUrl" label="Video URL" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const Video: React.FC = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      file: undefined,
      videoUrl: '',
    },
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
              Save
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="#" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default Video
