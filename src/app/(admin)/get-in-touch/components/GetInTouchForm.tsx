'use client'

import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm, useFieldArray } from 'react-hook-form'
import { useGetGetInTouchQuery, useUpsertGetInTouchMutation, getInTouchApi } from '@/services/getInTouchApi'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { useTitle } from '@/context/useTitleContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type GetInTouchFormData = {
  title: string
  officeAddress: string
  contactNumbers: Array<{ value: string }>
  emailAddresses: Array<{ value: string }>
  careerInfo: string
}

const getInTouchSchema: yup.ObjectSchema<GetInTouchFormData> = yup.object({
  title: yup.string().required('Title is required').trim(),
  officeAddress: yup.string().required('Office address is required').trim(),
  contactNumbers: yup
    .array()
    .of(
      yup.object({
        value: yup.string().required('Contact number cannot be empty').trim(),
      })
    )
    .min(1, 'At least one contact number is required'),
  emailAddresses: yup
    .array()
    .of(
      yup.object({
        value: yup.string().email('Invalid email address').required('Email address cannot be empty').trim(),
      })
    )
    .min(1, 'At least one email address is required'),
  careerInfo: yup.string().required('Career info is required').trim(),
}) as yup.ObjectSchema<GetInTouchFormData>

// Default ID to use for upsert operations (24-character MongoDB ObjectId format)
const DEFAULT_GET_IN_TOUCH_ID = '507f1f77bcf86cd799439011'

