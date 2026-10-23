import { createSlice } from '@reduxjs/toolkit';

/**
 * State d'authentification.
 *
 * Sécurité :
 *  - l'access token (15 min) reste UNIQUEMENT en mémoire : une faille XSS ne peut pas
 *    le retrouver dans le localStorage, et il disparaît à la fermeture de l'onglet ;
 *  - le refresh token est dans un cookie HttpOnly posé par le serveur (illisible en JS) ;
 *  - seul le profil (non secret) est gardé dans le localStorage pour l'affichage.
 *    Après un rechargement, le premier appel API reçoit 401 et baseApi récupère
 *    automatiquement un nouvel access token grâce au cookie.
 *
 * Structure:
 * {
 *   user: UserResponse | null,
 *   accessToken: string | null,
 *   isAuthenticated: boolean,
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
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ user: state.user }));
  } catch { /* silently ignore */ }
}

function clearStorage() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch { /* silently ignore */ }
}

const persisted = loadFromStorage();

const initialState = {
  user: persisted?.user ?? null,
  accessToken: null,
  isAuthenticated: !!persisted?.user,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Appelé quand une session est ouverte (connexion 2FA réussie, changement de mot de passe).
     * payload: AuthResponse (access_token, expires_in, user)
     */
    setCredentials(state, { payload }) {
      state.user            = payload.user ?? state.user;
      state.accessToken     = payload.access_token;
      state.isAuthenticated = true;
      saveToStorage(state);
    },

    /**
     * Met à jour l'access token après un refresh.
     */
    setAccessToken(state, { payload }) {
      state.accessToken = payload.access_token;
      if (payload.user) {
        state.user = payload.user;
        saveToStorage(state);
      }
    },

    /**
     * Déconnexion : vide tout.
     */
    logout(state) {
      state.user            = null;
      state.accessToken     = null;
      state.isAuthenticated = false;
      clearStorage();
    },
  },
});

export const { setCredentials, setAccessToken, logout } = authSlice.actions;

// Selectors
export const selectCurrentUser        = (state) => state.auth.user;
export const selectAccessToken        = (state) => state.auth.accessToken;
export const selectIsAuthenticated    = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
