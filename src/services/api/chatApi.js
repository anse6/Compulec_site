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

    // Liste des sessions en attente (WAITING_ADMIN)
    getPendingSessions: builder.query({
      query: () => ({
        url: `/chat/admin/sessions/pending`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CHAT],
    }),

    // Liste des sessions actives (WITH_ADMIN)
    getActiveSessions: builder.query({
      query: () => ({
        url: `/chat/admin/sessions/active`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CHAT],
    }),

    // Liste des sessions fermées (CLOSED)
    getClosedSessions: builder.query({
      query: () => ({
        url: `/chat/admin/sessions/closed`,
        method: "GET",
      }),
      providesTags: [API_TAGS.CHAT],
    }),

    // Détail d'une session pour l'administrateur
    getSessionDetail: builder.query({
      query: (sessionToken) => ({
        url: `/chat/admin/sessions/${sessionToken}`,
        method: "GET",
      }),
      providesTags: (_result, _error, sessionToken) => [{ type: API_TAGS.CHAT, id: sessionToken }],
    }),

    // Réponse de l'administrateur
    adminReply: builder.mutation({
      query: (data) => ({
        url: `/chat/admin/reply`,
        method: "POST",
        body: data, // { sessionToken, message }
      }),
      invalidatesTags: (_result, _error, arg) => [
        API_TAGS.CHAT, 
        { type: API_TAGS.CHAT, id: arg.sessionToken }
      ],
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
  useGetPendingSessionsQuery,
  useGetActiveSessionsQuery,
  useGetClosedSessionsQuery,
  useGetSessionDetailQuery,
  useAdminReplyMutation,
  useCloseSessionMutation,
} = chatApi;
