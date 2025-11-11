'use client'
import React, { useState, useEffect } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'
import MenuAccessCheckbox, { MenuAccess } from './MenuAccessCheckbox'
import TextFormInput from '@/components/form/TextFormInput'
import { useRoleApi } from '@/hooks/useRoleApi'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

export interface EditRoleFormData {
  staffName: string
  role: string
  email: string
  phone: string
  menuAccess: MenuAccess
}

interface EditRoleProps {
  initialData: EditRoleFormData
  roleId: string
  onSuccess?: () => void
}

// Validation schema for edit role
const editRoleSchema = yup.object({
  staffName: yup.string().required('Please enter staff name'),
  role: yup.string().required('Please select a role'),
  email: yup.string().email('Please enter a valid email').required('Please enter email'),
  phone: yup.string().required('Please enter phone number'),
})

const EditRole: React.FC<EditRoleProps> = ({
  initialData,
  roleId,
  onSuccess
}) => {
  const router = useRouter()
  const [menuAccess, setMenuAccess] = useState<MenuAccess>(initialData?.menuAccess || {})
  
  // Fixed roles as per backend enum
  // Backend expects "super admin" (two words), but we use "superadmin" internally for consistency
  const availableRoles = ['superadmin', 'admin', 'manager', 'supervisor', 'cashier', 'waiter', 'staff']
  
  // Map internal role values to backend expected values
  const mapRoleToBackend = (role: string): string => {
    if (role === 'superadmin') {
      return 'super admin'
    }
    return role
  }
  
  // Map backend role values to internal values
  const mapRoleFromBackend = (role: string): string => {
    if (role === 'super admin') {
      return 'superadmin'
    }
    return role
  }
  
  // API hooks
  const { updateRole, isUpdating } = useRoleApi()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(editRoleSchema),
    defaultValues: {
      staffName: '',
      role: '',
      email: '',
      phone: ''
    }
  })
  
  // Watch form values for debugging
  const formValues = watch()

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      
      // Always reset if we have initialData
      if (initialData.staffName || initialData.email) {
        
        // Force reset with new data
        reset({
          staffName: initialData.staffName || '',
          role: mapRoleFromBackend(initialData.role || ''),
          email: initialData.email || '',
          phone: initialData.phone || ''
        }, {
          keepDefaultValues: false // Force update
        })
        
        // Also set individual values to ensure they're updated
        setValue('staffName', initialData.staffName || '')
        setValue('role', mapRoleFromBackend(initialData.role || ''))
        setValue('email', initialData.email || '')
        setValue('phone', initialData.phone || '')
        
        setMenuAccess(initialData.menuAccess || {})
      }
    }
  }, [initialData, reset, setValue])

  // Watch for form value changes
  useEffect(() => {
  }, [formValues])

  const handleMenuAccessChange = (access: MenuAccess) => {
    setMenuAccess(access)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      
      // Map role to backend format (superadmin -> super admin)
      const updateData: any = {
        name: data.staffName,
        email: data.email,
        phone: data.phone,
        role: mapRoleToBackend(data.role),
        menuAccess: menuAccess
      }
      
      
      await updateRole(roleId, updateData)
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Role updated successfully',
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
      console.error('EditRole - Error updating role:', error)
      
      let errorMessage = 'Failed to update role'
      
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
                Edit Role
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
                                {role === 'superadmin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
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
                        disabled={isUpdating}
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
                disabled={isUpdating}
              >
                Reset
              </Button>
              <Button 
                variant="outline-dark" 
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditRole
