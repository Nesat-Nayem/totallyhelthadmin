'use client'

import React, { useMemo, useState } from 'react'
import { Modal, Button, Table, Badge } from 'react-bootstrap'
import ThermalReceipt from './ThermalReceipt'
import { printThermalReceipt } from '@/utils/thermalPrint'

type HistoryItem = {
  action: string
  consumedMeals?: number
  remainingMeals?: number
  currentConsumed?: number
  mealsChanged?: number
  mealType?: string
  timestamp?: string
  notes?: string
  mealItems?: Array<{ title?: string; qty?: number; mealType?: string; moreOptions?: Array<{ name: string }> }>
}

interface MembershipHistoryModalProps {
  show: boolean
  onHide: () => void
  membershipData: any
}

const formatDateTime = (iso?: string) => {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  } catch {
    return iso
  }
}

const printDay = (entry: HistoryItem, userName?: string, fallbackItems?: any[]) => {
  const win = window.open('', '_blank')
  if (!win) return
  const srcItems = (entry.mealItems && entry.mealItems.length > 0) ? entry.mealItems : (fallbackItems || [])
  const rows = (srcItems).map((i: any) => `<tr><td>${i.title || ''}</td><td>${i.mealType || '-'}</td><td style=\"text-align:right\">${i.qty || 0}</td></tr>`).join('')
  win.document.write(`
    <html><head><title>Membership Day</title>
      <style>
        body{font-family: Arial, sans-serif; padding:16px}
        h2{margin:0 0 8px 0}
        table{width:100%; border-collapse:collapse; margin-top:8px}
        td,th{border:1px solid #ddd; padding:6px}
      </style>
    </head>
    <body>
      <h2>Membership - Daily Consumption</h2>
      <div><strong>Member:</strong> ${userName || 'N/A'}</div>
      <div><strong>Date/Time:</strong> ${formatDateTime(entry.timestamp)}</div>
      <div><strong>Meals Changed:</strong> ${entry.mealsChanged ?? 0}</div>
      <div><strong>Consumed:</strong> ${entry.consumedMeals ?? 0}</div>
      <div><strong>Remaining:</strong> ${entry.remainingMeals ?? 0}</div>
      <hr/>
      <table>
        <thead><tr><th>Item</th><th>Meal Type</th><th style="text-align:right">Qty</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

const MembershipHistoryModal: React.FC<MembershipHistoryModalProps> = ({ show, onHide, membershipData }) => {
  const history: HistoryItem[] = useMemo(() => {
    const h = membershipData?.history || []
    return [...h].sort((a: any, b: any) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime())
  }, [membershipData])

  const totals = useMemo(() => {
    let consumed = membershipData?.consumedMeals || 0
    let remaining = membershipData?.remainingMeals || 0
    return { consumed, remaining, total: membershipData?.totalMeals || 0 }
  }, [membershipData])

  const userName = typeof membershipData?.userId === 'object' ? membershipData?.userId?.name : undefined

  // Helper to build a YYYY-MM-DD key in local time
  const toKey = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Group membership mealItems by day so we can attach items to history rows
  const dayItemsMap: { [k: string]: any[] } = useMemo(() => {
    const map: { [k: string]: any[] } = {}
    const items: any[] = membershipData?.mealItems || []
    items.forEach((it) => {
      const k = toKey(it.punchingTime)
      if (!map[k]) map[k] = []
      map[k].push({
        title: it.title,
        qty: it.qty,
        mealType: it.mealType,
        moreOptions: it.moreOptions || []
      })
    })
    return map
  }, [membershipData])

  const [expanded, setExpanded] = useState<{ [k: number]: boolean }>({})
  const [showThermalOptions, setShowThermalOptions] = useState(false)
  const [dayOrderData, setDayOrderData] = useState<any>(null)

  return (
    <>
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="mb-0">Membership History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-3 flex-wrap mb-3">
          <Badge bg="primary">Total Meals: {totals.total}</Badge>
          <Badge bg="success">Consumed: {totals.consumed}</Badge>
          <Badge bg="warning" text="dark">Remaining: {totals.remaining}</Badge>
          {userName && <Badge bg="dark">Member: {userName}</Badge>}
        </div>
        {history.length === 0 ? (
          <div className="text-center text-muted">No history available</div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Table bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th>Date/Time</th>
                  <th>Action</th>
                  <th>Meals +/-</th>
                  <th>Current Consumed</th>
                  <th>Total Consumed</th>
                  <th>Remaining</th>
                  <th>Items</th>
                  <th>Print</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <>
                    <tr key={`row-${idx}`}>
                      <td>{formatDateTime(entry.timestamp)}</td>
                      <td>
                        <Badge bg={entry.action === 'consumed' ? 'primary' : entry.action === 'created' ? 'success' : 'secondary'}>
                          {entry.action}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={entry.mealsChanged && entry.mealsChanged > 0 ? 'success' : entry.mealsChanged && entry.mealsChanged < 0 ? 'danger' : 'secondary'}>
                          {entry.mealsChanged && entry.mealsChanged > 0 ? '+' : ''}{entry.mealsChanged ?? 0}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info" text="dark" style={{ fontSize: '12px', fontWeight: '600' }}>
                          {entry.currentConsumed !== undefined && entry.currentConsumed !== null ? entry.currentConsumed : '-'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="warning" text="dark" style={{ fontSize: '12px', fontWeight: '600' }}>
                          {entry.consumedMeals ?? '-'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="success" style={{ fontSize: '12px', fontWeight: '600' }}>
                          {entry.remainingMeals ?? '-'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          {(() => {
                            const items = (entry.mealItems && entry.mealItems.length > 0)
                              ? entry.mealItems
                              : (dayItemsMap[toKey(entry.timestamp)] || [])
                            const totalQty = items.reduce((s: number, it: any) => s + (it.qty || 0), 0)
                            
                            // Group items by meal type for better display
                            const groupedByMealType: { [key: string]: any[] } = {}
                            items.forEach((it: any) => {
                              const mealType = it.mealType || 'general'
                              if (!groupedByMealType[mealType]) {
                                groupedByMealType[mealType] = []
                              }
                              groupedByMealType[mealType].push(it)
                            })
                            
                            const mealTypeLabels: { [key: string]: string } = {
                              breakfast: 'Breakfast',
                              lunch: 'Lunch',
                              snacks: 'Snacks',
                              dinner: 'Dinner',
                              general: 'General'
                            }
                            
                            return (
                              <>
                                <div className="d-flex align-items-center gap-2">
                                  <span><strong>{totalQty}</strong> items</span>
                                  {items.length > 0 && (
                                    <Button size="sm" variant="outline-primary" onClick={() => setExpanded((p) => ({ ...p, [idx]: !p[idx] }))}>
                                      {expanded[idx] ? 'Hide' : 'View'} Details
                                    </Button>
                                  )}
                                </div>
                                {/* Show consumed items grouped by meal type - Always visible */}
                                {items.length > 0 && (
                                  <div className="mt-2">
                                    {Object.entries(groupedByMealType).map(([mealType, mealItems]) => (
                                      <div key={mealType} className="mb-2" style={{ 
                                        padding: '10px', 
                                        backgroundColor: mealType === 'breakfast' ? '#fff3cd' : 
                                                        mealType === 'lunch' ? '#d1ecf1' : 
                                                        mealType === 'snacks' ? '#f8d7da' : 
                                                        mealType === 'dinner' ? '#d4edda' : '#e7f5ff', 
                                        borderRadius: '6px',
                                        border: '2px solid #28a745',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }}>
                                        <div className="d-flex align-items-center mb-2">
                                          <Badge bg="primary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                                            {mealTypeLabels[mealType] || mealType}
                                          </Badge>
                                          <span className="ms-2" style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>
                                            ({mealItems.length} item{mealItems.length !== 1 ? 's' : ''})
                                          </span>
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                          {mealItems.map((item: any, itemIdx: number) => (
                                            <div
                                              key={itemIdx}
                                              style={{
                                                backgroundColor: '#ffffff',
                                                border: '2px solid #28a745',
                                                borderRadius: '4px',
                                                padding: '6px 10px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#28a745',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                              }}
                                            >
                                              {item.title || 'N/A'} <Badge bg="success" style={{ fontSize: '10px', marginLeft: '4px' }}>{item.qty || 0}</Badge>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {items.length === 0 && (
                                  <div className="text-muted" style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '8px' }}>
                                    No meal items
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-dark" 
                          onClick={() => {
                            const items = (entry.mealItems && entry.mealItems.length > 0) 
                              ? entry.mealItems 
                              : (dayItemsMap[toKey(entry.timestamp)] || [])
                            const selectedProducts: any = {}
                            items.forEach((it: any, idx: number) => {
                              selectedProducts[`d_${idx}`] = {
                                title: it.title,
                                qty: it.qty || 1,
                                price: 0,
                                mealType: it.mealType || 'general'
                              }
                            })
                            const mealsToConsume = items.reduce((s: number, it: any) => s + (it.qty || 0), 0)
                            const subTotal = 0
                            const orderData = {
                              selectedProducts,
                              itemOptions: {},
                              subTotal,
                              totalAmount: subTotal,
                              orderNo: undefined,
                              membershipData,
                              mealsToConsume,
                              selectedOrderType: 'MembershipMeal',
                              invoiceNo: `MEM-${Date.now()}`
                            }
                            setDayOrderData(orderData)
                            setShowThermalOptions(true)
                          }}
                        >
                          Print Day
                        </Button>
                      </td>
                    </tr>
                    {expanded[idx] && (
                      <tr key={`expand-${idx}`}>
                        <td colSpan={8} style={{ backgroundColor: '#f8f9fa', padding: '16px' }}>
                          {(() => {
                            const items = (entry.mealItems && entry.mealItems.length > 0)
                              ? entry.mealItems
                              : (dayItemsMap[toKey(entry.timestamp)] || [])
                            
                            // Group items by meal type
                            const groupedByMealType: { [key: string]: any[] } = {}
                            items.forEach((it: any) => {
                              const mealType = it.mealType || 'general'
                              if (!groupedByMealType[mealType]) {
                                groupedByMealType[mealType] = []
                              }
                              groupedByMealType[mealType].push(it)
                            })
                            
                            const mealTypeLabels: { [key: string]: string } = {
                              breakfast: 'Breakfast',
                              lunch: 'Lunch',
                              snacks: 'Snacks',
                              dinner: 'Dinner',
                              general: 'General'
                            }
                            
                            const mealTypeColors: { [key: string]: string } = {
                              breakfast: '#fff3cd',
                              lunch: '#d1ecf1',
                              snacks: '#f8d7da',
                              dinner: '#d4edda',
                              general: '#e2e3e5'
                            }
                            
                            return (
                              <div>
                                <h6 className="mb-3" style={{ color: '#495057' }}>
                                  <i className="ri-restaurant-line me-2"></i>
                                  Consumed Meal Items
                                </h6>
                                {Object.entries(groupedByMealType).map(([mealType, mealItems]) => (
                                  <div 
                                    key={mealType} 
                                    className="mb-3 p-3 rounded"
                                    style={{ 
                                      backgroundColor: mealTypeColors[mealType] || '#f8f9fa',
                                      border: '2px solid #dee2e6'
                                    }}
                                  >
                                    <div className="d-flex align-items-center mb-2">
                                      <Badge 
                                        bg="primary" 
                                        style={{ fontSize: '13px', padding: '6px 12px' }}
                                      >
                                        {mealTypeLabels[mealType] || mealType}
                                      </Badge>
                                      <span className="ms-2 text-muted">
                                        ({mealItems.length} item{mealItems.length !== 1 ? 's' : ''}, 
                                        Qty: {mealItems.reduce((sum, it) => sum + (it.qty || 0), 0)})
                                      </span>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                      {mealItems.map((item: any, itemIdx: number) => (
                                        <div
                                          key={itemIdx}
                                          className="p-2 rounded"
                                          style={{
                                            backgroundColor: '#ffffff',
                                            border: '2px solid #28a745',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            minWidth: '150px'
                                          }}
                                        >
                                          <div style={{ fontWeight: '600', color: '#28a745', marginBottom: '4px' }}>
                                            {item.title || 'N/A'}
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <Badge bg="success" style={{ fontSize: '11px' }}>
                                              Qty: {item.qty || 0}
                                            </Badge>
                                            {(item.moreOptions || []).length > 0 && (
                                              <div className="ms-2">
                                                {(item.moreOptions || []).map((o: any, oi: number) => (
                                                  <Badge key={oi} bg="secondary" className="me-1" style={{ fontSize: '10px' }}>
                                                    {o.name}
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                {items.length === 0 && (
                                  <div className="text-center text-muted py-3">
                                    No meal items found for this entry
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
    {dayOrderData && (
      <div style={{ display: 'none' }}>
        <ThermalReceipt orderData={dayOrderData} receiptType="customer" />
        <ThermalReceipt orderData={dayOrderData} receiptType="kitchen" />
      </div>
    )}
    <Modal show={showThermalOptions} onHide={() => setShowThermalOptions(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Download Thermal Receipts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-grid gap-2">
          <Button variant="success" onClick={() => { printThermalReceipt('customer'); setShowThermalOptions(false) }}>Download Customer Receipt</Button>
          <Button variant="warning" onClick={() => { printThermalReceipt('kitchen'); setShowThermalOptions(false) }}>Download Kitchen Receipt</Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowThermalOptions(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
    </>
  )
}

export default MembershipHistoryModal


