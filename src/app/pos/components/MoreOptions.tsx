'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'

const optionGroups = {
  More: ['Add Sugar', 'BBQ Flavor', 'Broccoli', 'Brown Rice'],
  Less: ['Corn', 'Extra Cheese', 'Green Beans', 'Low Calorie'],
  Without: ['No Cheese', 'No Chicken', 'No Lettuce', 'No Mushroom'],
  General: ['Spicy', 'Sweet Potato', 'Roasted Potato', 'Pasta'],
}

const MoreOptions = () => {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleShowModal = () => setShowOptions(true)
  const handleCloseModal = () => setShowOptions(false)

  const handleSelect = (option: string) => {
    setSelectedOptions(
      (prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option) // unselect
          : [...prev, option], // select
    )
  }

  const handleSave = () => {
    console.log('Selected Options:', selectedOptions)
    setShowOptions(false)
  }

  return (
    <>
      {/* Trigger Button */}
      <Button variant="success" size="sm" onClick={handleShowModal}>
        <IconifyIcon icon="mdi:calculator-variant-outline" className="me-1" />
        More Options
      </Button>

      {/* Modal */}
      <Modal show={showOptions} onHide={handleCloseModal} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>More Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {Object.entries(optionGroups).map(([group, options]) => (
              <Col key={group} md={3} className="mb-3">
                <h4 className="text-center fw-bold bg-dark p-2 text-white">{group}</h4>
                {options.map((option) => {
                  const isSelected = selectedOptions.includes(option)
                  return (
                    <div
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={`p-2 mb-2 text-center rounded cursor-pointer border 
                        ${isSelected ? 'bg-success text-white' : 'bg-light'}`}
                      style={{ userSelect: 'none' }}>
                      {option}
                    </div>
                  )
                })}
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default MoreOptions
