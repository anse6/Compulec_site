/**
 * Formatage partagé par les widgets du tableau de bord (dates, mois du graphique).
 * Les dates du backend sont des LocalDateTime sans fuseau ("2026-10-16T14:05:00"),
 * interprétées dans le fuseau du navigateur.
 */

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** "Aujourd'hui, 14:05" / "Hier, 09:12" / "03 oct. 2026" selon le jour calendaire. */
export function formatDashboardDate(dateStr, t, lang) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";

  const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000);
  const time = d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });

  if (dayDiff === 0) return t("admin.dashboard.today", { time });
  if (dayDiff === 1) return t("admin.dashboard.yesterday", { time });
  return d.toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" });
}

/** "2026-10" → "oct." (fr) / "Oct" (en) ; l'année est ajoutée en janvier pour marquer le changement d'année. */
export function formatChartMonth(isoMonth, lang) {
  const [year, month] = String(isoMonth).split("-").map(Number);
  if (!year || !month) return isoMonth;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(lang, month === 1 ? { month: "short", year: "2-digit" } : { month: "short" });
}
