import { baseApi } from '@/services/baseApi'

export type UserMembership = {
  _id: string
  userId: string
  mealPlanId: string
  totalMeals: number
  remainingMeals: number
  consumedMeals: number
  price: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'cancelled' | 'completed'
  isActive: boolean
  createdAt: string
  updatedAt: string
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
      price: number
      startDate?: string
      endDate: string
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
      remainingMeals?: number;
      consumedMeals?: number;
      status?: string;
      isActive?: boolean;
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
  }),
  overrideExisting: true,
})

export const { 
  useGetUserMembershipsQuery, 
  useLazyGetUserMembershipsQuery, 
  useGetUserMembershipByIdQuery, 
  useCreateUserMembershipMutation,
  useUpdateUserMembershipMutation,
  useDeleteUserMembershipMutation
} = userMembershipApi
