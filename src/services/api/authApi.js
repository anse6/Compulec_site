import baseApi from './baseApi';
import { API_TAGS } from '../constants';

/**
 * Endpoints d'authentification — mappés sur le AuthController Spring Boot.
 *
 * POST /auth/login                → { email, password }  → { mfa_required | mfa_setup_required, mfa_token }
 * POST /auth/mfa/verify           → { mfaToken, code }   → session (cookie HttpOnly + access_token)
 * POST /auth/mfa/setup            → { token: mfaToken }  → { otpauthUri, secret }
 * POST /auth/mfa/setup/confirm    → { mfaToken, code }   → session + backup_codes
 * POST /auth/forgot-password      → { email }  (envoie un lien à usage unique)
 * POST /auth/reset-password       → { token, newPassword, confirmNewPassword }
 * POST /auth/invitations/preview  → { token }
 * POST /auth/invitations/accept   → { token, code, password, confirmPassword }
 * POST /auth/refresh-token        → (cookie HttpOnly, géré par baseApi)
 * POST /auth/logout               → (Bearer token requis)
 *
 * Il n'y a plus d'inscription publique : les managers sont invités par un admin.
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

    // ── Forgot Password : envoie un lien à usage unique par e-mail ─────────
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body, // { email }
      }),
    }),

    // ── Reset Password : jeton du lien + nouveau mot de passe ──────────────
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body, // { token, newPassword, confirmNewPassword }
      }),
    }),

    // ── Invitation : vérifier le lien avant d'afficher le formulaire ───────
    previewInvitation: builder.mutation({
      query: (token) => ({
        url: '/auth/invitations/preview',
        method: 'POST',
        body: { token },
      }),
    }),

    // ── Invitation : activer le compte (lien + code admin + mot de passe) ──
    acceptInvitation: builder.mutation({
      query: (body) => ({
        url: '/auth/invitations/accept',
        method: 'POST',
        body, // { token, code, password, confirmPassword }
      }),
    }),

    // ── 2FA : étape 2 de la connexion (code de l'application ou de secours) ─
    verifyMfa: builder.mutation({
      query: (body) => ({
        url: '/auth/mfa/verify',
        method: 'POST',
        body, // { mfaToken, code }
      }),
    }),

    // ── 2FA : première connexion → QR code à scanner ──────────────────────
    startMfaSetup: builder.mutation({
      query: (mfaToken) => ({
        url: '/auth/mfa/setup',
        method: 'POST',
        body: { token: mfaToken },
      }),
    }),

    // ── 2FA : confirmation avec un premier code → session + codes de secours
    confirmMfaSetup: builder.mutation({
      query: (body) => ({
        url: '/auth/mfa/setup/confirm',
        method: 'POST',
        body, // { mfaToken, code }
      }),
    }),

    // ── Logout ───────────────────────────────────────────────────────────────
    logoutApi: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  usePreviewInvitationMutation,
  useAcceptInvitationMutation,
  useVerifyMfaMutation,
  useStartMfaSetupMutation,
  useConfirmMfaSetupMutation,
  useLogoutApiMutation,
} = authApi;

export default authApi;
