'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RoleForm from '@/components/role-management/RoleForm'
import { RoleFormData } from '@/types/role'
// import { toast } from 'react-toastify'

const EditRolePage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleId = searchParams.get('id')
  
  const [isLoading, setIsLoading] = useState(false)
  const [initialData, setInitialData] = useState<Partial<RoleFormData> | undefined>()

  useEffect(() => {
    if (roleId) {
      // Replace with actual API call to fetch role data
      const mockRoleData: Partial<RoleFormData> = {
        staffName: 'Suraj Jamdade',
        role: 'cashier',
        email: 'suraj@example.com',
        password: 'cashier1234',
        menuAccess: {
          'pos-module': {
            checked: true,
            children: {
              'pos-main': true,
              'settle-bill': true,
              'print-order': true,
              'pos-reports': false,
              'view-orders': true,
              'transaction-history': false,
              'split-bill': false,
              'apply-discount': true,
              'meal-plan-list': false,
              'sales-list': false,
              'calculator': true,
              'start-shift': false
            }
          },
          'paymeny-method': {
            checked: true,
            children: {
              'list-of-payment-method': true,
              'add-new-payment-method': false
            }
          },
          'expenses': {
            checked: true,
            children: {
              'add-expense': true,
              'cash-expense': true,
              'credit-expense': false
            }
          }
        }
      }
      setInitialData(mockRoleData)
    }
  }, [roleId])

  const handleSubmit = async (data: RoleFormData) => {
    setIsLoading(true)
    
    try {
      // Replace with actual API call
      console.log('Updating role:', roleId, data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // toast.success('Role updated successfully!')
      console.log('Role updated successfully!')
      router.push('/role-management-v2')
    } catch (error) {
      console.error('Error updating role:', error)
      // toast.error('Failed to update role. Please try again.')
      console.error('Failed to update role. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!roleId) {
    return (
      <div className="alert alert-danger">
        <h4>Error</h4>
        <p>No role ID provided. Please select a role to edit.</p>
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <RoleForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode="edit"
    />
  )
}

export default EditRolePage
