import { baseApi } from '@/services/baseApi'

export type Video = {
  _id: string
  brandLogo?: string
  videoUrl: string
  status: 'active' | 'inactive'
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type VideoResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Video | null
}

export type VideoUpsertRequest = {
  brandLogo?: string
  videoUrl: string
  status?: 'active' | 'inactive'
}

export const videoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get video (returns single video or null for frontend)
    getVideo: builder.query<VideoResponse, void>({
      query: () => ({
        url: '/videos',
        method: 'GET',
      }),
      transformResponse: (response: VideoResponse) => response,
      providesTags: [{ type: 'Video', id: 'SINGLE' }],
    }),
    // Upsert video (create or update - only one video record)
    upsertVideo: builder.mutation<VideoResponse, VideoUpsertRequest>({
      query: (body) => ({
        url: '/videos',
        method: 'POST',
        body,
      }),
      transformResponse: (response: VideoResponse) => response,
      invalidatesTags: [{ type: 'Video', id: 'SINGLE' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetVideoQuery,
  useUpsertVideoMutation,
} = videoApi
