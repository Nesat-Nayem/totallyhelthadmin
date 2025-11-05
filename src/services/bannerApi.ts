import { baseApi } from '@/services/baseApi'

export type Banner = {
  _id: string
  title: string
  image: string
  certLogo: string
  description: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  googleReviewCount: number
  status: 'active' | 'inactive'
  order: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface GetBannersResponse {
  success: boolean
  statusCode: number
  message: string
  data: Banner[]
}

export interface GetBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: Banner
}

export interface CreateBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: Banner
}

export interface UpdateBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: Banner
}

export interface DeleteBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: Banner
}

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get all banners
    getBanners: build.query<GetBannersResponse, { status?: string } | void>({
      query: (params) => ({ 
        url: '/banners', 
        method: 'GET', 
        params: params ?? {} 
      }),
      providesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
    
    // Get banner by ID
    getBannerById: build.query<Banner, string>({
      query: (id) => ({ url: `/banners/${id}`, method: 'GET' }),
      transformResponse: (res: GetBannerResponse) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'Banner' as const, id }],
    }),
    
    // Create banner
    createBanner: build.mutation<Banner, FormData>({
      query: (body) => ({ 
        url: '/banners', 
        method: 'POST', 
        body,
        // Don't set Content-Type for FormData, let browser set it with boundary
      }),
      transformResponse: (res: CreateBannerResponse) => res?.data,
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
    
    // Update banner
    updateBanner: build.mutation<Banner, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ 
        url: `/banners/${id}`, 
        method: 'PUT', 
        body: data,
        // Don't set Content-Type for FormData, let browser set it with boundary
      }),
      transformResponse: (res: UpdateBannerResponse) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Banner', id }, { type: 'Banner', id: 'LIST' }],
    }),
    
    // Delete banner
    deleteBanner: build.mutation<Banner, string>({
      query: (id) => ({ url: `/banners/${id}`, method: 'DELETE' }),
      transformResponse: (res: DeleteBannerResponse) => res?.data,
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useGetBannersQuery, 
  useLazyGetBannersQuery, 
  useGetBannerByIdQuery, 
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation
} = bannerApi

