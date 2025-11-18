import { baseApi } from '@/services/baseApi'

export type TermsCondition = {
  _id: string
  content: string
  createdAt?: string
  updatedAt?: string
}

export type TermsConditionResponse = {
  success: boolean
  statusCode: number
  message: string
  data: TermsCondition
}

export type TermsConditionCreateRequest = {
  content: string
}

export const termsConditionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTermsCondition: builder.query<TermsConditionResponse, void>({
      query: () => ({
        url: '/terms-conditions',
        method: 'GET',
      }),
      transformResponse: (response: TermsConditionResponse) => response,
      providesTags: [{ type: 'TermsCondition', id: 'SINGLE' }],
    }),
    createOrUpdateTermsCondition: builder.mutation<TermsConditionResponse, TermsConditionCreateRequest>({
      query: (body) => ({
        url: '/terms-conditions',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: TermsConditionResponse) => response,
      invalidatesTags: [{ type: 'TermsCondition', id: 'SINGLE' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetTermsConditionQuery,
  useCreateOrUpdateTermsConditionMutation,
} = termsConditionApi

