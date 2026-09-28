import baseApi from './baseApi';
import { API_TAGS } from '../constants';

/**
 * Projets API — mappé sur ProjetController Spring Boot
 * BASE_URL = 'http://localhost:8080/api' (défini dans constants.js)
 * Les chemins ici sont RELATIFS au BASE_URL, donc sans répéter /api.
 *
 * POST   /projets                  → créer (multipart)
 * GET    /projets                  → liste paginée (admin)
 * GET    /projets/publies          → liste paginée (publics)
 * GET    /projets/{id}            → détail
 * PUT    /projets/{id}            → modifier (multipart)
 * PATCH  /projets/{id}/publier    → publier
 * PATCH  /projets/{id}/depublier  → dépublier
 * DELETE /projets/{id}            → supprimer
 */
const projetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET ALL (admin paginé) ─────────────────────────────────────────────
    getAllProjets: builder.query({
      query: ({ page = 0, size = 20, sort = 'createdAt' } = {}) =>
        `/projets?page=${page}&size=${size}&sort=${sort}`,
      providesTags: (result) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ id }) => ({ type: API_TAGS.PROJET, id })),
              { type: API_TAGS.PROJET, id: 'LIST' },
            ]
          : [{ type: API_TAGS.PROJET, id: 'LIST' }],
    }),

    // ── GET PUBLIES (public, paginé) ──────────────────────────────────────
    getProjetsPublies: builder.query({
      query: ({ page = 0, size = 50 } = {}) =>
        `/projets/publies?page=${page}&size=${size}`,
      providesTags: [{ type: API_TAGS.PROJET, id: 'PUBLIES' }],
    }),

    // ── GET BY ID ─────────────────────────────────────────────────────────
    getProjetById: builder.query({
      query: (id) => `/projets/${id}`,
      providesTags: (result, error, id) => [{ type: API_TAGS.PROJET, id }],
    }),

    // ── CREATE (multipart/form-data) ──────────────────────────────────────
    createProjet: builder.mutation({
      query: (formData) => ({
        url: '/projets',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [{ type: API_TAGS.PROJET, id: 'LIST' }],
    }),

    // ── UPDATE (multipart/form-data) ──────────────────────────────────────
    updateProjet: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/projets/${id}`,
        method: 'PUT',
        body: formData,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.PROJET, id },
        { type: API_TAGS.PROJET, id: 'LIST' },
      ],
    }),

    // ── PUBLIER ───────────────────────────────────────────────────────────
    publierProjet: builder.mutation({
      query: (id) => ({
        url: `/projets/${id}/publier`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAGS.PROJET, id },
        { type: API_TAGS.PROJET, id: 'LIST' },
      ],
    }),

    // ── DÉPUBLIER ─────────────────────────────────────────────────────────
    depublierProjet: builder.mutation({
      query: (id) => ({
        url: `/projets/${id}/depublier`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAGS.PROJET, id },
        { type: API_TAGS.PROJET, id: 'LIST' },
      ],
    }),

    // ── DELETE ────────────────────────────────────────────────────────────
    deleteProjet: builder.mutation({
      query: (id) => ({
        url: `/projets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: API_TAGS.PROJET, id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetAllProjetsQuery,
  useGetProjetsPubliesQuery,
  useGetProjetByIdQuery,
  useCreateProjetMutation,
  useUpdateProjetMutation,
  usePublierProjetMutation,
  useDepublierProjetMutation,
  useDeleteProjetMutation,
} = projetApi;

export default projetApi;
