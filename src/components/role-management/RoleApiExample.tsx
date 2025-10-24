'use client'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Table, Badge, Spinner } from 'react-bootstrap'
import { useGetAllRolesQuery, useDeleteRoleMutation } from '@/services/roleApi'
import { useRoleApi } from '@/hooks/useRoleApi'
import Link from 'next/link'

const RoleApiExample: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  
  // Using the hook for easier API management
  const { deleteRole, isDeleting } = useRoleApi()
  
  // Direct query usage
  const { data, isLoading, error, refetch } = useGetAllRolesQuery({
    page,
    limit: 10,
    search,
    role: roleFilter
  })

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteRole(id, name)
      refetch() // Refresh the list after deletion
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>
      case 'inactive':
        return <Badge bg="danger">Inactive</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const colors: { [key: string]: string } = {
      'Super Admin': 'danger',
      'Admin': 'danger',
      'Manager': 'warning',
      'Supervisor': 'info',
      'Cashier': 'info',
      'Waiter': 'primary',
      'Staff': 'secondary'
    }
    return <Badge bg={colors[role] || 'secondary'}>{role}</Badge>
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center text-danger">
            <h5>Error loading roles</h5>
            <p>Please try again later.</p>
            <Button variant="outline-primary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4" className="d-flex justify-content-between align-items-center">
          Role Management API Example
          <Link href="/role-management-v2/add-new-role">
            <Button variant="primary" size="sm">
              Add New Role
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {/* Search and Filter Controls */}
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Cashier">Cashier</option>
              <option value="Waiter">Waiter</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="col-md-2">
            <Button variant="outline-secondary" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Roles Table */}
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.roles.map((role) => (
                <tr key={role._id}>
                  <td>{role.name}</td>
                  <td>{role.email}</td>
                  <td>{role.phone}</td>
                  <td>{getRoleBadge(role.role)}</td>
                  <td>{getStatusBadge(role.status)}</td>
                  <td>{new Date(role.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link href={`/role-management-v2/edit-role/${role._id}`}>
                        <Button variant="outline-primary" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(role._id, role.name)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pagination Info */}
        {data && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Showing {data.data.roles.length} of {data.data.total} roles
            </div>
            <div>
              Page {data.data.page} of {data.data.totalPages}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {data && data.data.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <div className="btn-group" role="group">
              <Button
                variant="outline-primary"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => setPage(Math.min(data.data.totalPages, page + 1))}
                disabled={page === data.data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default RoleApiExample
