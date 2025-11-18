'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Spinner,
  Modal,
  Button,
} from 'react-bootstrap'

import PageTItle from '@/components/PageTItle'
import Link from 'next/link'
import { useGetAllFAQsQuery, useDeleteFAQMutation } from '@/services/faqApi'
import { confirmDelete } from '@/utils/sweetAlert'
import { toast } from 'react-toastify'
import { useState } from 'react'
import type { FAQ } from '@/services/faqApi'

const FaqsPage = () => {
  const { data: faqsResponse, isLoading, isFetching, refetch } = useGetAllFAQsQuery()
  const [deleteFAQ, { isLoading: isDeleting }] = useDeleteFAQMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)

  const faqs = faqsResponse?.data || []

  // Truncate text helper function
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleView = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowViewModal(true)
  }

  const handleDelete = async (id: string, question: string) => {
    const confirmed = await confirmDelete(
      'Delete FAQ?',
      `Are you sure you want to delete the FAQ "${question}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeletingId(id)
      await deleteFAQ(id).unwrap()
      toast.success('FAQ deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete FAQ')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageTItle title="FAQS" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageTItle title="FAQS" />
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            All Faq List
          </CardTitle>
          <Link href="/support/faqs/faq-add" className="btn btn-lg btn-primary">
            Add FAQ
          </Link>
        </CardHeader>
        <div>
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover table-centered">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Questions</th>
                  <th>Answer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {faqs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      No FAQs found
                    </td>
                  </tr>
                ) : (
                  faqs.map((faq) => (
                    <tr key={faq._id}>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '300px' }} title={faq.question}>
                          {faq.question}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-truncate" style={{ maxWidth: '250px' }} title={faq.answer}>
                            {truncateText(faq.answer, 80)}
                          </span>
                          {faq.answer.length > 80 && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-primary"
                              onClick={() => handleView(faq)}
                              style={{ textDecoration: 'none', fontSize: '12px' }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className={faq.isActive ? 'text-success' : 'text-danger'}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleView(faq)}
                            className="btn btn-soft-info btn-sm"
                            title="View Details"
                          >
                            <IconifyIcon icon="solar:eye-bold-duotone" className="align-middle fs-18" />
                          </button>
                          <Link 
                            href={`/support/faqs/faq-edit?id=${faq._id}`} 
                            className="btn btn-soft-primary btn-sm"
                            title="Edit"
                          >
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button
                            onClick={() => handleDelete(faq._id, faq.question)}
                            className="btn btn-soft-danger btn-sm"
                            disabled={deletingId === faq._id || isDeleting}
                            title="Delete"
                          >
                            {deletingId === faq._id ? (
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
        {faqs.length > 0 && (
          <CardFooter className="border-top">
            <div className="text-muted text-center">
              Showing {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* View FAQ Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="solar:question-circle-bold-duotone" className="me-2" />
            FAQ Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFAQ && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">
                  <IconifyIcon icon="solar:question-circle-bold-duotone" className="me-2 text-primary" />
                  Question
                </h6>
                <p className="mb-0 fs-6 fw-semibold">{selectedFAQ.question}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-2">
                  <IconifyIcon icon="solar:document-text-bold-duotone" className="me-2 text-success" />
                  Answer
                </h6>
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {selectedFAQ.answer}
                </p>
              </div>
              <div className="d-flex gap-3 mt-4 pt-3 border-top">
                <div>
                  <span className="text-muted small">Status:</span>
                  <span className={`ms-2 fw-semibold ${selectedFAQ.isActive ? 'text-success' : 'text-danger'}`}>
                    {selectedFAQ.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-muted small">Order:</span>
                  <span className="ms-2 fw-semibold">{selectedFAQ.order || 0}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedFAQ && (
            <Link 
              href={`/support/faqs/faq-edit?id=${selectedFAQ._id}`}
              className="btn btn-primary"
              onClick={() => setShowViewModal(false)}
            >
              <IconifyIcon icon="solar:pen-2-broken" className="me-1" />
              Edit FAQ
            </Link>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default FaqsPage
