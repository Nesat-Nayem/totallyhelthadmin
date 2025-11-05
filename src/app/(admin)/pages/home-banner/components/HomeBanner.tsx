'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { useGetBannersQuery, useDeleteBannerMutation, useGetBannerByIdQuery } from '@/services/bannerApi'
import { confirmDelete } from '@/utils/sweetAlert'
import { toast } from 'react-toastify'
import ViewBannerModal from './ViewBannerModal'

const HomeBanner = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [viewModalShow, setViewModalShow] = useState(false)
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null)
  
  const { data: bannersResponse, isLoading, isFetching, refetch } = useGetBannersQuery(statusFilter ? { status: statusFilter } : undefined)
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation()
  const { data: selectedBanner, isLoading: isLoadingBanner } = useGetBannerByIdQuery(selectedBannerId || '', { skip: !selectedBannerId })
  
  const banners = bannersResponse?.data || []
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirmDelete(
      'Delete Banner?',
      `Are you sure you want to delete the banner "${title}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeletingId(id)
      await deleteBanner(id).unwrap()
      toast.success('Banner deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete banner')
    } finally {
      setDeletingId(null)
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.png'
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    // If it's a Cloudinary path, construct the full URL
    // Assuming the image path is stored as something like "restaurant-banners/abc123.jpg"
    // You may need to adjust this based on your actual Cloudinary setup
    return imagePath
  }

  const handleView = (id: string) => {
    setSelectedBannerId(id)
    setViewModalShow(true)
  }

  const handleCloseViewModal = () => {
    setViewModalShow(false)
    setSelectedBannerId(null)
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Home Banners
            </CardTitle>
            <Link href="/pages/home-banner/home-banner-add" className="btn btn-lg btn-primary">
              Add Banners
            </Link>
          </CardHeader>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Title</th>
                    <th>Sub Title</th>
                    <th>Banner</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading || isFetching ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-2">Loading banners...</span>
                      </td>
                    </tr>
                  ) : banners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No banners found
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner) => (
                      <tr key={banner._id}>
                        <td>{banner.title}</td>
                        <td>{banner.description}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              <Image 
                                src={getImageUrl(banner.image)} 
                                alt={banner.title} 
                                className="avatar-md"
                                width={60}
                                height={60}
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`fw-medium ${banner.status === 'active' ? 'text-success' : 'text-danger'}`}>
                            {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleView(banner._id)}
                              className="btn btn-soft-info btn-sm"
                              title="View Details"
                            >
                              <IconifyIcon icon="solar:eye-bold" className="align-middle fs-18" />
                            </button>
                            <Link 
                              href={`/pages/home-banner/home-banner-edit/${banner._id}`} 
                              className="btn btn-soft-primary btn-sm"
                              title="Edit"
                            >
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              onClick={() => handleDelete(banner._id, banner.title)}
                              className="btn btn-soft-danger btn-sm"
                              disabled={isDeleting && deletingId === banner._id}
                              title="Delete"
                            >
                              {isDeleting && deletingId === banner._id ? (
                                <Spinner animation="border" size="sm" />
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
          {banners.length > 0 && (
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {/* Simple pagination - you can enhance this based on your backend pagination */}
                  <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(1)}>
                      1
                    </button>
                  </li>
                  {banners.length > 10 && (
                    <li className={`page-item ${currentPage === 2 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(2)}>
                        2
                      </button>
                    </li>
                  )}
                  {banners.length > 20 && (
                    <li className={`page-item ${currentPage === 3 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(3)}>
                        3
                      </button>
                    </li>
                  )}
                  <li className={`page-item ${banners.length <= 10 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={banners.length <= 10}
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

      <ViewBannerModal
        show={viewModalShow}
        onHide={handleCloseViewModal}
        banner={selectedBanner || null}
        isLoading={isLoadingBanner}
      />
    </Row>
  )
}

export default HomeBanner
