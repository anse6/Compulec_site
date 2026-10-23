/**
 * Catalogue des projets : catégories de services, services et secteurs d'activité.
 *
 * - `value` est la valeur enregistrée en base (anglais, stable, indépendante de la langue
 *   de l'interface) : ne la modifiez pas une fois des projets enregistrés avec.
 * - `fr` / `en` sont les libellés affichés.
 * - Les catégories et services reprennent ceux de la page « Services » du site
 *   (même ordre, même `slug`), pour que les projets restent cohérents avec l'offre.
 */

export const SERVICE_CATEGORIES = [
  {
    value: "Digital Solutions",
    fr: "Solutions Numériques",
    en: "Digital Solutions",
    services: [
      { value: "Website Development", slug: "website-development", fr: "Développement Web", en: "Website Development" },
      { value: "Software Development & Integration", slug: "software-development-integration", fr: "Développement Logiciel", en: "Software Development" },
      { value: "AI Integrations", slug: "ai-integration", fr: "Intégrations IA", en: "AI Integrations" },
    ],
  },
  {
    value: "IT Hardware & Consumables",
    fr: "Ordinateurs, Équipements IT & Consommables",
    en: "Computers, IT Equipment & Consumables",
    services: [
      { value: "Laptops & Desktops", slug: "laptops-desktops", fr: "Ordinateurs portables et Desktops", en: "Laptops and Desktops" },
      { value: "Mobile Devices", slug: "mobile-devices", fr: "Appareils mobiles", en: "Mobile Devices" },
      { value: "IT Equipment & Gadgets", slug: "it-equipment-gadgets", fr: "Équipement IT et gadgets", en: "IT Equipment and Gadgets" },
      { value: "IT Consumables", slug: "it-consumables", fr: "Consommables", en: "Consumables" },
    ],
  },
  {
    value: "Computer Security",
    fr: "Sécurité Informatique",
    en: "Computer Security",
    services: [
      { value: "Cybersecurity", slug: "cybersecurity", fr: "Cybersécurité", en: "Cybersecurity" },
      { value: "Video Surveillance", slug: "video-surveillance", fr: "Vidéosurveillance", en: "Video Surveillance" },
      { value: "Biometrics & Access Control", slug: "biometric-access-control", fr: "Biométrie & Contrôle d'accès", en: "Biometric & Access Control" },
      { value: "Fire Detection & Alarms", slug: "fire-detection-alarms", fr: "Système de Détection Incendie & Alarmes", en: "Fire Detection System & Alarms" },
    ],
  },
  {
    value: "Infrastructure & Network",
    fr: "Infrastructures & Réseau",
    en: "Infrastructure & Network",
    services: [
      { value: "Network & System Administration Installation", slug: "network-system-administration", fr: "Installation et Administration de Systèmes et Réseaux", en: "Network and System Administration Installation" },
      { value: "Cloud Solutions", slug: "cloud-solutions", fr: "Solutions Cloud", en: "Cloud Solutions" },
    ],
  },
  {
    value: "Energy Solutions",
    fr: "Solutions Énergétiques",
    en: "Energy Solutions",
    services: [
      { value: "Electrical & Energy Solutions", slug: "electrical-energy-solutions", fr: "Solutions Électriques & Énergétiques", en: "Electrical & Energy Solutions" },
    ],
  },
  {
    value: "Conferencing Solutions",
    fr: "Solutions de Conférence",
    en: "Conferencing Solutions",
    services: [
      { value: "Meeting Room Solutions", slug: "meeting-room-solutions", fr: "Solutions de Salle de Réunion", en: "Meeting Room Solutions" },
    ],
  },
  {
    value: "Training",
    fr: "Formation",
    en: "Training",
    services: [
      { value: "IT & Technology Training", slug: "it-technology-training", fr: "Formation IT & Technologique", en: "IT & Technology Training" },
    ],
  },
  {
    value: "IT Services & Support",
    fr: "Services IT & Support",
    en: "IT Services & Support",
    services: [
      { value: "Technical Support", slug: "technical-support", fr: "Support Technique", en: "Technical Support" },
    ],
  },
];

export const SECTORS = [
  { value: "Government & Public Administration", fr: "Administration publique & Gouvernement", en: "Government & Public Administration" },
  { value: "Banking, Finance & Insurance", fr: "Banque, Finance & Assurance", en: "Banking, Finance & Insurance" },
  { value: "Telecommunications", fr: "Télécommunications", en: "Telecommunications" },
  { value: "Education & Research", fr: "Éducation & Recherche", en: "Education & Research" },
  { value: "Healthcare", fr: "Santé", en: "Healthcare" },
  { value: "Energy & Utilities", fr: "Énergie & Services publics (eau, électricité)", en: "Energy & Utilities" },
  { value: "Oil, Gas & Mining", fr: "Pétrole, Gaz & Mines", en: "Oil, Gas & Mining" },
  { value: "Industry & Manufacturing", fr: "Industrie & Production", en: "Industry & Manufacturing" },
  { value: "Construction & Real Estate", fr: "BTP & Immobilier", en: "Construction & Real Estate" },
  { value: "Retail & Distribution", fr: "Commerce & Distribution", en: "Retail & Distribution" },
  { value: "Transport & Logistics", fr: "Transport & Logistique", en: "Transport & Logistics" },
  { value: "Hospitality & Tourism", fr: "Hôtellerie & Tourisme", en: "Hospitality & Tourism" },
  { value: "Agriculture & Agri-food", fr: "Agriculture & Agroalimentaire", en: "Agriculture & Agri-food" },
  { value: "Media & Communication", fr: "Médias & Communication", en: "Media & Communication" },
  { value: "NGOs & International Organizations", fr: "ONG & Organisations internationales", en: "NGOs & International Organizations" },
  { value: "Security & Defense", fr: "Sécurité & Défense", en: "Security & Defense" },
  { value: "Private Companies & SMEs", fr: "Entreprises privées & PME", en: "Private Companies & SMEs" },
  { value: "Individuals", fr: "Particuliers", en: "Individuals" },
  { value: "Other", fr: "Autre", en: "Other" },
];

/** Plusieurs services sont enregistrés dans un seul champ, séparés par ce séparateur. */
export const SERVICE_SEPARATOR = ", ";

export function splitServices(value) {
  return (value || "")
    .split(SERVICE_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinServices(values) {
  return (values || []).join(SERVICE_SEPARATOR);
}

/** Libellé d'une entrée du catalogue dans la langue courante ("fr" ou "en"). */
export function labelOf(entry, lang) {
  return entry[lang === "en" ? "en" : "fr"];
}

/**
 * Options d'un Select. Une ancienne valeur absente du catalogue (projets créés avant
 * les listes) est ajoutée telle quelle, pour ne jamais être perdue à la modification.
 */
export function toOptions(entries, lang, currentValues = []) {
  const options = entries.map((e) => ({ value: e.value, label: labelOf(e, lang) }));
  const known = new Set(entries.map((e) => e.value));
  currentValues
    .filter((v) => v && !known.has(v))
    .forEach((v) => options.push({ value: v, label: v }));
  return options;
}

export function findCategory(value) {
  return SERVICE_CATEGORIES.find((c) => c.value === value);
}
