'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import { Card, CardFooter, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Spinner, Modal, Button } from 'react-bootstrap'
import { useGetAllContactsQuery, useDeleteContactByIdMutation, type Contact } from '@/services/contactApi'
import { toast } from 'react-toastify'
import { confirmDelete } from '@/utils/sweetAlert'

const ContactEnquiryList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [fieldModalContent, setFieldModalContent] = useState<{ type: 'subject' | 'message'; content: string; title: string } | null>(null)
  const itemsPerPage = 20

  const { data: contactsResponse, isLoading, refetch } = useGetAllContactsQuery({
    page: currentPage,
    limit: itemsPerPage,
  })
  const [deleteContact] = useDeleteContactByIdMutation()

  const contacts = contactsResponse?.data || []
  const pagination = contactsResponse?.pagination

  const handleViewAll = (contact: Contact) => {
    setSelectedContact(contact)
    setShowViewModal(true)
  }

  const handleViewField = (contact: Contact, type: 'subject' | 'message') => {
    const content = type === 'subject' ? contact.subject || '' : contact.message
    const title = type === 'subject' ? 'Subject' : 'Message'
    setFieldModalContent({ type, content, title })
    setShowFieldModal(true)
  }

  const handleDelete = async (id: string, fullName: string) => {
    const confirmed = await confirmDelete(
      'Delete Contact Enquiry?',
      `Are you sure you want to delete the contact enquiry from "${fullName}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeletingId(id)
      await deleteContact(id).unwrap()
      toast.success('Contact enquiry deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete contact enquiry')
    } finally {
      setDeletingId(null)
    }
  }

  // Truncate text helper function
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '-'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Truncate text without dots (for when View link is shown)
  const truncateTextWithoutDots = (text: string, maxLength: number = 50) => {
    if (!text) return '-'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength)
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <div className="d-flex card-header justify-content-between align-items-center">
              <div>
                <CardTitle as={'h4'}>Contact Enquiry List</CardTitle>
              </div>
            </div>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <Spinner animation="border" variant="primary" />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <div className="d-flex card-header justify-content-between align-items-center">
              <div>
                <CardTitle as={'h4'}>Contact Enquiry List</CardTitle>
              </div>
              <Dropdown>
                <DropdownToggle className="btn btn-sm btn-outline-light content-none icons-center" data-bs-toggle="dropdown" aria-expanded="false">
                  This Month <IconifyIcon className="ms-1" width={16} height={16} icon="bx:chevron-down" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem href="" className="dropdown-item">
                    Download
                  </DropdownItem>
                  <DropdownItem href="" className="dropdown-item">
                    Export
                  </DropdownItem>
                  <DropdownItem href="" className="dropdown-item">
                    Import
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
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
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          No contact enquiries found
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" id={`customCheck-${contact._id}`} />
                              <label className="form-check-label" htmlFor={`customCheck-${contact._id}`}>
                                &nbsp;
                              </label>
                            </div>
                          </td>
                          <td>{contact.fullName}</td>
                          <td>{contact.emailAddress}</td>
                          <td>{contact.phoneNumber || '-'}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-truncate" style={{ maxWidth: '200px' }} title={contact.subject || ''}>
                                {truncateText(contact.subject || '-', 30)}
                              </span>
                              {contact.subject && contact.subject.length > 30 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-primary"
                                  onClick={() => handleViewField(contact, 'subject')}
                                  style={{ textDecoration: 'none', fontSize: '12px' }}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {contact.message.length > 30 ? (
                                <>
                                  <span className="text-truncate" style={{ maxWidth: '200px' }} title={contact.message}>
                                    {truncateTextWithoutDots(contact.message, 30)}
                                  </span>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 text-primary"
                                    onClick={() => handleViewField(contact, 'message')}
                                    style={{ textDecoration: 'none', fontSize: '12px' }}
                                  >
                                    View
                                  </Button>
                                </>
                              ) : (
                                <span className="text-truncate" style={{ maxWidth: '200px' }} title={contact.message}>
                                  {contact.message}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => handleViewAll(contact)}
                                className="btn btn-soft-info btn-sm"
                                title="View All Details"
                                type="button"
                              >
                                <IconifyIcon icon="solar:eye-bold-duotone" className="align-middle fs-18" />
                              </button>
                              <button
                                onClick={() => handleDelete(contact._id, contact.fullName)}
                                className="btn btn-soft-danger btn-sm"
                                type="button"
                                disabled={deletingId === contact._id}
                                title="Delete"
                              >
                                {deletingId === contact._id ? (
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

      {/* View Field Modal - For Subject or Message only */}
      <Modal show={showFieldModal} onHide={() => setShowFieldModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon 
              icon={fieldModalContent?.type === 'subject' ? 'solar:tag-bold-duotone' : 'solar:document-text-bold-duotone'} 
              className="me-2" 
            />
            {fieldModalContent?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', wordBreak: 'break-word' }}>
            {fieldModalContent?.content || '-'}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFieldModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View All Contact Enquiry Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="solar:letter-bold-duotone" className="me-2" />
            Contact Enquiry Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContact && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">
                  <IconifyIcon icon="solar:user-bold-duotone" className="me-2 text-primary" />
                  Full Name
                </h6>
                <p className="mb-0 fs-6 fw-semibold">{selectedContact.fullName}</p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">
                  <IconifyIcon icon="solar:letter-opened-bold-duotone" className="me-2 text-info" />
                  Email Address
                </h6>
                <p className="mb-0 fs-6">
                  <a href={`mailto:${selectedContact.emailAddress}`} className="text-decoration-none">
                    {selectedContact.emailAddress}
                  </a>
                </p>
              </div>

              {selectedContact.phoneNumber && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">
                    <IconifyIcon icon="solar:phone-calling-bold-duotone" className="me-2 text-success" />
                    Phone Number
                  </h6>
                  <p className="mb-0 fs-6">
                    <a href={`tel:${selectedContact.phoneNumber}`} className="text-decoration-none">
                      {selectedContact.phoneNumber}
                    </a>
                  </p>
                </div>
              )}

              {selectedContact.subject && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">
                    <IconifyIcon icon="solar:tag-bold-duotone" className="me-2 text-warning" />
                    Subject
                  </h6>
                  <p className="mb-0 fs-6 fw-semibold" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {selectedContact.subject}
                  </p>
                </div>
              )}

              <div className="mb-3">
                <h6 className="text-muted mb-2">
                  <IconifyIcon icon="solar:document-text-bold-duotone" className="me-2 text-danger" />
                  Message
                </h6>
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {selectedContact.message}
                </p>
              </div>

              <div className="d-flex gap-3 mt-4 pt-3 border-top">
                {selectedContact.createdAt && (
                  <div>
                    <span className="text-muted small">Submitted:</span>
                    <span className="ms-2 fw-semibold">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ContactEnquiryList
