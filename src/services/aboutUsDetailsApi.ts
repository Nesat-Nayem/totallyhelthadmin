import { baseApi } from '@/services/baseApi'

export type AboutUsDetailsService = {
  title: string
  description: string
}

export type AboutUsDetails = {
  _id: string
  image: string
  headline: string
  description: string
  services: AboutUsDetailsService[]
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type AboutUsDetailsResponse = {
  success: boolean
  statusCode: number
  message: string
  data: AboutUsDetails
}

export type AboutUsDetailsListResponse = {
  success: boolean
  statusCode: number
  message: string
  data: AboutUsDetails[]
}

export type AboutUsDetailsCreateRequest = {
  image: string
  headline: string
  description: string
  services?: Array<{
    title: string
    description: string
  }>
}

export const aboutUsDetailsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAboutUsDetails: builder.query<AboutUsDetailsResponse, void>({
      query: () => ({
        url: '/about-us/details',
        method: 'GET',
      }),
      transformResponse: (response: AboutUsDetailsResponse) => response,
      providesTags: [{ type: 'AboutUsDetails', id: 'SINGLE' }],
    }),
    getAllAboutUsDetails: builder.query<AboutUsDetailsListResponse, void>({
      query: () => ({
        url: '/about-us/details/admin/all',
        method: 'GET',
      }),
      transformResponse: (response: AboutUsDetailsListResponse) => response,
      providesTags: [{ type: 'AboutUsDetails', id: 'LIST' }],
    }),
    createOrUpdateAboutUsDetails: builder.mutation<AboutUsDetailsResponse, FormData>({
      query: (body) => ({
        url: '/about-us/details',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AboutUsDetailsResponse) => response,
      invalidatesTags: [{ type: 'AboutUsDetails', id: 'SINGLE' }, { type: 'AboutUsDetails', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAboutUsDetailsQuery,
  useGetAllAboutUsDetailsQuery,
  useCreateOrUpdateAboutUsDetailsMutation,
} = aboutUsDetailsApi

