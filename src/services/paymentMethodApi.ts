import { baseApi } from '@/services/baseApi'

export type PaymentMethod = { _id: string; name: string; status: 'active' | 'inactive' }
export type CreatePaymentMethodDto = { name: string; status?: 'active' | 'inactive' }
export type UpdatePaymentMethodDto = Partial<CreatePaymentMethodDto>

export const paymentMethodApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPaymentMethods: build.query<PaymentMethod[], void>({
      query: () => ({ url: '/payment-methods', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'PaymentMethod' as const, id: _id })),
              { type: 'PaymentMethod' as const, id: 'LIST' },
            ]
          : [{ type: 'PaymentMethod', id: 'LIST' }],
    }),
    getPaymentMethodById: build.query<PaymentMethod, string>({
      query: (id) => ({ url: `/payment-methods/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_res, _err, id) => [{ type: 'PaymentMethod', id }],
    }),
    createPaymentMethod: build.mutation<PaymentMethod, CreatePaymentMethodDto>({
      query: (body) => ({ url: '/payment-methods', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'PaymentMethod', id: 'LIST' }],
    }),
    updatePaymentMethod: build.mutation<PaymentMethod, { id: string; data: UpdatePaymentMethodDto }>({
      query: ({ id, data }) => ({ url: `/payment-methods/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'PaymentMethod', id },
        { type: 'PaymentMethod', id: 'LIST' },
      ],
    }),
    deletePaymentMethod: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/payment-methods/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: res?.message ? true : !!res?.success }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'PaymentMethod', id },
        { type: 'PaymentMethod', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetPaymentMethodsQuery,
  useGetPaymentMethodByIdQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
} = paymentMethodApi
