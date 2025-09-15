'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import {
  FaUtensils,
  FaShoppingBag,
  FaTruck,
  FaUserPlus,
  FaIdBadge,
  FaGlobe,
  FaPrint,
  FaBan,
  FaStickyNote,
  FaSignOutAlt,
  FaMoneyBillAlt,
  FaTable,
  FaArrowDown,
  FaArrowUp,
  FaUser,
} from 'react-icons/fa'
import ReprintBillsModal from './ReprintBillsModal'
import OrderCancellationModal from './OrderCancellationModal'

interface DefaultModalProps {
  show: boolean
  onClose: () => void
}

const DefaultModal: React.FC<DefaultModalProps> = ({ show, onClose }) => {
  const router = useRouter()

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      {/* Header */}
      <Modal.Header className="bg-dark text-white py-2">
        <Modal.Title>
          <FaUtensils className="me-2" />
          Dine-In
        </Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body>
        <Row className="g-3">
          {/* Left Column */}
          <Col md={4} className="d-grid gap-2 bg-dark p-2">
            <Button className="btn-custom" size="lg">
              <FaUtensils /> Dien (restaurant menu show)
            </Button>
            <Button className="btn-custom" size="lg">
              <FaGlobe /> Takeway (restaurant menu show)
            </Button>
            <Button className="btn-custom" size="lg">
              <FaUser /> Delivery (restaurant menu show)
            </Button>
            <Button className="btn-custom" size="lg">
              <FaUser /> Online (Show Aggregate Menu)
            </Button>

            <Button className="btn-custom" size="lg">
              <FaUserPlus /> New Membership (resgiter new menu)
            </Button>
            <Button className="btn-custom" size="lg">
              <FaIdBadge /> Membership Meal
            </Button>
          </Col>

          {/* Middle Column */}
          <Col md={4} className="d-grid gap-2">
            <ReprintBillsModal />
            <OrderCancellationModal />
            {/* <Button className="btn-custom">
              <FaTruck /> Pending Delivery Bills
            </Button>
            <Button className="btn-custom">
              <FaIdBadge /> Pending Membership Bills
            </Button> */}

            <Button className="btn-custom btn-danger" onClick={() => router.push('/login')}>
              <FaSignOutAlt /> Log Off
            </Button>
          </Col>

          {/* Right Column */}
          <Col md={4} className="d-grid gap-2">
            <Button className="btn-custom">
              <FaTable /> Table Status
            </Button>
            {/* <Button className="btn-custom">
              <FaShoppingBag /> Pending Take Away Bills
            </Button>
            <Button className="btn-custom">
              <FaGlobe /> Pending Online Bills
            </Button> */}

            <Button className="btn-custom btn-danger">
              <FaArrowUp /> Pay Out
            </Button>
          </Col>
        </Row>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="justify-content-between">
        <Button className="btn-custom btn-danger" onClick={onClose}>
          <FaSignOutAlt /> Close
        </Button>
      </Modal.Footer>

      {/* Styles */}
      <style jsx>{`
        .btn-custom {
          background: linear-gradient(to bottom, #e3e3e3, #cfcfcf);
          border: 1px solid #aaa;
          font-weight: 600;
          color: #000;
          height: 50px;
          display: flex;
          align-items: center; /* vertical align */
          justify-content: center; /* icon + text centered as a group */
          gap: 8px; /* space between icon & text */
          padding: 0 12px;
          text-align: center;
          border-radius: 6px;
        }
        .btn-custom:hover {
          background: linear-gradient(to bottom, #dcdcdc, #bcbcbc);
        }
        .btn-danger {
          background: linear-gradient(to bottom, #f87171, #dc2626);
          border-color: #b91c1c;
          color: #fff;
        }
        .btn-danger:hover {
          background: linear-gradient(to bottom, #ef4444, #b91c1c);
        }
      `}</style>
    </Modal>
  )
}

export default DefaultModal
