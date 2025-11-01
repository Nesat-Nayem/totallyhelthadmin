import { baseApi } from '@/services/baseApi'

export type UserMembership = {
  _id: string
  userId: string
  mealPlanId: string
  totalMeals: number
  remainingMeals: number
  consumedMeals: number
  price?: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'cancelled' | 'completed'
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Optional embedded weeks copied from plan
  weeks?: Array<{
    week: number
    isConsumed?: boolean
    repeatFromWeek?: number
    days: Array<{
      day: 'saturday'|'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'
      isConsumed?: boolean
      meals: {
        breakfast: string[]
        lunch: string[]
        snacks: string[]
        dinner: string[]
      }
      consumedMeals?: {
        breakfast?: boolean
        lunch?: boolean
        dinner?: boolean
        snacks?: boolean
      }
    }>
  }>
  // Optional per-membership selections (if you persist them)
  weeksSelections?: Array<{
    week: number
    days: Array<{
      day: 'saturday'|'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'
      selections: { breakfast?: string; lunch?: string; snacks?: string; dinner?: string }
    }>
  }>
}

export const userMembershipApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUserMemberships: build.query<{ memberships: UserMembership[]; pagination?: any }, { 
      userId?: string; 
      status?: string;
      page?: number; 
      limit?: number;
    } | void>({
      query: (params) => ({ url: '/user-memberships', method: 'GET', params: params ?? {} }),
      transformResponse: (res: any) => res?.data,
    }),
    getUserMembershipById: build.query<UserMembership, string>({
      query: (id) => ({ url: `/user-memberships/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'UserMembership' as const, id }],
    }),
        createUserMembership: build.mutation<UserMembership, {
          userId: string
          mealPlanId: string
          totalMeals: number
          startDate?: string
          endDate: string
          // Payment fields
          totalPrice?: number
          receivedAmount?: number
          cumulativePaid?: number
          paymentStatus?: string
          paymentMode?: string
          note?: string
          // Optional plan weeks to embed
          weeks?: Array<any>
          // Optional user selections
          weeksSelections?: Array<any>
        }>({
      query: (body) => ({ 
        url: '/user-memberships', 
        method: 'POST', 
        body
      }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'UserMembership', id: 'LIST' }],
    }),
    updateUserMembership: build.mutation<UserMembership, { 
      id: string; 
      consumedMeals?: number; // This will be the increment, not total
      mealItems?: Array<{
        productId: string;
        title: string;
        qty: number;
        punchingTime: string;
        mealType: string;
        moreOptions: Array<{ name: string }>;
        branchId?: string;
        createdBy?: string;
      }>;
      status?: string;
      isActive?: boolean;
      weeks?: Array<any>; // Support updating weeks (full array)
      // Support updating single week/day
      week?: number;
      day?: string;
      meals?: {
        breakfast?: string[];
        lunch?: string[];
        snacks?: string[];
        dinner?: string[];
      };
    }>({
      query: ({ id, ...data }) => ({ url: `/user-memberships/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'UserMembership', id }],
    }),
    deleteUserMembership: build.mutation<UserMembership, string>({
      query: (id) => ({ url: `/user-memberships/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, id) => [{ type: 'UserMembership', id }],
    }),
    setMembershipStatus: build.mutation<UserMembership, { id: string; status: 'hold' | 'active' | 'cancelled' }>({
      query: ({ id, status }) => ({ url: `/user-memberships/${id}/status`, method: 'PATCH', body: { status } }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'UserMembership', id }],
    }),
    punchMeals: build.mutation<any, {
      id: string;
      week: number;
      day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
      mealItems: Array<{
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
        mealItemTitle: string;
        qty: number;
      }>;
      notes?: string;
    }>({
      query: ({ id, ...body }) => ({ 
        url: `/user-memberships/${id}/punch`, 
        method: 'POST', 
        body 
      }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'UserMembership', id }],
    }),
    updateMealSelections: build.mutation<UserMembership, {
      id: string;
      week: number;
      day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
      meals: {
        breakfast?: string[];
        lunch?: string[];
        snacks?: string[];
        dinner?: string[];
      };
    }>({
      query: ({ id, ...body }) => ({ 
        url: `/user-memberships/${id}/update-meal-selections`, 
        method: 'PATCH', 
        body 
      }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'UserMembership', id },
        { type: 'UserMembership', id: 'LIST' } // Also invalidate list to refresh when reopening
      ],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useGetUserMembershipsQuery, 
  useLazyGetUserMembershipsQuery, 
  useGetUserMembershipByIdQuery, 
  useCreateUserMembershipMutation,
  useUpdateUserMembershipMutation,
  useDeleteUserMembershipMutation,
  useSetMembershipStatusMutation,
  usePunchMealsMutation,
  useUpdateMealSelectionsMutation
} = userMembershipApi
