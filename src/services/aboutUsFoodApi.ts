import { baseApi } from '@/services/baseApi'

export type AboutUsFoodCertification = {
  name: string
  logo: string
}

export type AboutUsFood = {
  _id: string
  title: string
  subtitle: string
  description: string
  images: string[]
  certifications: AboutUsFoodCertification[]
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type AboutUsFoodResponse = {
  success: boolean
  statusCode: number
  message: string
  data: AboutUsFood
}

export type AboutUsFoodListResponse = {
  success: boolean
  statusCode: number
  message: string
  data: AboutUsFood[]
}

export type AboutUsFoodCreateRequest = {
  title: string
  subtitle: string
  description: string
  images?: string[]
  certifications?: Array<{
    name: string
    logo?: string
  }>
}

export const aboutUsFoodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAboutUsFood: builder.query<AboutUsFoodResponse, void>({
      query: () => ({
        url: '/about-us/food',
        method: 'GET',
      }),
      transformResponse: (response: AboutUsFoodResponse) => response,
      providesTags: [{ type: 'AboutUsFood', id: 'SINGLE' }],
    }),
    getAllAboutUsFoods: builder.query<AboutUsFoodListResponse, void>({
      query: () => ({
        url: '/about-us/food/admin/all',
        method: 'GET',
      }),
      transformResponse: (response: AboutUsFoodListResponse) => response,
      providesTags: [{ type: 'AboutUsFood', id: 'LIST' }],
    }),
    createOrUpdateAboutUsFood: builder.mutation<AboutUsFoodResponse, FormData>({
      query: (body) => ({
        url: '/about-us/food',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AboutUsFoodResponse) => response,
      invalidatesTags: [{ type: 'AboutUsFood', id: 'SINGLE' }, { type: 'AboutUsFood', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAboutUsFoodQuery,
  useGetAllAboutUsFoodsQuery,
  useCreateOrUpdateAboutUsFoodMutation,
} = aboutUsFoodApi

