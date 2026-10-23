import { useLocation } from "react-router-dom";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import footerLogo from "../assets/image.png";

// Icônes de réseaux sociaux personnalisées (SVG précis)
const InstagramIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const XIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
  </svg>
);

const WhatsappIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.0398 2.00005C6.5798 2.00005 2.1298 6.45005 2.1298 11.9101C2.1298 13.6601 2.5898 15.3601 3.4498 16.8601L2.0498 22.0001L7.2998 20.6201C8.7498 21.4101 10.3798 21.8301 12.0398 21.8301C17.4998 21.8301 21.9498 17.3801 21.9498 11.9201C21.9498 9.27005 20.9198 6.78005 19.0498 4.91005C18.1329 3.98416 17.0408 3.25002 15.8373 2.75042C14.6338 2.25081 13.3429 1.99574 12.0398 2.00005ZM12.0498 3.67005C14.2498 3.67005 16.3098 4.53005 17.8698 6.09005C18.6352 6.85557 19.242 7.76457 19.6556 8.76497C20.0691 9.76538 20.2813 10.8375 20.2798 11.9201C20.2798 16.4601 16.5798 20.1501 12.0398 20.1501C10.5598 20.1501 9.10981 19.7601 7.8498 19.0001L7.5498 18.8301L4.4298 19.6501L5.2598 16.6101L5.0598 16.2901C4.23435 14.9785 3.79747 13.4598 3.7998 11.9101C3.8098 7.37005 7.4998 3.67005 12.0498 3.67005ZM8.5298 7.33005C8.3698 7.33005 8.0998 7.39005 7.8698 7.64005C7.6498 7.89005 6.9998 8.50005 6.9998 9.71005C6.9998 10.9301 7.8898 12.1001 7.9998 12.2701C8.1398 12.4401 9.7598 14.9401 12.2498 16.0001C12.8398 16.2701 13.2998 16.4201 13.6598 16.5301C14.2498 16.7201 14.7898 16.6901 15.2198 16.6301C15.6998 16.5601 16.6798 16.0301 16.8898 15.4501C17.0998 14.8701 17.0998 14.3801 17.0398 14.2701C16.9698 14.1701 16.8098 14.1101 16.5598 14.0001C16.3098 13.8601 15.0898 13.2601 14.8698 13.1801C14.6398 13.1001 14.4998 13.0601 14.3098 13.3001C14.1498 13.5501 13.6698 14.1101 13.5298 14.2701C13.3798 14.4401 13.2398 14.4601 12.9998 14.3401C12.7398 14.2101 11.9398 13.9501 10.9998 13.1101C10.2598 12.4501 9.7698 11.6401 9.6198 11.3901C9.4998 11.1501 9.6098 11.0001 9.7298 10.8901C9.8398 10.7801 9.9998 10.6001 10.0998 10.4501C10.2298 10.3101 10.2698 10.2001 10.3498 10.0401C10.4298 9.87005 10.3898 9.73005 10.3298 9.61005C10.2698 9.50005 9.7698 8.26005 9.5598 7.77005C9.35981 7.29005 9.1598 7.35005 8.9998 7.34005C8.8598 7.34005 8.6998 7.33005 8.5298 7.33005Z"
      fill="currentColor"
    />
  </svg>
);

const TiktokIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

// Catégories principales de services (sans les sous-services), synchronisées avec Header.jsx
// href = premier sous-service de la catégorie, utilisé comme page d'entrée vers "service-detail"
const footerServicesCategories = {
  EN: [
    { label: "All Services", href: "services", isMainList: true },
    { label: "Digital Solution", href: "website-development" },
    {
      label: "Computer, IT Requirements & Consumables",
      href: "laptops-desktops",
    },
    { label: "Computer Security", href: "cybersecurity" },
    {
      label: "Infrastructure & Network",
      href: "network-system-administration",
    },
    { label: "Energy Solution", href: "electrical-energy-solutions" },
    { label: "Conferencing Solution", href: "meeting-room-solutions" },
    { label: "Training", href: "it-technology-training" },
    { label: "IT Services & Support", href: "technical-support" },
  ],

  FR: [
    { label: "Tous les services", href: "services", isMainList: true },
    { label: "Solution numérique", href: "website-development" },
    {
      label: "Ordinateur, exigences IT & consommables",
      href: "laptops-desktops",
    },
    { label: "Sécurité informatique", href: "cybersecurity" },
    { label: "Infrastructure & Réseau", href: "network-system-administration" },
    { label: "Solution énergie", href: "electrical-energy-solutions" },
    { label: "Solution de conférence", href: "meeting-room-solutions" },
    { label: "Formation", href: "it-technology-training" },
    { label: "Services & support IT", href: "technical-support" },
  ],

  ES: [
    { label: "Todos los servicios", href: "services", isMainList: true },
    { label: "Solución digital", href: "website-development" },
    {
      label: "Computadoras, requisitos de TI y consumibles",
      href: "laptops-desktops",
    },
    { label: "Seguridad informática", href: "cybersecurity" },
    { label: "Infraestructura y Red", href: "network-system-administration" },
    { label: "Solución energética", href: "electrical-energy-solutions" },
    { label: "Solución de conferencias", href: "meeting-room-solutions" },
    { label: "Capacitación", href: "it-technology-training" },
    { label: "Servicios y soporte de TI", href: "technical-support" },
  ],

  CH: [
    { label: "全部服务", href: "services", isMainList: true },
    { label: "数字解决方案", href: "website-development" },
    { label: "电脑、IT需求与耗材", href: "laptops-desktops" },
    { label: "计算机安全", href: "cybersecurity" },
    { label: "基础设施与网络", href: "network-system-administration" },
    { label: "能源解决方案", href: "electrical-energy-solutions" },
    { label: "会议解决方案", href: "meeting-room-solutions" },
    { label: "培训", href: "it-technology-training" },
    { label: "IT服务与支持", href: "technical-support" },
  ],

  AR: [
    { label: "جميع الخدمات", href: "services", isMainList: true },
    { label: "الحلول الرقمية", href: "website-development" },
    {
      label: "أجهزة الكمبيوتر ومتطلبات تكنولوجيا المعلومات والمواد الاستهلاكية",
      href: "laptops-desktops",
    },
    { label: "أمن الحاسوب", href: "cybersecurity" },
    { label: "البنية التحتية والشبكات", href: "network-system-administration" },
    { label: "حلول الطاقة", href: "electrical-energy-solutions" },
    { label: "حلول المؤتمرات", href: "meeting-room-solutions" },
    { label: "التدريب", href: "it-technology-training" },
    { label: "خدمات ودعم تكنولوجيا المعلومات", href: "technical-support" },
  ],
};

