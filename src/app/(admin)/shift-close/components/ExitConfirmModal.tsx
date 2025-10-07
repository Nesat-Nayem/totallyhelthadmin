'use client'
import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import styles from './ExitConfirmModal.module.css'

interface ExitConfirmModalProps {
  show: boolean
  onHide: () => void
  onConfirm: () => void
}

const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({ show, onHide, onConfirm }) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      className={styles.exitConfirmModal}
    >
      <Modal.Body className="p-4">
        <div className="mb-4">
          <h4 className="mb-3 fw-bold text-dark">Exit to Dashboard?</h4>
          <p className="text-muted mb-0">
            Are you sure you want to exit the shift management?<br />
            Any unsaved changes will be lost.
          </p>
        </div>
        
        <div className="d-flex justify-content-end gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm}
            className="px-4"
          >
            Exit
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ExitConfirmModal
