import { baseApi } from '@/services/baseApi'

export type MealPlanWorkStep = {
  title: string
  subTitle: string
}

export type MealPlanWork = {
  _id?: string
  title: string
  subtitle: string
  banner1: string // Image URL
  banner2: string // Image URL
  step1: MealPlanWorkStep
  step2: MealPlanWorkStep
  step3: MealPlanWorkStep
  metaTitle: string
  metaTagKeyword: string
  description: string
  status: 'active' | 'inactive'
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type MealPlanWorkResponse = {
  success: boolean
  statusCode: number
  message: string
  data: MealPlanWork | null
}

export type MealPlanWorkUpsertRequest = FormData

export const mealPlanWorkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMealPlanWork: builder.query<MealPlanWorkResponse, { status?: 'active' | 'inactive' } | void>({
      query: (params) => ({
        url: '/meal-plan-work',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: MealPlanWorkResponse) => response,
    }),
    getMealPlanWorkById: builder.query<MealPlanWorkResponse, string>({
      query: (id) => ({
        url: `/meal-plan-work/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: MealPlanWorkResponse) => response,
    }),
    upsertMealPlanWork: builder.mutation<MealPlanWorkResponse, MealPlanWorkUpsertRequest>({
      query: (formData) => ({
        url: '/meal-plan-work',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: MealPlanWorkResponse) => response,
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetMealPlanWorkQuery,
  useLazyGetMealPlanWorkQuery,
  useGetMealPlanWorkByIdQuery,
  useUpsertMealPlanWorkMutation,
} = mealPlanWorkApi

