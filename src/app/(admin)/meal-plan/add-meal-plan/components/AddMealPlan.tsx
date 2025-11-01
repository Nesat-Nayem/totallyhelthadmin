'use client'

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Link from 'next/link'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Modal } from 'react-bootstrap'
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

type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
type MealTypeMeals = { breakfast: string[]; lunch: string[]; snacks: string[]; dinner: string[] }
type WeekDayPlan = { day: DayOfWeek; meals: MealTypeMeals }
type WeekMealPlan = { week: number; days?: WeekDayPlan[]; repeatFromWeek?: number }

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
  const [weeks, setWeeks] = useState<WeekMealPlan[]>([])
  const [showWeeksModal, setShowWeeksModal] = useState(false)
  const [activeWeekIndex, setActiveWeekIndex] = useState<number | null>(null)

  const weekDays: DayOfWeek[] = ['saturday','sunday','monday','tuesday','wednesday','thursday','friday']
  const emptyMeals = (): MealTypeMeals => ({ breakfast: ['', '', ''], lunch: ['', '', ''], snacks: ['', '', ''], dinner: ['', '', ''] })

  const addWeek = () => {
    // Week numbers should always be sequential: 1, 2, 3, 4, 5...
    const nextWeekNum = weeks.length + 1
    const newWeeks = [...weeks, { week: nextWeekNum, days: weekDays.map(d => ({ day: d, meals: emptyMeals() })) }]
    setWeeks(newWeeks)
    setActiveWeekIndex(newWeeks.length - 1)
    setShowWeeksModal(true)
  }
  const openWeek = (index: number) => {
    setActiveWeekIndex(index)
    setShowWeeksModal(true)
  }

  const removeWeek = (index: number) => {
    const copy = [...weeks]
    copy.splice(index, 1)
    // Re-number weeks sequentially after removal
    const renumberedWeeks = copy.map((week, idx) => ({ ...week, week: idx + 1 }))
    setWeeks(renumberedWeeks)
  }

  const setRepeatFromWeek = (index: number, repeatFromWeek?: number) => {
    const copy = [...weeks]
    if (repeatFromWeek) {
      // Find the week to repeat from
      const sourceWeek = copy.find(w => w.week === repeatFromWeek)
      if (sourceWeek && sourceWeek.days) {
        // Copy the exact meal data from the source week
        const copiedDays = sourceWeek.days.map(day => ({
          day: day.day,
          meals: {
            breakfast: [...day.meals.breakfast],
            lunch: [...day.meals.lunch],
            snacks: [...day.meals.snacks],
            dinner: [...day.meals.dinner]
          }
        }))
        
        copy[index] = { 
          week: copy[index].week, 
          repeatFromWeek, 
          days: copiedDays
        }
      } else {
        // Fallback if source week not found
        copy[index] = { 
          week: copy[index].week, 
          repeatFromWeek, 
          days: weekDays.map(d => ({ day: d, meals: emptyMeals() }))
        }
      }
    } else {
      // When not repeating, ensure days data exists
      copy[index] = { 
        week: copy[index].week, 
        repeatFromWeek: undefined, 
        days: copy[index].days || weekDays.map(d => ({ day: d, meals: emptyMeals() })) 
      }
    }
    setWeeks(copy)
  }

  const updateMealItem = (wIdx: number, day: DayOfWeek, mealType: keyof MealTypeMeals, itemIdx: number, value: string) => {
    const copy = [...weeks]
    if (!copy[wIdx].days) return
    const dayIdx = copy[wIdx].days!.findIndex(d => d.day === day)
    if (dayIdx === -1) return
    const items = [...copy[wIdx].days![dayIdx].meals[mealType]]
    items[itemIdx] = value
    copy[wIdx].days![dayIdx] = {
      ...copy[wIdx].days![dayIdx],
      meals: { ...copy[wIdx].days![dayIdx].meals, [mealType]: items }
    }
    setWeeks(copy)
  }

  const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const sampleItems = {
    breakfast: ['Oats', 'Pancakes', 'Eggs', 'Smoothie', 'Paratha', 'Idli', 'Poha'],
    lunch: ['Chicken Bowl', 'Paneer Wrap', 'Rice & Dal', 'Quinoa Salad', 'Pasta', 'Grilled Fish'],
    snacks: ['Nuts Mix', 'Fruit Cup', 'Yogurt', 'Protein Bar', 'Hummus'],
    dinner: ['Grilled Chicken', 'Veg Curry', 'Soup Bowl', 'Stir Fry', 'Biryani']
  }

  const prefillWeekRandom = (wIdx: number) => {
    const copy = [...weeks]
    if (!copy[wIdx]) return
    copy[wIdx].repeatFromWeek = undefined
    copy[wIdx].days = weekDays.map((d) => ({
      day: d,
      meals: {
        breakfast: [0,1,2].map(i => `${randomFrom(sampleItems.breakfast)} ${i + 1}`),
        lunch: [0,1,2].map(i => `${randomFrom(sampleItems.lunch)} ${i + 1}`),
        snacks: [0,1,2].map(i => `${randomFrom(sampleItems.snacks)} ${i + 1}`),
        dinner: [0,1,2].map(i => `${randomFrom(sampleItems.dinner)} ${i + 1}`),
      }
    }))
    setWeeks(copy)
  }

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

      // Weeks: send only if user added
      if (weeks.length > 0) {
        // basic cleanup: trim items and keep only non-empty strings; still keep array length at 3 for UX
        const cleanedWeeks = weeks.map(w => ({
          week: w.week,
          repeatFromWeek: w.repeatFromWeek || undefined,
          days: (w.days || []).map(d => ({
            day: d.day,
            meals: {
              breakfast: d.meals.breakfast.map(s => s.trim()),
              lunch: d.meals.lunch.map(s => s.trim()),
              snacks: d.meals.snacks.map(s => s.trim()),
              dinner: d.meals.dinner.map(s => s.trim()),
            }
          }))
        }))
        formData.append('weeks', JSON.stringify(cleanedWeeks))
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

              if (weeks.length > 0) {
                const cleanedWeeks = weeks.map(w => ({
                  week: w.week,
                  repeatFromWeek: w.repeatFromWeek || undefined,
                  days: w.repeatFromWeek ? undefined : (w.days || []).map(d => ({
                    day: d.day,
                    meals: {
                      breakfast: d.meals.breakfast.map(s => s.trim()),
                      lunch: d.meals.lunch.map(s => s.trim()),
                      snacks: d.meals.snacks.map(s => s.trim()),
                      dinner: d.meals.dinner.map(s => s.trim()),
                    }
                  }))
                }))
                formDataWithoutImages.append('weeks', JSON.stringify(cleanedWeeks))
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

        {/* Weeks (Modal trigger + summary) */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">Weeks</CardTitle>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addWeek}>
                + Add Week
              </button>
            </div>
          </CardHeader>
          <CardBody>
            {weeks.length === 0 ? (
              <div className="text-muted">No weeks configured yet.</div>
            ) : (
              <div>
                <div className="mb-2"><strong>{weeks.length}</strong> week(s) configured.</div>
                <div className="row g-2">
                  {weeks.map((w, i) => (
                    <div key={i} className="col-auto">
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openWeek(i)}>
                        Week {w.week}{w.repeatFromWeek ? ` (repeat ${w.repeatFromWeek})` : ''}{w.repeatFromWeek ? ' 🔄' : ''}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Modal show={showWeeksModal} onHide={() => setShowWeeksModal(false)} size="xl" centered scrollable>
          <Modal.Header closeButton>
            <div className="d-flex align-items-center w-100">
              <Modal.Title className="me-auto">
                {activeWeekIndex !== null ? `Configure Week ${weeks[activeWeekIndex]?.week ?? ''}` : 'Configure Week'}
              </Modal.Title>
              {activeWeekIndex !== null && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => prefillWeekRandom(activeWeekIndex!)}>
                  Prefill Random
                </button>
              )}
            </div>
          </Modal.Header>
          <Modal.Body>
            {activeWeekIndex === null || !weeks[activeWeekIndex] ? (
              <div className="alert alert-info">Select a week to configure.</div>
            ) : (
              <div className="border rounded p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Week {weeks[activeWeekIndex].week}</h5>
                  <div className="d-flex gap-2">
                    <select
                      className="form-control"
                      style={{ width: 160 }}
                      value={weeks[activeWeekIndex].repeatFromWeek || ''}
                      onChange={(e) => setRepeatFromWeek(activeWeekIndex, e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">Repeat from week</option>
                      {weeks
                        .filter((_, idx) => idx < activeWeekIndex) // Only show previous weeks
                        .map((w) => (
                          <option key={w.week} value={w.week}>
                            Week {w.week}
                          </option>
                        ))}
                    </select>
                    <button type="button" className="btn btn-outline-danger" onClick={() => { removeWeek(activeWeekIndex); setActiveWeekIndex(null); setShowWeeksModal(false) }}>Remove</button>
                  </div>
                </div>
                {weeks[activeWeekIndex].repeatFromWeek && (
                  <div className="text-muted mb-3">
                    This week reuses meals from week {weeks[activeWeekIndex].repeatFromWeek}.
                    <span className="ms-2">🔄 Repeated data</span>
                  </div>
                )}
                <div className="row g-3">
                    {weekDays.map((d) => (
                      <div key={d} className="col-12">
                        <div className="border rounded p-2">
                          <strong className="text-uppercase">{d}</strong>
                          <div className="row g-2 mt-2">
                            {(['breakfast','lunch','snacks','dinner'] as Array<keyof MealTypeMeals>).map((mt) => (
                              <div key={mt} className="col-12 col-md-6 col-lg-3">
                                <label className="form-label text-capitalize">{mt}</label>
                                {[0,1,2].map((idx) => (
                                  <input
                                    key={idx}
                                    type="text"
                                    className="form-control mb-1"
                                    placeholder={`${mt} item ${idx + 1}`}
                                    value={(weeks[activeWeekIndex].days || []).find(dd => dd.day === d)?.meals[mt][idx] || ''}
                                    onChange={(e) => updateMealItem(activeWeekIndex, d, mt, idx, e.target.value)}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn btn-light" onClick={() => setShowWeeksModal(false)}>Close</button>
            <button type="button" className="btn btn-primary" onClick={() => setShowWeeksModal(false)}>Done</button>
          </Modal.Footer>
        </Modal>

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
                    AED
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
