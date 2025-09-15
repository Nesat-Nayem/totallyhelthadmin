'use client'

import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

const PunchModal = () => {
  const [show, setShow] = useState(false)
  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)

  return (
    <>
      {/* Trigger Button */}
      <Button variant="soft-primary" size="sm" onClick={handleShow}>
        Punch
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Punch Hold</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="holdDateStart">
              <Form.Label>Hold Date Start</Form.Label>
              <Form.Control type="date" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="holdDateEnd">
              <Form.Label>Hold Date End</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PunchModal
