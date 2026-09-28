import baseApi from './baseApi';
import { API_TAGS } from '../constants';

const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: (params) => ({
        url: '/articles',
        method: 'GET',
        params,
      }),
      providesTags: [API_TAGS.NEWS],
    }),
    
    getArticlesPublies: builder.query({
      query: (params) => ({
        url: '/articles/publies',
        method: 'GET',
        params,
      }),
      providesTags: [API_TAGS.NEWS],
    }),

    getArticleById: builder.query({
      query: (id) => `/articles/${id}`,
      providesTags: (result, error, id) => [{ type: API_TAGS.NEWS, id }],
    }),

    createArticle: builder.mutation({
      query: (formData) => ({
        url: '/articles',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [API_TAGS.NEWS],
    }),

    updateArticle: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/articles/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.NEWS, id },
        API_TAGS.NEWS,
      ],
    }),

    publierArticle: builder.mutation({
      query: (id) => ({
        url: `/articles/${id}/publier`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAGS.NEWS, id },
        API_TAGS.NEWS,
      ],
    }),

    depublierArticle: builder.mutation({
      query: (id) => ({
        url: `/articles/${id}/depublier`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAGS.NEWS, id },
        API_TAGS.NEWS,
      ],
    }),

    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `/articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.NEWS],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticlesPubliesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  usePublierArticleMutation,
  useDepublierArticleMutation,
  useDeleteArticleMutation,
} = newsApi;

export default newsApi;
