'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { useGetAllSubscriptionsQuery, useDeleteSubscriptionMutation } from '@/services/subscriptionApi'
import { toast } from 'react-toastify'
import { confirmDelete } from '@/utils/sweetAlert'

const Subscription = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const itemsPerPage = 10

  const { data: subscriptionsResponse, isLoading, refetch } = useGetAllSubscriptionsQuery({
    page: currentPage,
    limit: itemsPerPage,
  })
  const [deleteSubscription] = useDeleteSubscriptionMutation()

  const subscriptions = subscriptionsResponse?.data || []
  const pagination = subscriptionsResponse?.pagination

  const handleDelete = async (id: string, email: string) => {
    const confirmed = await confirmDelete(
      'Delete Subscription?',
      `Are you sure you want to delete the subscription for "${email}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeletingId(id)
      await deleteSubscription(id).unwrap()
      toast.success('Subscription deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete subscription')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>Subscriptions</CardTitle>
            </CardHeader>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <Spinner animation="border" variant="primary" />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Subscriptions List
            </CardTitle>
          </CardHeader>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="customCheck1" />
                        <label className="form-check-label" htmlFor="customCheck1" />
                      </div>
                    </th>
                    <th style={{ textWrap: 'nowrap' }}>Full Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Email</th>
                    <th style={{ textWrap: 'nowrap' }}>Subscribed Date</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No subscriptions found
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`customCheck-${item._id}`} />
                            <label className="form-check-label" htmlFor={`customCheck-${item._id}`} />
                          </div>
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>{item.fullName}</td>
                        <td style={{ textWrap: 'nowrap' }}>{item.email}</td>
                        <td style={{ textWrap: 'nowrap' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleDelete(item._id, item.email)}
                              className="btn btn-soft-danger btn-sm"
                              type="button"
                              disabled={deletingId === item._id}
                            >
                              {deletingId === item._id ? (
                                <Spinner size="sm" />
                              ) : (
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          )}
        </Card>
      </Col>
    </Row>
  )
}

export default Subscription

