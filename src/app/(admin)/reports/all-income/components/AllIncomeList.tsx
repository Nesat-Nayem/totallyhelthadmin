'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
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
} from 'react-bootstrap'
import { useGetOrdersQuery, useUpdatePaymentModeMutation } from '@/services/orderApi'
import { useSession } from 'next-auth/react'
import PaymentModeChangeModal from '@/components/PaymentModeChangeModal'
import OrderDetailsModal from '@/components/OrderDetailsModal'

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString()
}

function isCurrentDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  const today = new Date()
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

function firstDayOfMonthISO() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function todayISO() {
  return new Date().toISOString()
}

function toCSV(rows: any[]) {
  const headers = [
    'Invoice No',
    'Date',
    'Customer',
    'Payment Mode',
    'Subtotal',
    'VAT',
    'Shipping',
    'Total',
    'Status',
  ]
  const lines = rows.map((o: any) => [
    o.invoiceNo,
    o.date,
    o.customer?.name || '',
    o.paymentMode || '',
    o.subTotal,
    o.vatAmount || 0,
    o.shippingCharge || 0,
    o.total,
    o.status,
  ])
  const csv = [headers, ...lines].map((r) => r.map((v) => `"${String(v ?? '')}"`).join(',')).join('\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}




const AllIncomeList = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [q, setQ] = React.useState('')
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [page, setPage] = React.useState(1)
  const limit = 20
  
  // Payment mode change modal state
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null)
  
  // Order details modal state
  const [showOrderDetailsModal, setShowOrderDetailsModal] = React.useState(false)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = React.useState<any>(null)

  // Wait for session to be ready before making API calls
  const isSessionReady = status !== 'loading'
  
  // Check for token with a small delay to ensure localStorage is synced
  const [tokenReady, setTokenReady] = React.useState(false)
  const [showNoData, setShowNoData] = React.useState(false)
  
  React.useEffect(() => {
    if (isSessionReady) {
      // Small delay to ensure LocalAuthSync has updated localStorage
      const timer = setTimeout(() => {
        const token = localStorage.getItem('backend_token')
        setTokenReady(!!token)
      }, 50) // Reduced delay
      
      return () => clearTimeout(timer)
    }
  }, [isSessionReady])
  
  const hasToken = tokenReady

  const { data: ordersResp, isLoading, error, refetch } = useGetOrdersQuery({ 
    ...(q && { q }), 
    page, 
    limit, 
    ...(startDate && { startDate }), 
    ...(endDate && { endDate }) 
  }, {
    skip: !isSessionReady || !hasToken,
    // Force fresh data on mount
    refetchOnMountOrArgChange: true
  })

  // Payment mode update mutation
  const [updatePaymentMode, { isLoading: isUpdatingPayment }] = useUpdatePaymentModeMutation()

  // this month
  const { data: monthResp } = useGetOrdersQuery({ startDate: firstDayOfMonthISO(), endDate: todayISO(), page: 1, limit: 1 }, {
    skip: !isSessionReady || !hasToken
  })
  const monthTotal = monthResp?.summary?.total ?? 0

  const orders = ordersResp?.data ?? []
  const meta = ordersResp?.meta
  const summary = ordersResp?.summary
  
  // Delay showing "No Data" message to prevent blinking
  React.useEffect(() => {
    if (isSessionReady && !isLoading && !error && orders.length === 0) {
      const timer = setTimeout(() => {
        setShowNoData(true)
      }, 300) // 300ms delay before showing "No Data"
      
      return () => clearTimeout(timer)
    } else {
      setShowNoData(false)
    }
  }, [isSessionReady, isLoading, error, orders.length])

  // Debug logging
  React.useEffect(() => {
    console.log('Session status:', { status, isSessionReady, hasToken })
    console.log('Orders query state:', { ordersResp, isLoading, error })
    console.log('Orders data:', orders)
    
    if (error) {
      console.error('Orders query error:', error)
    }
  }, [ordersResp, isLoading, error, status, isSessionReady, hasToken, orders])



  const handleEditOrder = (order: any) => {
    // Store order data in sessionStorage for POS to access with source identifier
    const orderDataWithSource = {
      ...order,
      editSource: 'reports'
    }
    sessionStorage.setItem('editOrderData', JSON.stringify(orderDataWithSource))
    // Navigate to POS page
    router.push('/pos')
  }

  const handleChangePaymentMode = (order: any) => {
    setSelectedOrder(order)
    setShowPaymentModal(true)
  }

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrderForDetails(order)
    setShowOrderDetailsModal(true)
  }

  const handleConfirmPaymentModeChange = async (newPaymentMode: string) => {
    if (!selectedOrder) return

    try {
      await updatePaymentMode({
        id: selectedOrder._id,
        paymentMode: newPaymentMode
      }).unwrap()

      // Show success message
      alert(`Payment mode changed to ${newPaymentMode} successfully!`)
      
      // Close modal and refresh data
      setShowPaymentModal(false)
      setSelectedOrder(null)
      refetch()
    } catch (error) {
      console.error('Failed to update payment mode:', error)
      alert('Failed to update payment mode. Please try again.')
    }
  }



  const handleExportCSV = () => {
    const blob = toCSV(
      orders.map((o: any) => ({
        invoiceNo: o.invoiceNo,
        date: o.date,
        customer: o.customer?.name,
        paymentMode: o.paymentMode,
        subTotal: o.subTotal,
        vatAmount: o.vatAmount,
        shippingCharge: o.shippingCharge,
        total: o.total,
        status: o.status,
      }))
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'all-income.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Row>
        <Col lg={4}>
          <Card>
            <div className="p-3 text-center d-flex align-items-center gap-3">
              <div>
                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-24" />
              </div>
              <div>
                <h5>Total Income</h5>
                <h5>
                  <span className="text-success">AED {summary?.total ?? 0}</span>
                </h5>
              </div>
            </div>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <div className="p-3 text-center d-flex align-items-center gap-3">
              <div>
                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-24" />
              </div>
              <div>
                <h5>This Month Income</h5>
                <h5>
                  <span className="text-success">AED {monthTotal}</span>
                </h5>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                All Income List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search invoice No..." value={q} onChange={(e) => setQ(e.target.value)} />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>

              {/* Date Range */}
              <div className="d-flex gap-2">
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <Button variant="outline-success" onClick={handleExportCSV}>
                  <IconifyIcon icon="mdi:file-export-outline" /> Export CSV
                </Button>
              </div>
            </CardHeader>

            <div>
              {/* Combined Loading State - Show only when actually loading */}
              {(!isSessionReady || isLoading) && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading orders...</p>
                </div>
              )}

              {/* Error State */}
              {isSessionReady && error && (
                <div className="alert alert-danger text-center">
                  <p>Failed to load orders. Please try again.</p>
                  <div className="small text-muted mb-2">
                    {(() => {
                      const errorStatus = (error as any)?.status
                      const errorMessage = (error as any)?.data?.message
                      
                      return (
                        <>
                          Error: {errorStatus ? `Status ${errorStatus}` : 'Network Error'}
                          {errorMessage && <div>Message: {errorMessage}</div>}
                          {errorStatus === 401 && (
                            <div className="text-warning mt-2">
                              <strong>Authentication Error:</strong> Please check if you're logged in properly.
                            </div>
                          )}
                          {errorStatus === 'FETCH_ERROR' && (
                            <div className="text-warning mt-2">
                              <strong>Connection Error:</strong> Unable to connect to the server. Please check your internet connection.
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => window.location.reload()}>
                      Retry
                    </button>
                    {(error as any)?.status === 401 && (
                      <button className="btn btn-outline-warning btn-sm" onClick={() => {
                        localStorage.removeItem('backend_token')
                        window.location.href = '/auth/login'
                      }}>
                        Login Again
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* No Data Message - Only show after delay to prevent blinking */}
              {showNoData && (
                <div className="text-center py-4">
                  <div className="alert alert-info">
                    <h5>No orders found</h5>
                    <p className="mb-0">
                      {q || startDate || endDate 
                        ? 'No orders match your current search criteria. Try adjusting your filters.'
                        : 'No orders have been created yet. Create your first order to see it here.'
                      }
                    </p>
                    <div className="d-flex gap-2 justify-content-center mt-3">
                      {(q || startDate || endDate) && (
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setQ('')
                            setStartDate('')
                            setEndDate('')
                            setPage(1)
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => {
                          console.log('Manual refresh triggered')
                          refetch()
                        }}
                      >
                        <IconifyIcon icon="mdi:refresh" className="me-1" />
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Table */}
              {isSessionReady && !isLoading && !error && orders.length > 0 && (
                <div className="table-responsive">
                  <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck1" />
                          <label className="form-check-label" htmlFor="customCheck1" />
                        </div>
                      </th>
                      <th style={{ textWrap: 'nowrap' }}>Sr.No</th>
                      <th style={{ textWrap: 'nowrap' }}>Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Invoice No</th>
                      <th style={{ textWrap: 'nowrap' }}>Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>
                      <th style={{ textWrap: 'nowrap' }}>Paid Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any, idx: number) => (
                      <tr key={o._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" />
                          </div>
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>{(page - 1) * limit + idx + 1}</td>
                        <td style={{ textWrap: 'nowrap' }}>{formatDate(o.date)}</td>
                        <td style={{ textWrap: 'nowrap' }}>{o.invoiceNo}</td>
                        <td style={{ textWrap: 'nowrap' }}>AED {o.total}</td>
                        <td style={{ textWrap: 'nowrap' }}>
                          {o.payments?.length > 1 ? (
                            <div>
                              <span className="badge bg-warning me-1">Multiple</span>
                              <span className="badge bg-info">
                                {o.payments?.[0]?.type || 'Unknown'}
                              </span>
                            </div>
                          ) : (
                            <span className="badge bg-info">
                              {o.payments?.[0]?.type || 'Unknown'}
                            </span>
                          )}
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>
                          <span 
                            className={`badge ${o.status === 'paid' ? 'bg-success' : 'bg-warning'}`}
                            style={{ 
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {o.status === 'paid' ? 'PAID' : 'UNPAID'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {/* View button - always available */}
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewOrderDetails(o)}
                              title="View Order Details"
                              className="p-1"
                            >
                              <IconifyIcon icon="solar:eye-bold" className="align-middle fs-16" />
                            </Button>
                            
                            {/* Edit button for unpaid orders */}
                            {o.status !== 'paid' && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditOrder(o)}
                                title="Edit Order"
                                className="p-1"
                              >
                                <IconifyIcon icon="solar:pen-2-bold" className="align-middle fs-16" />
                              </Button>
                            )}
                            
                            {/* Payment mode change button for paid orders on current date only */}
                            {o.status === 'paid' && isCurrentDate(o.date) && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleChangePaymentMode(o)}
                                title="Change Payment Mode (Current Date Only)"
                                className="p-1"
                              >
                                <IconifyIcon 
                                  icon="solar:bill-bold" 
                                  className="align-middle fs-16" 
                                />
                              </Button>
                            )}
                            
                            <Link href="#" className="btn btn-soft-danger btn-sm" title="Delete (coming soon)">
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}

              {/* Pagination */}
              {isSessionReady && !isLoading && !error && orders.length > 0 && (
                <CardFooter className="border-top">
                  <nav aria-label="Page navigation example">
                    <ul className="pagination justify-content-end mb-0">
                      <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                          Previous
                        </button>
                      </li>
                      <li className="page-item active">
                        <span className="page-link">{page}</span>
                      </li>
                      <li className={`page-item ${meta && page * limit >= (meta.total || 0) ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </CardFooter>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Payment Mode Change Modal */}
      <PaymentModeChangeModal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onConfirm={handleConfirmPaymentModeChange}
        isLoading={isUpdatingPayment}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        show={showOrderDetailsModal}
        onHide={() => {
          setShowOrderDetailsModal(false)
          setSelectedOrderForDetails(null)
        }}
        order={selectedOrderForDetails}
      />

    </>
  )
}

export default AllIncomeList

