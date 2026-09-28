import baseApi from './baseApi';
import { API_TAGS } from '../constants';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllGalleries: builder.query({
      query: () => '/galleries',
      providesTags: [API_TAGS.GALLERY],
    }),
    
    getGalleriesByProjet: builder.query({
      query: (projetId) => `/galleries/projet/${projetId}`,
      providesTags: (result, error, arg) => [{ type: API_TAGS.GALLERY, id: arg }],
    }),

    createGallery: builder.mutation({
      query: (formData) => ({
        url: '/galleries',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [API_TAGS.GALLERY],
    }),

    updateGallery: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/galleries/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: [API_TAGS.GALLERY],
    }),

    deleteGallery: builder.mutation({
      query: (id) => ({
        url: `/galleries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.GALLERY],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllGalleriesQuery,
  useGetGalleriesByProjetQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
} = galleryApi;
