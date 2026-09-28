import baseApi from './baseApi';
import { API_TAGS } from '../constants';

/**
 * dashboardApi — Endpoints du tableau de bord admin
 *
 * GET /dashboard/stats           → DashboardStatsResponse
 * GET /dashboard/recent-messages → List<ContactResponse>
 * GET /dashboard/ai-sessions     → List<ChatSessionResponse>
 * GET /dashboard/recent-activity → List<DashboardActivityResponse>
 */
const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Compteurs statistiques (cartes) ──────────────────────────────────────
    getDashboardStats: builder.query({
      query: () => ({ url: '/dashboard/stats', method: 'GET' }),
      providesTags: [API_TAGS.DASHBOARD],
    }),

    // ── 6 derniers messages de contact ───────────────────────────────────────
    getDashboardRecentMessages: builder.query({
      query: (limit = 6) => ({ url: `/dashboard/recent-messages?limit=${limit}`, method: 'GET' }),
      providesTags: [API_TAGS.DASHBOARD, API_TAGS.CONTACT],
    }),

    // ── Sessions AI actives / transférées ────────────────────────────────────
    getDashboardAiSessions: builder.query({
      query: (limit = 8) => ({ url: `/dashboard/ai-sessions?limit=${limit}`, method: 'GET' }),
      providesTags: [API_TAGS.DASHBOARD, API_TAGS.CHAT],
    }),

    // ── Flux d'activité récente ───────────────────────────────────────────────
    getDashboardRecentActivity: builder.query({
      query: (limit = 10) => ({ url: `/dashboard/recent-activity?limit=${limit}`, method: 'GET' }),
      providesTags: [API_TAGS.DASHBOARD],
    }),

    // ── Données pour le graphique d'interactions ─────────────────────────────
    getInteractionChartData: builder.query({
      query: () => ({ url: `/dashboard/interactions-chart`, method: 'GET' }),
      providesTags: [API_TAGS.DASHBOARD],
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
