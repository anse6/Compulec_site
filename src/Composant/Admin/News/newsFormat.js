/** Dates des articles dans la langue de l'interface (dayjs n'avait pas de locale chargée → toujours en anglais). */
export function formatNewsDate(dateStr, lang, withTime = false) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(lang, {
    day: "2-digit",
    month: withTime ? "long" : "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
}
