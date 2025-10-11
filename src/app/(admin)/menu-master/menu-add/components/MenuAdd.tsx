'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useMemo, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import Select from 'react-select'
import { useGetMenuCategoriesQuery } from '@/services/menuCategoryApi'
import { useGetBrandsQuery } from '@/services/brandApi'
import { useGetBranchesQuery } from '@/services/branchApi'
import { uploadSingle } from '@/services/upload'
import { useCreateMenuMutation } from '@/services/menuApi'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

/** HELPER FUNCTION TO CALCULATE VAT **/
const calculateVatTotal = (price: string, vatPercent: string = '5'): number => {
  const basePrice = parseFloat(price) || 0
  const vat = parseFloat(vatPercent) || 5
  return basePrice + (basePrice * vat / 100)
}

/** FORM DATA TYPE **/
type FormData = {
  title: string
  status: string
  description: string
  NutritionFacts: string

  // ✅ changed from single string to multiple selections
  orderTypes: string[]
  dineinPrice?: string
  takeawayPrice?: string
  aggregatorPrice?: string
  // VAT fields for each price type (3 main categories)
  restaurantVat?: string
  onlineVat?: string
  membershipVat?: string
  // Total price after VAT (separate fields for backend)
  restaurantTotalPrice?: string
  onlineTotalPrice?: string
  membershipTotalPrice?: string
  // optional nutrition fields (UI only for now)
  calories?: string
  protein?: string
  carbs?: string
  fibre?: string
  sugars?: string
  sodium?: string
  iron?: string
  calcium?: string
  vitaminC?: string
}

/** PROP TYPE FOR CHILD COMPONENTS **/
type ControlType = {
  control: Control<FormData>
  register: ReturnType<typeof useForm<FormData>>['register']
  categories: any[]
  selectedCategory: string
  onCategoryChange: (val: string) => void
  brands: any[]
  selectedBrands: any[]
  setSelectedBrands: (arr: any[]) => void
  branches: any[]
  selectedBranches: any[]
  setSelectedBranches: (arr: any[]) => void
  onFileChange: (f: File | null) => void
  watch: any
}

