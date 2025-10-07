'use client'
import LogoBox from '@/components/LogoBox'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React from 'react'
import { Modal, Button, Table, Badge } from 'react-bootstrap'
import { useGetBranchByIdQuery } from '@/services/branchApi'

interface ReportData {
  date: string
  time: string
  cashier: string
  logInDate: string
  logInTime: string
  logOutDate: string
  logOutTime: string
  totalInvoice: number
  totalDiscount: number
  netSales: number
  vat: number
  grandTotal: number
  sales: {
    restaurant: number
    membershipMeal: number
    membershipRegister: number
  }
  collections: {
    cash: number
    card: number
    online: number
    total: number
  }
}

interface ReportModalProps {
  show: boolean
  onClose: () => void
  data?: any
}

function fmtDate(d?: string | Date | null) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString() } catch { return '-' }
}
function fmtTime(d?: string | Date | null) {
  if (!d) return '-'
  try { return new Date(d).toLocaleTimeString() } catch { return '-' }
}

const ReportModal: React.FC<ReportModalProps> = ({ show, onClose, data }) => {
  // Fetch branch details if branchId is available
  const { data: branchData, isLoading: isLoadingBranch } = useGetBranchByIdQuery(
    data?.branchId || '', 
    { skip: !data?.branchId }
  )

  // Professional status badge function
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'day-close':
        return (
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" 
               style={{ 
                 background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                 boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                 border: '1px solid rgba(16, 185, 129, 0.2)'
               }}>
            <IconifyIcon icon="solar:check-circle-bold-duotone" className="fs-5 text-white" />
            <span className="fw-semibold text-white">Shift Closed</span>
          </div>
        )
      case 'closed':
        return (
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" 
               style={{ 
                 background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                 boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                 border: '1px solid rgba(59, 130, 246, 0.2)'
               }}>
            <IconifyIcon icon="solar:shield-check-bold-duotone" className="fs-5 text-white" />
            <span className="fw-semibold text-white">Shift Closed</span>
          </div>
        )
      case 'open':
        return (
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" 
               style={{ 
                 background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                 boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                 border: '1px solid rgba(245, 158, 11, 0.2)'
               }}>
            <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-5 text-white" />
            <span className="fw-semibold text-white">Shift Open</span>
          </div>
        )
      default:
        return (
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" 
               style={{ 
                 background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                 boxShadow: '0 2px 8px rgba(107, 114, 128, 0.25)',
                 border: '1px solid rgba(107, 114, 128, 0.2)'
               }}>
            <IconifyIcon icon="solar:question-circle-bold-duotone" className="fs-5 text-white" />
            <span className="fw-semibold text-white">Unknown</span>
          </div>
        )
    }
  }

  // Map data directly from the database structure
  const reportData = React.useMemo(() => {
    if (!data) return null
    
    // Direct mapping from database fields
    return {
      _id: data._id,
      shiftNumber: data.shiftNumber,
      status: data.status,
      startDate: data.startDate,
      startTime: data.startTime,
      endDate: data.endDate,
      endTime: data.endTime,
      loginName: data.loginName,
      logoutTime: data.logoutTime,
      branchId: data.branchId,
      createdBy: data.createdBy,
      closedBy: data.closedBy,
      note: data.note,
      denominations: data.denominations || {},
      sales: data.sales || {},
      totalCash: data.totalCash || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }, [data])

  if (!reportData) {
    return (
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Shift Close Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>No report data available.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="xl" 
      centered 
      backdrop="static"
      keyboard={false}
      className="shift-close-report-modal"
    >
      {/* Header */}
      <Modal.Header className="bg-primary text-white py-3 border-0">
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon="solar:document-text-bold-duotone" className="me-2 fs-5" />
          Shift Close Report
        </Modal.Title>
        <Button 
          variant="link" 
          className="text-white p-0 ms-auto" 
          onClick={onClose}
          style={{ fontSize: '1.5rem', textDecoration: 'none' }}
        >
          <IconifyIcon icon="solar:close-circle-bold-duotone" />
        </Button>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className="p-4">
        <div className="report-container text-center mb-4">
          <LogoBox />
        </div>

        {/* Day Summary Overview */}
        <div className="mb-4">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="card border-0 bg-primary bg-opacity-10">
                <div className="card-body py-3">
                  <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-2 text-primary mb-2" />
                  <h6 className="text-primary mb-1">Shift #{reportData.shiftNumber}</h6>
                  <small className="text-muted">Current Shift</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-success bg-opacity-10">
                <div className="card-body py-3">
                  <IconifyIcon icon="solar:wallet-money-bold-duotone" className="fs-2 text-success mb-2" />
                  <h6 className="text-success mb-1">₹{reportData.denominations?.totalCash?.toFixed(2) || '0.00'}</h6>
                  <small className="text-muted">Total Cash</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-info bg-opacity-10">
                <div className="card-body py-3">
                  <IconifyIcon icon="solar:shopping-cart-bold-duotone" className="fs-2 text-info mb-2" />
                  <h6 className="text-info mb-1">{reportData.sales?.totalOrders || 0}</h6>
                  <small className="text-muted">Total Orders</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-warning bg-opacity-10">
                <div className="card-body py-3">
                  <IconifyIcon icon="solar:chart-2-bold-duotone" className="fs-2 text-warning mb-2" />
                  <h6 className="text-warning mb-1">₹{reportData.sales?.totalSales?.toFixed(2) || '0.00'}</h6>
                  <small className="text-muted">Total Sales</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info Table */}
        <div className="mb-4">
          <h6 className="text-primary mb-3">
            <IconifyIcon icon="solar:info-circle-bold-duotone" className="me-2" />
            Shift Information
          </h6>
          <Table bordered size="sm" className="table-hover">
            <tbody>
              <tr>
                <td className="bg-light fw-semibold" style={{ width: '25%' }}>Shift Number</td>
                <td style={{ width: '25%' }}>{reportData.shiftNumber}</td>
                <td className="bg-light fw-semibold" style={{ width: '25%' }}>Status</td>
                <td style={{ width: '25%' }}>{getStatusBadge(reportData.status)}</td>
              </tr>
              <tr>
                <td className="bg-light fw-semibold">Start Date</td>
                <td>{reportData.startDate}</td>
                <td className="bg-light fw-semibold">Start Time</td>
                <td>{fmtTime(reportData.startTime)}</td>
              </tr>
              <tr>
                <td className="bg-light fw-semibold">End Date</td>
                <td>{reportData.endDate || '-'}</td>
                <td className="bg-light fw-semibold">End Time</td>
                <td>{fmtTime(reportData.endTime) || '-'}</td>
              </tr>
              <tr>
                <td className="bg-light fw-semibold">Login Name</td>
                <td>{reportData.loginName}</td>
                <td className="bg-light fw-semibold">Logout Time</td>
                <td>{fmtTime(reportData.logoutTime) || '-'}</td>
              </tr>
              {reportData.note && (
                <tr>
                  <td className="bg-light fw-semibold">Note</td>
                  <td colSpan={3}>{reportData.note}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>


        {/* Cash Summary */}
        <div className="mb-4">
          <h6 className="text-success mb-3">
            <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
            Cash Summary
          </h6>
          <div className="alert alert-success d-flex align-items-center justify-content-between">
            <span className="fw-semibold">
              <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
              Total Cash
            </span>
            <span className="fs-5 fw-bold">
              {reportData.denominations?.totalCash?.toFixed(2) || '0.00'} AED
            </span>
          </div>
        </div>

        {/* Denomination Details */}
        <div className="mb-4">
          <h6 className="text-info mb-3">
            <IconifyIcon icon="solar:calculator-bold-duotone" className="me-2" />
            Denomination Breakdown
          </h6>
          <Table bordered size="sm" className="table-hover">
            <thead className="bg-light">
              <tr>
                <th>Denomination</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-semibold">1000 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination1000 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination1000 || 0) * 1000).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">500 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination500 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination500 || 0) * 500).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">200 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination200 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination200 || 0) * 200).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">100 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination100 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination100 || 0) * 100).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">50 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination50 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination50 || 0) * 50).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">20 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination20 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination20 || 0) * 20).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">10 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination10 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination10 || 0) * 10).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">5 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination5 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination5 || 0) * 5).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">2 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination2 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination2 || 0) * 2).toFixed(2)} AED</td>
              </tr>
              <tr>
                <td className="fw-semibold">1 Dirham</td>
                <td className="text-center">{reportData.denominations.denomination1 || 0}</td>
                <td className="text-end">{((reportData.denominations.denomination1 || 0) * 1).toFixed(2)} AED</td>
              </tr>
              <tr className="table-success">
                <td className="fw-bold">Total Cash</td>
                <td></td>
                <td className="text-end fw-bold">{reportData.denominations?.totalCash?.toFixed(2) || '0.00'} AED</td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Sales Information */}
        {reportData.sales && Object.keys(reportData.sales).length > 0 && (
          <div className="mb-4">
            <h6 className="text-success mb-3">
              <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2" />
              Sales Information
            </h6>
            <div className="row">
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-primary">
                      <IconifyIcon icon="solar:shopping-cart-bold-duotone" className="me-2" />
                      Order Summary
                    </h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Orders:</span>
                      <strong className="text-primary">{reportData.sales.totalOrders || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Total Sales:</span>
                      <strong className="text-success">₹{reportData.sales.totalSales?.toFixed(2) || '0.00'}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-info">
                      <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
                      Payment Methods
                    </h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Cash:</span>
                      <strong className="text-success">₹{reportData.sales.payments?.cash?.toFixed(2) || '0.00'}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Card:</span>
                      <strong className="text-primary">₹{reportData.sales.payments?.card?.toFixed(2) || '0.00'}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Online:</span>
                      <strong className="text-info">₹{reportData.sales.payments?.online?.toFixed(2) || '0.00'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shift Duration Information */}
        <div className="mb-4">
          <h6 className="text-warning mb-3">
            <IconifyIcon icon="solar:clock-circle-bold-duotone" className="me-2" />
            Shift Duration
          </h6>
          <div className="row">
            <div className="col-md-6">
              <div className="card border-0 bg-warning bg-opacity-10">
                <div className="card-body">
                  <h6 className="card-title text-warning">
                    <IconifyIcon icon="solar:play-circle-bold-duotone" className="me-2" />
                    Shift Start
                  </h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Date:</span>
                    <strong>{reportData.startDate}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Time:</span>
                    <strong>{fmtTime(reportData.startTime)}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 bg-success bg-opacity-10">
                <div className="card-body">
                  <h6 className="card-title text-success">
                    <IconifyIcon icon="solar:stop-circle-bold-duotone" className="me-2" />
                    Shift End
                  </h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Date:</span>
                    <strong>{reportData.endDate || 'Still Open'}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Time:</span>
                    <strong>{fmtTime(reportData.endTime) || 'Still Open'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="mb-4">
          <h6 className="text-info mb-3">
            <IconifyIcon icon="solar:user-bold-duotone" className="me-2" />
            User Information
          </h6>
          <Table bordered size="sm" className="table-hover">
            <tbody>
              <tr>
                <td className="bg-light fw-semibold" style={{ width: '30%' }}>Login Name</td>
                <td style={{ width: '70%' }}>{reportData.loginName || '-'}</td>
              </tr>
              <tr>
                <td className="bg-light fw-semibold">Created By</td>
                <td>
                  {data?.createdByDetails ? (
                    <div>
                      <div className="fw-medium">{data.createdByDetails.name || 'Unknown'}</div>
                      <small className="text-muted">{data.createdByDetails.email || 'No email'}</small>
                    </div>
                  ) : (
                    reportData.createdBy || '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="bg-light fw-semibold">Closed By</td>
                <td>
                  {data?.closedByDetails ? (
                    <div>
                      <div className="fw-medium">{data.closedByDetails.name || 'Unknown'}</div>
                      <small className="text-muted">{data.closedByDetails.email || 'No email'}</small>
                    </div>
                  ) : (
                    reportData.closedBy || '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="bg-light fw-semibold">Branch</td>
                <td>
                  {isLoadingBranch ? (
                    <div className="d-flex align-items-center gap-2">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span className="text-muted">Loading branch...</span>
                    </div>
                  ) : branchData ? (
                    <div className="fw-medium">{branchData.name}</div>
                  ) : (
                    <span className="text-muted">Unknown Branch</span>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* System Information */}
        <div className="mb-4">
          <h6 className="text-secondary mb-3">
            <IconifyIcon icon="solar:settings-bold-duotone" className="me-2" />
            System Information
          </h6>
          <Table bordered size="sm" className="table-hover">
            <tbody>
              <tr>
                <td className="bg-light fw-semibold">Created At</td>
                <td>{fmtTime(reportData.createdAt)}</td>
              </tr>
              <tr>
                <td className="bg-light fw-semibold">Updated At</td>
                <td>{fmtTime(reportData.updatedAt)}</td>
              </tr>
              {reportData.note && (
                <tr>
                  <td className="bg-light fw-semibold">Note</td>
                  <td>{reportData.note}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      {/* Footer - Clean and minimal */}
      <Modal.Footer className="bg-light border-0 py-3">
        <div className="d-flex justify-content-end w-100">
          <Button variant="outline-secondary" onClick={onClose} size="sm">
            <IconifyIcon icon="solar:close-circle-bold-duotone" className="me-1" />
            Close
          </Button>
        </div>
      </Modal.Footer>

      {/* Styles */}
      <style jsx>{`
        .report-container {
          font-size: 14px;
          line-height: 1.6;
        }
        h6 {
          margin-top: 15px;
          font-weight: 600;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 8px;
        }
        table {
          font-size: 13px;
          margin-bottom: 0;
        }
        .table th {
          background-color: #f8f9fa;
          border-top: none;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .table td {
          vertical-align: middle;
          border-color: #dee2e6;
        }
        .alert {
          border: none;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .modal-content {
          border: none;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .modal-header {
          border-radius: 12px 12px 0 0;
        }
        .modal-footer {
          border-radius: 0 0 12px 12px;
        }
        .shift-close-report-modal .modal-dialog {
          max-width: 1200px;
          margin: 1.75rem auto;
        }
        .shift-close-report-modal .modal-content {
          max-height: 90vh;
          overflow-y: auto;
        }
        .shift-close-report-modal .modal-body {
          max-height: calc(90vh - 120px);
          overflow-y: auto;
        }
        .card {
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .bg-opacity-10 {
          background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
        }
        .text-primary { color: #0d6efd !important; }
        .text-success { color: #198754 !important; }
        .text-info { color: #0dcaf0 !important; }
        .text-warning { color: #ffc107 !important; }
        .text-secondary { color: #6c757d !important; }
      `}</style>
    </Modal>
  )
}

export default ReportModal