const GetInTouchForm: React.FC = () => {
  const dispatch = useDispatch()
  const { setTitle } = useTitle()
  const { data: existingData, isLoading: isLoadingData, error } = useGetGetInTouchQuery()
  const [upsertGetInTouch, { isLoading: isSubmitting }] = useUpsertGetInTouchMutation()

  // Use existing ID if available, otherwise use default
  // existingData will be null when no data exists (404 handled gracefully)
  const getInTouchId = existingData?.data?._id || DEFAULT_GET_IN_TOUCH_ID

  // Set page title
  useEffect(() => {
    setTitle('Get In Touch')
    // Cleanup: reset to default when component unmounts
    return () => {
      setTitle('WELCOME TO TOTALLY HEALTH')
    }
  }, [setTitle])

  const { handleSubmit, control, reset } = useForm<GetInTouchFormData>({
    resolver: yupResolver(getInTouchSchema) as any,
    defaultValues: {
      title: '',
      officeAddress: '',
      contactNumbers: [{ value: '' }],
      emailAddresses: [{ value: '' }],
      careerInfo: '',
    },
  })

  const {
    fields: contactNumberFields,
    append: appendContactNumber,
    remove: removeContactNumber,
  } = useFieldArray({
    control,
    name: 'contactNumbers',
  })

  const {
    fields: emailAddressFields,
    append: appendEmailAddress,
    remove: removeEmailAddress,
  } = useFieldArray({
    control,
    name: 'emailAddresses',
  })

  // Load existing data
  useEffect(() => {
    // If we have data, load it into the form
    if (existingData?.data) {
      const data = existingData.data
      reset({
        title: data.title || '',
        officeAddress: data.officeAddress || '',
        contactNumbers: data.contactNumbers?.length > 0
          ? data.contactNumbers.map((num) => ({ value: num }))
          : [{ value: '' }],
        emailAddresses: data.emailAddresses?.length > 0
          ? data.emailAddresses.map((email) => ({ value: email }))
          : [{ value: '' }],
        careerInfo: data.careerInfo || '',
      })
    } else if (!isLoadingData && (existingData === null || existingData?.data === null)) {
      // No data exists (backend returned null data or API returned null) - reset to empty form
      reset({
        title: '',
        officeAddress: '',
        contactNumbers: [{ value: '' }],
        emailAddresses: [{ value: '' }],
        careerInfo: '',
      })
    }
  }, [existingData, isLoadingData, reset])

  const onSubmit = async (data: GetInTouchFormData) => {
    try {
      // Convert form data to API format
      const contactNumbers = data.contactNumbers
        .map((item) => item.value.trim())
        .filter((value) => value.length > 0)

      const emailAddresses = data.emailAddresses
        .map((item) => item.value.trim().toLowerCase())
        .filter((value) => value.length > 0)

      const payload = {
        title: data.title.trim(),
        officeAddress: data.officeAddress.trim(),
        contactNumbers,
        emailAddresses,
        careerInfo: data.careerInfo.trim(),
      }

      const result = await upsertGetInTouch({
        id: getInTouchId,
        data: payload,
      }).unwrap()

      dispatch(getInTouchApi.util.invalidateTags([{ type: 'GetInTouch', id: 'SINGLE' }]))
      toast.success(result.message || 'Get In Touch saved successfully')
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to save Get In Touch'
      toast.error(errorMessage)
    }
  }

  // Show loading spinner while fetching
  if (isLoadingData) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>
                <IconifyIcon icon="solar:phone-calling-bold-duotone" className="me-2" />
                Get In Touch
              </CardTitle>
            </CardHeader>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <Spinner animation="border" variant="primary" />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }
  
  // If there's an error (shouldn't happen for 404 since we handle it in API, but handle other errors)
  // Only log if it's not a 404 and we don't have null data (which means 404 was handled)
  if (error && existingData !== null) {
    console.warn('Error loading Get In Touch data (non-404):', error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>
                <IconifyIcon icon="solar:phone-calling-bold-duotone" className="me-2" />
                Get In Touch
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <TextFormInput
                    control={control}
                    name="title"
                    label="Title"
                    placeholder="Enter title"
                  />
                </Col>
                <Col lg={12} className="mt-3">
                  <TextAreaFormInput
                    control={control}
                    name="officeAddress"
                    label="Office Address"
                    placeholder="Enter office address"
                    rows={3}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Contact Numbers */}
      <Row className="mt-3">
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as={'h4'}>
                <IconifyIcon icon="solar:phone-calling-bold-duotone" className="me-2" />
                Contact Numbers
              </CardTitle>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => appendContactNumber({ value: '' })}
              >
                <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                Add Contact Number
              </Button>
            </CardHeader>
            <CardBody>
              {contactNumberFields.length === 0 ? (
                <p className="text-muted">No contact numbers added. Click "Add Contact Number" to add one.</p>
              ) : (
                contactNumberFields.map((field, index) => (
                  <Row key={field.id} className="mb-3 align-items-end">
                    <Col lg={10}>
                      <TextFormInput
                        control={control}
                        name={`contactNumbers.${index}.value`}
                        label={`Contact Number ${index + 1}`}
                        placeholder="Enter contact number (e.g., +1 (639) 831-4614)"
                      />
                    </Col>
                    <Col lg={2}>
                      {contactNumberFields.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeContactNumber(index)}
                          className="w-100"
                        >
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-1" />
                          Remove
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Email Addresses */}
      <Row className="mt-3">
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as={'h4'}>
                <IconifyIcon icon="solar:letter-opened-bold-duotone" className="me-2" />
                Email Addresses
              </CardTitle>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => appendEmailAddress({ value: '' })}
              >
                <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                Add Email Address
              </Button>
            </CardHeader>
            <CardBody>
              {emailAddressFields.length === 0 ? (
                <p className="text-muted">No email addresses added. Click "Add Email Address" to add one.</p>
              ) : (
                emailAddressFields.map((field, index) => (
                  <Row key={field.id} className="mb-3 align-items-end">
                    <Col lg={10}>
                      <TextFormInput
                        control={control}
                        name={`emailAddresses.${index}.value`}
                        label={`Email Address ${index + 1}`}
                        placeholder="Enter email address (e.g., info@example.com)"
                        type="email"
                      />
                    </Col>
                    <Col lg={2}>
                      {emailAddressFields.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeEmailAddress(index)}
                          className="w-100"
                        >
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-1" />
                          Remove
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Career Info */}
      <Row className="mt-3">
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>
                <IconifyIcon icon="solar:briefcase-bold-duotone" className="me-2" />
                Career Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <TextAreaFormInput
                control={control}
                name="careerInfo"
                label="Career Info"
                placeholder="Enter career information"
                rows={5}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Submit Button */}
      <div className="p-3 bg-light mb-3 rounded mt-3">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <IconifyIcon icon="solar:diskette-bold-duotone" className="me-2" />
                  Save Changes
                </>
              )}
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default GetInTouchForm

