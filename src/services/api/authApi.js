import baseApi from './baseApi';
import { API_TAGS } from '../constants';

/**
 * Endpoints d'authentification — mappés sur le AuthController Spring Boot.
 *
 * POST /auth/login              → { email, password }
 * POST /auth/forgot-password    → { email }
 * POST /auth/verify-reset-code  → { code }
 * POST /auth/reset-password     → { newPassword, confirmNewPassword }  (Bearer token requis)
 * POST /auth/refresh-token      → ?refreshToken=...
 * POST /auth/logout             → (Bearer token requis)
 * POST /auth/register           → { nom, prenom, email, password, ... }
 */
const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Login ────────────────────────────────────────────────────────────────
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials, // { email, password }
      }),
      invalidatesTags: [API_TAGS.AUTH],
    }),

    // ── Forgot Password (Step 1: send code by email) ────────────────────────
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body, // { email }
      }),
    }),

    // ── Verify Reset Code (Step 2) ───────────────────────────────────────────
    verifyResetCode: builder.mutation({
      query: (body) => ({
        url: '/auth/verify-reset-code',
        method: 'POST',
        body, // { code }
      }),
    }),

    // ── Reset Password (Step 3 — needs Bearer temp token) ───────────────────
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body, // { newPassword, confirmNewPassword }
      }),
    }),

    // ── Refresh Token ────────────────────────────────────────────────────────
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: `/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
        method: 'POST',
      }),
    }),

    // ── Logout ───────────────────────────────────────────────────────────────
    logoutApi: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // ── Register (Admin) ─────────────────────────────────────────────────────
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.AUTH],
    }),

  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutApiMutation,
  useRegisterMutation,
} = authApi;

export default authApi;
