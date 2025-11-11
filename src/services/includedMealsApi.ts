import { baseApi } from '@/services/baseApi'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS'

export type IncludedMeal = {
  _id: string
  meal_type: MealType
  title: string
  image_url: string
  nutrition: {
    calories: number
    fat_g: number
    carbs_g: number
    protein_g: number
  }
  allergens: string[]
  status: 'active' | 'inactive'
  order: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface GetIncludedMealsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IncludedMeal[]
}

export interface GetIncludedMealResponse {
  success: boolean
  statusCode: number
  message: string
  data: IncludedMeal
}

export interface CreateIncludedMealResponse {
  success: boolean
  statusCode: number
  message: string
  data: IncludedMeal
}

export interface UpdateIncludedMealResponse {
  success: boolean
  statusCode: number
  message: string
  data: IncludedMeal
}

export interface DeleteIncludedMealResponse {
  success: boolean
  statusCode: number
  message: string
  data: IncludedMeal
}

export const includedMealsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get all included meals
    getIncludedMeals: build.query<GetIncludedMealsResponse, { status?: string; meal_type?: string } | void>({
      query: (params) => ({ 
        url: '/included', 
        method: 'GET', 
        params: params ?? {} 
      }),
      providesTags: [{ type: 'IncludedMeal', id: 'LIST' }],
    }),
    
    // Get included meal by ID
    getIncludedMealById: build.query<IncludedMeal, string>({
      query: (id) => ({ url: `/included/${id}`, method: 'GET' }),
      transformResponse: (res: GetIncludedMealResponse) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'IncludedMeal' as const, id }],
    }),
    
    // Create included meal
    createIncludedMeal: build.mutation<IncludedMeal, FormData>({
      query: (body) => ({ 
        url: '/included', 
        method: 'POST', 
        body,
      }),
      transformResponse: (res: CreateIncludedMealResponse) => res?.data,
      invalidatesTags: [{ type: 'IncludedMeal', id: 'LIST' }],
    }),
    
    // Update included meal
    updateIncludedMeal: build.mutation<IncludedMeal, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ 
        url: `/included/${id}`, 
        method: 'PUT', 
        body: data,
      }),
      transformResponse: (res: UpdateIncludedMealResponse) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'IncludedMeal', id }, { type: 'IncludedMeal', id: 'LIST' }],
    }),
    
    // Delete included meal
    deleteIncludedMeal: build.mutation<IncludedMeal, string>({
      query: (id) => ({ url: `/included/${id}`, method: 'DELETE' }),
      transformResponse: (res: DeleteIncludedMealResponse) => res?.data,
      invalidatesTags: [{ type: 'IncludedMeal', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useGetIncludedMealsQuery, 
  useLazyGetIncludedMealsQuery, 
  useGetIncludedMealByIdQuery, 
  useCreateIncludedMealMutation,
  useUpdateIncludedMealMutation,
  useDeleteIncludedMealMutation
} = includedMealsApi

