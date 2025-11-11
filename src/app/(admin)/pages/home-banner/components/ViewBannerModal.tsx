'use client'

import React from 'react'
import { Modal, Row, Col, Spinner, Badge } from 'react-bootstrap'
import Image from 'next/image'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Banner } from '@/services/bannerApi'

interface ViewBannerModalProps {
  show: boolean
  onHide: () => void
  banner: Banner | null
  isLoading: boolean
}

const ViewBannerModal: React.FC<ViewBannerModalProps> = ({ show, onHide, banner, isLoading }) => {
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.png'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    return imagePath
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="solar:document-bold" className="me-2" />
          Banner Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading banner details...</p>
          </div>
        ) : banner ? (
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Title</label>
                <p className="mb-0">{banner.title}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Status</label>
                <div>
                  <Badge bg={banner.status === 'active' ? 'success' : 'danger'}>
                    {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Google Review Count</label>
                <p className="mb-0">{banner.googleReviewCount}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Order</label>
                <p className="mb-0">{banner.order || 0}</p>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Description</label>
                <p className="mb-0">{banner.description}</p>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Banner Image</label>
                <div className="mt-2">
                  <Image 
                    src={getImageUrl(banner.image)} 
                    alt={banner.title} 
                    width={400}
                    height={200}
                    className="img-fluid rounded"
                    style={{ objectFit: 'cover', maxWidth: '100%' }}
                  />
                </div>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Certification Logo</label>
                <div className="mt-2">
                  <Image 
                    src={getImageUrl(banner.certLogo)} 
                    alt="Certification Logo" 
                    width={200}
                    height={100}
                    className="img-fluid rounded"
                    style={{ objectFit: 'cover', maxWidth: '100%' }}
                  />
                </div>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Meta Title</label>
                <p className="mb-0">{banner.metaTitle}</p>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Meta Description</label>
                <p className="mb-0">{banner.metaDescription}</p>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Meta Keywords</label>
                <p className="mb-0">{banner.metaKeywords}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Created At</label>
                <p className="mb-0">{banner.createdAt ? new Date(banner.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">Updated At</label>
                <p className="mb-0">{banner.updatedAt ? new Date(banner.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </Col>
          </Row>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">Banner not found</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
        {banner && (
          <Link 
            href={`/pages/home-banner/home-banner-edit/${banner._id}`} 
            className="btn btn-primary"
            onClick={onHide}
          >
            Edit Banner
          </Link>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ViewBannerModal

