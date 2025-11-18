import { baseApi } from '@/services/baseApi'

export type PrivacyPolicy = {
  _id: string
  content: string
  createdAt?: string
  updatedAt?: string
}

export type PrivacyPolicyResponse = {
  success: boolean
  statusCode: number
  message: string
  data: PrivacyPolicy
}

export type PrivacyPolicyUpdateRequest = {
  content: string
}

export const privacyPolicyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacyPolicy: builder.query<PrivacyPolicyResponse, void>({
      query: () => ({
        url: '/privacy-policy',
        method: 'GET',
      }),
      transformResponse: (response: PrivacyPolicyResponse) => response,
      providesTags: [{ type: 'PrivacyPolicy', id: 'SINGLE' }],
    }),
    updatePrivacyPolicy: builder.mutation<PrivacyPolicyResponse, PrivacyPolicyUpdateRequest>({
      query: (body) => ({
        url: '/privacy-policy',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: PrivacyPolicyResponse) => response,
      invalidatesTags: [{ type: 'PrivacyPolicy', id: 'SINGLE' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} = privacyPolicyApi

