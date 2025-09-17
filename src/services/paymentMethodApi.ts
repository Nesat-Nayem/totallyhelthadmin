import { baseApi } from '@/services/baseApi'

export type PaymentMethod = { _id: string; name: string; status: 'active' | 'inactive' }

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
  }),
  overrideExisting: true,
})

export const { useGetPaymentMethodsQuery } = paymentMethodApi
