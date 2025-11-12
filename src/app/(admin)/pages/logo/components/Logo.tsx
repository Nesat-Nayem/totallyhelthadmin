'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { useGetAllLogosQuery, useDeleteLogoMutation } from '@/services/logoApi'
import { toast } from 'react-toastify'
import { confirmDelete } from '@/utils/sweetAlert'
import Image from 'next/image'

const Logo = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: logosResponse, isLoading, refetch } = useGetAllLogosQuery(
    statusFilter ? { status: statusFilter as 'active' | 'inactive' } : undefined
  )
  const [deleteLogo] = useDeleteLogoMutation()

  const logos = logosResponse?.data || []

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete(
      'Delete Logo?',
      'Are you sure you want to delete this logo? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      setDeletingId(id)
      await deleteLogo(id).unwrap()
      toast.success('Logo deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete logo')
    } finally {
      setDeletingId(null)
    }
  }

  // Pagination logic
  const itemsPerPage = 10
  const totalPages = Math.ceil(logos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLogos = logos.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>Logos</CardTitle>
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
              Logos List
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
              <Link href="/pages/logo/logo-add" className="btn btn-lg btn-primary">
                Add Logo
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
                    <th>Logo</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No logos found
                      </td>
                    </tr>
                  ) : (
                    paginatedLogos.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`customCheck-${item._id}`} />
                            <label className="form-check-label" htmlFor={`customCheck-${item._id}`} />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              <Image 
                                src={item.image} 
                                alt="logo" 
                                width={80}
                                height={80}
                                className="avatar-md"
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{item.order || 0}</td>
                        <td>
                          <span className={`badge ${item.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link
                              href={`/pages/logo/logo-edit/${item._id}`}
                              className="btn btn-soft-primary btn-sm"
                            >
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id)}
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

export default Logo

