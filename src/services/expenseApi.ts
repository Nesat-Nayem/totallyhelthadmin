import { baseApi } from '@/services/baseApi'

export type Expense = {
  _id: string
  invoiceId?: string
  invoiceDate: string
  expenseType: string | { _id: string; name: string }
  description: string
  supplier: string | { _id: string; name: string }
  paymentMethod: string
  paymentReference?: string
  paymentReferenceNo?: string
  baseAmount: number
  taxPercent?: number
  taxAmount?: number
  vatPercent?: number
  vatAmount?: number
  grandTotal: number
  approvedBy: string | { _id: string; name: string }
  status?: 'active' | 'inactive'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface ExpenseResponse {
  data: Expense[]
  message?: string
  meta?: any
}

export interface ExpenseSingleResponse {
  data: Expense
  message?: string
}

export interface CreateExpenseRequest {
  invoiceId?: string
  invoiceDate: string
  expenseType: string
  description?: string
  supplier: string
  paymentMethod: string
  paymentReferenceNo?: string
  baseAmount: number
  taxPercent?: number
  taxAmount?: number
  vatPercent?: number
  vatAmount?: number
  grandTotal: number
  approvedBy: string
  status?: 'active' | 'inactive'
  notes?: string
}

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<ExpenseResponse, { page?: number; limit?: number; search?: string; paymentMethod?: string; month?: number; year?: number } | void>({
      query: (params) => ({ url: '/expenses', method: 'GET', params: params ?? {} }),
      transformResponse: (res: any) => res,
      providesTags: ['Expense'],
    }),
    getCashExpenses: build.query<ExpenseResponse, { month?: number; year?: number } | void>({
      query: (params) => ({ url: '/expenses/cash', method: 'GET', params: params ?? {} }),
      transformResponse: (res: any) => res,
      providesTags: ['Expense'],
    }),
    getCreditExpenses: build.query<ExpenseResponse, { month?: number; year?: number } | void>({
      query: (params) => ({ url: '/expenses/credit', method: 'GET', params: params ?? {} }),
      transformResponse: (res: any) => res,
      providesTags: ['Expense'],
    }),
    getExpenseById: build.query<ExpenseSingleResponse, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res,
      providesTags: (_r, _e, id) => [{ type: 'Expense' as const, id }],
    }),
    createExpense: build.mutation<ExpenseSingleResponse, CreateExpenseRequest>({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      transformResponse: (res: any) => res,
      invalidatesTags: ['Expense'],
    }),
    updateExpense: build.mutation<ExpenseSingleResponse, { id: string; data: Partial<CreateExpenseRequest> }>({
      query: ({ id, data }) => ({ url: `/expenses/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Expense', id }, 'Expense'],
    }),
    deleteExpense: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Expense'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetExpensesQuery,
  useLazyGetExpensesQuery,
  useGetCashExpensesQuery,
  useGetCreditExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi

