'use client'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useGetIncludedMealByIdQuery, includedMealsApi } from '@/services/includedMealsApi'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'

type FormData = {
  meal_type: string
  title: string
  file?: FileList
  calories: string
  fat_g: string
  carbs_g: string
  protein_g: string
  allergens?: string
  status: string
  order?: string
}

type ControlType = {
  control: Control<FormData>
}

const messageSchema: yup.ObjectSchema<FormData> = yup.object({
  meal_type: yup.string().required('Please select meal type'),
  title: yup.string().required('Please enter title'),
  file: yup.mixed<FileList>().optional(),
  calories: yup.string().required('Please enter calories'),
  fat_g: yup.string().required('Please enter fat (g)'),
  carbs_g: yup.string().required('Please enter carbs (g)'),
  protein_g: yup.string().required('Please enter protein (g)'),
  allergens: yup.string().optional(),
  status: yup.string().required('Please select a status'),
  order: yup.string().optional(),
})

const GeneralInformationCard: React.FC<ControlType & { existingImage?: string }> = ({ control, existingImage }) => {
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.png'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    return imagePath
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>General Information</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Meal Type</label>
              <Controller
                control={control}
                name="meal_type"
                rules={{ required: 'Please select meal type' }}
                render={({ field, fieldState }) => (
                  <>
                    <select
                      {...field}
                      className={`form-select ${fieldState.error ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Meal Type</option>
                      <option value="BREAKFAST">Breakfast</option>
                      <option value="LUNCH">Lunch</option>
                      <option value="DINNER">Dinner</option>
                      <option value="SNACKS">Snacks</option>
                    </select>
                    {fieldState.error && (
                      <div className="invalid-feedback">{fieldState.error.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="title" label="Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <Controller
                control={control}
                name="file"
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                  <div>
                    <label className="form-label">Meal Image</label>
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
                    {fieldState.error && (
                      <div className="invalid-feedback">{fieldState.error.message}</div>
                    )}
                    {existingImage && (
                      <div className="mt-2">
                        <small className="text-muted">Current image:</small>
                        <div className="mt-1">
                          <Image 
                            src={getImageUrl(existingImage)} 
                            alt="Current meal" 
                            width={100}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </Col>
          <Col lg={6}>
            <label className="form-label">Status</label>
            <Controller
              control={control}
              name="status"
              rules={{ required: 'Please select a status' }}
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
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput 
                control={control} 
                type="number" 
                name="order" 
                label="Order" 
                placeholder="Enter order (optional)"
              />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const NutritionCard: React.FC<ControlType> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Nutrition Information</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput 
                control={control} 
                type="number" 
                step="0.1"
                name="calories" 
                label="Calories" 
                placeholder="Enter calories"
              />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput 
                control={control} 
                type="number" 
                step="0.1"
                name="fat_g" 
                label="Fat (g)" 
                placeholder="Enter fat in grams"
              />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput 
                control={control} 
                type="number" 
                step="0.1"
                name="carbs_g" 
                label="Carbs (g)" 
                placeholder="Enter carbs in grams"
              />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput 
                control={control} 
                type="number" 
                step="0.1"
                name="protein_g" 
                label="Protein (g)" 
                placeholder="Enter protein in grams"
              />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput 
                control={control} 
                name="allergens" 
                label="Allergens (comma-separated)" 
                placeholder="Enter allergens separated by commas, e.g., Dairy, Eggs, Nuts"
                rows={3}
              />
              <small className="text-muted">Separate multiple allergens with commas</small>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

interface IncludedMealsEditProps {
  id: string
}

const IncludedMealsEdit: React.FC<IncludedMealsEditProps> = ({ id }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { data: meal, isLoading: isLoadingMeal, error } = useGetIncludedMealByIdQuery(id)
  
  const { handleSubmit, control, formState: { isSubmitting }, setValue } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active', order: '0' },
  })

  useEffect(() => {
    if (meal) {
      setValue('meal_type', meal.meal_type)
      setValue('title', meal.title)
      setValue('calories', meal.nutrition.calories.toString())
      setValue('fat_g', meal.nutrition.fat_g.toString())
      setValue('carbs_g', meal.nutrition.carbs_g.toString())
      setValue('protein_g', meal.nutrition.protein_g.toString())
      setValue('allergens', meal.allergens?.join(', ') || '')
      setValue('status', meal.status)
      setValue('order', meal.order?.toString() || '0')
    }
  }, [meal, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      const formDataObj = new FormData()
      
      const meal_type = String(data.meal_type || '').trim()
      const title = String(data.title || '').trim()
      const calories = parseFloat(String(data.calories || '0'))
      const fat_g = parseFloat(String(data.fat_g || '0'))
      const carbs_g = parseFloat(String(data.carbs_g || '0'))
      const protein_g = parseFloat(String(data.protein_g || '0'))
      const allergens = String(data.allergens ?? '').trim()
      const status = String(data.status || 'active').trim()
      const order = String(data.order ?? '0').trim()
      
      if (!meal_type) {
        showError('Please select a meal type')
        return
      }
      if (!title) {
        showError('Please enter a title')
        return
      }
      if (isNaN(calories) || calories < 0) {
        showError('Please enter valid calories')
        return
      }
      if (isNaN(fat_g) || fat_g < 0) {
        showError('Please enter valid fat amount')
        return
      }
      if (isNaN(carbs_g) || carbs_g < 0) {
        showError('Please enter valid carbs amount')
        return
      }
      if (isNaN(protein_g) || protein_g < 0) {
        showError('Please enter valid protein amount')
        return
      }
      
      const nutrition = {
        calories,
        fat_g,
        carbs_g,
        protein_g,
      }
      
      let allergensArray: string[] = []
      if (allergens) {
        allergensArray = allergens.split(',').map(a => a.trim()).filter(Boolean)
      }
      
      formDataObj.append('meal_type', meal_type)
      formDataObj.append('title', title)
      formDataObj.append('nutrition', JSON.stringify(nutrition))
      formDataObj.append('allergens', JSON.stringify(allergensArray))
      formDataObj.append('status', status)
      formDataObj.append('order', order)
      
      if (data.file && data.file.length > 0 && data.file[0] instanceof File) {
        formDataObj.append('file', data.file[0], data.file[0].name)
      }
      
      const token = getAuthToken()
      if (!token) {
        showError('Authentication token not found. Please login again.')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/included/${id}`, {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`)
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to update included meal')
      }
      
      dispatch(includedMealsApi.util.invalidateTags([{ type: 'IncludedMeal', id }, { type: 'IncludedMeal', id: 'LIST' }]))
      
      showSuccess('Included meal updated successfully')
      router.push('/pages/included-meals')
    } catch (error: any) {
      showError(error?.message || error?.data?.message || 'Failed to update included meal')
    }
  }

  if (isLoadingMeal) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading meal data...</p>
        </div>
      </div>
    )
  }

  if (error || !meal) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <h5 className="text-danger">Error Loading Meal</h5>
          <p>Meal not found or failed to load.</p>
          <Link href="/pages/included-meals" className="btn btn-outline-primary">
            Back to List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard 
        control={control} 
        existingImage={meal.image_url}
      />
      <NutritionCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Change'}
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/pages/included-meals" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default IncludedMealsEdit

