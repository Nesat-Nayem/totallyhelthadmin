'use client'

import React, { useMemo, useState } from 'react'
import { Modal, Button, Table, Badge } from 'react-bootstrap'
import ThermalReceipt from './ThermalReceipt'
import { printThermalReceipt } from '@/utils/thermalPrint'

type HistoryItem = {
  action: string
  consumedMeals?: number
  remainingMeals?: number
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
                  <th>Consumed</th>
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
                      <td>{entry.action}</td>
                      <td>{entry.mealsChanged ?? 0}</td>
                      <td>{entry.consumedMeals ?? '-'}</td>
                      <td>{entry.remainingMeals ?? '-'}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {(() => {
                            const items = (entry.mealItems && entry.mealItems.length > 0)
                              ? entry.mealItems
                              : (dayItemsMap[toKey(entry.timestamp)] || [])
                            const totalQty = items.reduce((s: number, it: any) => s + (it.qty || 0), 0)
                            return (
                              <>
                                <span>{totalQty} items</span>
                                {items.length > 0 && (
                                  <Button size="sm" variant="outline-primary" onClick={() => setExpanded((p) => ({ ...p, [idx]: !p[idx] }))}>
                                    {expanded[idx] ? 'Hide' : 'View'} Items
                                  </Button>
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
                        <td colSpan={7}>
                          <Table bordered size="sm" className="mb-0">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Meal Type</th>
                                <th>Qty</th>
                                <th>Options</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(((entry.mealItems && entry.mealItems.length > 0) ? entry.mealItems : (dayItemsMap[toKey(entry.timestamp)] || []))).map((mi, miIdx) => (
                                <tr key={miIdx}>
                                  <td>{mi.title || '-'}</td>
                                  <td><Badge bg="info" text="dark">{mi.mealType || 'general'}</Badge></td>
                                  <td>{mi.qty || 0}</td>
                                  <td>
                                    {(mi.moreOptions || []).map((o: any, oi: number) => (
                                      <Badge key={oi} bg="light" text="dark" className="me-1">{o.name}</Badge>
                                    ))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
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
      <Modal.Footer className="d-flex justify-content-between">
        <Button 
          variant="dark" 
          onClick={() => {
            // Aggregate all items from membershipData.mealItems
            const allItems: any[] = Array.isArray(membershipData?.mealItems) ? membershipData.mealItems : []
            const map: { [k: string]: { title: string; qty: number } } = {}
            allItems.forEach((it: any) => {
              const key = it.title || it.name || it.productId
              if (!map[key]) {
                map[key] = { title: key, qty: 0 }
              }
              map[key].qty += Number(it.qty || 0)
            })
            // Build daily breakdown (by local date)
            const toKey = (iso?: string) => {
              if (!iso) return ''
              const d = new Date(iso)
              const y = d.getFullYear()
              const m = String(d.getMonth() + 1).padStart(2, '0')
              const day = String(d.getDate()).padStart(2, '0')
              return `${y}-${m}-${day}`
            }
            const dayMap: { [k: string]: { times: { [t: string]: { items: { [name: string]: number }, consumed: number } }, consumed: number } } = {}
            const toTime = (iso?: string) => {
              if (!iso) return ''
              const d = new Date(iso)
              const hh = String(d.getHours()).padStart(2, '0')
              const mm = String(d.getMinutes()).padStart(2, '0')
              return `${hh}:${mm}`
            }
            allItems.forEach((it: any) => {
              const dk = toKey(it.punchingTime)
              const tk = toTime(it.punchingTime)
              if (!dayMap[dk]) dayMap[dk] = { times: {}, consumed: 0 }
              if (!dayMap[dk].times[tk]) dayMap[dk].times[tk] = { items: {}, consumed: 0 }
              const title = it.title || it.name || it.productId
              dayMap[dk].times[tk].items[title] = (dayMap[dk].times[tk].items[title] || 0) + Number(it.qty || 0)
              dayMap[dk].times[tk].consumed += Number(it.qty || 0)
              dayMap[dk].consumed += Number(it.qty || 0)
            })
            const dailyBreakdown = Object.entries(dayMap)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, val]) => ({
                dateKey,
                times: Object.entries(val.times)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([timeKey, tval]) => ({
                    timeKey,
                    consumed: tval.consumed,
                    items: Object.entries(tval.items).map(([title, qty]) => ({ title, qty }))
                  })),
                consumed: val.consumed
              }))
            const selectedProducts: any = {}
            Object.values(map).forEach((it: any, idx: number) => {
              selectedProducts[`a_${idx}`] = { title: it.title, qty: it.qty, price: 0 }
            })
            const mealsToConsume = Object.values(map).reduce((s: number, it: any) => s + (it.qty || 0), 0)
            const orderData = {
              selectedProducts,
              itemOptions: {},
              subTotal: 0,
              totalAmount: 0,
              orderNo: undefined,
              membershipData,
              mealsToConsume,
              selectedOrderType: 'MembershipMeal',
              invoiceNo: `MEM-ALL-${Date.now()}`,
              dailyBreakdown
            }
            setDayOrderData(orderData)
            setShowThermalOptions(true)
          }}
        >
          Print Full History
        </Button>
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


