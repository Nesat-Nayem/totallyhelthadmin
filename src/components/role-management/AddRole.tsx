'use client'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'
import MenuAccessCheckbox, { MenuAccess } from './MenuAccessCheckbox'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { useCreateRoleMutation } from '@/services/roleApi'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

export interface AddRoleFormData {
  staffName: string
  role: string
  email: string
  password: string
  phone: string
  menuAccess: MenuAccess
}

interface AddRoleProps {
  onSuccess?: () => void
}

// Validation schema for add role
const addRoleSchema = yup.object({
  staffName: yup.string().required('Please enter staff name'),
  role: yup.string().required('Please select a role'),
  email: yup.string().email('Please enter a valid email').required('Please enter email'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Please enter password'),
  phone: yup.string().required('Please enter phone number'),
})

const AddRole: React.FC<AddRoleProps> = ({
  onSuccess
}) => {
  const router = useRouter()
  const [menuAccess, setMenuAccess] = useState<MenuAccess>({})
  
  // Fixed roles as per backend enum
  const availableRoles = ['superadmin', 'admin', 'manager', 'supervisor', 'cashier', 'waiter', 'staff']
  
  // API mutation
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(addRoleSchema),
    defaultValues: {
      staffName: '',
      role: '',
      email: '',
      password: '',
      phone: ''
    }
  })

  const handleMenuAccessChange = (access: MenuAccess) => {
    setMenuAccess(access)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      
      const createData = {
        name: data.staffName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        password: data.password,
        menuAccess: menuAccess
      }
      
      
      const result = await createRole(createData).unwrap()
      
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Role created successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      })
      
      // Call success callback or navigate back
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/role-management-v2')
      }
    } catch (error: any) {
      console.error('AddRole - Error creating role:', error)
      
      let errorMessage = 'Failed to create role'
      
      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }

  const handleReset = () => {
    // Reset form fields
    reset()
    setMenuAccess({})
  }

  const handleCancel = () => {
    router.push('/role-management-v2')
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <Card>
            <CardHeader>
              <CardTitle as="h4" className="mb-0">
                Add New Role
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit(handleFormSubmit)}>
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name="staffName" 
                        label="Staff Name" 
                        placeholder="Enter staff name"
                      />
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <select 
                            {...field} 
                            className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                          >
                            <option value="">Select Role</option>
                            {availableRoles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.role && (
                        <div className="invalid-feedback">
                          {errors.role.message}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        type="email" 
                        name="email" 
                        label="Email" 
                        placeholder="Enter email address"
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <PasswordFormInput 
                        control={control} 
                        name="password" 
                        label="Password" 
                        placeholder="Enter password"
                      />
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        type="tel" 
                        name="phone" 
                        label="Phone" 
                        placeholder="Enter phone number"
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <div className="mb-3">
                      <MenuAccessCheckbox
                        selectedAccess={menuAccess}
                        onAccessChange={handleMenuAccessChange}
                        disabled={isCreating}
                      />
                    </div>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>

          <div className="p-3 bg-light mb-3 rounded">
            <div className="d-flex gap-2 justify-content-end">
              <Button 
                variant="outline-secondary" 
                onClick={handleReset}
                disabled={isCreating}
              >
                Reset
              </Button>
              <Button 
                variant="outline-dark" 
                onClick={handleCancel}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddRole
