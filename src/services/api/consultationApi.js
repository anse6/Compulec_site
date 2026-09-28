import baseApi from "./baseApi";
import { API_TAGS } from "../constants";

// BASE_URL = 'http://localhost:8080/api'
// ConsultationController est mappé sur '/api/consultations'
// URL réelle = BASE_URL + '/api/consultations' = 'http://localhost:8080/api/api/consultations'

export const consultationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Toutes les consultations (paginé)
    getAllConsultations: builder.query({
      query: ({ page = 0, size = 10, sort = "createdAt" } = {}) => ({
        url: `/api/consultations?page=${page}&size=${size}&sort=${sort}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CONSULTATION],
    }),

    // Consultations non lues (paginé)
    getUnreadConsultations: builder.query({
      query: ({ page = 0, size = 10 } = {}) => ({
        url: `/api/consultations/non-lues?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CONSULTATION],
    }),

    // Compter les non lues
    countUnreadConsultations: builder.query({
      query: () => ({
        url: `/api/consultations/count-non-lues`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CONSULTATION],
    }),

    // Détail d'une consultation
    getConsultationById: builder.query({
      query: (id) => ({
        url: `/api/consultations/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: API_TAGS.CONSULTATION, id }],
    }),

    // Marquer comme lue
    markConsultationAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/consultations/${id}/lire`,
        method: "PATCH",
      }),
      invalidatesTags: [API_TAGS.CONSULTATION],
    }),

    // Supprimer une consultation
    deleteConsultation: builder.mutation({
      query: (id) => ({
        url: `/api/consultations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.CONSULTATION],
    }),

    // Envoyer une demande de consultation (Public)
    createConsultation: builder.mutation({
      query: (body) => ({
        url: `/api/consultations`,
        method: "POST",
        body,
      }),
      // On n'invalide pas de tag car c'est un visiteur qui le fait et il ne lit pas la liste
      // Mais on peut le faire si on veut que l'admin (qui regarde son tableau de bord) ait une mise à jour auto.
      invalidatesTags: [API_TAGS.CONSULTATION, API_TAGS.DASHBOARD],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllConsultationsQuery,
  useGetUnreadConsultationsQuery,
  useCountUnreadConsultationsQuery,
  useGetConsultationByIdQuery,
  useMarkConsultationAsReadMutation,
  useDeleteConsultationMutation,
  useCreateConsultationMutation,
} = consultationApi;
