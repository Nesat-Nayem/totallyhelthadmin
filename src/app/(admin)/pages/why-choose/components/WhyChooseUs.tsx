'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Button, Spinner } from 'react-bootstrap'
import Link from 'next/link'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useGetWhyChooseQuery, useUpsertWhyChooseMutation } from '@/services/whyChooseApi'
import { toast } from 'react-toastify'
import Image from 'next/image'

type CardItem = {
  value: string
}

type WhyChooseFormData = {
  title: string
  subTitle: string
  card1Icon: FileList | null
  card1Title: string
  card2Icon: FileList | null
  card2Title: string
  card3Icon: FileList | null
  card3Title: string
  status: 'active' | 'inactive'
  // For existing images (when editing)
  card1IconUrl?: string
  card2IconUrl?: string
  card3IconUrl?: string
}

const whyChooseSchema = yup.object({
  title: yup.string().required('Please enter title'),
  subTitle: yup.string().required('Please enter sub title'),
  card1Icon: yup.mixed().nullable().test('card1Icon-required', 'Please upload card 1 icon', function(value) {
    const parent = this.parent as WhyChooseFormData
    return (value && value instanceof FileList && value.length > 0) || !!parent.card1IconUrl
  }),
  card1Title: yup.string().required('Please enter card 1 title'),
  card2Icon: yup.mixed().nullable().test('card2Icon-required', 'Please upload card 2 icon', function(value) {
    const parent = this.parent as WhyChooseFormData
    return (value && value instanceof FileList && value.length > 0) || !!parent.card2IconUrl
  }),
  card2Title: yup.string().required('Please enter card 2 title'),
  card3Icon: yup.mixed().nullable().test('card3Icon-required', 'Please upload card 3 icon', function(value) {
    const parent = this.parent as WhyChooseFormData
    return (value && value instanceof FileList && value.length > 0) || !!parent.card3IconUrl
  }),
  card3Title: yup.string().required('Please enter card 3 title'),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select status'),
  card1IconUrl: yup.string().optional(),
  card2IconUrl: yup.string().optional(),
  card3IconUrl: yup.string().optional(),
})

