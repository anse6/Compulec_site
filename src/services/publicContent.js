import { BASE_URL } from "./constants";
import { SERVICE_CATEGORIES, findCategory, labelOf, splitServices } from "./projectCatalog";

/**
 * Outils d'affichage des contenus réels (projets, articles) sur le site public.
 */

// Le backend renvoie des chemins "/api/uploads/xxx.png" (parfois "/uploads/xxx.png")
const BASE_HOST = BASE_URL.replace(/\/api$/, "");

/** URL absolue d'une image envoyée par le backend, ou null. */
export function getMediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  let p = path.startsWith("/") ? path : `/${path}`;
  if (p.startsWith("/uploads/")) p = `/api${p}`;
  return `${BASE_HOST}${p}`;
}

/** Code de langue du site public ("FR", "EN", "ES", "AR", "CH") → locale Intl. */
const INTL_LOCALES = { FR: "fr-FR", EN: "en-GB", ES: "es-ES", AR: "ar", CH: "zh-CN" };

export function intlLocale(currentLang) {
  return INTL_LOCALES[currentLang] || "fr-FR";
}

/** Le catalogue des projets n'existe qu'en "fr" / "en". */
export function catalogLang(currentLang) {
  return currentLang === "FR" ? "fr" : "en";
}

export function formatPublicDate(dateStr, currentLang) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(intlLocale(currentLang), { day: "numeric", month: "short", year: "numeric" });
}

/** Libellé traduit d'une catégorie de projet (valeur inconnue → affichée telle quelle). */
export function categoryLabel(value, currentLang) {
  const category = findCategory(value);
  return category ? labelOf(category, catalogLang(currentLang)) : value || "";
}

const SERVICES_BY_VALUE = new Map(
  SERVICE_CATEGORIES.flatMap((c) => c.services.map((s) => [s.value, s])),
);

/** Libellés traduits des services d'un projet (champ unique "A, B"), joints par " · ". */
export function servicesLabel(value, currentLang) {
  const lang = catalogLang(currentLang);
  return splitServices(value)
    .map((v) => (SERVICES_BY_VALUE.has(v) ? labelOf(SERVICES_BY_VALUE.get(v), lang) : v))
    .join(" · ");
}

/** Temps de lecture estimé (≈ 200 mots / minute, minimum 1 min). */
export function readingMinutes(...texts) {
  const words = texts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
