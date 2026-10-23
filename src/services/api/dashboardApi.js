import baseApi from './baseApi';
import { API_TAGS } from '../constants';

/**
 * dashboardApi — Endpoints du tableau de bord admin
 *
 * GET /dashboard/stats              → DashboardStatsResponse
 * GET /dashboard/recent-messages    → List<ContactResponse>
 * GET /dashboard/ai-sessions        → List<ChatSessionResponse>
 * GET /dashboard/recent-activity    → List<DashboardActivityResponse> { type, action, targetId, subject, date }
 * GET /dashboard/interactions-chart → List<InteractionChartResponse> { month: "yyyy-MM", messages, chats, projects, articles }
 *
 * Chaque requête fournit aussi les tags des données qu'elle agrège : une mutation ailleurs
 * dans l'admin (projet publié, message lu, article supprimé…) rafraîchit donc le dashboard.
 * Les projets invalident { type: PROJET, id: 'LIST' } (voir projetApi), d'où ce tag précis.
 */
const PROJECTS_LIST = { type: API_TAGS.PROJET, id: 'LIST' };

/**
 * Options communes des hooks du dashboard : les nouveaux messages et chats arrivent du site public
 * (aucune mutation locale ne les signale), d'où un rafraîchissement périodique quand l'onglet est visible.
 */
export const DASHBOARD_QUERY_OPTIONS = {
  pollingInterval: 60_000,
  skipPollingIfUnfocused: true,
  refetchOnMountOrArgChange: 30,
};

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Compteurs statistiques (cartes) ──────────────────────────────────────
    getDashboardStats: builder.query({
      query: () => ({ url: '/dashboard/stats', method: 'GET' }),
      providesTags: [
        API_TAGS.DASHBOARD, API_TAGS.CONTACT, API_TAGS.CHAT,
        API_TAGS.USER, API_TAGS.NEWS, PROJECTS_LIST,
      ],
    }),

    // ── Derniers messages de contact ─────────────────────────────────────────
    getDashboardRecentMessages: builder.query({
      query: (limit = 6) => ({ url: '/dashboard/recent-messages', method: 'GET', params: { limit } }),
      providesTags: [API_TAGS.DASHBOARD, API_TAGS.CONTACT],
    }),

    // ── Conversations non terminées ──────────────────────────────────────────
    getDashboardAiSessions: builder.query({
      query: (limit = 8) => ({ url: '/dashboard/ai-sessions', method: 'GET', params: { limit } }),
      providesTags: [API_TAGS.DASHBOARD, API_TAGS.CHAT],
    }),

    // ── Flux d'activité récente ───────────────────────────────────────────────
    getDashboardRecentActivity: builder.query({
      query: (limit = 10) => ({ url: '/dashboard/recent-activity', method: 'GET', params: { limit } }),
      providesTags: [
        API_TAGS.DASHBOARD, API_TAGS.CONTACT, API_TAGS.CHAT,
        API_TAGS.NEWS, API_TAGS.GALLERY, PROJECTS_LIST,
      ],
    }),

    // ── Données pour le graphique d'interactions ─────────────────────────────
    getInteractionChartData: builder.query({
      query: () => ({ url: '/dashboard/interactions-chart', method: 'GET' }),
      providesTags: [
        API_TAGS.DASHBOARD, API_TAGS.CONTACT, API_TAGS.CHAT,
        API_TAGS.NEWS, PROJECTS_LIST,
      ],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardRecentMessagesQuery,
  useGetDashboardAiSessionsQuery,
  useGetDashboardRecentActivityQuery,
  useGetInteractionChartDataQuery,
} = dashboardApi;

export default dashboardApi;
