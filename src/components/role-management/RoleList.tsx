'use client'
import React, { useState } from 'react'
import { 
  Button, 
  Card, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  Col, 
  FormControl, 
  InputGroup, 
  Row,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'react-bootstrap'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { MenuAccess } from './MenuAccessCheckbox'
import { POS_ROLE_MENU_ITEMS } from '@/assets/data/pos-role-menu-items'

export interface RoleData {
  id: string
  staffName: string
  role: string
  email: string
  password: string
  phone?: string
  menuAccess: MenuAccess
  createdAt: Date
  updatedAt: Date
}

interface RoleListProps {
  roles: RoleData[]
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onAddRole?: () => void
  isLoading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    onPageChange: (page: number) => void
  }
  search?: {
    value: string
    onChange: (value: string) => void
  }
  filter?: {
    value: string
    onChange: (value: string) => void
  }
}

const RoleList: React.FC<RoleListProps> = ({ 
  roles, 
  onDelete, 
  onEdit, 
  onAddRole,
  isLoading = false,
  pagination,
  search,
  filter
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<MenuAccess | null>(null)
  const [selectedRoleName, setSelectedRoleName] = useState<string>('')

  // Use external search if provided, otherwise use local state
  const searchTerm = search?.value || ''
  const setSearchTerm = search?.onChange || (() => {})
  
  // Use external filter if provided
  const roleFilter = filter?.value || ''
  const setRoleFilter = filter?.onChange || (() => {})

  // Use roles directly from API (server-side filtering) when search is provided
  // Only do client-side filtering if no external search is provided
  const filteredRoles = search ? roles : roles.filter(role =>
    role.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (id: string) => {
    setSelectedRoleId(id)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedRoleId && onDelete) {
      onDelete(selectedRoleId)
    }
    setShowDeleteModal(false)
    setSelectedRoleId(null)
  }

  const handleViewPermissions = (role: RoleData) => {
    setSelectedRolePermissions(role.menuAccess || {})
    setSelectedRoleName(`${role.staffName} (${role.role})`)
    setShowPermissionsModal(true)
  }

  const getMenuAccessBadges = (menuAccess: MenuAccess) => {
    const categories: { [key: string]: { module: string, children: string[] } } = {}
    
    // Check if menuAccess exists and is an object
    if (!menuAccess || typeof menuAccess !== 'object') {
      return []
    }
    
    Object.entries(menuAccess).forEach(([moduleKey, moduleData]) => {
      const menuItem = POS_ROLE_MENU_ITEMS.find(item => item.key === moduleKey)
      if (menuItem) {
        const categoryName = menuItem.label
        if (!categories[categoryName]) {
          categories[categoryName] = { module: '', children: [] }
        }
        
        // Check if module is checked OR if it has checked children
        const hasCheckedChildren = moduleData.children && Object.values(moduleData.children).some(isChecked => isChecked)
        
        if (moduleData.checked || hasCheckedChildren) {
          categories[categoryName].module = menuItem.label
        }
        
        if (moduleData.children) {
          Object.entries(moduleData.children).forEach(([childKey, isChecked]) => {
            if (isChecked) {
              const child = menuItem.children?.find(c => c.key === childKey)
              if (child) {
                categories[categoryName].children.push(child.label)
              }
            }
          })
        }
      }
    })
    
    if (Object.keys(categories).length === 0) {
      return <Badge bg="secondary">No access</Badge>
    }
    
    return (
      <div className="permission-list">
        {Object.entries(categories).map(([categoryName, data]) => (
          <div key={categoryName} className="permission-category mb-2">
            {data.module && (
              <div className="category-header">
                <Badge bg="success" className="category-badge">
                  {data.module}
                </Badge>
              </div>
            )}
            {data.children.length > 0 && (
              <div className="sub-categories ms-3">
                <ul className="list-unstyled mb-0">
                  {data.children.map((child, index) => (
                    <li key={index} className="sub-category-item">
                      <span className="bullet-point">•</span>
                      <span className="sub-category-text">{child}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const getAccessCount = (menuAccess: MenuAccess): number => {
    let count = 0
    
    // Check if menuAccess exists and is an object
    if (!menuAccess || typeof menuAccess !== 'object') {
      return 0
    }
    
    Object.values(menuAccess).forEach(module => {
      if (module && module.checked) count++
      if (module && module.children) {
        Object.values(module.children).forEach(child => {
          if (child) count++
        })
      }
    })
    return count
  }

  return (
    <>
      <style jsx>{`
        .permission-list {
          max-width: 300px;
          max-height: 200px;
          overflow-y: auto;
          overflow-x: hidden;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 8px;
          background-color: #f8f9fa;
        }
        .permission-compact {
          max-width: 180px;
        }
        .permission-summary {
          max-height: 120px;
          overflow-y: auto;
          overflow-x: hidden;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 6px;
          background-color: #f8f9fa;
        }
        .permission-list::-webkit-scrollbar {
          width: 6px;
        }
        .permission-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .permission-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .permission-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .permission-category {
          border-left: 3px solid #28a745;
          padding-left: 8px;
        }
        .category-header {
          margin-bottom: 4px;
        }
        .category-badge {
          font-size: 0.75rem;
          font-weight: 600;
        }
        .sub-categories {
          margin-top: 2px;
        }
        .sub-category-item {
          display: flex;
          align-items: center;
          margin-bottom: 2px;
          font-size: 0.8rem;
        }
        .bullet-point {
          color: #6c757d;
          margin-right: 6px;
          font-weight: bold;
        }
        .sub-category-text {
          color: #495057;
        }
        .permissions-modal-content {
          max-height: 400px;
          overflow-y: auto;
          padding: 10px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          background-color: #f8f9fa;
        }
        .permissions-modal-content .permission-list {
          max-width: 100%;
          max-height: none;
        }
      `}</style>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Role Management List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                  }}
                />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>
              
              {/* Role Filter */}
              {filter && (
                <select
                  className="form-select"
                  style={{ maxWidth: '150px' }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="cashier">Cashier</option>
                  <option value="waiter">Waiter</option>
                  <option value="staff">Staff</option>
                </select>
              )}

              {/* Add Role Button */}
              {onAddRole ? (
                <button 
                  onClick={onAddRole} 
                  className="btn btn-lg btn-primary"
                >
                  + Add Role
                </button>
              ) : (
                <Link href="/role-management-v2/add-role" className="btn btn-lg btn-primary">
                  + Add Role
                </Link>
              )}
            </CardHeader>

            <div>
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="selectAll" />
                          <label className="form-check-label" htmlFor="selectAll" />
                        </div>
                      </th>
                      <th style={{ textWrap: 'nowrap' }}>Staff Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Role</th>
                      <th style={{ textWrap: 'nowrap' }}>Email</th>
                      <th style={{ textWrap: 'nowrap' }}>Phone</th>
                      <th style={{ textWrap: 'nowrap' }}>Password</th>
                      <th style={{ textWrap: 'nowrap' }}>Menu Access</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => (
                        <tr key={role.id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" id={`role-${role.id}`} />
                              <label className="form-check-label" htmlFor={`role-${role.id}`} />
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{role.staffName}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <Badge bg="primary">{role.role}</Badge>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{role.email}</td>
                          <td style={{ textWrap: 'nowrap' }}>{role.phone || 'N/A'}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <code>{'*'.repeat(role.password.length)}</code>
                          </td>
                          <td style={{ minWidth: '200px', verticalAlign: 'top' }}>
                            <div className="permission-compact">
                              <div className="permission-summary">
                                {getMenuAccessBadges(role.menuAccess)}
                              </div>
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <small className="text-muted">
                                  ({getAccessCount(role.menuAccess)} permissions)
                                </small>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewPermissions(role)}
                                  className="btn-sm"
                                >
                                  View All
                                </Button>
                              </div>
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <div className="d-flex gap-2">
                              <Link 
                                href={`/role-management-v2/edit-role/${role.id}`} 
                                className="btn btn-soft-primary btn-sm"
                                title="Edit Role"
                              >
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Link>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteClick(role.id)}
                                title="Delete Role"
                              >
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <div className="text-muted">
                            <IconifyIcon icon="solar:users-group-rounded-bold-duotone" className="fs-48 mb-2" />
                            <p className="mb-0">No roles found</p>
                            <small>Create your first role to get started</small>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredRoles.length > 0 && pagination && (
              <CardFooter className="border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    Showing {filteredRoles.length} of {pagination.totalItems} roles
                  </div>
                  <nav aria-label="Page navigation example">
                    <ul className="pagination justify-content-end mb-0">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => pagination.currentPage > 1 && pagination.onPageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                        <li key={pageNum} className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => pagination.onPageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => pagination.currentPage < pagination.totalPages && pagination.onPageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </CardFooter>
            )}
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <ModalHeader closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this role? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Permissions View Modal */}
      <Modal 
        show={showPermissionsModal} 
        onHide={() => setShowPermissionsModal(false)} 
        size="lg"
        centered
      >
        <ModalHeader closeButton>
          <Modal.Title>Permissions for {selectedRoleName}</Modal.Title>
        </ModalHeader>
        <ModalBody>
          {selectedRolePermissions && (
            <div className="permissions-modal-content">
              {getMenuAccessBadges(selectedRolePermissions)}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowPermissionsModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default RoleList
