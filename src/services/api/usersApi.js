import baseApi from './baseApi';
import { API_TAGS } from '../constants';

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/users?page=0&size=20&sort=nom
    getUsers: builder.query({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: `/users?page=${page}&size=${size}&sort=nom`,
        method: 'GET',
      }),
      providesTags: [API_TAGS.USER],
    }),

    // GET /api/users/{id}
    getUserById: builder.query({
      query: (id) => ({ url: `/users/${id}`, method: 'GET' }),
      providesTags: [API_TAGS.USER],
    }),

    // POST /api/users/managers
    createManager: builder.mutation({
      query: (data) => ({
        url: `/users/managers`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [API_TAGS.USER],
    }),

    // PUT /api/users/{id}
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [API_TAGS.USER],
    }),

    // PUT /api/users/{id}/role  ?role=MANAGER
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/${id}/role?role=${role}`,
        method: 'PUT',
      }),
      invalidatesTags: [API_TAGS.USER],
    }),

    // PATCH /api/users/{id}/activate
    activateUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}/activate`, method: 'PATCH' }),
      invalidatesTags: [API_TAGS.USER],
    }),

    // PATCH /api/users/{id}/deactivate
    deactivateUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: [API_TAGS.USER],
    }),

    // DELETE /api/users/{id}
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [API_TAGS.USER],
    }),
    // GET /api/users/me
    getCurrentUser: builder.query({
      query: () => ({ url: `/users/me`, method: 'GET' }),
      providesTags: [API_TAGS.USER],
    }),

    // PATCH /api/users/me/password
    changePassword: builder.mutation({
      query: (data) => ({
        url: `/users/me/password`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetCurrentUserQuery,
  useCreateManagerMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
} = usersApi;

export default usersApi;
