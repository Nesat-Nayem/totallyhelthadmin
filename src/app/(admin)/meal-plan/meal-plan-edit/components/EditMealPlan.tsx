'use client'

import React, { useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Link from 'next/link'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import FileUpload from '@/components/FileUpload'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { apiFetch, apiMultipartPut } from '@/utils/api'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

/** FORM TYPES **/
type FormData = {
  title: string
  discount: string
  badge: string
  description: string
  price: number
  delPrice: number
}

type SingleValue = { value: string }
type WeekOffer = { week: string; offer: string }

const EditMealPlan = () => {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const params = useSearchParams()
  const id = params.get('id') || ''
  const router = useRouter()
  const { data: session } = useSession()

  const [kcalList, setKcalList] = useState<SingleValue[]>([{ value: '' }])
  const [deliveredList, setDeliveredList] = useState<SingleValue[]>([{ value: '' }])
  const [suitableList, setSuitableList] = useState<SingleValue[]>([{ value: '' }])
  const [daysPerWeekList, setDaysPerWeekList] = useState<WeekOffer[]>([{ week: '', offer: '' }])
  const [weeksOfferList, setWeeksOfferList] = useState<WeekOffer[]>([{ week: '', offer: '' }])
  const [category, setCategory] = useState<string>('')
  const [brand, setBrand] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<{ _id?: string; url?: string }[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined)
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const getImgUrl = (u?: any): string | undefined => {
    if (!u) return undefined
    if (typeof u === 'string') return u
    return u.url || u.secure_url
  }

  const handleChange = <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, index: number, key: keyof T, val: string) => {
    const updated = [...list]
    updated[index] = { ...updated[index], [key]: val }
    setList(updated)
  }

  const handleAdd = <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
    setList([...list, item])
  }

  const handleRemove = <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    const updated = [...list]
    updated.splice(index, 1)
    setList(updated)
  }

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await apiFetch<any>(`/meal-plans/${id}`)
        const item = res?.data || res
        reset({
          title: item.title,
          description: item.description,
          discount: item.discount,
          badge: item.badge,
          price: item.price,
          delPrice: item.delPrice,
        })
        setCategory(item.category || '')
        setBrand(item.brand || '')
        setKcalList((item.kcalList || ['']).map((v: string) => ({ value: v })))
        setDeliveredList((item.deliveredList || ['']).map((v: string) => ({ value: v })))
        setSuitableList((item.suitableList || ['']).map((v: string) => ({ value: v })))
        setDaysPerWeekList((item.daysPerWeek || ['']).map((v: string) => ({ week: v, offer: '' })))
        setWeeksOfferList((item.weeksOffers || [{ week: '', offer: '' }]).map((w: any) => ({ week: w.week, offer: w.offer })))
        setExistingImages((item.images || []).map((img: any) => ({ _id: img?._id, url: getImgUrl(img) })))
        setThumbnailUrl(getImgUrl(item.thumbnail))
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onRemoveExistingImage = (imgId?: string) => {
    if (!imgId) return
    setRemovedImageIds((prev) => [...prev, imgId])
    setExistingImages((prev) => prev.filter((x) => x._id !== imgId))
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setSubmitting(true)
      const form = new FormData()
      form.append('title', data.title)
      form.append('description', data.description)
      if (data.discount) form.append('discount', data.discount)
      if (data.badge) form.append('badge', data.badge)
      if (data.price !== undefined && data.price !== null) form.append('price', String(data.price))
      if (data.delPrice !== undefined && data.delPrice !== null) form.append('delPrice', String(data.delPrice))
      if (category) form.append('category', category)
      if (brand) form.append('brand', brand)

      // Arrays
      const arr = (xs: SingleValue[]) => xs.map((x) => x.value).filter((v) => v)
      form.append('kcalList', JSON.stringify(arr(kcalList)))
      form.append('deliveredList', JSON.stringify(arr(deliveredList)))
      form.append('suitableList', JSON.stringify(arr(suitableList)))
      form.append('daysPerWeek', JSON.stringify(daysPerWeekList.map((x) => x.week).filter((v) => v)))
      form.append('weeksOffers', JSON.stringify(weeksOfferList.filter((w) => w.week && w.offer)))

      // Image removals
      if (removedImageIds.length) form.append('removeImageIds', JSON.stringify(removedImageIds))

      // New files: first file as new thumbnail (if present), all appended as images
      files.forEach((file, idx) => {
        form.append('images', file)
        if (idx === 0) form.append('thumbnail', file)
      })

      const token = (session as any)?.user?.token as string | undefined
      await apiMultipartPut(`/meal-plans/${id}`, form, token)
      alert('Meal plan updated')
      router.push('/meal-plan/meal-plan-list')
    } catch (e: any) {
      alert(e?.message || 'Failed to update')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Col xl={12}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FileUpload title="Meal Plan Photos" onFilesChange={(fs) => setFiles(fs)} />

        {/* Existing Images */}
        {!loading && (thumbnailUrl || existingImages.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle as="h4">Current Images</CardTitle>
            </CardHeader>
            <CardBody>
              {thumbnailUrl && (
                <div className="mb-3">
                  <label className="form-label">Thumbnail</label>
                  <div>
                    <img src={thumbnailUrl} alt="thumbnail" style={{ maxHeight: 120, borderRadius: 8 }} />
                  </div>
                  <small className="text-muted d-block mt-1">Upload a new first image to replace the thumbnail.</small>
                </div>
              )}
              {existingImages.length > 0 && (
                <div>
                  <label className="form-label">Gallery</label>
                  <Row>
                    {existingImages.map((img) => (
                      <Col key={img._id || img.url} lg={3} className="mb-3">
                        <div className="border p-2 rounded d-flex flex-column align-items-center">
                          <img src={img.url} alt="meal" style={{ maxHeight: 140, borderRadius: 6, objectFit: 'cover', width: '100%' }} />
                          {img._id && (
                            <button type="button" className="btn btn-sm btn-outline-danger mt-2" onClick={() => onRemoveExistingImage(img._id)}>
                              Remove
                            </button>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Edit Meal Plan</CardTitle>
          </CardHeader>
          <CardBody>
            {loading && <p>Loading...</p>}
            {!loading && (
              <Row>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Title
                    </label>
                    <input {...register('title')} type="text" id="title" className="form-control" />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label htmlFor="menuCategory" className="form-label">
                      Select Menu Category
                    </label>
                    <select id="menuCategory" className="form-control form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="">Select Category</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="mb-3">
                    <label htmlFor="brands" className="form-label">
                      Select Brands
                    </label>
                    <select id="brands" className="form-control form-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                      <option value="">Select Brand</option>
                      <option value="Totally Health">Totally Health</option>
                      <option value="Subway">Subway</option>
                      <option value="Pizza Hut">Pizza Hut</option>
                      <option value="Burger King">Burger King</option>
                    </select>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="mb-3">
                    <label htmlFor="discount" className="form-label">
                      % Off
                    </label>
                    <input {...register('discount')} type="text" id="discount" className="form-control" />
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="mb-3">
                    <label htmlFor="badge" className="form-label">
                      Badge Title
                    </label>
                    <input {...register('badge')} type="text" id="badge" className="form-control" />
                  </div>
                </Col>
                <Col lg={12}>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      className="form-control bg-light-subtle"
                      id="description"
                      rows={5}
                      placeholder="Short description about the product"
                    />
                  </div>
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>

        {/* Dynamic Sections */}
        {[
          { title: 'Add Kcal', state: kcalList, setState: setKcalList },
          { title: 'Delivered Daily', state: deliveredList, setState: setDeliveredList },
          { title: 'Suitable For', state: suitableList, setState: setSuitableList },
        ].map(({ title, state, setState }, i) => (
          <Card key={i}>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4">{title}</CardTitle>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleAdd(state, setState, { value: '' })}>
                +
              </button>
            </CardHeader>
            <CardBody>
              {state.map((item, idx) => (
                <Row key={idx} className="align-items-end mb-3">
                  <Col lg={10}>
                    <label className="form-label">{title}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.value}
                      onChange={(e) => handleChange(state, setState, idx, 'value', e.target.value)}
                    />
                  </Col>
                  <Col lg={2}>
                    {state.length > 1 && (
                      <button type="button" className="btn btn-outline-danger w-100" onClick={() => handleRemove(state, setState, idx)}>
                        Remove
                      </button>
                    )}
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>
        ))}

        {/* Days Per Week */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">Days per week</CardTitle>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleAdd(daysPerWeekList, setDaysPerWeekList, { week: '', offer: '' })}>
              +
            </button>
          </CardHeader>
          <CardBody>
            {daysPerWeekList.map((item, index) => (
              <Row key={index} className="align-items-end mb-3">
                <Col lg={9}>
                  <label className="form-label">Add Days</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.week}
                    onChange={(e) => handleChange(daysPerWeekList, setDaysPerWeekList, index, 'week', e.target.value)}
                  />
                </Col>
                <Col lg={2}>
                  {daysPerWeekList.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => handleRemove(daysPerWeekList, setDaysPerWeekList, index)}>
                      Remove
                    </button>
                  )}
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>

        {/* How Many Weeks */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">How many weeks</CardTitle>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleAdd(weeksOfferList, setWeeksOfferList, { week: '', offer: '' })}>
              +
            </button>
          </CardHeader>
          <CardBody>
            {weeksOfferList.map((item, index) => (
              <Row key={index} className="align-items-end mb-3">
                <Col lg={5}>
                  <label className="form-label">Add Weeks</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.week}
                    onChange={(e) => handleChange(weeksOfferList, setWeeksOfferList, index, 'week', e.target.value)}
                  />
                </Col>
                <Col lg={5}>
                  <label className="form-label">Offer</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.offer}
                    onChange={(e) => handleChange(weeksOfferList, setWeeksOfferList, index, 'offer', e.target.value)}
                  />
                </Col>
                <Col lg={2}>
                  {weeksOfferList.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => handleRemove(weeksOfferList, setWeeksOfferList, index)}>
                      Remove
                    </button>
                  )}
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Pricing Details</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label htmlFor="product-price" className="form-label">
                  Price
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon icon="bx:dollar" />
                  </span>
                  <input type="number" id="product-price" className="form-control" {...register('price')} />
                </div>
              </Col>
              <Col lg={6}>
                <label htmlFor="product-discount" className="form-label">
                  Del Price
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text fs-20">
                    <IconifyIcon icon="bxs:discount" />
                  </span>
                  <input type="number" id="product-discount" className="form-control" {...register('delPrice')} />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Submit */}
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button type="submit" disabled={submitting} className="btn btn-outline-secondary w-100">
                {submitting ? 'Updating...' : 'Update Meal Plan'}
              </button>
            </Col>
            <Col lg={2}>
              <Link href="#" className="btn btn-primary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </Col>
  )
}

export default EditMealPlan
