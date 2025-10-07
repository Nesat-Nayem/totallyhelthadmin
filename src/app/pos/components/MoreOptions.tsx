'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Row, Col, Form } from 'react-bootstrap'
import { useGetMoreOptionsQuery } from '@/services/moreOptionApi'

interface MoreOptionsProps {
  onOptionsChange?: (options: any[]) => void
}

const MoreOptions: React.FC<MoreOptionsProps> = ({ onOptionsChange }) => {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: any }>({})
  
  const { data: moreOptionsData } = useGetMoreOptionsQuery()
  const allOptions = moreOptionsData ?? []
  
  // Group options by stored category
  const optionGroups = {
    More: allOptions.filter((opt: any) => opt.category === 'more'),
    Less: allOptions.filter((opt: any) => opt.category === 'less'),
    Without: allOptions.filter((opt: any) => opt.category === 'without'),
    General: allOptions.filter((opt: any) => opt.category === 'general')
  }

  const handleShowModal = () => setShowOptions(true)
  const handleCloseModal = () => {
    setShowOptions(false)
    setSelectedOptions({})
  }

  const handleSelect = (option: any) => {
    setSelectedOptions(prev => {
      const optId = option._id
      if (prev[optId]) {
        // Remove if already selected
        const updated = { ...prev }
        delete updated[optId]
        return updated
      } else {
        // Add option
        return {
          ...prev,
          [optId]: option
        }
      }
    })
  }
  

  const handleSave = () => {
    const options = Object.values(selectedOptions).map((option) => ({
      _id: option._id,
      category: option.category
    }))
    onOptionsChange?.(options)
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
                {options.length === 0 ? (
                  <div className="text-center text-muted p-3">No options available</div>
                ) : (
                  options.map((option: any) => {
                    const optId = option._id
                    const isSelected = !!selectedOptions[optId]
                    return (
                      <div key={optId} className="mb-2">
                        <div
                          onClick={() => handleSelect(option)}
                          className={`p-2 text-center rounded cursor-pointer border 
                            ${isSelected ? 'bg-success text-white' : 'bg-light'}`}
                          style={{ userSelect: 'none' }}>
                          <div>{option.name}</div>
                        </div>
                      </div>
                    )
                  })
                )}
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
