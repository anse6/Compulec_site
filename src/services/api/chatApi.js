import baseApi from "./baseApi";
import { API_TAGS } from "../constants";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ------------------------------------------
    // ENDPOINTS PUBLICS (Visiteurs)
    // ------------------------------------------
    
    // Démarrer une session (retourne { sessionToken, ... })
    startChat: builder.mutation({
      query: (data) => ({
        url: `/chat/start`,
        method: "POST",
        body: data, // { visitorName, visitorEmail }
      }),
    }),

    // Envoyer un message au bot (retourne la réponse du bot)
    sendMessage: builder.mutation({
      query: (data) => ({
        url: `/chat/message`,
        method: "POST",
        body: data, // { sessionToken, message }
      }),
    }),

    // Demander le transfert vers un administrateur
    requestAdminTransfer: builder.mutation({
      query: (sessionToken) => ({
        url: `/chat/request-admin/${sessionToken}`,
        method: "POST",
      }),
    }),

    // Récupérer l'historique complet d'une session (utilisé pour le polling visiteur)
    getChatHistory: builder.query({
      query: (sessionToken) => ({
        url: `/chat/history/${sessionToken}`,
        method: "GET",
      }),
    }),

    // ------------------------------------------
    // ENDPOINTS ADMIN (Nécessite JWT)
    // ------------------------------------------

    // Conversations d'un statut (ACTIVE = avec le bot, WAITING_ADMIN, WITH_ADMIN, CLOSED),
    // triées par dernière activité, paginées, avec recherche (nom, email, n° de session)
    searchChatSessions: builder.query({
      query: ({ status, q = "", page = 0, size = 20 }) => ({
        url: `/chat/admin/sessions`,
        method: "GET",
        params: { status, page, size, ...(q.trim() ? { q: q.trim() } : {}) },
      }),
      providesTags: [API_TAGS.CHAT],
    }),

    // Compteurs des onglets + total des messages non lus
    getChatCounts: builder.query({
      query: () => ({ url: `/chat/admin/sessions/counts`, method: "GET" }),
      providesTags: [API_TAGS.CHAT],
    }),

    // Détail d'une session pour l'équipe
    getSessionDetail: builder.query({
      query: (sessionToken) => ({
        url: `/chat/admin/sessions/${sessionToken}`,
        method: "GET",
      }),
      providesTags: (_result, _error, sessionToken) => [{ type: API_TAGS.CHAT, id: sessionToken }],
    }),

    // Prendre en charge une conversation
    takeOverSession: builder.mutation({
      query: (sessionToken) => ({ url: `/chat/admin/take/${sessionToken}`, method: "POST" }),
      invalidatesTags: [API_TAGS.CHAT],
    }),

    // Réponse d'un membre de l'équipe (signée)
    adminReply: builder.mutation({
      query: (data) => ({
        url: `/chat/admin/reply`,
        method: "POST",
        body: data, // { sessionToken, message }
      }),
      invalidatesTags: [API_TAGS.CHAT],
    }),

    // Marquer les messages du visiteur comme lus
    markSessionRead: builder.mutation({
      query: (sessionToken) => ({ url: `/chat/admin/read/${sessionToken}`, method: "PATCH" }),
      invalidatesTags: [API_TAGS.CHAT],
    }),

    // Fermer une session
    closeSession: builder.mutation({
      query: (sessionToken) => ({
        url: `/chat/admin/close/${sessionToken}`,
        method: "PATCH",
      }),
      invalidatesTags: [API_TAGS.CHAT],
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartChatMutation,
  useSendMessageMutation,
  useRequestAdminTransferMutation,
  useGetChatHistoryQuery,
  useSearchChatSessionsQuery,
  useGetChatCountsQuery,
  useGetSessionDetailQuery,
  useTakeOverSessionMutation,
  useAdminReplyMutation,
  useMarkSessionReadMutation,
  useCloseSessionMutation,
} = chatApi;
