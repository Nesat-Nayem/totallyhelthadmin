'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import EditRole from '@/components/role-management/EditRole'
import { useGetRoleByIdQuery } from '@/services/roleApi'
import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'

const EditRolePage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string
  
  console.log('Edit page - Role ID from params:', roleId)
  
  // API hooks - moved before conditional returns
  const { data, isLoading, error } = useGetRoleByIdQuery(roleId || '')
  
  // Validate roleId
  if (!roleId) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <h5 className="text-danger">Invalid Role ID</h5>
          <p>No role ID provided in the URL.</p>
          <button className="btn btn-outline-primary" onClick={() => router.push('/role-management-v2')}>
            Back to List
          </button>
        </div>
      </div>
    )
  }
  
  console.log('Edit page - API state:', { data, isLoading, error, roleId })
  console.log('Edit page - API call made for roleId:', roleId)
  console.log('Edit page - Raw API response:', data)
  console.log('Edit page - API data structure:', data?.data)
  console.log('Edit page - API error:', error)
  console.log('Edit page - API loading state:', isLoading)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading role data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Error loading role:', error)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <h5 className="text-danger">Error loading role</h5>
          <p>Please try again later.</p>
          <p className="text-muted small">Error: {JSON.stringify(error)}</p>
          <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data?.data) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <h5 className="text-warning">Role not found</h5>
          <p>The role you&apos;re looking for doesn&apos;t exist.</p>
          <button className="btn btn-outline-primary" onClick={() => router.push('/role-management-v2')}>
            Back to List
          </button>
        </div>
      </div>
    )
  }

  // Don't render form until we have complete data
  if (!data?.data?.name || !data?.data?.email) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading role data...</span>
          </Spinner>
          <p className="mt-2">Loading role data...</p>
          <p className="text-muted small">Waiting for API response...</p>
          <p className="text-muted small">Role ID: {roleId}</p>
          <p className="text-muted small">API Data: {JSON.stringify(data?.data)}</p>
        </div>
      </div>
    )
  }

  const role = data.data

  // Map backend role format to internal format
  // Backend returns "super admin" but form uses "superadmin"
  const mapRoleFromBackend = (roleValue: string): string => {
    if (roleValue === 'super admin') {
      return 'superadmin'
    }
    return roleValue
  }

  // Transform API data to form format
  const initialData = {
    staffName: role.name,
    email: role.email,
    phone: role.phone,
    role: mapRoleFromBackend(role.role),
    password: '', // Don't pre-fill password for security
    menuAccess: role.menuAccess || {}
  }
  
  console.log('Edit page - Role data from API:', role)
  console.log('Edit page - Initial data for form:', initialData)
  console.log('Edit page - Role name:', role.name)
  console.log('Edit page - Role email:', role.email)
  console.log('Edit page - Role phone:', role.phone)
  console.log('Edit page - Role role:', role.role)
  console.log('Edit page - About to render form with data:', {
    staffName: initialData.staffName,
    email: initialData.email,
    role: initialData.role,
    phone: initialData.phone
  })

  return (
    <EditRole
      key={`${roleId}-${role._id}`} // Force re-render when roleId or role data changes
      initialData={initialData}
      roleId={roleId}
      onSuccess={() => router.push('/role-management-v2')}
    />
  )
}

export default EditRolePage
