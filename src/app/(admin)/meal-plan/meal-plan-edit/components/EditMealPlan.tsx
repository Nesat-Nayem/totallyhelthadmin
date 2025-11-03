'use client'

import React, { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Link from 'next/link'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Modal } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import { useGetMealPlanByIdQuery, mealPlanApi } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'
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

interface EditMealPlanProps {
  id: string
}

const EditMealPlan = ({ id }: EditMealPlanProps) => {
  const { register, handleSubmit, formState: { isSubmitting }, setValue } = useForm<MealPlanFormData>()
  const router = useRouter()

  const { data: mealPlan, isLoading, error, refetch } = useGetMealPlanByIdQuery(id)

  const [kcalList, setKcalList] = useState<SingleValue[]>([{ value: '' }])
  const [deliveredList, setDeliveredList] = useState<SingleValue[]>([{ value: '' }])
  const [suitableList, setSuitableList] = useState<SingleValue[]>([{ value: '' }])
  const [daysPerWeekList, setDaysPerWeekList] = useState<WeekOffer[]>([{ week: '', offer: '' }])
  const [weeksOfferList, setWeeksOfferList] = useState<WeekOffer[]>([{ week: '', offer: '' }])
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [weeks, setWeeks] = useState<WeekMealPlan[]>([])
  const [showWeeksModal, setShowWeeksModal] = useState(false)
  const [activeWeekIndex, setActiveWeekIndex] = useState<number | null>(null)

  const weekDays: DayOfWeek[] = ['saturday','sunday','monday','tuesday','wednesday','thursday','friday']
  const emptyMeals = (): MealTypeMeals => ({ breakfast: ['', '', ''], lunch: ['', '', ''], snacks: ['', '', ''], dinner: ['', '', ''] })

  // Force refetch when component mounts or id changes to get latest data from server
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        await refetch()
      } catch (error) {
        console.error('Error refetching meal plan data:', error)
      }
    }
    fetchLatestData()
  }, [id, refetch])

  // Load existing data when mealPlan is available
  useEffect(() => {
    if (mealPlan) {
      setValue('title', mealPlan.title)
      setValue('description', mealPlan.description)
      setValue('badge', mealPlan.badge || '')
      setValue('discount', mealPlan.discount || '')
      setValue('price', mealPlan.price)
      setValue('delPrice', mealPlan.delPrice || 0)
      setCategory(mealPlan.category || '')
      setBrand(mealPlan.brand || '')
      setStatus(mealPlan.status || 'active')
      
      // Load dynamic lists from backend data
      if (mealPlan.kcalList && mealPlan.kcalList.length > 0) {
        setKcalList(mealPlan.kcalList.map(item => ({ value: item })))
      }
      if (mealPlan.deliveredList && mealPlan.deliveredList.length > 0) {
        setDeliveredList(mealPlan.deliveredList.map(item => ({ value: item })))
      }
      if (mealPlan.suitableList && mealPlan.suitableList.length > 0) {
        setSuitableList(mealPlan.suitableList.map(item => ({ value: item })))
      }
      if (mealPlan.daysPerWeek && mealPlan.daysPerWeek.length > 0) {
        setDaysPerWeekList(mealPlan.daysPerWeek.map(item => ({ week: item, offer: '' })))
      }
      if (mealPlan.weeksOffers && mealPlan.weeksOffers.length > 0) {
        setWeeksOfferList(mealPlan.weeksOffers)
      }
      
      // Load existing images
      if (mealPlan.images && mealPlan.images.length > 0) {
        setExistingImages(mealPlan.images)
      } else if (mealPlan.thumbnail) {
        setExistingImages([mealPlan.thumbnail])
      }
      
      // Load existing weeks data - IMPORTANT: Load ALL weeks from API
      if (mealPlan.weeks && Array.isArray(mealPlan.weeks) && mealPlan.weeks.length > 0) {
        // Ensure weeks with repeatFromWeek have days data populated from source
        // Create deep mutable copies to avoid read-only property errors
        const processedWeeks = mealPlan.weeks.map((week, idx) => {
          try {
            // Create a deep copy of the week - preserve all weeks including those with repeatFromWeek
            let processedWeek = {
              week: week.week || (idx + 1),
              repeatFromWeek: week.repeatFromWeek,
              days: week.days && week.days.length > 0 ? week.days.map(day => ({
                day: day.day,
                meals: {
                  breakfast: Array.isArray(day.meals?.breakfast) ? [...day.meals.breakfast] : ['', '', ''],
                  lunch: Array.isArray(day.meals?.lunch) ? [...day.meals.lunch] : ['', '', ''],
                  snacks: Array.isArray(day.meals?.snacks) ? [...day.meals.snacks] : ['', '', ''],
                  dinner: Array.isArray(day.meals?.dinner) ? [...day.meals.dinner] : ['', '', '']
                }
              })) : undefined
            }
            
            // If week has repeatFromWeek but no days (or empty days), copy from source
            if (processedWeek.repeatFromWeek && (!processedWeek.days || processedWeek.days.length === 0)) {
              // Find source week
              const sourceWeek = mealPlan.weeks?.find(w => w.week === processedWeek.repeatFromWeek)
              if (sourceWeek?.days) {
                // Copy days from source week with deep copy
                processedWeek = {
                  ...processedWeek,
                  days: sourceWeek.days.map(day => ({
                    day: day.day,
                    meals: {
                      breakfast: Array.isArray(day.meals?.breakfast) ? [...day.meals.breakfast] : ['', '', ''],
                      lunch: Array.isArray(day.meals?.lunch) ? [...day.meals.lunch] : ['', '', ''],
                      snacks: Array.isArray(day.meals?.snacks) ? [...day.meals.snacks] : ['', '', ''],
                      dinner: Array.isArray(day.meals?.dinner) ? [...day.meals.dinner] : ['', '', '']
                    }
                  }))
                }
              }
            }
            
            // Ensure all weeks have days array initialized (only if missing)
            if (!processedWeek.days || processedWeek.days.length === 0) {
              processedWeek = {
                ...processedWeek,
                days: weekDays.map(d => ({ day: d, meals: emptyMeals() }))
              }
            }
            
            return processedWeek
          } catch (error) {
            // Return a fallback week if processing fails - but still include it!
            return {
              week: week.week || (idx + 1),
              repeatFromWeek: week.repeatFromWeek,
              days: weekDays.map(d => ({ day: d, meals: emptyMeals() }))
            }
          }
        })
        
        // IMPORTANT: Set ALL processed weeks, don't filter anything
        setWeeks(processedWeeks)
      } else {
        // Reset weeks if no weeks data in mealPlan
        setWeeks([])
      }
    }
  }, [mealPlan, setValue])

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

  // Weeks management functions
  const addWeek = () => {
    // Week numbers should always be sequential: 1, 2, 3, 4, 5...
    const nextWeekNum = weeks.length > 0 ? Math.max(...weeks.map(w => w.week)) + 1 : 1
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
    if (index < 0 || index >= weeks.length) return
    
    // Store the week being removed for reference
    const removedWeek = weeks[index]
    
    // Create a map of old week numbers to new positions before removal
    const weekNumberMap = new Map<number, number>()
    weeks.forEach((week, i) => {
      if (i !== index) {
        // Calculate new position: if i < index, position stays same, else decreases by 1
        const newPosition = i < index ? i : i - 1
        weekNumberMap.set(week.week, newPosition + 1) // +1 because week numbers start at 1
      }
    })
    
    const copy = [...weeks]
    copy.splice(index, 1)
    
    // Renumber weeks sequentially: 1, 2, 3, 4...
    const renumberedWeeks = copy.map((week, idx) => {
      const newWeekNumber = idx + 1
      
      // Update repeatFromWeek if it exists
      let updatedRepeatFromWeek: number | undefined = undefined
      if (week.repeatFromWeek) {
        // If repeating from the removed week, clear it
        if (week.repeatFromWeek === removedWeek.week) {
          updatedRepeatFromWeek = undefined
        } else {
          // Find the new week number for the source week
          const newSourceWeekNumber = weekNumberMap.get(week.repeatFromWeek)
          if (newSourceWeekNumber !== undefined) {
            updatedRepeatFromWeek = newSourceWeekNumber
          }
        }
      }
      
      return {
        ...week,
        week: newWeekNumber,
        repeatFromWeek: updatedRepeatFromWeek
      }
    })
    
    setWeeks(renumberedWeeks)
    
    // Close modal if removing the currently active week
    if (activeWeekIndex === index) {
      setActiveWeekIndex(null)
      setShowWeeksModal(false)
    } else if (activeWeekIndex !== null && activeWeekIndex > index) {
      // Adjust active index if the removed week was before the active one
      setActiveWeekIndex(activeWeekIndex - 1)
    }
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
    // Create a deep copy of weeks to avoid read-only property errors
    const copy = weeks.map(week => ({
      ...week,
      days: week.days ? week.days.map(d => ({
        ...d,
        meals: {
          breakfast: [...(d.meals.breakfast || [])],
          lunch: [...(d.meals.lunch || [])],
          snacks: [...(d.meals.snacks || [])],
          dinner: [...(d.meals.dinner || [])]
        }
      })) : undefined
    }))
    
    if (!copy[wIdx]) return
    
    // Ensure days array exists
    if (!copy[wIdx].days) {
      copy[wIdx].days = weekDays.map(d => ({ day: d, meals: emptyMeals() }))
    }
    
    // Find or create the day
    let dayIdx = copy[wIdx].days!.findIndex(d => d.day === day)
    if (dayIdx === -1) {
      // Day doesn't exist, create it
      copy[wIdx].days!.push({ day, meals: emptyMeals() })
      dayIdx = copy[wIdx].days!.length - 1
    }
    
    // Ensure meal type array exists and has enough items - create new array to avoid read-only
    const currentMeals = copy[wIdx].days![dayIdx].meals[mealType] || []
    let items = Array.isArray(currentMeals) ? [...currentMeals] : []
    
    // Ensure array has enough items
    while (items.length <= itemIdx) {
      items.push('')
    }
    
    // Update the item
    items[itemIdx] = value
    
    // Create new day object with updated meals
    copy[wIdx].days![dayIdx] = {
      ...copy[wIdx].days![dayIdx],
      meals: {
        ...copy[wIdx].days![dayIdx].meals,
        [mealType]: items
      }
    }
    
    // When editing, remove repeatFromWeek to allow independent editing
    if (copy[wIdx].repeatFromWeek) {
      copy[wIdx].repeatFromWeek = undefined
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

  // Custom update function using fetch API
  const updateMealPlanCustom = async (formData: FormData) => {
    const token = localStorage.getItem('backend_token')
    
    const response = await fetch(`${API_BASE_URL}/meal-plans/${id}`, {
      method: 'PUT',
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

  const onSubmit: SubmitHandler<MealPlanFormData> = async (formData) => {
    try {
      const formDataObj = new FormData()
      
      // Add basic fields
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      if (formData.badge) formDataObj.append('badge', formData.badge)
      if (formData.discount) formDataObj.append('discount', formData.discount)
      formDataObj.append('price', formData.price.toString())
      if (formData.delPrice) formDataObj.append('delPrice', formData.delPrice.toString())
      formDataObj.append('category', category)
      formDataObj.append('brand', brand)
      formDataObj.append('status', status)
      
      // Add dynamic arrays
      const filteredKcalList = kcalList.filter(item => item.value.trim() !== '').map(item => item.value)
      if (filteredKcalList.length > 0) {
        formDataObj.append('kcalList', JSON.stringify(filteredKcalList))
      }
      
      const filteredDeliveredList = deliveredList.filter(item => item.value.trim() !== '').map(item => item.value)
      if (filteredDeliveredList.length > 0) {
        formDataObj.append('deliveredList', JSON.stringify(filteredDeliveredList))
      }
      
      const filteredSuitableList = suitableList.filter(item => item.value.trim() !== '').map(item => item.value)
      if (filteredSuitableList.length > 0) {
        formDataObj.append('suitableList', JSON.stringify(filteredSuitableList))
      }
      
      const filteredDaysPerWeek = daysPerWeekList.filter(item => item.week.trim() !== '').map(item => item.week)
      if (filteredDaysPerWeek.length > 0) {
        formDataObj.append('daysPerWeek', JSON.stringify(filteredDaysPerWeek))
      }
      
      const filteredWeeksOffers = weeksOfferList.filter(item => item.week.trim() !== '' && item.offer.trim() !== '')
      if (filteredWeeksOffers.length > 0) {
        formDataObj.append('weeksOffers', JSON.stringify(filteredWeeksOffers))
      }

      // Weeks: send only if user added/edited
      if (weeks.length > 0) {
        // Clean up: trim items and keep only non-empty strings; still keep array length at 3 for UX
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
        formDataObj.append('weeks', JSON.stringify(cleanedWeeks))
      }

      // Add existing images (keep current ones)
      existingImages.forEach(image => {
        formDataObj.append('existingImages', image)
      })

      // Add new files
      selectedFiles.forEach((file, index) => {
        formDataObj.append('images', file)
      })

      await updateMealPlanCustom(formDataObj)
      
      // Invalidate cache to ensure fresh data
      mealPlanApi.util.invalidateTags([{ type: 'MealPlan', id }])
      mealPlanApi.util.invalidateTags([{ type: 'MealPlan', id: 'LIST' }])
      
      showSuccess('Meal plan updated successfully.')
      
      // Redirect to list page after successful update
      router.push('/meal-plan/meal-plan-list')
    } catch (error: any) {
      if (error?.status === 400) {
        showError('Invalid data. Please check all fields and try again.')
      } else if (error?.status === 401) {
        showError('Unauthorized. Please login again.')
      } else if (error?.status >= 500) {
        showError('Server error. Please try again later.')
      } else {
        showError(`Failed to update meal plan: ${error?.message || 'Unknown error'}`)
      }
    }
  }

  if (isLoading) {
    return (
      <Col xl={12}>
        <Card>
          <CardBody className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </CardBody>
        </Card>
      </Col>
    )
  }

  if (error || !mealPlan) {
    return (
      <Col xl={12}>
        <Card>
          <CardBody className="text-center py-5">
            <p className="text-danger">Error loading meal plan. Please try again.</p>
            <Link href="/meal-plan/meal-plan-list" className="btn btn-primary">
              Back to List
            </Link>
          </CardBody>
        </Card>
      </Col>
    )
  }

  return (
    <Col xl={12}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Meal Plan Photos</CardTitle>
          </CardHeader>
          <CardBody>
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Current Images</label>
                <div className="d-flex flex-wrap gap-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="position-relative">
                      <Image 
                        src={image} 
                        alt={`Existing image ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded border"
                        style={{ objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        onClick={() => {
                          const newImages = existingImages.filter((_, i) => i !== index)
                          setExistingImages(newImages)
                        }}
                        style={{ transform: 'translate(50%, -50%)' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Image Upload */}
            <div className="dropzone dropzone-custom py-5">
              <div className="dz-message">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files)
                      setSelectedFiles(prev => [...prev, ...files])
                    }
                  }}
                  style={{ display: 'none' }}
                  id="file-upload-edit"
                />
                <label htmlFor="file-upload-edit" style={{ cursor: 'pointer', display: 'block' }}>
                  <IconifyIcon icon="bx:cloud-upload" height={48} width={48} className="mb-4 text-primary" />
                  <h3>Add more images or click to browse</h3>
                  <span className="text-muted fs-13">(1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are allowed)</span>
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
            <CardTitle as="h4">Edit Meal Plan</CardTitle>
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
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select 
                    id="status" 
                    className="form-control form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
              <div key={`weeks-count-${weeks.length}`}>
                <div className="mb-2"><strong>{weeks.length}</strong> week(s) configured.</div>
                <div className="row g-2">
                  {weeks.map((w, i) => (
                    <div key={`week-${w.week}-${i}`} className="col-auto">
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
                    <button type="button" className="btn btn-outline-danger" onClick={() => { 
                      if (activeWeekIndex !== null) {
                        removeWeek(activeWeekIndex)
                      }
                    }}>Remove</button>
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
                                    value={(() => {
                                      const week = weeks[activeWeekIndex]
                                      if (!week) return ''
                                      
                                      // If repeating from another week, get from source
                                      if (week.repeatFromWeek) {
                                        const sourceWeek = weeks.find(w => w.week === week.repeatFromWeek)
                                        if (sourceWeek?.days) {
                                          const sourceDay = sourceWeek.days.find(dd => dd.day === d)
                                          if (sourceDay?.meals?.[mt]?.[idx]) {
                                            return sourceDay.meals[mt][idx]
                                          }
                                        }
                                      }
                                      
                                      // Otherwise get from current week
                                      const day = week.days?.find(dd => dd.day === d)
                                      return day?.meals?.[mt]?.[idx] || ''
                                    })()}
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

        {/* Submit */}
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Meal Plan'}
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

export default EditMealPlan
