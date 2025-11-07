'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Spinner, Button } from 'react-bootstrap'
import Link from 'next/link'
import { useGetCompareQuery, useUpsertCompareMutation } from '@/services/compareApi'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

type CompareItem = {
  title: string
  included: boolean
}

type CompareFormData = {
  title: string
  banner1: FileList | null
  banner2: FileList | null
  status: 'active' | 'inactive'
  // For existing banners (when editing)
  banner1Url?: string
  banner2Url?: string
}

const compareSchema = yup.object({
  title: yup.string().required('Please enter title'),
  banner1: yup.mixed().nullable().test('banner1-required', 'Please upload banner 1', function(value) {
    const parent = this.parent as CompareFormData
    return (value && value instanceof FileList && value.length > 0) || !!parent.banner1Url
  }),
  banner2: yup.mixed().nullable().test('banner2-required', 'Please upload banner 2', function(value) {
    const parent = this.parent as CompareFormData
    return (value && value instanceof FileList && value.length > 0) || !!parent.banner2Url
  }),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Please select status'),
  banner1Url: yup.string().optional(),
  banner2Url: yup.string().optional(),
})

const Compare = () => {
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<CompareFormData>({
    resolver: yupResolver(compareSchema) as any,
    defaultValues: {
      title: '',
      banner1: null,
      banner2: null,
      status: 'active',
    },
  })

  const [compareItems, setCompareItems] = useState<CompareItem[]>([{ title: '', included: true }])

  const { data: compareData, isLoading, refetch } = useGetCompareQuery()
  const [upsertCompare] = useUpsertCompareMutation()

  // Populate form when data is fetched
  useEffect(() => {
    if (compareData?.data) {
      const compare = compareData.data
      reset({
        title: compare.title || '',
        banner1: null,
        banner2: null,
        banner1Url: compare.banner1 || compare.image2 || '',
        banner2Url: compare.banner2 || compare.image1 || '',
        status: (compare.status || 'active') as 'active' | 'inactive',
      } as CompareFormData)
      // Set compareItems from API data
      if (compare.compareItems && compare.compareItems.length > 0) {
        setCompareItems(compare.compareItems)
      } else {
        setCompareItems([{ title: '', included: true }])
      }
    }
  }, [compareData, reset])

  const addCompareItem = () => {
    setCompareItems([...compareItems, { title: '', included: true }])
  }

  const handleCompareItemChange = (index: number, field: keyof CompareItem, value: string | boolean) => {
    const updated = compareItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value }
      }
      return item
    })
    setCompareItems(updated)
  }

  const removeCompareItem = (index: number) => {
    if (compareItems.length > 1) {
      const updated = [...compareItems]
      updated.splice(index, 1)
      setCompareItems(updated)
    }
  }

  const onSubmit = async (data: CompareFormData) => {
    try {
      // Validate compareItems
      const validCompareItems = compareItems.filter(item => item.title.trim() !== '')
      if (validCompareItems.length === 0) {
        toast.error('Please add at least one compare item with a title')
        return
      }

      const formData = new FormData()

      // Add basic fields
      formData.append('title', data.title.trim())
      formData.append('status', data.status)

      // Handle banner uploads
      if (data.banner1 && data.banner1.length > 0) {
        formData.append('banner1', data.banner1[0])
      } else if (data.banner1Url) {
        formData.append('banner1', data.banner1Url)
      }

      if (data.banner2 && data.banner2.length > 0) {
        formData.append('banner2', data.banner2[0])
      } else if (data.banner2Url) {
        formData.append('banner2', data.banner2Url)
      }

      // Add compareItems as JSON string
      formData.append('compareItems', JSON.stringify(validCompareItems))

      const result = await upsertCompare(formData).unwrap()
      toast.success(result.message || 'Compare saved successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to save compare')
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

  const compare = compareData?.data
  const banner1Url = compare?.banner1 || compare?.image2
  const banner2Url = compare?.banner2 || compare?.image1

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Basic Details</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={4}>
                <Controller
                  control={control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                        {...field}
                      />
                      {fieldState.error && (
                        <div className="invalid-feedback">{fieldState.error.message}</div>
                      )}
                    </div>
                  )}
                />
              </Col>
              <Col lg={4}>
                <Controller
                  control={control}
                  name="banner1"
                  render={({ field: { onChange, value, ...field }, fieldState }) => (
                    <div>
                      <label className="form-label">Banner 1</label>
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
                      {banner1Url && !value && (
                        <div className="mt-2">
                          <small className="text-muted">Current banner: </small>
                          <a href={banner1Url} target="_blank" rel="noopener noreferrer" className="ms-1">
                            View
                          </a>
                        </div>
                      )}
                      {fieldState.error && (
                        <div className="invalid-feedback">{fieldState.error.message}</div>
                      )}
                    </div>
                  )}
                />
              </Col>
              <Col lg={4}>
                <Controller
                  control={control}
                  name="banner2"
                  render={({ field: { onChange, value, ...field }, fieldState }) => (
                    <div>
                      <label className="form-label">Banner 2</label>
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
                      {banner2Url && !value && (
                        <div className="mt-2">
                          <small className="text-muted">Current banner: </small>
                          <a href={banner2Url} target="_blank" rel="noopener noreferrer" className="ms-1">
                            View
                          </a>
                        </div>
                      )}
                      {fieldState.error && (
                        <div className="invalid-feedback">{fieldState.error.message}</div>
                      )}
                    </div>
                  )}
                />
              </Col>
              <Col lg={12} className="mt-3">
                <Controller
                  control={control}
                  name="status"
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="form-label">Status</label>
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
                    </div>
                  )}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">Compare</CardTitle>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={addCompareItem}
              style={{ borderRadius: '4px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              +
            </button>
          </CardHeader>
          <CardBody>
            {compareItems.map((item, index) => (
              <Row key={index} className="align-items-end mb-3">
                <Col lg={5}>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.title}
                    onChange={(e) => handleCompareItemChange(index, 'title', e.target.value)}
                  />
                </Col>

                <Col lg={5}>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`included-${index}`}
                        value="true"
                        checked={item.included === true}
                        onChange={() => handleCompareItemChange(index, 'included', true)}
                        id={`included-yes-${index}`}
                      />
                      <label className="form-check-label" htmlFor={`included-yes-${index}`}>
                        Yes
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`included-${index}`}
                        value="false"
                        checked={item.included === false}
                        onChange={() => handleCompareItemChange(index, 'included', false)}
                        id={`included-no-${index}`}
                      />
                      <label className="form-check-label" htmlFor={`included-no-${index}`}>
                        No
                      </label>
                    </div>
                  </div>
                </Col>

                <Col lg={2}>
                  {compareItems.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => removeCompareItem(index)}
                    >
                      Remove
                    </button>
                  )}
                </Col>
              </Row>
            ))}
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
              <Link href="" className="btn btn-primary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </Container>
  )
}

export default Compare
