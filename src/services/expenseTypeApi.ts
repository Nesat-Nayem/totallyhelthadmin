import { baseApi } from '@/services/baseApi'

export type ExpenseType = {
  _id: string
  name: string
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface ExpenseTypeResponse {
  data: ExpenseType[]
  message?: string
}

export interface ExpenseTypeSingleResponse {
  data: ExpenseType
  message?: string
}

export const expenseTypeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenseTypes: build.query<ExpenseTypeResponse, void>({
      query: () => ({ url: '/expenses/expense-types', method: 'GET' }),
      transformResponse: (res: any) => res,
      providesTags: ['ExpenseType'],
    }),
    getExpenseTypeById: build.query<ExpenseTypeSingleResponse, string>({
      query: (id) => ({ url: `/expenses/expense-types/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res,
      providesTags: (_r, _e, id) => [{ type: 'ExpenseType' as const, id }],
    }),
    createExpenseType: build.mutation<ExpenseTypeSingleResponse, { name: string; status?: 'active' | 'inactive' }>({
      query: (body) => ({ url: '/expenses/expense-types', method: 'POST', body }),
      transformResponse: (res: any) => res,
      invalidatesTags: ['ExpenseType'],
    }),
    updateExpenseType: build.mutation<ExpenseTypeSingleResponse, { id: string; data: Partial<{ name: string; status: 'active' | 'inactive' }> }>({
      query: ({ id, data }) => ({ url: `/expenses/expense-types/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ExpenseType', id }, 'ExpenseType'],
    }),
    deleteExpenseType: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/expenses/expense-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ExpenseType'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetExpenseTypesQuery,
  useLazyGetExpenseTypesQuery,
  useGetExpenseTypeByIdQuery,
  useCreateExpenseTypeMutation,
  useUpdateExpenseTypeMutation,
  useDeleteExpenseTypeMutation,
} = expenseTypeApi

