'use client'
import React, { useState, useEffect } from 'react'
import RoleList, { RoleData } from '@/components/role-management/RoleList'
import { useGetAllRolesQuery } from '@/services/roleApi'
import { useRoleApi } from '@/hooks/useRoleApi'
import { useRouter } from 'next/navigation'

const RoleManagementPage: React.FC = () => {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  
  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page when searching
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [search])
  
  // API hooks
  const { data, isLoading, error, refetch } = useGetAllRolesQuery({
    page,
    limit: 10,
    search: debouncedSearch || undefined, // Send undefined instead of empty string
    role: roleFilter || undefined // Send undefined instead of empty string
  })

  // Debug logging
  console.log('RoleManagementPage - Search State:', { search, debouncedSearch })
  console.log('RoleManagementPage - API Query Params:', {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined
  })
  console.log('RoleManagementPage - API Response:', data)
  console.log('RoleManagementPage - API Error:', error)
  
  const { deleteRole, isDeleting } = useRoleApi()

  // Transform API data to match RoleList component expectations
  const roles: RoleData[] = data?.data?.roles?.map(role => ({
    id: role._id,
    staffName: role.name,
    role: role.role,
    email: role.email,
    password: '********', // Don't show actual password
    phone: role.phone,
    menuAccess: role.menuAccess || {}, // Provide default empty object if undefined
    createdAt: new Date(role.createdAt),
    updatedAt: new Date(role.updatedAt)
  })) || []

  // Debug the transformed roles
  console.log('RoleManagementPage - Transformed roles:', roles)

  const handleDelete = async (id: string) => {
    try {
      const roleToDelete = roles.find(role => role.id === id)
      if (roleToDelete) {
        await deleteRole(id, roleToDelete.staffName)
        refetch() // Refresh the list after deletion
      }
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/role-management-v2/edit-role/${id}`)
  }

  const handleAddRole = () => {
    router.push('/role-management-v2/add-role')
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <h5 className="text-danger">Error loading roles</h5>
          <p>Please try again later.</p>
          <button className="btn btn-outline-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <RoleList 
      roles={roles} 
      onDelete={handleDelete}
      onEdit={handleEdit}
      onAddRole={handleAddRole}
      isLoading={isDeleting}
      // Pass pagination data if needed
      pagination={{
        currentPage: page,
        totalPages: data?.data.totalPages || 1,
        totalItems: data?.data.total || 0,
        onPageChange: setPage
      }}
      // Pass search and filter data
      search={{
        value: search,
        onChange: setSearch
      }}
      filter={{
        value: roleFilter,
        onChange: setRoleFilter
      }}
    />
  )
}

export default RoleManagementPage
