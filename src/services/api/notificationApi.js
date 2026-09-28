import baseApi from './baseApi';

/**
 * notificationApi — Endpoints pour les notifications
 */
const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => ({ url: '/notifications', method: 'GET' }),
      providesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({ url: '/notifications/mark-all-read', method: 'POST' }),
      invalidatesTags: ['Notification', 'Dashboard', 'Contact'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
} = notificationApi;

export default notificationApi;
