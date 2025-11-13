import { baseApi } from '@/services/baseApi'

export type AboutUsAuthor = {
  _id: string
  title: string
  name: string
  designation: string
  image: string
  description: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type AboutUsAuthorResponse = {
  success: boolean
  statusCode: number
  message: string
  data: AboutUsAuthor
}

export type AboutUsAuthorListResponse = {
  success: boolean
  statusCode: number
  message: string
  data: AboutUsAuthor[]
}

export type AboutUsAuthorCreateRequest = {
  title: string
  name: string
  designation: string
  image?: string
  description: string
}

export const aboutUsAuthorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAboutUsAuthor: builder.query<AboutUsAuthorResponse, void>({
      query: () => ({
        url: '/about-us/author',
        method: 'GET',
      }),
      transformResponse: (response: AboutUsAuthorResponse) => response,
      providesTags: [{ type: 'AboutUsAuthor', id: 'SINGLE' }],
    }),
    getAllAboutUsAuthors: builder.query<AboutUsAuthorListResponse, void>({
      query: () => ({
        url: '/about-us/author/admin/all',
        method: 'GET',
      }),
      transformResponse: (response: AboutUsAuthorListResponse) => response,
      providesTags: [{ type: 'AboutUsAuthor', id: 'LIST' }],
    }),
    createOrUpdateAboutUsAuthor: builder.mutation<AboutUsAuthorResponse, FormData>({
      query: (body) => ({
        url: '/about-us/author',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AboutUsAuthorResponse) => response,
      invalidatesTags: [{ type: 'AboutUsAuthor', id: 'SINGLE' }, { type: 'AboutUsAuthor', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAboutUsAuthorQuery,
  useGetAllAboutUsAuthorsQuery,
  useCreateOrUpdateAboutUsAuthorMutation,
} = aboutUsAuthorApi

