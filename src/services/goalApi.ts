import { baseApi } from '@/services/baseApi'

export type GoalSection = {
  title: string
  icon: string // URL
  description: string
}

export type Goal = {
  _id?: string
  title: string
  subtitle: string
  sections: GoalSection[] // length 1-3
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  status: 'active' | 'inactive'
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type GoalResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Goal | null
}

export type GoalUpsertRequest = FormData

export const goalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGoal: builder.query<GoalResponse, { status?: 'active' | 'inactive' } | void>({
      query: (params) => ({
        url: '/goals',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: GoalResponse) => response,
    }),
    upsertGoal: builder.mutation<GoalResponse, GoalUpsertRequest>({
      query: (formData) => ({
        url: '/goals',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: GoalResponse) => response,
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetGoalQuery,
  useLazyGetGoalQuery,
  useUpsertGoalMutation,
} = goalApi