export default function Footer({
  currentLang,
  t,
  onOpenConsultation,
  onNavigate,
}) {
  const f = t.footerNew;
  const location = useLocation();
  const isHome = location.pathname === "/home" || location.pathname === "/";

  const servicesList =
    footerServicesCategories[currentLang] || footerServicesCategories.EN;

  return (
    <footer
      id="contact"
      className="bg-[#17253f] pt-20 pb-8 text-white relative"
    >
      <div className="w-full px-8 sm:px-16 lg:px-24 xl:px-32">
        {/* Banner CTA (Floating Card) — visible uniquement sur la page Home */}
        {isHome && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16 relative z-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-black text-[#17253f] leading-tight mb-3">
                {f.ctaTitle}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {f.ctaSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenConsultation}
                className="bg-[#ffde58] hover:bg-yellow-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer text-sm shadow-sm hover:shadow-lg"
              >
                {f.ctaRequest}
              </button>
              <button
                onClick={onOpenConsultation}
                className="bg-white border border-slate-200 text-[#17253f] hover:bg-slate-50 font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer text-sm"
              >
                {f.ctaContact}
              </button>
            </div>
          </div>
        )}

        {/* Main Footer Contents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
          {/* Logo & Direct Consultation Column */}
          <div className="flex flex-col items-start">
            <img
              src={footerLogo}
              alt="Compulec Logo"
              className="h-16 w-auto object-contain mb-6"
            />
            <button
              onClick={onOpenConsultation}
              className="bg-[#ffde58] hover:bg-yellow-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              {f.ctaRequest}
            </button>
          </div>

          {/* Column Company */}
          <div>
            <h4 className="text-xs font-bold text-[#ffde58] tracking-[0.2em] uppercase mb-6">
              {f.company}
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("about");
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.about}
                </a>
              </li>
              <li>
                <a
                  href="about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("home");
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.team}
                </a>
              </li>
              <li>
                <a
                  href="about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("about");
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.projects}
                </a>
              </li>
              <li>
                <a
                  href="about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("about");
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.testimonials}
                </a>
              </li>
            </ul>
          </div>

          {/* Column Solutions - Catégories principales de services (Header sync) */}
          <div>
            <h4 className="text-xs font-bold text-[#ffde58] tracking-[0.2em] uppercase mb-6">
              {f.solutions}
            </h4>
            <ul className="space-y-3.5">
              {servicesList.map((item, idx) => (
                <li key={`footer-service-${idx}`}>
                  <a
                    href={item.isMainList ? "#" : `/services/${item.href}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.isMainList) {
                        onNavigate("services");
                      } else {
                        onNavigate("service-detail", item.href);
                      }
                    }}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column Resources */}
          <div>
            <h4 className="text-xs font-bold text-[#ffde58] tracking-[0.2em] uppercase mb-6">
              {f.resources}
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="resources"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("home");
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.news}
                </a>
              </li>
              <li>
                <a
                  href="faq"
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.faq}
                </a>
              </li>
              <li>
                <a
                  href="gallery"
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.gallery}
                </a>
              </li>
              {/* <li>
                
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  {f.search}
                </a>
              </li> */}
            </ul>
          </div>

          {/* Column Contact */}
          <div>
            <h4 className="text-xs font-bold text-[#ffde58] tracking-[0.2em] uppercase mb-6">
              {f.contact}
            </h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-center gap-3 text-sm">
                <MailOutlined className="text-[#ffde58] text-base flex-shrink-0" />

                <a
                  href="mailto:contact@compulec.com"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  contact@compulec.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <PhoneOutlined className="text-[#ffde58] text-base flex-shrink-0" />
                <span className="text-slate-300">+237 674 286 914</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <PhoneOutlined className="text-[#ffde58] text-base flex-shrink-0" />
                <span className="text-slate-300">+237 679 444 985</span>
              </li>

              <li className="flex items-center gap-3 text-sm">
                <EnvironmentOutlined className="text-[#ffde58] text-base flex-shrink-0" />
                <span className="text-slate-300">Location</span>
              </li>
            </ul>

            {/* Socials Row */}
            <div className="flex items-center gap-4 text-[#ffde58]">
              <a href="https://www.instagram.com/compulectech?igsh=OXMzNDM5emx1a3Bk">
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/share/19B4Vg2Dpi/">
                <FacebookIcon />
              </a>
              <a href="https://x.com/CompulecTech">
                <XIcon />
              </a>

              <a
                href="https://wa.me/237674286914?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20le%20site%20de%20Compulec"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsappIcon />
              </a>
              <a href="https://www.tiktok.com/@compulec?_r=1&_t=ZS-98xItroNjFs">
                <TiktokIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{f.rights}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              {f.privacy}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {f.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
