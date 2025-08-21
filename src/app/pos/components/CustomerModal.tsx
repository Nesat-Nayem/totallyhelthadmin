'use client'

import React, { useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { apiFetch } from '@/utils/api'
import { useSession } from 'next-auth/react'

type Customer = {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
}

const CustomerModal = ({ onCreated }: { onCreated?: (c: Customer) => void }) => {
  const { data: session } = useSession()
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  const handleShowModal = () => setShowCustomerModal(true)
  const handleCloseModal = () => setShowCustomerModal(false)

  const saveCustomer = async () => {
    if (!name.trim()) return alert('Name is required')
    try {
      const token = (session as any)?.user?.token || (session as any)?.accessToken || (session as any)?.user?.accessToken
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      }
      const res = await apiFetch<{ message: string; data: any }>(`/customers`, { method: 'POST', body: JSON.stringify(payload) }, token)
      const created = res.data
      const normalized: Customer = {
        id: created._id || created.id,
        name: created.name,
        phone: created.phone,
        email: created.email,
        address: created.address,
      }
      onCreated?.(normalized)
      setShowCustomerModal(false)
      setName('')
      setPhone('')
      setEmail('')
      setAddress('')
    } catch (e: any) {
      alert(e?.message || 'Failed to create customer')
    }
  }

  return (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <Button size="sm" variant="primary" onClick={handleShowModal}>
            Add Customers
          </Button>
        </Col>
      </Row>

      <Modal show={showCustomerModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <textarea cols={30} rows={4} placeholder="Enter Address" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={saveCustomer}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomerModal
