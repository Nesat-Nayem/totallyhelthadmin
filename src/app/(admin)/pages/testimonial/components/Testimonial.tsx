'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { useGetAllTestimonialsQuery, useDeleteTestimonialMutation } from '@/services/testimonialApi'
import { toast } from 'react-toastify'
import { confirmDelete } from '@/utils/sweetAlert'
import { useRouter } from 'next/navigation'

const Testimonial = () => {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: testimonialsResponse, isLoading, refetch } = useGetAllTestimonialsQuery(
    statusFilter ? { status: statusFilter as 'active' | 'inactive' } : undefined
  )
  const [deleteTestimonial] = useDeleteTestimonialMutation()

  const testimonials = testimonialsResponse?.data || []

  const handleDelete = async (id: string, authorName: string) => {
    const confirmed = await confirmDelete(
      'Delete Testimonial?',
      `Are you sure you want to delete the testimonial from "${authorName}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeletingId(id)
      await deleteTestimonial(id).unwrap()
      toast.success('Testimonial deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete testimonial')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/pages/testimonial/testimonial-edit/${id}`)
  }

  // Pagination logic
  const itemsPerPage = 10
  const totalPages = Math.ceil(testimonials.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTestimonials = testimonials.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>Testimonials</CardTitle>
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
              Testimonials
            </CardTitle>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={statusFilter || ''}
                onChange={(e) => {
                  setStatusFilter(e.target.value || undefined)
                  setCurrentPage(1)
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Link href="/pages/testimonial/testimonial-add" className="btn btn-lg btn-primary">
                Add testimonial
              </Link>
            </div>
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
                    <th style={{ textWrap: 'nowrap' }}>Author Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Author Profession</th>
                    <th style={{ textWrap: 'nowrap' }}>Quote</th>
                    <th style={{ textWrap: 'nowrap' }}>Order</th>
                    <th style={{ textWrap: 'nowrap' }}>Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTestimonials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No testimonials found
                      </td>
                    </tr>
                  ) : (
                    paginatedTestimonials.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`customCheck-${item._id}`} />
                            <label className="form-check-label" htmlFor={`customCheck-${item._id}`} />
                          </div>
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>{item.authorName}</td>
                        <td style={{ textWrap: 'nowrap' }}>{item.authorProfession}</td>
                        <td style={{ textWrap: 'nowrap' }} title={item.quote}>
                          {item.quote.length > 80 ? `${item.quote.substring(0, 80)}...` : item.quote}
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>{item.order || 0}</td>
                        <td style={{ textWrap: 'nowrap' }} className={`fw-medium ${item.status === 'active' ? 'text-success' : 'text-danger'}`}>
                          {item.status === 'active' ? 'Active' : 'Inactive'}
                        </td>
                        <td style={{ textWrap: 'nowrap' }}>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleEdit(item._id)}
                              className="btn btn-soft-primary btn-sm"
                              type="button"
                            >
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id, item.authorName)}
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
          {totalPages > 1 && (
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
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

export default Testimonial
