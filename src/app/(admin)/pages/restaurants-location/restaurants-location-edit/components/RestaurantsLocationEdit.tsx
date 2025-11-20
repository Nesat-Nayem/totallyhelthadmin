'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState, useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useUpdateRestaurantLocationMutation, useGetRestaurantLocationByIdQuery } from '@/services/restaurantLocationApi'
import { useRouter, useSearchParams } from 'next/navigation'
import { uploadSingle } from '@/services/upload'

/** FORM DATA TYPE **/
type FormData = {
  name: string
  address: string
  image?: string
  file?: FileList
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
  currentImage?: string
  onFileChange: (f: File | null) => void
}

/** VALIDATION SCHEMA WITH STRONG TYPES **/
const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  name: yup.string().required('Please enter restaurant name').trim(),
  address: yup.string().required('Please enter address').trim(),
  image: yup.string().optional(),
  file: yup.mixed<FileList>().optional(),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control, currentImage, onFileChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Restaurant Location Edit</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="name" label="Restaurant Name" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="address" label="Restaurant Address" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <label className="form-label">Restaurant Image</label>
              <Controller
                control={control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <>
                    <input
                      {...field}
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        onFileChange(file)
                        onChange(e.target.files)
                      }}
                    />
                    {currentImage && (
                      <div className="mt-2">
                        <img src={currentImage} alt="Preview" className="img-thumbnail" style={{ maxHeight: '150px' }} />
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const RestaurantsLocationEdit: React.FC = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const { data: restaurantLocation, isLoading: isLoadingData } = useGetRestaurantLocationByIdQuery(id, { skip: !id })
  const { reset, handleSubmit, control, setValue } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { name: '', address: '', image: '' },
  })
  const [updateRestaurantLocation, { isLoading }] = useUpdateRestaurantLocationMutation()
  const { push } = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const handleFileChange = (f: File | null) => {
    setFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(f)
    }
  }

  useEffect(() => {
    if (restaurantLocation) {
      reset({
        name: restaurantLocation.name,
        address: restaurantLocation.address,
        image: restaurantLocation.image || '',
      })
      if (restaurantLocation.image) {
        setImagePreview(restaurantLocation.image)
      }
    }
  }, [restaurantLocation, reset])

  const onSubmit = async (data: FormData) => {
    if (!id) {
      alert('Missing restaurant location id')
      return
    }
    try {
      let image = data.image
      if (file) {
        image = await uploadSingle(file)
      }
      await updateRestaurantLocation({ id, data: { name: data.name, address: data.address, image } }).unwrap()
      alert('Restaurant location updated successfully')
      push('/pages/restaurants-location')
    } catch (e: any) {
      alert(e?.data?.message || e?.message || 'Failed to update restaurant location')
    }
  }

  if (isLoadingData) {
    return <div>Loading...</div>
  }

  if (!restaurantLocation) {
    return <div>Restaurant location not found</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard control={control} currentImage={imagePreview} onFileChange={handleFileChange} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isLoading}>
              Save Changes
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/pages/restaurants-location" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default RestaurantsLocationEdit
