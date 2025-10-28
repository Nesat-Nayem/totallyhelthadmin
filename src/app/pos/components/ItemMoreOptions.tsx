'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Row, Col, Form } from 'react-bootstrap'
import { useGetMoreOptionsQuery } from '@/services/moreOptionApi'

interface ItemMoreOptionsProps {
  itemId: string
  itemName: string
  onOptionsChange?: (itemId: string, options: string[]) => void
  currentOptions?: string[]
}

const ItemMoreOptions: React.FC<ItemMoreOptionsProps> = ({ 
  itemId, 
  itemName, 
  onOptionsChange, 
  currentOptions = [] 
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: any }>({})
  
  const { data: moreOptionsData } = useGetMoreOptionsQuery()
  const allOptions = moreOptionsData ?? []
  
  // Initialize selected options from current options
  useEffect(() => {
    const initialSelected: { [key: string]: any } = {}
    currentOptions.forEach((optionName: string) => {
      // Find the option object by name
      const option = allOptions.find((opt: any) => opt.name === optionName)
      if (option) {
        initialSelected[option._id] = option
      }
    })
    setSelectedOptions(initialSelected)
  }, [currentOptions, allOptions])
  
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
    // Reset to current options when closing without saving
    const initialSelected: { [key: string]: any } = {}
    currentOptions.forEach((optionName: string) => {
      // Find the option object by name
      const option = allOptions.find((opt: any) => opt.name === optionName)
      if (option) {
        initialSelected[option._id] = option
      }
    })
    setSelectedOptions(initialSelected)
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
    const options = Object.values(selectedOptions).map((option) => option.name)
    onOptionsChange?.(itemId, options)
    setShowOptions(false)
  }

  // Check if item has any options
  const hasOptions = currentOptions && currentOptions.length > 0

  return (
    <>
      {/* Trigger Button */}
      <Button 
        size="sm" 
        variant="success"
        onClick={handleShowModal}
        className="me-1"
        title={`Item options for ${itemName}`}
      >
        <IconifyIcon icon="mdi:plus" className="me-1" />
        More Options
        {hasOptions && <span className="ms-1">({currentOptions.length})</span>}
      </Button>

      {/* Modal */}
      <Modal show={showOptions} onHide={handleCloseModal} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Item Options - {itemName}</Modal.Title>
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
            Save Options
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ItemMoreOptions
