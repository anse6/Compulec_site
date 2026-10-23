import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL, API_TAGS } from '../constants';
import { logout, setAccessToken } from '../../store/authSlice';

/**
 * baseQuery configurée avec le Bearer token (en mémoire) depuis Redux.
 * credentials: 'include' → le navigateur envoie le cookie HttpOnly du refresh token
 * aux endpoints /api/auth (et accepte le Set-Cookie du serveur).
 */
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
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

// Un seul refresh à la fois : le refresh token est rotatif (à usage unique),
// plusieurs requêtes 401 simultanées doivent partager le même renouvellement.
let refreshPromise = null;

async function refreshAccessToken(api, extraOptions) {
  const attempt = () =>
    baseQuery({ url: '/auth/refresh-token', method: 'POST' }, api, extraOptions);

  let result = await attempt();
  if (result?.error?.status === 401) {
    // Un autre onglet vient peut-être de faire tourner le cookie : on réessaie une fois
    await new Promise((resolve) => setTimeout(resolve, 400));
    result = await attempt();
  }
  return result?.data?.data?.access_token ? result.data.data : null;
}

/**
 * baseQuery avec renouvellement automatique de l'access token sur 401.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const url = typeof args === 'string' ? args : args.url;
  // Les endpoints d'authentification gèrent leurs propres erreurs (mauvais mot de passe, code 2FA…)
  if (result?.error?.status !== 401 || url.startsWith('/auth/')) {
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(api, extraOptions).finally(() => {
      refreshPromise = null;
    });
  }
  const session = await refreshPromise;

  if (session) {
    api.dispatch(setAccessToken(session));
    result = await baseQuery(args, api, extraOptions);
  } else {
    api.dispatch(logout());
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
