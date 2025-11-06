import { baseApi } from '@/services/baseApi'

export type CounterPage = {
  _id?: string
  totalReviews: number
  totalMealItems: number
  happyClients: number
  yearsHelpingPeople: number
  createdAt?: string
  updatedAt?: string
}

export type CounterPageResponse = {
  success: boolean
  statusCode: number
  message: string
  data: CounterPage
}

export type CounterPageRequest = {
  totalReviews: number
  totalMealItems: number
  happyClients: number
  yearsHelpingPeople: number
}

export const counterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCounterPage: builder.query<CounterPageResponse, void>({
      query: () => ({
        url: '/counter-page',
        method: 'GET',
      }),
      transformResponse: (response: CounterPageResponse) => response,
    }),
    upsertCounterPage: builder.mutation<CounterPageResponse, CounterPageRequest>({
      query: (body) => ({
        url: '/counter-page',
        method: 'POST',
        body,
      }),
      transformResponse: (response: CounterPageResponse) => response,
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetCounterPageQuery,
  useLazyGetCounterPageQuery,
  useUpsertCounterPageMutation,
} = counterApi

