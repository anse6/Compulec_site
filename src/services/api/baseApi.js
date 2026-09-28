import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL, API_TAGS } from '../constants';
import { logout } from '../../store/authSlice';

/**
 * baseQuery configurée avec le Bearer token depuis Redux.
 * Re-essaie avec le refresh token si le serveur renvoie 401.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // ⚠️ NE PAS forcer Content-Type ici.
    // Pour les requêtes JSON, fetchBaseQuery le définit automatiquement.
    // Pour les requêtes multipart/form-data (FormData), le navigateur doit
    // le définir lui-même avec le boundary correct — sinon Spring Boot rejette la requête.
    return headers;
  },
});

/**
 * baseQuery with automatic refresh-token retry on 401.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: `/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
          method: 'POST',
        },
        api,
        extraOptions
      );

      if (refreshResult?.data?.data?.access_token) {
        // On a un nouveau token — on importe dynamiquement pour éviter les
        // dépendances circulaires
        const { setTokens } = await import('../../store/authSlice');
        api.dispatch(
          setTokens({
            accessToken: refreshResult.data.data.access_token,
            refreshToken: refreshResult.data.data.refresh_token,
          })
        );
        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed → logout
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

/**
 * RTK Query base API — toutes les autres API étendent celle-ci via injectEndpoints.
 */
const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
});

export default baseApi;
