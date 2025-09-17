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
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: { option: any; qty: number } }>({})
  
  const { data: moreOptionsData } = useGetMoreOptionsQuery()
  const allOptions = moreOptionsData ?? []
  
  // Group options by category based on their names
  const optionGroups = {
    More: allOptions.filter((opt: any) => 
      opt.name?.toLowerCase().includes('add') || 
      opt.name?.toLowerCase().includes('extra') ||
      opt.name?.toLowerCase().includes('more')
    ),
    Less: allOptions.filter((opt: any) => 
      opt.name?.toLowerCase().includes('less') || 
      opt.name?.toLowerCase().includes('low') ||
      opt.name?.toLowerCase().includes('light')
    ),
    Without: allOptions.filter((opt: any) => 
      opt.name?.toLowerCase().includes('no ') || 
      opt.name?.toLowerCase().includes('without')
    ),
    General: allOptions.filter((opt: any) => {
      const name = opt.name?.toLowerCase() || ''
      return !name.includes('add') && !name.includes('extra') && !name.includes('more') &&
             !name.includes('less') && !name.includes('low') && !name.includes('light') &&
             !name.includes('no ') && !name.includes('without')
    })
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
        // Add with quantity 1
        return {
          ...prev,
          [optId]: { option, qty: 1 }
        }
      }
    })
  }
  
  const handleQtyChange = (optId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedOptions(prev => {
        const updated = { ...prev }
        delete updated[optId]
        return updated
      })
    } else {
      setSelectedOptions(prev => ({
        ...prev,
        [optId]: { ...prev[optId], qty }
      }))
    }
  }

  const handleSave = () => {
    const options = Object.values(selectedOptions).map(({ option, qty }) => ({
      _id: option._id,
      name: option.name,
      price: option.price,
      qty
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
                    const qty = selectedOptions[optId]?.qty || 0
                    return (
                      <div key={optId} className="mb-2">
                        <div
                          onClick={() => handleSelect(option)}
                          className={`p-2 text-center rounded cursor-pointer border 
                            ${isSelected ? 'bg-success text-white' : 'bg-light'}`}
                          style={{ userSelect: 'none' }}>
                          <div>{option.name}</div>
                          {option.price > 0 && (
                            <small className={isSelected ? 'text-white' : 'text-success'}>
                              +AED {option.price}
                            </small>
                          )}
                        </div>
                        {isSelected && (
                          <div className="d-flex align-items-center justify-content-center mt-1 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline-secondary"
                              onClick={() => handleQtyChange(optId, qty - 1)}
                            >
                              -
                            </Button>
                            <span className="px-2">{qty}</span>
                            <Button 
                              size="sm" 
                              variant="outline-secondary"
                              onClick={() => handleQtyChange(optId, qty + 1)}
                            >
                              +
                            </Button>
                          </div>
                        )}
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
