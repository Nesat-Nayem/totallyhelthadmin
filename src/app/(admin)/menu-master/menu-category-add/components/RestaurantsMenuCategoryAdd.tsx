'use client'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateMenuCategoryMutation } from '@/services/menuCategoryApi'
import { toast } from 'react-toastify'
import TextFormInput from '@/components/form/TextFormInput'

type FormData = {
  title: string
  status: string
}

const messageSchema = yup.object({
  title: yup.string().required('Please enter category title'),
  status: yup.string().required('Please select a status'),
})

const RestaurantsMenuCategoryAdd: React.FC = () => {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: { status: 'active' },
  })
  
  const router = useRouter()
  const [createCategory, { isLoading }] = useCreateMenuCategoryMutation()

  const onSubmit = async (data: FormData) => {
    try {
      await createCategory({ 
        title: data.title, 
        status: data.status as 'active' | 'inactive' 
      }).unwrap()
      toast.success('Category created successfully')
      router.push('/menu-master/menu-category')
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to create category')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">Add Menu Category</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  type="text" 
                  name="title" 
                  label="Category Title" 
                  placeholder="Enter category title"
                />
              </div>
            </Col>
            <Col lg={6}>
              <label className="form-label">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field, fieldState }) => (
                  <>
                    <div className="d-flex gap-3 align-items-center">
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
            <Link href="/menu-master/menu-category" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default RestaurantsMenuCategoryAdd
