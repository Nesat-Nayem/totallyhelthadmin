'use client'

import React, { useState } from 'react'
import { Modal, Button, Form, InputGroup } from 'react-bootstrap'
import { FaPrint, FaSearch } from 'react-icons/fa'

export default function ReprintBillsModal() {
  const [show, setShow] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const handleSearch = () => {
    console.log('Searching for:', searchValue)
    // 👉 API call / filter logic goes here
  }

  return (
    <>
      <Button className="btn-custom" onClick={handleShow}>
        <FaPrint className="me-2" /> Re-Print Bills
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Re-Print Bills</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Label>Search by Order No / Invoice No</Form.Label>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Enter Order No or Invoice No"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button variant="primary" onClick={handleSearch}>
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
