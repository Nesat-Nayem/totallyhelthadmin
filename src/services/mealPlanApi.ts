import { baseApi } from '@/services/baseApi'

export type MealPlan = {
  _id: string
  title: string
  description: string
  badge?: string
  discount?: string
  price: number
  delPrice?: number
  category?: string
  brand?: string
  kcalList?: string[]
  deliveredList?: string[]
  suitableList?: string[]
  daysPerWeek?: string[]
  weeksOffers?: { week: string; offer: string }[]
  images?: string[]
  thumbnail?: string
  status: 'active' | 'inactive'
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export const mealPlanApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMealPlans: build.query<{ data: MealPlan[]; meta?: any }, { q?: string; brand?: string; category?: string; page?: number; limit?: number; fields?: string } | void>({
      query: (params) => ({ url: '/meal-plans', method: 'GET', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res?.data ?? [], meta: res?.meta }),
      providesTags: [{ type: 'MealPlan', id: 'LIST' }],
    }),
    getMealPlanById: build.query<MealPlan, string>({
      query: (id) => ({ url: `/meal-plans/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'MealPlan' as const, id }],
    }),
    createMealPlan: build.mutation<MealPlan, FormData>({
      query: (formData) => ({ 
        url: '/meal-plans', 
        method: 'POST', 
        body: formData,
        formData: true
      }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'MealPlan', id: 'LIST' }],
    }),
    updateMealPlan: build.mutation<MealPlan, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ 
        url: `/meal-plans/${id}`, 
        method: 'PUT', 
        body: data,
        formData: true
      }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'MealPlan', id }, { type: 'MealPlan', id: 'LIST' }],
    }),
    deleteMealPlan: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/meal-plans/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res }),
      invalidatesTags: (_r, _e, id) => [{ type: 'MealPlan', id }, { type: 'MealPlan', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useGetMealPlansQuery, 
  useGetMealPlanByIdQuery,
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation 
} = mealPlanApi
