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
  totalMeals?: number
  durationDays?: number
  // Structured meal plan weeks
  weeks?: Array<{
    week: number
    days?: Array<{
      day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
      meals: {
        breakfast: string[]
        lunch: string[]
        snacks: string[]
        dinner: string[]
      }
    }>
    repeatFromWeek?: number
  }>
  status: 'active' | 'inactive'
  isDeleted?: boolean
  showOnClient?: boolean
  createdAt: string
  updatedAt: string
}

export const mealPlanApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMealPlans: build.query<{ data: MealPlan[]; meta?: any }, { 
      q?: string; 
      page?: number; 
      limit?: number; 
      status?: string;
      brand?: string;
      category?: string;
      fields?: string;
    } | void>({
      query: (params) => ({ url: '/meal-plans', method: 'GET', params: params ?? {} }),
    }),
    getMealPlanById: build.query<MealPlan, string>({
      query: (id) => ({ url: `/meal-plans/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'MealPlan' as const, id }],
    }),
    createMealPlan: build.mutation<MealPlan, FormData | Partial<MealPlan>>({
      query: (body) => ({ 
        url: '/meal-plans', 
        method: 'POST', 
        body,
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(body instanceof FormData ? {} : {})
      }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'MealPlan', id: 'LIST' }],
    }),
    updateMealPlan: build.mutation<MealPlan, { id: string; data: FormData | Partial<MealPlan> }>({
      query: ({ id, data }) => ({ 
        url: `/meal-plans/${id}`, 
        method: 'PUT', 
        body: data,
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(data instanceof FormData ? {} : {})
      }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'MealPlan', id }],
    }),
    deleteMealPlan: build.mutation<MealPlan, string>({
      query: (id) => ({ url: `/meal-plans/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, id) => [{ type: 'MealPlan', id }],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useGetMealPlansQuery, 
  useLazyGetMealPlansQuery, 
  useGetMealPlanByIdQuery, 
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation
} = mealPlanApi