/** VALIDATION SCHEMA **/
const messageSchema: yup.ObjectSchema<any> = yup.object({
  title: yup.string().required('Please enter title'),
  status: yup.string().required('Please select a status'),
  description: yup.string().required('Please enter description'),
  NutritionFacts: yup.string().optional(),

  // ✅ at least one order type must be selected
  orderTypes: yup.array().of(yup.string()).min(1, 'Please select at least one order type'),

  // ✅ require price only if type is selected
  dineinPrice: yup.string().when('orderTypes', {
    is: (val: string[]) => val?.includes('dinein'),
    then: (schema) => schema.required('Please enter Restaurant price'),
    otherwise: (schema) => schema.notRequired(),
  }),
  takeawayPrice: yup.string().when('orderTypes', {
    is: (val: string[]) => val?.includes('takeaway'),
    then: (schema) => schema.required('Please enter Online price'),
    otherwise: (schema) => schema.notRequired(),
  }),
  aggregatorPrice: yup.string().when('orderTypes', {
    is: (val: string[]) => val?.includes('aggregator'),
    then: (schema) => schema.required('Please enter Membership price'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

/** GENERAL INFORMATION CARD **/
const GeneralInformationCard: React.FC<ControlType> = ({ control, register, categories, selectedCategory, onCategoryChange, brands, selectedBrands, setSelectedBrands, branches, selectedBranches, setSelectedBranches, onFileChange, watch }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}> Menu Add</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="title" label="Item Name" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <label className="form-label">Item Image</label>
              <input className="form-control" type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
            </div>
          </Col>
          {/* Category */}
          <Col lg={4}>
            <label className="form-label"> Category</label>
            <div className="mb-3">
              <select className="form-control form-select" value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </Col>

          {/* Brands multiselect */}
          <Col lg={4}>
            <label className="form-label">Brands</label>
            <div className="mb-3">
              <Select
                isMulti
                options={brands.map((b: any) => ({ value: b._id, label: b.name }))}
                value={selectedBrands}
                onChange={(brands) => setSelectedBrands(brands as any[])}
                placeholder="Select Brands"
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
          </Col>

          {/* Branch  checkbox */}
          <Col lg={4}>
            <label className="form-label">Restaurant Branch</label>
            <div className="">
              <Select
                isMulti
                options={branches.map((br: any) => ({ value: br._id, label: br.name }))}
                value={selectedBranches}
                onChange={(brands) => setSelectedBranches(brands as any[])}
                placeholder="Select Branches"
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
          </Col>

          {/* ✅ Price with checkboxes */}
          <Col lg={4}>
            <label className="form-label">Price</label>
            <Controller
              control={control}
              name="orderTypes"
              render={({ field, fieldState }) => {
                const handleChange = (value: string) => {
                  let newValue = [...(field.value || [])]
                  if (newValue.includes(value)) {
                    newValue = newValue.filter((v) => v !== value)
                  } else {
                    newValue.push(value)
                  }
                  field.onChange(newValue)
                }

                return (
                  <>
                    <div className="d-flex gap-4 align-items-center mb-3">
                      {/* DineIn */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="dineIn"
                          checked={field.value?.includes('dinein')}
                          onChange={() => handleChange('dinein')}
                        />
                        <label className="form-check-label" htmlFor="dineIn">
                          Restaurant
                        </label>
                      </div>

                      {/* Takeaway */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="takeaway"
                          checked={field.value?.includes('takeaway')}
                          onChange={() => handleChange('takeaway')}
                        />
                        <label className="form-check-label" htmlFor="takeaway">
                          Online
                        </label>
                      </div>

                      {/* Aggregators */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="aggregator"
                          checked={field.value?.includes('aggregator')}
                          onChange={() => handleChange('aggregator')}
                        />
                        <label className="form-check-label" htmlFor="aggregator">
                          Membership
                        </label>
                      </div>
                    </div>

                    {/* Conditional price inputs with VAT */}
                    {field.value?.includes('dinein') && (
                      <div className="mb-3">
                        <label className="form-label">Restaurant Price</label>
                        <div className="row">
                          <div className="col-md-4">
                            <label className="form-label small">Base Price</label>
                            <input type="number" className="form-control" placeholder="Enter base price" {...register('dineinPrice')} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small">VAT %</label>
                            <input type="number" className="form-control" placeholder="5" defaultValue="5" {...register('restaurantVat')} />
                          </div>
                          <div className="col-md-5">
                            <label className="form-label small">Total After VAT</label>
                            <input type="number" className="form-control bg-light" placeholder="Total" readOnly 
                              value={calculateVatTotal(watch('dineinPrice') || '0', watch('restaurantVat') || '5')} 
                              {...register('restaurantTotalPrice')} />
                          </div>
                        </div>
                      </div>
                    )}
                    {field.value?.includes('takeaway') && (
                      <div className="mb-3">
                        <label className="form-label">Online Price</label>
                        <div className="row">
                          <div className="col-md-4">
                            <label className="form-label small">Base Price</label>
                            <input type="number" className="form-control" placeholder="Enter base price" {...register('takeawayPrice')} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small">VAT %</label>
                            <input type="number" className="form-control" placeholder="5" defaultValue="5" {...register('onlineVat')} />
                          </div>
                          <div className="col-md-5">
                            <label className="form-label small">Total After VAT</label>
                            <input type="number" className="form-control bg-light" placeholder="Total" readOnly 
                              value={calculateVatTotal(watch('takeawayPrice') || '0', watch('onlineVat') || '5')} 
                              {...register('onlineTotalPrice')} />
                          </div>
                        </div>
                      </div>
                    )}
                    {field.value?.includes('aggregator') && (
                      <div className="mb-3">
                        <label className="form-label">Membership Price</label>
                        <div className="row">
                          <div className="col-md-4">
                            <label className="form-label small">Base Price</label>
                            <input type="number" className="form-control" placeholder="Enter base price" {...register('aggregatorPrice')} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small">VAT %</label>
                            <input type="number" className="form-control" placeholder="5" defaultValue="5" {...register('membershipVat')} />
                          </div>
                          <div className="col-md-5">
                            <label className="form-label small">Total After VAT</label>
                            <input type="number" className="form-control bg-light" placeholder="Total" readOnly 
                              value={calculateVatTotal(watch('aggregatorPrice') || '0', watch('membershipVat') || '5')} 
                              {...register('membershipTotalPrice')} />
                          </div>
                        </div>
                      </div>
                    )}

                    {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                  </>
                )
              }}
            />
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="calories" label="calories (kcal)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="protein" label="Protein (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="carbs" label="Carbs (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="fibre" label="Fibre (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="sugars" label="sugars (g)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="sodium" label="sodium (mg)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="iron" label="iron (mg)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="calcium" label="calcium (mg)" />
            </div>
          </Col>

          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="vitaminC" label="vitaminC (mg)" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput rows={4} control={control} type="text" name="description" label="Description" placeholder="Type description" />
            </div>
          </Col>

          {/* STATUS FIELD */}
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
        </Row>
      </CardBody>
    </Card>
  )
}

/** MAIN COMPONENT **/
const MenuAdd: React.FC = () => {
  const { reset, handleSubmit, control, register, watch } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active', orderTypes: [] },
  })
  const router = useRouter()
  const { data: categories = [] } = useGetMenuCategoriesQuery()
  const { data: brands = [] } = useGetBrandsQuery()
  const { data: branches = [] } = useGetBranchesQuery()
  const [createMenu, { isLoading }] = useCreateMenuMutation()

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrands, setSelectedBrands] = useState<any[]>([])
  const [selectedBranches, setSelectedBranches] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)

  const onSubmit = async (data: FormData) => {
    try {
      let image: string | undefined
      if (file) {
        image = await uploadSingle(file)
      }

      const payload: any = {
        title: data.title,
        description: data.description,
        image,
        status: data.status as any,
        category: selectedCategory || undefined,
        brands: selectedBrands.map((x) => x.value),
        branches: selectedBranches.map((x) => x.value),
      }

      // Send original prices, total prices, and VAT percentages to backend
      if (data.orderTypes?.includes('dinein')) {
        const basePrice = parseFloat(String(data.dineinPrice)) || 0
        const vatPercent = parseFloat(String(data.restaurantVat)) || 5
        const totalPrice = basePrice + (basePrice * vatPercent / 100)
        payload.restaurantPrice = basePrice
        payload.restaurantTotalPrice = totalPrice
        payload.restaurantVat = vatPercent
      }
      if (data.orderTypes?.includes('takeaway')) {
        const basePrice = parseFloat(String(data.takeawayPrice)) || 0
        const vatPercent = parseFloat(String(data.onlineVat)) || 5
        const totalPrice = basePrice + (basePrice * vatPercent / 100)
        payload.onlinePrice = basePrice
        payload.onlineTotalPrice = totalPrice
        payload.onlineVat = vatPercent
      }
      if (data.orderTypes?.includes('aggregator')) {
        const basePrice = parseFloat(String(data.aggregatorPrice)) || 0
        const vatPercent = parseFloat(String(data.membershipVat)) || 5
        const totalPrice = basePrice + (basePrice * vatPercent / 100)
        payload.membershipPrice = basePrice
        payload.membershipTotalPrice = totalPrice
        payload.membershipVat = vatPercent
      }

      // nutrition fields
      if (data.calories) payload.calories = parseFloat(String(data.calories))
      if (data.protein) payload.protein = parseFloat(String(data.protein))
      if (data.carbs) payload.carbs = parseFloat(String(data.carbs))
      if (data.fibre) payload.fibre = parseFloat(String(data.fibre))
      if (data.sugars) payload.sugars = parseFloat(String(data.sugars))
      if (data.sodium) payload.sodium = parseFloat(String(data.sodium))
      if (data.iron) payload.iron = parseFloat(String(data.iron))
      if (data.calcium) payload.calcium = parseFloat(String(data.calcium))
      if (data.vitaminC) payload.vitaminC = parseFloat(String(data.vitaminC))

      await createMenu(payload).unwrap()
      toast.success('Menu created successfully')
      router.push('/menu-master/restaurant-menu')
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to create menu')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralInformationCard 
        control={control} 
        register={register}
        watch={watch}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        brands={brands}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        branches={branches}
        selectedBranches={selectedBranches}
        setSelectedBranches={setSelectedBranches}
        onFileChange={setFile}
      />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
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

export default MenuAdd
