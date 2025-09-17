import { baseApi } from '@/services/baseApi'

export type MealPlan = {
  _id: string
  title: string
  description?: string
  price: number
  delPrice?: number
  restaurantPrice?: number
  onlinePrice?: number
  membershipPrice?: number
  menuType?: 'restaurant' | 'online' | 'membership'
  category?: string
  brand?: string
  images?: string[]
  thumbnail?: string
  image?: string
  status?: 'active' | 'inactive'
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
    createMealPlan: build.mutation<MealPlan, Partial<MealPlan>>({
      query: (body) => ({ url: '/meal-plans', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'MealPlan', id: 'LIST' }],
    }),
    updateMealPlan: build.mutation<MealPlan, { id: string; data: Partial<MealPlan> }>({
      query: ({ id, data }) => ({ url: `/meal-plans/${id}`, method: 'PATCH', body: data }),
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
