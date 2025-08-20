'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

const Calculator = () => {
  const [showCalculator, setShowCalculator] = useState(false)
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<string | number>('')

  const handleShowModal = () => setShowCalculator(true)
  const handleCloseModal = () => {
    setShowCalculator(false)
    setExpression('')
    setResult('')
  }

  const handleInput = (value: string) => {
    setExpression((prev) => prev + value)
  }

  const handleClear = () => {
    setExpression('')
    setResult('')
  }

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1))
  }

  const handleCalculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const evalResult = eval(expression)
      setResult(evalResult)
    } catch (err) {
      setResult('Error')
    }
  }

  const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+']

  return (
    <>
      {/* Trigger Button */}
      <Button variant="info" size="sm" onClick={handleShowModal}>
        <IconifyIcon icon="mdi:calculator-variant-outline" className="me-1" />
        Calculator
      </Button>

      {/* Modal */}
      <Modal show={showCalculator} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Calculator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control type="text" value={expression} readOnly className="mb-2 text-end fs-4" />
          <Form.Control type="text" value={result} readOnly className="mb-3 text-end fw-bold fs-5" />

          <div className="d-grid gap-2">
            <div className="d-flex gap-2 mb-2">
              <Button variant="secondary" onClick={handleClear} className="flex-fill">
                C
              </Button>
              <Button variant="secondary" onClick={handleBackspace} className="flex-fill">
                ←
              </Button>
            </div>

            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <div className="d-flex gap-2 mb-2" key={rowIndex}>
                {buttons.slice(rowIndex * 4, rowIndex * 4 + 4).map((btn) => (
                  <Button
                    key={btn}
                    variant={btn === '=' ? 'success' : 'light'}
                    className="flex-fill"
                    onClick={() => (btn === '=' ? handleCalculate() : handleInput(btn))}>
                    {btn}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default Calculator
