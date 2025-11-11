'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Col,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap'
import { useGetCreditExpensesQuery, useDeleteExpenseMutation } from '@/services/expenseApi'
import Swal from 'sweetalert2'
import { showSuccess, showError } from '@/utils/sweetAlert'
import { useRouter } from 'next/navigation'

const CreditExpenseList = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  // Build query params - only include defined values
  // If no month is selected, don't filter by year either to get all data
  const queryParams: { month?: number; year?: number } = {}
  if (selectedMonth !== undefined) {
    queryParams.month = selectedMonth
    if (selectedYear !== undefined) {
      queryParams.year = selectedYear
    }
  }
  const { data: expensesRes, isLoading, error, refetch } = useGetCreditExpensesQuery(
    Object.keys(queryParams).length > 0 ? queryParams : undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  )

  const [deleteExpense] = useDeleteExpenseMutation()

  // Debug logging
  React.useEffect(() => {
    console.log('Credit Expenses Query Params:', queryParams)
    console.log('Credit Expenses Data:', expensesRes)
    console.log('Credit Expenses Error:', error)
    console.log('Credit Expenses Loading:', isLoading)
  }, [expensesRes, error, isLoading, queryParams])

  const expenses = useMemo(() => {
    const data = expensesRes?.data || []
    console.log('Credit expenses array:', data)
    console.log('Credit expenses count:', data.length)
    return data
  }, [expensesRes])

  const filteredExpenses = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return expenses
    return expenses.filter((e: any) =>
      e.invoiceId?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      (typeof e.expenseType === 'object' ? e.expenseType?.name?.toLowerCase().includes(q) : false) ||
      (typeof e.supplier === 'object' ? e.supplier?.name?.toLowerCase().includes(q) : false)
    )
  }, [expenses, query])

  const handleDelete = async (id: string, invoiceId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete expense "${invoiceId || id}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })
    
    if (result.isConfirmed) {
      try {
        await deleteExpense(id).unwrap()
        showSuccess('Expense has been deleted.')
        refetch()
      } catch (error: any) {
        showError(error?.data?.message || 'Failed to delete expense.')
      }
    }
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    try {
      return new Date(date).toLocaleDateString()
    } catch {
      return '-'
    }
  }

  const formatCurrency = (amount: number) => {
    return `AED ${(amount || 0).toFixed(2)}`
  }

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <CardTitle as="h4" className="mb-0 flex-grow-1">
              Credit Expense List
            </CardTitle>

            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button variant="outline-secondary">
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>

            <Link href="/expenses/add-expense?paymentMethod=Credit" className="btn btn-lg btn-primary">
              + Add Credit Expense
            </Link>
          </CardHeader>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3">
            <select 
              style={{ maxWidth: '200px' }} 
              className="form-select form-select-sm p-1"
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select 
              style={{ maxWidth: '200px' }} 
              className="form-select form-select-sm p-1"
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Invoice ID</th>
                    <th>Invoice Date</th>
                    <th>Expense Type</th>
                    <th>Description</th>
                    <th>Supplier</th>
                    <th>Payment Reference</th>
                    <th>Base Amount</th>
                    <th>Grand Total</th>
                    <th>Approved By</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={11} className="text-center py-4">Loading...</td>
                    </tr>
                  )}
                  {!isLoading && !error && filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-4">No credit expenses found</td>
                    </tr>
                  )}
                  {error && (
                    <tr>
                      <td colSpan={11} className="text-center py-4 text-danger">
                        Error loading expenses: {(error as any)?.data?.message || (error as any)?.message || 'Unknown error'}
                      </td>
                    </tr>
                  )}
                  {!isLoading && filteredExpenses.map((expense: any) => (
                    <tr key={expense._id}>
                      <td>{expense.invoiceId || '-'}</td>
                      <td>{formatDate(expense.invoiceDate)}</td>
                      <td>{typeof expense.expenseType === 'object' ? expense.expenseType?.name : '-'}</td>
                      <td>{expense.description || '-'}</td>
                      <td>{typeof expense.supplier === 'object' ? expense.supplier?.name : '-'}</td>
                      <td>{expense.paymentReferenceNo || expense.paymentReference || '-'}</td>
                      <td>{formatCurrency(expense.baseAmount)}</td>
                      <td>{formatCurrency(expense.grandTotal)}</td>
                      <td>{typeof expense.approvedBy === 'object' ? expense.approvedBy?.name : '-'}</td>
                      <td>{expense.notes || '-'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/expenses/expenses-edit/${expense._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            onClick={() => handleDelete(expense._id, expense.invoiceId)}
                          >
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  )
}

export default CreditExpenseList
