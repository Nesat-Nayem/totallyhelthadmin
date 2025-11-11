'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useGetCounterPageQuery, useUpsertCounterPageMutation } from '@/services/counterApi'
import { toast } from 'react-toastify'

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
              <TextFormInput control={control} type="number" name="totalReviews" label="Total Reviews" placeholder="" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="totalMealItems" label="Total Meal Items" placeholder="" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="happyClients" label="Happy Clients" placeholder="" />
            </div>
          </Col>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="yearsHelpingPeople" label="Years Helping People" placeholder="" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const Counter = () => {
  const counterSchema = yup.object({
    totalReviews: yup.number().min(0, 'Total reviews must be a positive number').required('Please enter total reviews'),
    totalMealItems: yup.number().min(0, 'Total meal items must be a positive number').required('Please enter total meal items'),
    happyClients: yup.number().min(0, 'Happy clients must be a positive number').required('Please enter happy clients'),
    yearsHelpingPeople: yup.number().min(0, 'Years helping people must be a positive number').required('Please enter years helping people'),
  })

  const { reset, handleSubmit, control } = useForm({
    resolver: yupResolver(counterSchema),
    defaultValues: {
      totalReviews: 0,
      totalMealItems: 0,
      happyClients: 0,
      yearsHelpingPeople: 0,
    },
  })

  const { data: counterData, isLoading, refetch } = useGetCounterPageQuery()
  const [upsertCounterPage, { isLoading: isSubmitting }] = useUpsertCounterPageMutation()

  // Populate form when data is fetched
  useEffect(() => {
    if (counterData?.data) {
      reset({
        totalReviews: counterData.data.totalReviews || 0,
        totalMealItems: counterData.data.totalMealItems || 0,
        happyClients: counterData.data.happyClients || 0,
        yearsHelpingPeople: counterData.data.yearsHelpingPeople || 0,
      })
    }
  }, [counterData, reset])

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        totalReviews: Number(data.totalReviews) || 0,
        totalMealItems: Number(data.totalMealItems) || 0,
        happyClients: Number(data.happyClients) || 0,
        yearsHelpingPeople: Number(data.yearsHelpingPeople) || 0,
      }

      const result = await upsertCounterPage(payload).unwrap()
      toast.success(result.message || 'Counter page updated successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to update counter page')
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className=" w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Save Change'}
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
