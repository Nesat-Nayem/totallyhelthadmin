'use client'
import React, { useState, useEffect } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'
import MenuAccessCheckbox, { MenuAccess } from './MenuAccessCheckbox'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { useCreateRoleMutation } from '@/services/roleApi'
import { RoleFormData } from '@/types/role'
import Swal from 'sweetalert2'

export interface LocalRoleFormData {
  staffName: string
  role: string
  email: string
  password: string
  phone: string
  menuAccess: MenuAccess
}

interface RoleFormProps {
  initialData?: Partial<LocalRoleFormData>
  onSubmit?: (data: RoleFormData) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

const createRoleSchema = yup.object({
  staffName: yup.string().required('Please enter staff name'),
  role: yup.string().required('Please select or enter a role'),
  email: yup.string().email('Please enter a valid email').required('Please enter email'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Please enter password'),
  phone: yup.string().required('Please enter phone number'),
})

const editRoleSchema = yup.object({
  staffName: yup.string().required('Please enter staff name'),
  role: yup.string().required('Please select or enter a role'),
  email: yup.string().email('Please enter a valid email').required('Please enter email'),
  phone: yup.string().required('Please enter phone number'),
})

const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  mode = 'create'
}) => {
  const [menuAccess, setMenuAccess] = useState<MenuAccess>(initialData?.menuAccess || {})
  
  // Fixed roles as per backend enum - no dynamic creation
  const availableRoles = ['Super Admin', 'Admin', 'Manager', 'Supervisor', 'Cashier', 'Waiter', 'Staff']
  
  // API mutation
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(mode === 'edit' ? editRoleSchema : createRoleSchema),
    defaultValues: mode === 'edit' ? {
      staffName: '',
      role: '',
      email: '',
      phone: ''
    } : {
      staffName: '',
      role: '',
      email: '',
      password: '',
      phone: ''
    }
  })
  
  // Watch form values for debugging
  const formValues = watch()
  console.log('RoleForm - Current form values:', formValues)
  console.log('RoleForm - Initial data received:', initialData)
  console.log('RoleForm - Mode:', mode)
  console.log('RoleForm - Has initialData:', !!initialData)
  console.log('RoleForm - InitialData keys:', initialData ? Object.keys(initialData) : 'No initialData')
  console.log('RoleForm - InitialData values:', initialData ? {
    staffName: initialData.staffName,
    email: initialData.email,
    role: initialData.role,
    phone: initialData.phone
  } : 'No initialData')

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      console.log('RoleForm - Updating form with initialData:', initialData)
      console.log('RoleForm - Current form values before reset:', {
        staffName: initialData.staffName,
        role: initialData.role,
        email: initialData.email,
        phone: initialData.phone
      })
      
      // Always reset if we have initialData in edit mode
      if (initialData.staffName || initialData.email) {
        console.log('RoleForm - Resetting form with data:', {
          staffName: initialData.staffName,
          role: initialData.role,
          email: initialData.email,
          phone: initialData.phone
        })
        
        // Force reset with new data
        if (mode === 'edit') {
          reset({
            staffName: initialData.staffName || '',
            role: initialData.role || '',
            email: initialData.email || '',
            phone: initialData.phone || ''
          }, {
            keepDefaultValues: false // Force update
          })
        } else {
          reset({
            staffName: initialData.staffName || '',
            role: initialData.role || '',
            email: initialData.email || '',
            password: initialData.password || '',
            phone: initialData.phone || ''
          }, {
            keepDefaultValues: false // Force update
          })
        }
        
        // Also set individual values to ensure they're updated
        setValue('staffName', initialData.staffName || '')
        setValue('role', initialData.role || '')
        setValue('email', initialData.email || '')
        setValue('phone', initialData.phone || '')
        
        setMenuAccess(initialData.menuAccess || {})
        console.log('RoleForm - Form reset completed with data')
      } else {
        console.log('RoleForm - Skipping reset - no valid data yet')
        console.log('RoleForm - InitialData check:', {
          hasStaffName: !!initialData.staffName,
          hasEmail: !!initialData.email,
          staffName: initialData.staffName,
          email: initialData.email
        })
      }
    }
  }, [initialData, mode, reset])

  // Watch for form value changes
  useEffect(() => {
    if (mode === 'edit') {
      console.log('RoleForm - Form values changed:', formValues)
    }
  }, [formValues, mode])

  const handleFormSubmit = async (data: any) => {
    try {
      if (mode === 'edit') {
        // For edit mode, call the onSubmit callback directly
        if (onSubmit) {
          const formData: RoleFormData = {
            staffName: data.staffName,
            email: data.email,
            phone: data.phone,
            role: data.role as 'Super Admin' | 'Admin' | 'Manager' | 'Supervisor' | 'Cashier' | 'Waiter' | 'Staff',
            menuAccess: menuAccess
          }
          console.log('RoleForm edit mode - calling onSubmit with:', formData)
          onSubmit(formData)
        }
      } else {
        // For create mode, use the API
        const apiPayload = {
          name: data.staffName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: data.role as 'Super Admin' | 'Admin' | 'Manager' | 'Supervisor' | 'Cashier' | 'Waiter' | 'Staff',
          menuAccess: menuAccess
        }
        
        // Log the form data to console
        console.log('Form submitted with data:', apiPayload)
        
        // Call the API
        const result = await createRole(apiPayload).unwrap()
        
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: result.message || 'Role created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        })
        
        // Call the onSubmit callback if provided
        if (onSubmit) {
          const formData: RoleFormData = {
            staffName: result.data.name,
            email: result.data.email,
            password: '', // Don't pass password back
            phone: result.data.phone,
            role: result.data.role as 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Staff',
            menuAccess: result.data.menuAccess
          }
          onSubmit(formData)
        }
      }
      
    } catch (error: any) {
      console.error('Error submitting form:', error)
      console.error('Error structure:', {
        error,
        data: error?.data,
        response: error?.response,
        message: error?.message
      })
      
      // Extract error message from different possible error structures
      let errorMessage = `Failed to ${mode === 'edit' ? 'update' : 'create'} role`
      
      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Show error message
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }

  const handleMenuAccessChange = (access: MenuAccess) => {
    setMenuAccess(access)
  }

  const handleReset = () => {
    // Reset form fields
    reset()
    // Reset menu access to initial data or empty
    setMenuAccess(initialData?.menuAccess || {})
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">
            {mode === 'create' ? 'Add New Role' : 'Edit Role'}
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  type="text" 
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
                      className={`form-control form-select ${errors.role ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Role</option>
                      {availableRoles.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.role && (
                  <div className="invalid-feedback">{errors.role.message}</div>
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

            {mode === 'create' && (
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
            )}

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
                  disabled={isLoading || isCreating}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button 
              variant="outline-secondary" 
              type="button" 
              className="w-100"
              onClick={handleReset}
              disabled={isLoading || isCreating}
            >
              Reset
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="/role-management-v2" className="btn btn-secondary w-100">
              Cancel
            </Link>
          </Col>
          <Col lg={2}>
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={isLoading || isCreating}
            >
              {isLoading || isCreating ? 'Saving...' : 'Save'}
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default RoleForm
