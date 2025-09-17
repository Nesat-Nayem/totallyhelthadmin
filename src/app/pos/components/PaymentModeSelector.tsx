import React from 'react'
import { Form, Button } from 'react-bootstrap'

type Props = {
  selectedMode?: string
  onModeChange?: (mode: string) => void
  paymentMethods?: any[]
}

const PaymentModeSelector: React.FC<Props> = ({ selectedMode, onModeChange, paymentMethods = [] }) => {
  // Use backend payment methods or fallback to defaults
  const paymentModes = paymentMethods.length > 0 
    ? paymentMethods.map(pm => pm.name)
    : ['Cash', 'Card', 'UPI', 'Wallet']

  return (
    <Form.Group className="mb-3 mt-4">
      <Form.Label>Payment Mode</Form.Label>
      <div>
        <div>
          {paymentModes.map((mode, idx) => (
            <Button
              key={idx}
              variant={selectedMode === mode ? 'primary' : 'outline-primary'}
              onClick={() => onModeChange && onModeChange(mode)}
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
