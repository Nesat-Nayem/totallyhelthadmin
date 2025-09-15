'use client'
import LogoBox from '@/components/LogoBox'
import React from 'react'
import { Modal, Button, Table } from 'react-bootstrap'
import { FaUtensils, FaSignOutAlt, FaReceipt } from 'react-icons/fa'

interface ReportData {
  date: string
  time: string
  cashier: string
  logInDate: string
  logInTime: string
  logOutDate: string
  logOutTime: string
  totalInvoice: number
  totalDiscount: number
  netSales: number
  vat: number
  grandTotal: number
  sales: {
    restaurant: number
    membershipMeal: number
    membershipRegister: number
  }
  collections: {
    cash: number
    card: number
    online: number
    total: number
  }
}

interface ReportModalProps {
  show: boolean
  onClose: () => void
  data?: ReportData
}

const ReportModal: React.FC<ReportModalProps> = ({ show, onClose, data }) => {
  const report = data || {
    date: '10 sept 2025',
    time: '11:51 pm',
    cashier: 'CASH',
    logInDate: '10-Sep-2025',
    logInTime: '10:00 AM',
    logOutDate: '10-Sep-2025',
    logOutTime: '07:00 PM',
    totalInvoice: 2885.43,
    totalDiscount: 462.2,
    netSales: 2423.23,
    vat: 121.2,
    grandTotal: 2544.43,
    sales: {
      restaurant: 2544.43,
      membershipMeal: 2457.87,
      membershipRegister: 1099.0,
    },
    collections: {
      cash: 1006.96,
      card: 799.38,
      online: 738.13,
      total: 2544.47,
    },
  }

  return (
    <Modal show={show} onHide={onClose} size="md" centered>
      {/* Header */}
      <Modal.Header className="bg-dark text-white py-2">
        <Modal.Title>
          <FaReceipt className="me-2" />
          10 Sept 2025 Report
        </Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body>
        <div className="report-container text-center">
          <LogoBox />
          <p className="mb-3">Sharjah</p>
        </div>

        {/* Info Table */}
        <Table bordered size="sm">
          <tbody>
            <tr>
              <td>
                <strong>Date</strong>
              </td>
              <td>{report.date}</td>
              <td>
                <strong>Time</strong>
              </td>
              <td>{report.time}</td>
            </tr>
            <tr>
              <td colSpan={4} className="text-center">
                Shift Report
              </td>
            </tr>
            <tr>
              <td>
                <strong>Cashier</strong>
              </td>
              <td colSpan={3}>{report.cashier}</td>
            </tr>
            <tr>
              <td>
                <strong>Log In Date</strong>
              </td>
              <td>{report.logInDate}</td>
              <td>
                <strong>Log In Time</strong>
              </td>
              <td>{report.logInTime}</td>
            </tr>
            <tr>
              <td>
                <strong>Log Out Date</strong>
              </td>
              <td>{report.logOutDate}</td>
              <td>
                <strong>Log Out Time</strong>
              </td>
              <td>{report.logOutTime}</td>
            </tr>
          </tbody>
        </Table>

        {/* Totals Table */}
        <Table bordered size="sm">
          <tbody>
            <tr>
              <td>
                <strong>Total Invoice Amount</strong>
              </td>
              <td>{report.totalInvoice.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Total Discount Amount</strong>
              </td>
              <td>{report.totalDiscount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Net Sales Amount</strong>
              </td>
              <td>{report.netSales.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>5% VAT Amount</strong>
              </td>
              <td>{report.vat.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Grand Total</strong>
              </td>
              <td>
                <strong>{report.grandTotal.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </Table>

        {/* Sales Details */}
        <h6>Sales Details</h6>
        <Table bordered size="sm">
          <tbody>
            <tr>
              <td>Restaurant Sales</td>
              <td>{report.sales.restaurant.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Membership Meal</td>
              <td>{report.sales.membershipMeal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Membership Register</td>
              <td>{report.sales.membershipRegister.toFixed(2)}</td>
            </tr>
          </tbody>
        </Table>

        {/* Collection Details */}
        <h6>Collection Details</h6>
        <Table bordered size="sm">
          <tbody>
            <tr>
              <td>Cash Sales Amt</td>
              <td>{report.collections.cash.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Credit Card Amt</td>
              <td>{report.collections.card.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Online Sales Amt</td>
              <td>{report.collections.online.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Total Collection</strong>
              </td>
              <td>
                <strong>{report.collections.total.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </Table>

        {/* denomination Details */}
        <h6>Denomination Details</h6>
        <Table bordered size="sm">
          <tbody>
            <tr>
              <td>1000 Dirham </td>
              <td>*</td>
              <td>1</td>
              <td>=</td>
              <td>1000</td>
            </tr>
            <tr>
              <td>500 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
            <tr>
              <td>200 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
            <tr>
              <td>100 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
            <tr>
              <td>50 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
            <tr>
              <td>20 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
            <tr>
              <td>10 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
            <tr>
              <td>5 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
            <tr>
              <td>1 Dirham </td>
              <td>*</td>
              <td></td>
              <td>=</td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="justify-content-between">
        <Button className="btn btn-danger" onClick={onClose}>
          <FaSignOutAlt /> Close
        </Button>
      </Modal.Footer>

      {/* Styles */}
      <style jsx>{`
        .report-container {
          font-size: 14px;
          line-height: 1.6;
        }
        h6 {
          margin-top: 15px;
          font-weight: 600;
        }
        table {
          font-size: 13px;
        }
      `}</style>
    </Modal>
  )
}

export default ReportModal
