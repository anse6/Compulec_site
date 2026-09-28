import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DownOutlined,
  SearchOutlined,
  MenuOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Dropdown, Drawer, ConfigProvider, theme, Menu } from "antd";
import logo from "../assets/logo.png";

export default function Header({
  currentLang,
  setLang,
  t,
  onOpenConsultation,
  onNavigate,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navTranslations = {
    EN: {
      home: "Home",
      about: "About",
      services: "Services",
      productsSolutions: "Products & Solutions",
      projects: "Projects",
      resources: "Resources",
      contact: "Contact",
      cta: "Request a Consultation",
    },

    FR: {
      home: "Accueil",
      about: "À propos",
      services: "Services",
      productsSolutions: "Produits & Solutions",
      projects: "Projets",
      resources: "Ressources",
      contact: "Contact",
      cta: "Demander une consultation",
    },

    ES: {
      home: "Inicio",
      about: "Nosotros",
      services: "Servicios",
      productsSolutions: "Productos y Soluciones",
      projects: "Proyectos",
      resources: "Recursos",
      contact: "Contacto",
      cta: "Solicitar una consulta",
    },

    CH: {
      home: "首页",
      about: "关于我们",
      services: "服务",
      productsSolutions: "产品与解决方案",
      projects: "项目",
      resources: "资源",
      contact: "联系我们",
      cta: "申请咨询",
    },

    AR: {
      home: "الرئيسية",
      about: "من نحن",
      services: "الخدمات",
      productsSolutions: "المنتجات والحلول",
      projects: "المشاريع",
      resources: "الموارد",
      contact: "اتصل بنا",
      cta: "طلب استشارة",
    },
  };

  const nav = navTranslations[currentLang] || navTranslations.EN;

  const dropdowns = {
    about: {
      EN: [
        { label: "Company Overview", href: "#about" },
        { label: "Mission & Vision", href: "#mission-vision" },
        { label: "Values", href: "#values" },
        { label: "Testimonials", href: "#testimonials" },
      ],

      FR: [
        { label: "Présentation de l'entreprise", href: "#about" },
        { label: "Mission & Vision", href: "#mission-vision" },
        { label: "Valeurs", href: "#values" },
        { label: "Témoignages", href: "#testimonials" },
      ],

      ES: [
        { label: "Presentación de la empresa", href: "#about" },
        { label: "Misión y Visión", href: "#mission-vision" },
        { label: "Valores", href: "#values" },
        { label: "Testimonios", href: "#testimonials" },
      ],

      CH: [
        { label: "公司概况", href: "#about" },
        { label: "使命与愿景", href: "#mission-vision" },
        { label: "价值观", href: "#values" },
        { label: "客户评价", href: "#testimonials" },
      ],

      AR: [
        { label: "نبذة عن الشركة", href: "#about" },
        { label: "الرسالة والرؤية", href: "#mission-vision" },
        { label: "القيم", href: "#values" },
        { label: "شهادات العملاء", href: "#testimonials" },
      ],
    },

    services: {
      EN: [
        { label: "All Services", href: "services" },
        {
          label: "Digital Solution",
          subItems: [
            { label: "Web Development", href: "website-development" },
            {
              label: "Software Development",
              href: "software-development-integration",
            },
            { label: "AI Integration", href: "ai-integration" },
          ],
        },
        {
          label: "Computer, IT Requirements & Consumables",
          subItems: [
            { label: "Laptops & Desktops", href: "laptops-desktops" },
            { label: "Mobile Devices", href: "mobile-devices" },
            { label: "IT Equipment and Gadgets", href: "it-equipment-gadgets" },
            { label: "IT Consumables", href: "it-consumables" },
          ],
        },
        {
          label: "Computer Security",
          subItems: [
            { label: "Cybersecurity", href: "cybersecurity" },
            { label: "Video Surveillance", href: "video-surveillance" },
            {
              label: "Biometric & Access Control",
              href: "biometric-access-control",
            },
            {
              label: "Fire Detection & Alarm",
              href: "fire-detection-alarms",
            },
          ],
        },
        {
          label: "Infrastructure & Network",
          subItems: [
            {
              label: "Network & System Administration Installation",
              href: "network-system-administration",
            },
            {
              label: "Cloud Solutions",
              href: "cloud-solutions",
            },
          ],
        },
        {
          label: "Energy Solution",
          subItems: [
            {
              label: "Electrical & Energy Solution",
              href: "electrical-energy-solutions",
            },
          ],
        },
        {
          label: "Conferencing Solution",
          subItems: [
            {
              label: "Meeting Room Solution",
              href: "meeting-room-solutions",
            },
          ],
        },
        {
          label: "Training",
          subItems: [
            {
              label: "IT & Technology Training",
              href: "it-technology-training",
            },
          ],
        },
        {
          label: "IT Services & Support",
          subItems: [
            {
              label: "Technical Support",
              href: "technical-support",
            },
          ],
        },
      ],

      FR: [
        { label: "Tous les services", href: "services" },
        {
          label: "Solution numérique",
          subItems: [
            { label: "Développement web", href: "website-development" },
            {
              label: "Développement logiciel",
              href: "software-development-integration",
            },
            { label: "Intégration IA", href: "ai-integration" },
          ],
        },
        {
          label: "Ordinateur, exigences IT & consommables",
          subItems: [
            {
              label: "Ordinateurs portables & ordinateurs de bureau",
              href: "laptops-desktops",
            },
            {
              label: "Appareils mobiles",
              href: "mobile-devices",
            },
            {
              label: "Équipement IT et gadgets",
              href: "it-equipment-gadgets",
            },
            {
              label: "Consommables IT",
              href: "it-consumables",
            },
          ],
        },
        {
          label: "Sécurité informatique",
          subItems: [
            {
              label: "Cybersécurité",
              href: "cybersecurity",
            },
            {
              label: "Surveillance vidéo",
              href: "video-surveillance",
            },
            {
              label: "Biométrie & contrôle d'accès",
              href: "biometric-access-control",
            },
            {
              label: "Détection d'incendie & alarme",
              href: "fire-detection-alarms",
            },
          ],
        },
        {
          label: "Infrastructure & Réseau",
          subItems: [
            {
              label: "Installation réseau & administration système",
              href: "network-system-administration",
            },
            {
              label: "Solutions Cloud",
              href: "cloud-solutions",
            },
          ],
        },
        {
          label: "Solution énergie",
          subItems: [
            {
              label: "Solution électrique & énergie",
              href: "electrical-energy-solutions",
            },
          ],
        },
        {
          label: "Solution de conférence",
          subItems: [
            {
              label: "Solution salle de réunion",
              href: "meeting-room-solutions",
            },
          ],
        },
        {
          label: "Formation",
          subItems: [
            {
              label: "Formation IT & technologie",
              href: "it-technology-training",
            },
          ],
        },
        {
          label: "Services & support IT",
          subItems: [
            {
              label: "Support Technique",
              href: "technical-support",
            },
          ],
        },
      ],

      ES: [
        { label: "Todos los servicios", href: "services" },
        {
          label: "Solución digital",
          subItems: [
            {
              label: "Desarrollo web",
              href: "website-development",
            },
            {
              label: "Desarrollo de software",
              href: "software-development-integration",
            },
            {
              label: "Integración de IA",
              href: "ai-integration",
            },
          ],
        },
        {
          label: "Computadoras, requisitos de TI y consumibles",
          subItems: [
            {
              label: "Computadoras portátiles y de escritorio",
              href: "laptops-desktops",
            },
            {
              label: "Dispositivos móviles",
              href: "mobile-devices",
            },
            {
              label: "Equipos y gadgets de TI",
              href: "it-equipment-gadgets",
            },
            {
              label: "Consumibles de TI",
              href: "it-consumables",
            },
          ],
        },
        {
          label: "Seguridad informática",
          subItems: [
            {
              label: "Ciberseguridad",
              href: "cybersecurity",
            },
            {
              label: "Videovigilancia",
              href: "video-surveillance",
            },
            {
              label: "Biometría y control de acceso",
              href: "biometric-access-control",
            },
            {
              label: "Detección de incendios y alarma",
              href: "fire-detection-alarms",
            },
          ],
        },
        {
          label: "Infraestructura y Red",
          subItems: [
            {
              label: "Instalación de red y administración de sistemas",
              href: "network-system-administration",
            },
            {
              label: "Soluciones en la nube",
              href: "cloud-solutions",
            },
          ],
        },
        {
          label: "Solución energética",
          subItems: [
            {
              label: "Solución eléctrica y energética",
              href: "electrical-energy-solutions",
            },
          ],
        },
        {
          label: "Solución de conferencias",
          subItems: [
            {
              label: "Solución de sala de reuniones",
              href: "meeting-room-solutions",
            },
          ],
        },
        {
          label: "Capacitación",
          subItems: [
            {
              label: "Capacitación en TI y tecnología",
              href: "it-technology-training",
            },
          ],
        },
        {
          label: "Servicios y soporte de TI",
          subItems: [
            {
              label: "Soporte Técnico",
              href: "technical-support",
            },
          ],
        },
      ],

      CH: [
        { label: "全部服务", href: "services" },
        {
          label: "数字解决方案",
          subItems: [
            { label: "网站开发", href: "website-development" },
            {
              label: "软件开发与集成",
              href: "software-development-integration",
            },
            { label: "人工智能集成", href: "ai-integration" },
          ],
        },
        {
          label: "电脑、IT需求与耗材",
          subItems: [
            {
              label: "笔记本电脑与台式电脑",
              href: "laptops-desktops",
            },
            {
              label: "移动设备",
              href: "mobile-devices",
            },
            {
              label: "IT设备与配件",
              href: "it-equipment-gadgets",
            },
            {
              label: "IT耗材",
              href: "it-consumables",
            },
          ],
        },
        {
          label: "计算机安全",
          subItems: [
            {
              label: "网络安全",
              href: "cybersecurity",
            },
            {
              label: "视频监控",
              href: "video-surveillance",
            },
            {
              label: "生物识别与门禁控制",
              href: "biometric-access-control",
            },
            {
              label: "火灾探测与报警",
              href: "fire-detection-alarms",
            },
          ],
        },
        {
          label: "基础设施与网络",
          subItems: [
            {
              label: "网络与系统管理安装",
              href: "network-system-administration",
            },
            {
              label: "云解决方案",
              href: "cloud-solutions",
            },
          ],
        },
        {
          label: "能源解决方案",
          subItems: [
            {
              label: "电力与能源解决方案",
              href: "electrical-energy-solutions",
            },
          ],
        },
        {
          label: "会议解决方案",
          subItems: [
            {
              label: "会议室解决方案",
              href: "meeting-room-solutions",
            },
          ],
        },
        {
          label: "培训",
          subItems: [
            {
              label: "IT与技术培训",
              href: "it-technology-training",
            },
          ],
        },
        {
          label: "IT服务与支持",
          subItems: [
            {
              label: "技术支持",
              href: "technical-support",
            },
          ],
        },
      ],

      AR: [
        { label: "جميع الخدمات", href: "services" },
        {
          label: "الحلول الرقمية",
          subItems: [
            {
              label: "تطوير المواقع الإلكترونية",
              href: "website-development",
            },
            {
              label: "تطوير البرمجيات",
              href: "software-development-integration",
            },
            {
              label: "دمج الذكاء الاصطناعي",
              href: "ai-integration",
            },
          ],
        },
        {
          label:
            "أجهزة الكمبيوتر ومتطلبات تكنولوجيا المعلومات والمواد الاستهلاكية",
          subItems: [
            {
              label: "أجهزة الكمبيوتر المحمولة والمكتبية",
              href: "laptops-desktops",
            },
            {
              label: "الأجهزة المحمولة",
              href: "mobile-devices",
            },
            {
              label: "معدات وأجهزة تكنولوجيا المعلومات",
              href: "it-equipment-gadgets",
            },
            {
              label: "المواد الاستهلاكية لتكنولوجيا المعلومات",
              href: "it-consumables",
            },
          ],
        },
        {
          label: "أمن الحاسوب",
          subItems: [
            {
              label: "الأمن السيبراني",
              href: "cybersecurity",
            },
            {
              label: "المراقبة بالفيديو",
              href: "video-surveillance",
            },
            {
              label: "القياسات الحيوية والتحكم في الدخول",
              href: "biometric-access-control",
            },
            {
              label: "كشف الحرائق والإنذار",
              href: "fire-detection-alarms",
            },
          ],
        },
        {
          label: "البنية التحتية والشبكات",
          subItems: [
            {
              label: "تركيب الشبكات وإدارة الأنظمة",
              href: "network-system-administration",
            },
            {
              label: "الحلول السحابية",
              href: "cloud-solutions",
            },
          ],
        },
        {
          label: "حلول الطاقة",
          subItems: [
            {
              label: "الحلول الكهربائية وحلول الطاقة",
              href: "electrical-energy-solutions",
            },
          ],
        },
        {
          label: "حلول المؤتمرات",
          subItems: [
            {
              label: "حلول غرف الاجتماعات",
              href: "meeting-room-solutions",
            },
          ],
        },
        {
          label: "التدريب",
          subItems: [
            {
              label: "التدريب في مجال تكنولوجيا المعلومات والتكنولوجيا",
              href: "it-technology-training",
            },
          ],
        },
        {
          label: "خدمات ودعم تكنولوجيا المعلومات",
          subItems: [
            {
              label: "الدعم الفني",
              href: "technical-support",
            },
          ],
        },
      ],
    },

    resources: {
      EN: [
        { label: "News / Article", href: "#news" },
        { label: "FAQ", href: "#faq" },
        { label: "Gallery", href: "#gallery" },
      ],

      FR: [
        { label: "Actualités / Articles", href: "#news" },
        { label: "FAQ", href: "#faq" },
        { label: "Galerie", href: "#gallery" },
      ],

      ES: [
        { label: "Noticias / Artículos", href: "#news" },
        { label: "Preguntas Frecuentes", href: "#faq" },
        { label: "Galería", href: "#gallery" },
      ],

      CH: [
        { label: "新闻/文章", href: "#news" },
        { label: "常见问题", href: "#faq" },
        { label: "图库", href: "#gallery" },
      ],

      AR: [
        { label: "الأخبار / المقالات", href: "#news" },
        { label: "الأسئلة الشائعة", href: "#faq" },
        { label: "معرض الصور", href: "#gallery" },
      ],
    },
  };

  const getLocalizedList = (section) => {
    const sectionData = dropdowns[section];

    if (!sectionData) {
      return [];
    }

    return sectionData[currentLang] || sectionData.EN || [];
  };

  // Helper to smoothly scroll to an element by its id (anchor hash)
  const scrollToSection = (hash) => {
    const id = hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL hash without causing navigation
      window.history.replaceState(null, '', hash);
    }
  };

  const getAboutItems = () =>
    getLocalizedList("about").map((item, idx) => ({
      key: `about-${idx}`,
      label: (
        <a
          href={item.href}
          onClick={(e) => {
            e.preventDefault();
            // Specific handling:
            //  • #mission-vision, #values, #testimonials -> smooth scroll
            //  • #projects -> navigate to projects page
            //  • other hashes (e.g., #about) -> navigate via onNavigate
            if (item.href === "#mission-vision" || item.href === "#values" || item.href === "#testimonials") {
              scrollToSection(item.href);
            } else if (item.href === "#projects") {
              onNavigate("projects");
            } else {
              // Fallback for any other hash or route
              onNavigate(item.href.replace(/^#/, ''));
            }
          }}
          className="block px-2 py-1 text-sm font-medium"
        >
          {item.label}
        </a>
      ),
    }));

  const getResourcesItems = () =>
    getLocalizedList("resources").map((item, idx) => ({
      key: `resources-${idx}`,
      label: (
        <a
          href={item.href}
          onClick={(e) => {
            e.preventDefault();

            if (item.href === "#projects") {
              onNavigate("projects");
            } else if (item.href === "#news") {
              onNavigate("resources");
            } else if (item.href === "#faq") {
              onNavigate("faq");
            } else if (item.href === "#gallery") {
              onNavigate("gallery");
            } else {
              onNavigate("home", item.href);
            }
          }}
          className="block px-2 py-1 text-sm font-medium"
        >
          {item.label}
        </a>
      ),
    }));

  const getServicesItems = () =>
    getLocalizedList("services").map((item, idx) => {
      if (item.subItems) {
        return {
          key: `services-${idx}`,

          label: <span className="font-medium">{item.label}</span>,

          children: item.subItems.map((sub, sIdx) => ({
            key: `services-${idx}-${sIdx}`,

            label: (
              <a
                href={`/services/${sub.href}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("service-detail", sub.href);
                }}
                className="block text-sm font-medium"
              >
                {sub.label}
              </a>
            ),
          })),
        };
      }

      return {
        key: `services-${idx}`,

        label: (
          <a
            href={`/services/${item.href}`}
            onClick={(e) => {
              e.preventDefault();

              if (item.href === "services") {
                onNavigate("services");
              } else {
                onNavigate("service-detail", item.href);
              }
            }}
            className="block px-2 py-1 text-sm font-medium"
          >
            {item.label}
          </a>
        ),
      };
    });

  const getMobileMenuItems = () => {
    return [
      {
        key: "home",

        label: (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate("home");
            }}
            className="text-lg font-medium"
          >
            {nav.home}
          </a>
        ),
      },

      {
        key: "about",

        label: <span className="text-lg font-medium">{nav.about}</span>,

        children: getAboutItems().map((item) => ({
          ...item,
          onClick: () => setMobileMenuOpen(false),
        })),
      },

      {
        key: "services",

        label: (
          <span className="text-lg font-medium">{nav.productsSolutions}</span>
        ),

        children: getServicesItems().map((item) => ({
          ...item,

          children: item.children
            ? item.children.map((child) => ({
                ...child,
                onClick: () => setMobileMenuOpen(false),
              }))
            : undefined,

          onClick: item.children ? undefined : () => setMobileMenuOpen(false),
        })),
      },

      {
        key: "projects",

        label: (
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate("projects");
            }}
            className="text-lg font-medium"
          >
            {nav.projects}
          </a>
        ),
      },

      {
        key: "resources",

        label: <span className="text-lg font-medium">{nav.resources}</span>,

        children: getResourcesItems().map((item) => ({
          ...item,
          onClick: () => setMobileMenuOpen(false),
        })),
      },

      {
        key: "contact",

        label: (
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate("contact");
            }}
            className="text-lg font-medium"
          >
            {nav.contact}
          </a>
        ),
      },
    ];
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      alert(`Search feature: searching for "${searchQuery}" in our system...`);

      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const getSearchPlaceholder = () => {
    switch (currentLang) {
      case "EN":
        return "Search...";

      case "FR":
        return "Rechercher...";

      case "ES":
        return "Buscar...";

      case "CH":
        return "搜索...";

      case "AR":
        return "بحث...";

      default:
        return "Search...";
    }
  };

  const getMobileSearchPlaceholder = () => {
    switch (currentLang) {
      case "EN":
        return "Search for services, projects...";

      case "FR":
        return "Rechercher des services, projets...";

      case "ES":
        return "Buscar servicios, proyectos...";

      case "CH":
        return "搜索服务、项目...";

      case "AR":
        return "البحث عن الخدمات والمشاريع...";

      default:
        return "Search for services, projects...";
    }
  };

  const getSearchButtonText = () => {
    switch (currentLang) {
      case "EN":
        return "Search";

      case "FR":
        return "Chercher";

      case "ES":
        return "Buscar";

      case "CH":
        return "搜索";

      case "AR":
        return "بحث";

      default:
        return "Search";
    }
  };

  const antdHeaderTheme = {
    algorithm: theme.defaultAlgorithm,

    token: {
      colorPrimary: "#023B6A",
      colorText: "#475569",
      borderRadiusLG: 8,
      colorBgElevated: "#ffffff",
      colorBgTextHover: "#f1f5f9",
      colorBgTextActive: "#e2e8f0",

      fontFamily:
        "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    components: {
      Dropdown: {
        paddingBlock: 8,
        colorBgElevated: "#ffffff",
      },

      Menu: {
        itemHoverBg: "#d1d5db",
        itemHoverColor: "#023B6A",
        itemSelectedBg: "#e8f0fe",
        itemSelectedColor: "#023B6A",
        activeBarBorderWidth: 0,
        colorBgContainer: "#ffffff",
        subMenuItemBg: "#ffffff",
      },

      Drawer: {
        colorBgElevated: "#ffffff",
      },
    },
  };

  const languageItems = [
    {
      key: "EN",
      label: "English (EN)",
      onClick: () => setLang("EN"),
    },
    {
      key: "FR",
      label: "Français (FR)",
      onClick: () => setLang("FR"),
    },
    {
      key: "ES",
      label: "Español (ES)",
      onClick: () => setLang("ES"),
    },
    {
      key: "CH",
      label: "Chinois (CH)",
      onClick: () => setLang("CH"),
    },
    {
      key: "AR",
      label: "Arabe (AR)",
      onClick: () => setLang("AR"),
    },
  ];

  const handleMobileLanguageChange = () => {
    const languages = ["EN", "FR", "ES", "CH", "AR"];

    const currentIndex = languages.indexOf(currentLang);

    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % languages.length;

    setLang(languages[nextIndex]);
  };

  return (
    <ConfigProvider theme={antdHeaderTheme}>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-slate-200 shadow-sm ${
          scrolled ? "py-3" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("home");
              }}
              className="flex items-center gap-2 group"
            >
              <img
                src={logo}
                alt="Compulec Logo"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            <nav className="hidden lg:flex items-center gap-8">
              {/* HOME */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("home");
                }}
                className={`text-sm font-medium text-slate-600 hover:text-[#023B6A] transition-colors duration-200 ${
                  location.pathname === "/" ? "border-b-2 border-[#023B6A]" : ""
                }`}
              >
                {nav.home}
              </a>

              {/* ABOUT */}
              <Dropdown
                menu={{
                  items: getAboutItems(),
                }}
                placement="bottomLeft"
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#023B6A] transition-colors duration-200 cursor-pointer ${
                    location.pathname === "/about"
                      ? "border-b-2 border-[#023B6A]"
                      : ""
                  }`}
                >
                  {nav.about}
                  <DownOutlined className="text-[10px]" />
                </button>
              </Dropdown>

              {/* PRODUCTS & SOLUTIONS */}
              <Dropdown
                menu={{
                  items: getServicesItems(),
                }}
                placement="bottomLeft"
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#023B6A] transition-colors duration-200 cursor-pointer ${
                    location.pathname === "/services" ||
                    location.pathname.startsWith("/services/")
                      ? "border-b-2 border-[#023B6A]"
                      : ""
                  }`}
                >
                  {nav.productsSolutions}
                  <DownOutlined className="text-[10px]" />
                </button>
              </Dropdown>

              {/* PROJECTS */}
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("projects");
                }}
                className={`text-sm font-medium text-slate-600 hover:text-[#023B6A] transition-colors duration-200 ${
                  location.pathname === "/projects"
                    ? "border-b-2 border-[#023B6A]"
                    : ""
                }`}
              >
                {nav.projects}
              </a>

              {/* RESOURCES */}
              <Dropdown
                menu={{
                  items: getResourcesItems(),
                }}
                placement="bottomLeft"
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#023B6A] transition-colors duration-200 cursor-pointer ${
                    location.pathname === "/resources"
                      ? "border-b-2 border-[#023B6A]"
                      : ""
                  }`}
                >
                  {nav.resources}
                  <DownOutlined className="text-[10px]" />
                </button>
              </Dropdown>
            </nav>

            <div className="hidden lg:flex items-center gap-6">
              {/* SEARCH */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-200 p-1 cursor-pointer"
                  aria-label="Search"
                >
                  <SearchOutlined className="text-lg" />
                </button>

                {searchOpen && (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="absolute right-0 top-full mt-2 w-72 p-2 rounded-xl bg-white border border-slate-200 shadow-2xl flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={getSearchPlaceholder()}
                      className="flex-1 bg-slate-50 text-sm text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
                      autoFocus
                    />

                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#ffe052] hover:bg-[#fbd319] text-[#023B6A] font-semibold text-xs rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Go
                    </button>
                  </form>
                )}
              </div>

              {/* CONTACT */}
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("contact");
                }}
                className={`text-sm font-medium text-slate-600 hover:text-[#023B6A] transition-colors duration-200 ${
                  location.pathname === "/contact"
                    ? "border-b-2 border-[#023B6A]"
                    : ""
                }`}
              >
                {nav.contact}
              </a>

              {/* CTA */}
              <button
                onClick={onOpenConsultation}
                className="text-sm font-bold bg-[#ffe052] hover:bg-[#fbd319] text-[#023B6A] px-5 py-2.5 rounded-lg shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
              >
                {nav.cta}
              </button>

              {/* LANGUAGE */}
              <Dropdown
                menu={{
                  items: languageItems,
                }}
                placement="bottomRight"
              >
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer">
                  <GlobalOutlined className="text-xs" />

                  <span>{currentLang}</span>

                  <DownOutlined className="text-[8px]" />
                </button>
              </Dropdown>
            </div>

            <div className="flex lg:hidden items-center gap-4">
              {/* MOBILE SEARCH */}
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);

                  if (mobileMenuOpen) {
                    setMobileMenuOpen(false);
                  }
                }}
                className="text-slate-500 hover:text-slate-900 transition-colors duration-200 p-1"
              >
                <SearchOutlined className="text-lg" />
              </button>

              {/* MOBILE LANGUAGE */}
              <button
                onClick={handleMobileLanguageChange}
                className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md"
                title="Change language"
              >
                {currentLang}
              </button>

              {/* HAMBURGER */}
              <button
                onClick={() => {
                  setMobileMenuOpen(true);

                  if (searchOpen) {
                    setSearchOpen(false);
                  }
                }}
                className="text-slate-600 hover:text-slate-900 transition-colors duration-200 p-1"
                aria-label="Toggle menu"
              >
                <MenuOutlined className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getMobileSearchPlaceholder()}
                className="flex-1 bg-slate-50 text-sm text-slate-800 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-[#ffe052] text-[#023B6A] border-none font-bold rounded-lg text-sm"
              >
                {getSearchButtonText()}
              </button>
            </form>
          </div>
        )}

        <Drawer
          title={<img src={logo} alt="Logo" className="h-8" />}
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={320}
          className="lg:hidden"
          styles={{
            body: {
              padding: 0,
            },
          }}
          footer={
            <div className="p-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full text-center bg-[#ffe052] hover:bg-[#fbd319] text-[#023B6A] font-bold py-3 rounded-xl shadow-sm border-none cursor-pointer"
              >
                {nav.cta}
              </button>
            </div>
          }
        >
          <Menu
            mode="inline"
            items={getMobileMenuItems()}
            selectedKeys={[location.pathname.replace("/", "") || "home"]}
            style={{
              borderRight: "none",
              fontSize: "16px",
            }}
          />
        </Drawer>
      </header>
    </ConfigProvider>
  );
}