const WhyChooseUs = () => {
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<WhyChooseFormData>({
    resolver: yupResolver(whyChooseSchema) as any,
    defaultValues: {
      title: '',
      subTitle: '',
      card1Icon: null,
      card1Title: '',
      card2Icon: null,
      card2Title: '',
      card3Icon: null,
      card3Title: '',
      status: 'active',
    },
  })

  const [card1Items, setCard1Items] = useState<CardItem[]>([{ value: '' }])
  const [card2Items, setCard2Items] = useState<CardItem[]>([{ value: '' }])
  const [card3Items, setCard3Items] = useState<CardItem[]>([{ value: '' }])

  const { data: whyChooseData, isLoading, refetch } = useGetWhyChooseQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const [upsertWhyChoose] = useUpsertWhyChooseMutation()

  // Helper functions for managing list items
  const addCardItem = (setState: React.Dispatch<React.SetStateAction<CardItem[]>>) => {
    setState((prev) => [...prev, { value: '' }])
  }

  const handleCardItemChange = (
    state: CardItem[],
    setState: React.Dispatch<React.SetStateAction<CardItem[]>>,
    index: number,
    value: string
  ) => {
    const updated = state.map((item, i) => {
      if (i === index) {
        return { ...item, value }
      }
      return item
    })
    setState(updated)
  }

  const removeCardItem = (
    state: CardItem[],
    setState: React.Dispatch<React.SetStateAction<CardItem[]>>,
    index: number
  ) => {
    if (state.length > 1) {
      const updated = [...state]
      updated.splice(index, 1)
      setState(updated)
    }
  }

  // Convert list items to JSON array string for API
  const itemsToJsonString = (items: CardItem[]): string => {
    const itemValues = items
      .map((item) => item.value.trim())
      .filter((value) => value.length > 0)
    return JSON.stringify(itemValues)
  }

  // Convert array from API to list items
  const arrayToItems = (arr: string[] | undefined): CardItem[] => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return [{ value: '' }]
    }
    return arr.map((item) => ({ value: item }))
  }

  // Populate form when data is fetched
  useEffect(() => {
    if (whyChooseData?.data) {
      const data = whyChooseData.data
      reset({
        title: data.title || '',
        subTitle: data.subTitle || '',
        card1Icon: null,
        card1IconUrl: data.card1?.icon || '',
        card1Title: data.card1?.title || '',
        card2Icon: null,
        card2IconUrl: data.card2?.icon || '',
        card2Title: data.card2?.title || '',
        card3Icon: null,
        card3IconUrl: data.card3?.icon || '',
        card3Title: data.card3?.title || '',
        status: (data.status || 'active') as 'active' | 'inactive',
      } as WhyChooseFormData)

      // Set card items from API data (items is now an array)
      setCard1Items(arrayToItems(data.card1?.items))
      setCard2Items(arrayToItems(data.card2?.items))
      setCard3Items(arrayToItems(data.card3?.items))
    }
  }, [whyChooseData, reset])

  const onSubmit = async (data: WhyChooseFormData) => {
    try {
      const formDataObj = new FormData()

      // Add text fields
      formDataObj.append('title', data.title.trim())
      formDataObj.append('subTitle', data.subTitle.trim())
      formDataObj.append('card1Title', data.card1Title.trim())
      formDataObj.append('card1Items', itemsToJsonString(card1Items))
      formDataObj.append('card2Title', data.card2Title.trim())
      formDataObj.append('card2Items', itemsToJsonString(card2Items))
      formDataObj.append('card3Title', data.card3Title.trim())
      formDataObj.append('card3Items', itemsToJsonString(card3Items))
      formDataObj.append('status', data.status)

      // Handle card icon uploads
      if (data.card1Icon && data.card1Icon.length > 0) {
        formDataObj.append('card1Icon', data.card1Icon[0])
      } else if (data.card1IconUrl) {
        formDataObj.append('card1Icon', data.card1IconUrl)
      }

      if (data.card2Icon && data.card2Icon.length > 0) {
        formDataObj.append('card2Icon', data.card2Icon[0])
      } else if (data.card2IconUrl) {
        formDataObj.append('card2Icon', data.card2IconUrl)
      }

      if (data.card3Icon && data.card3Icon.length > 0) {
        formDataObj.append('card3Icon', data.card3Icon[0])
      } else if (data.card3IconUrl) {
        formDataObj.append('card3Icon', data.card3IconUrl)
      }

      const result = await upsertWhyChoose(formDataObj).unwrap()
      toast.success(result.message || 'Why choose saved successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to save why choose')
    }
  }

  if (isLoading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    )
  }

  const whyChoose = whyChooseData?.data
  const card1IconUrl = whyChoose?.card1?.icon
  const card2IconUrl = whyChoose?.card2?.icon
  const card3IconUrl = whyChoose?.card3?.icon

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Basic Details</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <TextFormInput control={control} name="title" label="Title" placeholder="Enter Title" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="subTitle" label="Sub Title" placeholder="Enter Sub Title" />
              </Col>
              <Col lg={12}>
                <div className="mt-3">
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
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Card 1</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <Controller
                  control={control}
                  name="card1Icon"
                  render={({ field: { onChange, value, ...field }, fieldState }) => (
                    <div>
                      <label className="form-label">Icon</label>
                      <input
                        {...field}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files
                          onChange(files)
                        }}
                        className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                      />
                      {card1IconUrl && !value && (
                        <div className="mt-2">
                          <small className="text-muted d-block mb-1">Current icon:</small>
                          <Image 
                            src={card1IconUrl} 
                            alt="Card 1 Icon" 
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                      {fieldState.error && (
                        <div className="invalid-feedback">{fieldState.error.message}</div>
                      )}
                    </div>
                  )}
                />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="card1Title" label="Title" placeholder="Enter Title" />
              </Col>
              <Col lg={12}>
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">Content Items</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => addCardItem(setCard1Items)}
                      style={{ borderRadius: '4px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                  {card1Items.map((item, index) => (
                    <Row key={index} className="align-items-end mb-3">
                      <Col lg={10}>
                        <input
                          type="text"
                          className="form-control"
                          value={item.value}
                          onChange={(e) => handleCardItemChange(card1Items, setCard1Items, index, e.target.value)}
                          placeholder="Enter item"
                        />
                      </Col>
                      <Col lg={2}>
                        {card1Items.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() => removeCardItem(card1Items, setCard1Items, index)}
                          >
                            Remove
                          </button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Card 2</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <Controller
                  control={control}
                  name="card2Icon"
                  render={({ field: { onChange, value, ...field }, fieldState }) => (
                    <div>
                      <label className="form-label">Icon</label>
                      <input
                        {...field}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files
                          onChange(files)
                        }}
                        className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                      />
                      {card2IconUrl && !value && (
                        <div className="mt-2">
                          <small className="text-muted d-block mb-1">Current icon:</small>
                          <Image 
                            src={card2IconUrl} 
                            alt="Card 2 Icon" 
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                      {fieldState.error && (
                        <div className="invalid-feedback">{fieldState.error.message}</div>
                      )}
                    </div>
                  )}
                />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="card2Title" label="Title" placeholder="Enter Title" />
              </Col>
              <Col lg={12}>
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">Content Items</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => addCardItem(setCard2Items)}
                      style={{ borderRadius: '4px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                  {card2Items.map((item, index) => (
                    <Row key={index} className="align-items-end mb-3">
                      <Col lg={10}>
                        <input
                          type="text"
                          className="form-control"
                          value={item.value}
                          onChange={(e) => handleCardItemChange(card2Items, setCard2Items, index, e.target.value)}
                          placeholder="Enter item"
                        />
                      </Col>
                      <Col lg={2}>
                        {card2Items.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() => removeCardItem(card2Items, setCard2Items, index)}
                          >
                            Remove
                          </button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Card 3</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <Controller
                  control={control}
                  name="card3Icon"
                  render={({ field: { onChange, value, ...field }, fieldState }) => (
                    <div>
                      <label className="form-label">Icon</label>
                      <input
                        {...field}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files
                          onChange(files)
                        }}
                        className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                      />
                      {card3IconUrl && !value && (
                        <div className="mt-2">
                          <small className="text-muted d-block mb-1">Current icon:</small>
                          <Image 
                            src={card3IconUrl} 
                            alt="Card 3 Icon" 
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                      {fieldState.error && (
                        <div className="invalid-feedback">{fieldState.error.message}</div>
                      )}
                    </div>
                  )}
                />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="card3Title" label="Title" placeholder="Enter Title" />
              </Col>
              <Col lg={12}>
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">Content Items</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => addCardItem(setCard3Items)}
                      style={{ borderRadius: '4px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                  {card3Items.map((item, index) => (
                    <Row key={index} className="align-items-end mb-3">
                      <Col lg={10}>
                        <input
                          type="text"
                          className="form-control"
                          value={item.value}
                          onChange={(e) => handleCardItemChange(card3Items, setCard3Items, index, e.target.value)}
                          placeholder="Enter item"
                        />
                      </Col>
                      <Col lg={2}>
                        {card3Items.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() => removeCardItem(card3Items, setCard3Items, index)}
                          >
                            Remove
                          </button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Save'}
              </Button>
            </Col>
            <Col lg={2}>
              <Link href="/pages/why-choose" className="btn btn-primary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </Container>
  )
}

export default WhyChooseUs
