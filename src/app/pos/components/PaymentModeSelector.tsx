import React, { useState } from 'react'
import { Form, ButtonGroup, Button } from 'react-bootstrap'

const PaymentModeSelector = () => {
  const paymentModes = ['Cash', 'Card', 'UPI', 'Wallet']
  const [selectedMode, setSelectedMode] = useState<string>('')

  return (
    <Form.Group className="mb-3 mt-4">
      <Form.Label>Payment Mode</Form.Label>
      <div>
        <div>
          {paymentModes.map((mode, idx) => (
            <Button
              key={idx}
              variant={selectedMode === mode ? 'primary' : 'outline-primary'}
              onClick={() => setSelectedMode(mode)}
              className="mx-1 btn-lg">
              {mode}
            </Button>
          ))}
        </div>
      </div>
    </Form.Group>
  )
}

export default PaymentModeSelector
