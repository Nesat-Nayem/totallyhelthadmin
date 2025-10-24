'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import RoleForm, { RoleFormData } from '@/components/role-management/RoleForm'
// import { toast } from 'react-toastify'

const AddRolePage: React.FC = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: RoleFormData) => {
    setIsLoading(true)
    
    try {
      // Replace with actual API call
      console.log('Creating role:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // toast.success('Role created successfully!')
      console.log('Role created successfully!')
      router.push('/role-management-v2')
    } catch (error) {
      console.error('Error creating role:', error)
      // toast.error('Failed to create role. Please try again.')
      console.error('Failed to create role. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RoleForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode="create"
    />
  )
}

export default AddRolePage
