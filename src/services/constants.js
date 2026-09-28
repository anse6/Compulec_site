// API base URL — pointe vers le backend Spring Boot (avec le context-path /api)
export const BASE_URL = "http://localhost:8080/api";
// export const BASE_URL = "http://192.168.1.193:8080/api";

// Préfixe de chaque requête API (base path de l'application Spring Boot)
// Le backend ne préfixe pas par /api pour l'auth, il utilise /auth directement
export const API_TAGS = {
  AUTH: "Auth",
  USER: "User",
  PROJET: "Projet",
  GALLERY: "Gallery",
  CONTACT: "Contact",
  CONSULTATION: "Consultation",
  CHAT: "Chat",
  NEWS: "News",
  DASHBOARD: "Dashboard",
};
