import baseApi from "./baseApi";
import { API_TAGS } from "../constants";

// BASE_URL = 'http://localhost:8080/api'
// ContactController est mappé sur '/api/contacts'
// Donc l'URL réelle = BASE_URL + '/api/contacts' = 'http://localhost:8080/api/api/contacts'

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtenir tous les messages (paginé)
    getAllContacts: builder.query({
      query: ({ page = 0, size = 10, sort = "createdAt" } = {}) => ({
        url: `/api/contacts?page=${page}&size=${size}&sort=${sort}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CONTACT],
    }),

    // Obtenir les messages non lus (paginé)
    getUnreadContacts: builder.query({
      query: ({ page = 0, size = 10 } = {}) => ({
        url: `/api/contacts/non-lus?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CONTACT],
    }),

    // Compter les messages non lus
    countUnreadContacts: builder.query({
      query: () => ({
        url: `/api/contacts/count-non-lus`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CONTACT],
    }),

    // Détail d'un message
    getContactById: builder.query({
      query: (id) => ({
        url: `/api/contacts/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: API_TAGS.CONTACT, id }],
    }),

    // Marquer comme lu
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/contacts/${id}/lire`,
        method: "PATCH",
      }),
      invalidatesTags: [API_TAGS.CONTACT],
    }),

    // Supprimer un message
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/api/contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.CONTACT],
    }),

    // Envoyer un message de contact (Public)
    createContact: builder.mutation({
      query: (body) => ({
        url: `/api/contacts`,
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAGS.CONTACT, API_TAGS.DASHBOARD],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllContactsQuery,
  useGetUnreadContactsQuery,
  useCountUnreadContactsQuery,
  useGetContactByIdQuery,
  useMarkAsReadMutation,
  useDeleteContactMutation,
  useCreateContactMutation,
} = contactApi;
