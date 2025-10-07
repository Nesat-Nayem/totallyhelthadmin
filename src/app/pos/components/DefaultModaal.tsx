'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Modal, Button, Row, Col, Spinner } from 'react-bootstrap'
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
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setOrderType, hideOrderTypeModal, setLoading, OrderType, PriceType } from '@/store/slices/posSlice'
import ReprintBillsModal from './ReprintBillsModal'
import OrderCancellationModal from './OrderCancellationModal'

interface DefaultModalProps {
  show: boolean
  onClose: () => void
}

const DefaultModal: React.FC<DefaultModalProps> = ({ show, onClose }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isLoading, selectedOrderType } = useSelector((state: RootState) => state.pos)

  const handleOrderTypeSelect = async (orderType: OrderType, priceType: PriceType) => {
    dispatch(setLoading(true))
    
    // Simulate loading for better UX
    setTimeout(() => {
      dispatch(setOrderType({ orderType, priceType }))
      dispatch(setLoading(false))
      onClose()
    }, 500)
  }

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
        {isLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading menu...</p>
          </div>
        )}
        
        {!isLoading && (
          <Row className="g-3">
            {/* Left Column - Order Types */}
            <Col md={4} className="d-grid gap-2 bg-dark p-3 rounded">
              <h5 className="text-white text-center mb-3">Select Order Type</h5>
              
              <Button 
                className="btn-custom" 
                size="lg"
                onClick={() => handleOrderTypeSelect('DineIn', 'restaurant')}
                disabled={isLoading}
              >
                <FaUtensils /> Dine-In
                <small className="d-block">Restaurant Menu</small>
              </Button>
              
              <Button 
                className="btn-custom" 
                size="lg"
                onClick={() => handleOrderTypeSelect('TakeAway', 'restaurant')}
                disabled={isLoading}
              >
                <FaShoppingBag /> Takeaway
                <small className="d-block">Restaurant Menu</small>
              </Button>
              
              <Button 
                className="btn-custom" 
                size="lg"
                onClick={() => handleOrderTypeSelect('Delivery', 'restaurant')}
                disabled={isLoading}
              >
                <FaTruck /> Delivery
                <small className="d-block">Restaurant Menu</small>
              </Button>
              
              <Button 
                className="btn-custom" 
                size="lg"
                onClick={() => handleOrderTypeSelect('online', 'online')}
                disabled={isLoading}
              >
                <FaGlobe /> Online
                <small className="d-block">Online Menu</small>
              </Button>

              <Button 
                className="btn-custom" 
                size="lg"
                onClick={() => handleOrderTypeSelect('membership', 'membership')}
                disabled={isLoading}
              >
                <FaUserPlus /> New Membership
                <small className="d-block">Membership Menu</small>
              </Button>
              
              <Button 
                className="btn-custom" 
                size="lg"
                onClick={() => handleOrderTypeSelect('membership', 'membership')}
                disabled={isLoading}
              >
                <FaIdBadge /> Membership Meal
                <small className="d-block">Membership Menu</small>
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
        )}
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
