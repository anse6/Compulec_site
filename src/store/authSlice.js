import { createSlice } from '@reduxjs/toolkit';

/**
 * State d'authentification persisté dans localStorage.
 *
 * Structure:
 * {
 *   user: UserResponse | null,
 *   accessToken: string | null,
 *   refreshToken: string | null,
 *   isAuthenticated: boolean,
 *   // Token temporaire utilisé pendant le flux reset-password
 *   resetToken: string | null,
 * }
 */

const LOCAL_KEY = 'compulec_auth';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }));
  } catch { /* silently ignore */ }
}

function clearStorage() {
  localStorage.removeItem(LOCAL_KEY);
}

const persisted = loadFromStorage();

const initialState = {
  user: persisted?.user ?? null,
  accessToken: persisted?.accessToken ?? null,
  refreshToken: persisted?.refreshToken ?? null,
  isAuthenticated: !!persisted?.accessToken,
  // Token temporaire pour le flux forgot-password (step 2 → step 3)
  resetToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Appelé après un login ou register réussi.
     * payload: AuthResponse (access_token, refresh_token, expires_in, user)
     */
    setCredentials(state, { payload }) {
      state.user           = payload.user ?? null;
      state.accessToken    = payload.access_token;
      state.refreshToken   = payload.refresh_token;
      state.isAuthenticated = true;
      state.resetToken     = null;
      saveToStorage(state);
    },

    /**
     * Met à jour les tokens après un refresh.
     */
    setTokens(state, { payload }) {
      state.accessToken  = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      saveToStorage(state);
    },

    /**
     * Stocke le token temporaire retourné par verify-reset-code.
     */
    setResetToken(state, { payload }) {
      state.resetToken = payload;
    },

    /**
     * Déconnexion : vide tout.
     */
    logout(state) {
      state.user            = null;
      state.accessToken     = null;
      state.refreshToken    = null;
      state.isAuthenticated = false;
      state.resetToken      = null;
      clearStorage();
    },
  },
});

export const { setCredentials, setTokens, setResetToken, logout } = authSlice.actions;

// Selectors
export const selectCurrentUser        = (state) => state.auth.user;
export const selectAccessToken        = (state) => state.auth.accessToken;
export const selectIsAuthenticated    = (state) => state.auth.isAuthenticated;
export const selectResetToken         = (state) => state.auth.resetToken;

export default authSlice.reducer;
