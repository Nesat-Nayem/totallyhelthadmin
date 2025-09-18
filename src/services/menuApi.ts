import { baseApi } from '@/services/baseApi'

export type Menu = {
  _id: string
  title: string
  description?: string
  image?: string
  images?: string[]
  restaurantPrice?: number
  onlinePrice?: number
  membershipPrice?: number
  category?: string
  brands?: string[]
  branches?: string[]
  status?: 'active' | 'inactive'
}

export const menuApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMenus: build.query<{ data: Menu[]; meta?: any }, { q?: string; brand?: string; category?: string; page?: number; limit?: number; priceType?: 'restaurant' | 'online' | 'membership' } | void>({
      query: (params) => ({ url: '/menus', method: 'GET', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res?.data ?? [], meta: res?.meta }),
      providesTags: [{ type: 'Menu', id: 'LIST' }],
    }),
    getMenuById: build.query<Menu, string>({
      query: (id) => ({ url: `/menus/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'Menu' as const, id }],
    }),
    createMenu: build.mutation<Menu, Partial<Menu>>({
      query: (body) => ({ url: '/menus', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Menu', id: 'LIST' }],
    }),
    updateMenu: build.mutation<Menu, { id: string; data: Partial<Menu> }>({
      query: ({ id, data }) => ({ url: `/menus/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Menu', id }, { type: 'Menu', id: 'LIST' }],
    }),
    deleteMenu: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/menus/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Menu', id }, { type: 'Menu', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { useGetMenusQuery, useGetMenuByIdQuery, useCreateMenuMutation, useUpdateMenuMutation, useDeleteMenuMutation } = menuApi
