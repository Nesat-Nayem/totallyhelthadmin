'use client'

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Link from 'next/link'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { mealPlanApi } from '@/services/mealPlanApi'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/utils/env'

/** FORM TYPES **/
type MealPlanFormData = {
  title: string
  description: string
  badge?: string
  discount?: string
  price: number
  delPrice?: number
}

type SingleValue = { value: string }
type WeekOffer = { week: string; offer: string }

const AddMealPlan = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<MealPlanFormData>()
  const router = useRouter()

  const [kcalList, setKcalList] = useState<SingleValue[]>([{ value: '' }])
  const [deliveredList, setDeliveredList] = useState<SingleValue[]>([{ value: '' }])
  const [suitableList, setSuitableList] = useState<SingleValue[]>([{ value: '' }])
  const [daysPerWeekList, setDaysPerWeekList] = useState<WeekOffer[]>([{ week: '', offer: '' }])
  const [weeksOfferList, setWeeksOfferList] = useState<WeekOffer[]>([{ week: '', offer: '' }])
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)

  // Helper function to compress image
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    const maxSize = 2 * 1024 * 1024 // 2MB limit
    const maxFiles = 5 // Maximum 5 files
    
    // Check file count
    if (selectedFiles.length + fileArray.length > maxFiles) {
      showError(`Maximum ${maxFiles} files allowed.`)
      return
    }
    
    setIsProcessingFiles(true)
    
    try {
      const processedFiles: File[] = []
      
      for (const file of fileArray) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          showError(`${file.name} is not an image file.`)
          continue
        }
        
        if (file.size > maxSize) {
          // Compress large files
          const compressedFile = await compressImage(file)
          processedFiles.push(compressedFile)
        } else {
          processedFiles.push(file)
        }
      }
      
      setSelectedFiles(prev => [...prev, ...processedFiles])
    } catch (error) {
      showError('Error processing images. Please try smaller files.')
    } finally {
      setIsProcessingFiles(false)
    }
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

  // Confirmation function for retry without images
  const showConfirmRetry = async () => {
    const result = await Swal.fire({
      title: 'File Upload Failed',
      text: 'The images are too large. Would you like to create the meal plan without images? You can add images later by editing.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create without images',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    })
    return result.isConfirmed
  }

  // Custom upload function using fetch API
  const uploadMealPlan = async (formData: FormData) => {
    const token = localStorage.getItem('backend_token')
    
    const response = await fetch(`${API_BASE_URL}/meal-plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        status: response.status,
        data: errorData,
        message: errorData.message || `HTTP ${response.status}`
      }
    }

    return await response.json()
  }

  const onSubmit: SubmitHandler<MealPlanFormData> = async (data) => {
    try {
      const formData = new FormData()
      
      // Add basic fields
      formData.append('title', data.title)
      formData.append('description', data.description)
      if (data.badge) formData.append('badge', data.badge)
      if (data.discount) formData.append('discount', data.discount)
      formData.append('price', data.price.toString())
      if (data.delPrice) formData.append('delPrice', data.delPrice.toString())
      formData.append('category', category)
      formData.append('brand', brand)
      formData.append('status', status)
      
      // Add dynamic arrays
      const filteredKcalList = kcalList.filter(item => item.value.trim() !== '').map(item => item.value)
      if (filteredKcalList.length > 0) {
        formData.append('kcalList', JSON.stringify(filteredKcalList))
      }
      
      const filteredDeliveredList = deliveredList.filter(item => item.value.trim() !== '').map(item => item.value)
      if (filteredDeliveredList.length > 0) {
        formData.append('deliveredList', JSON.stringify(filteredDeliveredList))
      }
      
      const filteredSuitableList = suitableList.filter(item => item.value.trim() !== '').map(item => item.value)
      if (filteredSuitableList.length > 0) {
        formData.append('suitableList', JSON.stringify(filteredSuitableList))
      }
      
      const filteredDaysPerWeek = daysPerWeekList.filter(item => item.week.trim() !== '').map(item => item.week)
      if (filteredDaysPerWeek.length > 0) {
        formData.append('daysPerWeek', JSON.stringify(filteredDaysPerWeek))
      }
      
      const filteredWeeksOffers = weeksOfferList.filter(item => item.week.trim() !== '' && item.offer.trim() !== '')
      if (filteredWeeksOffers.length > 0) {
        formData.append('weeksOffers', JSON.stringify(filteredWeeksOffers))
      }

      // Add files to FormData
      selectedFiles.forEach((file, index) => {
        formData.append('images', file)
      })


      const result = await uploadMealPlan(formData)
      
      // Invalidate cache to ensure fresh data
      mealPlanApi.util.invalidateTags([{ type: 'MealPlan', id: 'LIST' }])
      
      showSuccess('Meal plan created successfully.')
      router.push('/meal-plan/meal-plan-list')
    } catch (error: any) {
      
      if (error?.status === 413) {
        // Try without images as fallback
        if (selectedFiles.length > 0) {
          const confirmRetry = await showConfirmRetry()
          if (confirmRetry) {
            try {
              // Remove images and try again
              const formDataWithoutImages = new FormData()
              formDataWithoutImages.append('title', data.title)
              formDataWithoutImages.append('description', data.description)
              if (data.badge) formDataWithoutImages.append('badge', data.badge)
              if (data.discount) formDataWithoutImages.append('discount', data.discount)
              formDataWithoutImages.append('price', data.price.toString())
              if (data.delPrice) formDataWithoutImages.append('delPrice', data.delPrice.toString())
              formDataWithoutImages.append('category', category)
              formDataWithoutImages.append('brand', brand)
              formDataWithoutImages.append('status', status)
              
              // Add dynamic arrays without images
              const filteredKcalList = kcalList.filter(item => item.value.trim() !== '').map(item => item.value)
              if (filteredKcalList.length > 0) {
                formDataWithoutImages.append('kcalList', JSON.stringify(filteredKcalList))
              }
              
              const filteredDeliveredList = deliveredList.filter(item => item.value.trim() !== '').map(item => item.value)
              if (filteredDeliveredList.length > 0) {
                formDataWithoutImages.append('deliveredList', JSON.stringify(filteredDeliveredList))
              }
              
              const filteredSuitableList = suitableList.filter(item => item.value.trim() !== '').map(item => item.value)
              if (filteredSuitableList.length > 0) {
                formDataWithoutImages.append('suitableList', JSON.stringify(filteredSuitableList))
              }
              
              const filteredDaysPerWeek = daysPerWeekList.filter(item => item.week.trim() !== '').map(item => item.week)
              if (filteredDaysPerWeek.length > 0) {
                formDataWithoutImages.append('daysPerWeek', JSON.stringify(filteredDaysPerWeek))
              }
              
              const filteredWeeksOffers = weeksOfferList.filter(item => item.week.trim() !== '' && item.offer.trim() !== '')
              if (filteredWeeksOffers.length > 0) {
                formDataWithoutImages.append('weeksOffers', JSON.stringify(filteredWeeksOffers))
              }

              const result = await uploadMealPlan(formDataWithoutImages)
              
              // Invalidate cache to ensure fresh data
              mealPlanApi.util.invalidateTags([{ type: 'MealPlan', id: 'LIST' }])
              
              showSuccess('Meal plan created successfully (without images). You can add images later by editing.')
              router.push('/meal-plan/meal-plan-list')
              return
            } catch (retryError) {
              // Retry failed silently
            }
          }
        }
        showError('File size too large. Please compress your images or use smaller files.')
      } else if (error?.status === 400) {
        showError('Invalid data. Please check all fields and try again.')
      } else if (error?.status === 401) {
        showError('Unauthorized. Please login again.')
      } else if (error?.status >= 500) {
        showError('Server error. Please try again later.')
      } else {
        showError(`Failed to create meal plan: ${error?.message || 'Unknown error'}`)
      }
    }
  }

  return (
    <Col xl={12}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Meal Plan Photos</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="dropzone dropzone-custom py-5">
              <div className="dz-message">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{ cursor: isProcessingFiles ? 'not-allowed' : 'pointer', display: 'block' }}>
                  {isProcessingFiles ? (
                    <>
                      <div className="spinner-border text-primary mb-4" role="status">
                        <span className="visually-hidden">Processing...</span>
                      </div>
                      <h3>Processing images...</h3>
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="bx:cloud-upload" height={48} width={48} className="mb-4 text-primary" />
                      <h3>Drop your images here, or click to browse</h3>
                      <span className="text-muted fs-13">(1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are allowed)</span>
                      <br />
                      <span className="text-warning fs-12">Maximum 5 files, 2MB each. Large files will be automatically compressed.</span>
                    </>
                  )}
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="dz-preview mt-3">
                  {selectedFiles.map((file, idx) => (
                    <Card className="mt-1 mb-0 shadow-none border" key={idx}>
                      <div className="p-2">
                        <Row className="align-items-center">
                          <Col className="col-auto">
                            <img 
                              className="avatar-sm rounded bg-light" 
                              alt={file.name} 
                              src={URL.createObjectURL(file)} 
                            />
                          </Col>
                          <Col className="ps-0">
                            <Link href="" className="text-muted fw-bold">
                              {file.name}
                            </Link>
                            <p className="mb-0">
                              <strong>{(file.size / 1024).toFixed(2)} KB</strong>
                              {file.size > 1024 * 1024 && (
                                <span className="text-warning ms-2">(Large file - will be compressed)</span>
                              )}
                            </p>
                          </Col>
                          <Col className="text-end">
                            <button 
                              type="button"
                              className="btn btn-lg btn-primary"
                              onClick={() => {
                                setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
                              }}
                            >
                              Delete
                            </button>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Add Meal Plan</CardTitle>
          </CardHeader>
          <CardBody>
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
                    Select Meal Plan Category
                  </label>
                  <select 
                    id="menuCategory" 
                    className="form-control form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Healthy Diet">Healthy Diet</option>
                    <option value="Healthy Lifestyle">Healthy Lifestyle</option>
                    <option value="Healthy Eating">Healthy Eating</option>
                  </select>
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <label htmlFor="brands" className="form-label">
                    Select Brands
                  </label>
                  <select 
                    id="brands" 
                    className="form-control form-select"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  >
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

        {/* status */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Status</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="flexSwitchCheckDefault" 
                checked={status === 'active'}
                onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
              />
              <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
                Active
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Submit */}
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Meal Plan'}
              </button>
            </Col>
            <Col lg={2}>
              <Link href="/meal-plan/meal-plan-list" className="btn btn-outline-secondary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </Col>
  )
}

export default AddMealPlan
