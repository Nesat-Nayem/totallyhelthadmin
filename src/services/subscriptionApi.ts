import { baseApi } from '@/services/baseApi'

export type Subscription = {
  _id: string
  fullName: string
  email: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type SubscriptionResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Subscription[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type SingleSubscriptionResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Subscription
}

export type SubscriptionCreateRequest = {
  fullName: string
  email: string
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query<SubscriptionResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/subscriptions',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: SubscriptionResponse) => response,
      providesTags: [{ type: 'Subscription', id: 'LIST' }],
    }),
    getSubscriptionById: builder.query<SingleSubscriptionResponse, string>({
      query: (id) => ({
        url: `/subscriptions/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: SingleSubscriptionResponse) => response,
      providesTags: (result, error, id) => [{ type: 'Subscription', id }],
    }),
    deleteSubscription: builder.mutation<{ success: boolean; statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useDeleteSubscriptionMutation,
} = subscriptionApi

