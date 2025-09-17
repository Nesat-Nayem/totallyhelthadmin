import { baseApi } from '@/services/baseApi'

export type Customer = {
  _id: string
  name: string
  phone?: string
  email?: string
  address?: string
  status?: 'active' | 'inactive'
}

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<{ data: Customer[]; meta?: any }, { q?: string; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/customers', method: 'GET', params: params ?? {} }),
    }),
    getCustomerById: build.query<Customer, string>({
      query: (id) => ({ url: `/customers/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'Customer' as const, id }],
    }),
    createCustomer: build.mutation<Customer, Partial<Customer>>({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { useGetCustomersQuery, useLazyGetCustomersQuery, useGetCustomerByIdQuery, useCreateCustomerMutation } = customerApi
