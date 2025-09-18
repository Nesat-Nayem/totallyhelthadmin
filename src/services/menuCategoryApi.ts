import { baseApi } from '@/services/baseApi'

export type MenuCategory = { _id: string; title: string; status: 'active' | 'inactive' }

export const menuCategoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMenuCategories: build.query<MenuCategory[], void>({
      query: () => ({ url: '/menu-categories', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result ? [...result.map(({ _id }) => ({ type: 'MenuCategory' as const, id: _id })), { type: 'MenuCategory' as const, id: 'LIST' }] : [{ type: 'MenuCategory', id: 'LIST' }],
    }),
    getMenuCategoryById: build.query<MenuCategory, string>({
      query: (id) => ({ url: `/menu-categories/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'MenuCategory' as const, id }],
    }),
    createMenuCategory: build.mutation<MenuCategory, Partial<MenuCategory>>({
      query: (body) => ({ url: '/menu-categories', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'MenuCategory', id: 'LIST' }],
    }),
    updateMenuCategory: build.mutation<MenuCategory, { id: string; data: Partial<MenuCategory> }>({
      query: ({ id, data }) => ({ url: `/menu-categories/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'MenuCategory', id }, { type: 'MenuCategory', id: 'LIST' }],
    }),
    deleteMenuCategory: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/menu-categories/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res }),
      invalidatesTags: (_r, _e, id) => [{ type: 'MenuCategory', id }, { type: 'MenuCategory', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useGetMenuCategoriesQuery,
  useGetMenuCategoryByIdQuery,
  useCreateMenuCategoryMutation,
  useUpdateMenuCategoryMutation,
  useDeleteMenuCategoryMutation
} = menuCategoryApi
