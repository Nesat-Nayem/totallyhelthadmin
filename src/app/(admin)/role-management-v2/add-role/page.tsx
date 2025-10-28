'use client'
import React from 'react'
import AddRole from '@/components/role-management/AddRole'
import { useRouter } from 'next/navigation'

const AddRolePage: React.FC = () => {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/role-management-v2')
  }

  return (
    <AddRole onSuccess={handleSuccess} />
  )
}

export default AddRolePage
