'use client'

import { useAccessControl } from '@/hooks/useAccessControl'
import { Card, CardBody, CardHeader, CardTitle, Badge, Alert } from 'react-bootstrap'

/**
 * Demo component showing how to use the access control system
 * This component can be used to test and verify the access control implementation
 */
export const AccessControlDemo: React.FC = () => {
  const { 
    userSession, 
    isAuthenticated, 
    isLoading, 
    userRole, 
    isAdmin,
    accessibleMenuItems,
    hasAccessToModule,
    hasAccessToSubModule,
    canAccess
  } = useAccessControl()

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Not Authenticated</Alert.Heading>
        <p>Please log in to view access control information.</p>
      </Alert>
    )
  }

  return (
    <div className="row">
      <div className="col-12">
        <Card>
          <CardHeader>
            <CardTitle as="h4">Access Control Demo</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="row">
              <div className="col-md-6">
                <h5>User Information</h5>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{userSession?.name}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{userSession?.email}</td>
                    </tr>
                    <tr>
                      <td><strong>Role:</strong></td>
                      <td>
                        <Badge bg={isAdmin ? 'success' : 'primary'}>
                          {userRole}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Branch ID:</strong></td>
                      <td>{userSession?.branchId}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="col-md-6">
                <h5>Accessible Modules</h5>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {accessibleMenuItems.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {accessibleMenuItems.map((item) => (
                        <li key={item.key} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.label}</strong>
                            {item.children && item.children.length > 0 && (
                              <div className="ms-3">
                                <small className="text-muted">
                                  {item.children.length} sub-module(s)
                                </small>
                              </div>
                            )}
                          </div>
                          <Badge bg="success">Access</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Alert variant="info">
                      No accessible modules found.
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="col-12">
                <h5>Module Access Tests</h5>
                <div className="row">
                  <div className="col-md-4">
                    <h6>Dashboard</h6>
                    <Badge bg={hasAccessToModule('dashboard') ? 'success' : 'danger'}>
                      {hasAccessToModule('dashboard') ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                  <div className="col-md-4">
                    <h6>Sales Module</h6>
                    <Badge bg={hasAccessToModule('sales') ? 'success' : 'danger'}>
                      {hasAccessToModule('sales') ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                  <div className="col-md-4">
                    <h6>Sales List</h6>
                    <Badge bg={hasAccessToSubModule('sales', 'sales-list') ? 'success' : 'danger'}>
                      {hasAccessToSubModule('sales', 'sales-list') ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="col-12">
                <h5>Route Access Tests</h5>
                <div className="row">
                  <div className="col-md-3">
                    <h6>/dashboard</h6>
                    <Badge bg={canAccess('/dashboard') ? 'success' : 'danger'}>
                      {canAccess('/dashboard') ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                  <div className="col-md-3">
                    <h6>/sales/sales-list</h6>
                    <Badge bg={canAccess('/sales/sales-list') ? 'success' : 'danger'}>
                      {canAccess('/sales/sales-list') ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                  <div className="col-md-3">
                    <h6>/menu-master</h6>
                    <Badge bg={canAccess('/menu-master') ? 'success' : 'danger'}>
                      {canAccess('/menu-master') ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                  <div className="col-md-3">
                    <h6>/role-management</h6>
                    <Badge bg={canAccess('/role-management') ? 'success' : 'danger'}>
                      {canAccess('/role-management') ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default AccessControlDemo
