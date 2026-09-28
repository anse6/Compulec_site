import { useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import { translations } from "./assets/translations";
import Header from "./Composant/Header";
import Hero from "./Composant/Hero";
import Commitments from "./Composant/Commitments";
import ServicesGrid from "./Composant/ServicesGrid";
import ProjectsGrid from "./Composant/ProjectsGrid";
import Testimonials from "./Composant/Testimonials";
import NewsGrid from "./Composant/NewsGrid";
import About from "./Composant/About";
import ServicesPage from "./Composant/service";
import ServiceDetailPage from "./Composant/servicesComponents/ServiceDetailPage";
import ProjectsPage from "./Composant/ProjectsPage";
import ResourcesPage from "./Composant/ResourcesPage";
import FaqPage from "./Composant/FaqPage";
import Footer from "./Composant/Footer";
import ChatWidget from "./Composant/ChatWidget";
import { useParams } from "react-router-dom";
import PartnersSection from "./Composant/composantanimation/Partnerssection";
import ProjectDetailPage from "./Composant/ProjectDetailPage";
import ResourceDetailPage from "./Composant/ResourceDetailPage";
import GalleryPage from "./Composant/GalleryPage";
import ConsultationPage from "./Composant/ConsultationPage";
import ContactPage from "./Composant/ContactPage";
import LoginPage from "./Composant/LoginPage";
import AdminLayout from "./Composant/Admin/AdminLayout";
import Dashboard from "./Composant/Admin/Dashboard/Dashboard";
import AdminProjects from "./Composant/Admin/Projects/AdminProjects";
import ProjectForm from "./Composant/Admin/Projects/ProjectForm";
import ProjectDetails from "./Composant/Admin/Projects/ProjectDetails";
import AdminGallery from "./Composant/Admin/Gallery/AdminGallery";
import AdminGalleryView from "./Composant/Admin/Gallery/AdminGalleryView";
import AdminMessages from "./Composant/Admin/Messages/AdminMessages";
import AdminMessageDetails from "./Composant/Admin/Messages/AdminMessageDetails";
import AdminAIChat from "./Composant/Admin/AIChat/AdminAIChat";
import AdminNews from "./Composant/Admin/News/AdminNews";
import NewsForm from "./Composant/Admin/News/NewsForm";
import NewsDetails from "./Composant/Admin/News/NewsDetails";
import AdminUsers from "./Composant/Admin/Users/AdminUsers";
import AdminSettings from "./Composant/Admin/Settings/AdminSettings";

function ServiceDetailPageWrapper({ t, onOpenConsultation }) {
  const { slug } = useParams();
  let foundItem = null;
  for (const category of t.services.categories) {
    const item = category.items.find((i) => i.slug === slug);
    if (item) {
      foundItem = item;
      break;
    }
  }
  return (
    <ServiceDetailPage
      item={foundItem}
      onOpenConsultation={onOpenConsultation}
    />
  );
}

function ProjectDetailPageWrapper({ t }) {
  const { id } = useParams();
  return <ProjectDetailPage id={Number(id)} t={t} />;
}

function ResourceDetailPageWrapper({ t, onNavigate }) {
  const { id } = useParams();
  return <ResourceDetailPage id={Number(id)} t={t} onNavigate={onNavigate} />;
}

export default function App() {
  const [currentLang, setCurrentLang] = useState("EN");

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page, hash) => {
    let path = "/";
    if (page === "about") path = "/about";
    if (page === "services") path = "/services";
    if (page === "projects") path = "/projects";
    if (page === "resources") path = "/resources";
    if (page === "faq") path = "/faq";
    if (page === "service-detail") {
      navigate(`/services/${hash}`);
      return;
    }
    if (page === "project-detail") {
      navigate(`/projects/${hash}`);
      return;
    }
    if (page === "resource-detail") {
      navigate(`/resources/${hash}`);
      return;
    }

    if (page === "gallery") {
      navigate("/gallery");
      return;
    }

    if (page === "consultation") {
      navigate("/consultation");
      return;
    }

    if (page === "contact") {
      navigate("/contact");
      return;
    }

    if (hash) {
      navigate(`${path}${hash}`);
    } else {
      navigate(path);
    }
  };

  // Handle smooth scroll when navigating or hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  const t = translations[currentLang];

  const antTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: "#fbbf24",
      colorBgBase: "#020617",
      colorTextBase: "#f8fafc",
      borderRadius: 12,
      fontFamily:
        "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      Button: {
        colorPrimary: "#fbbf24",
        colorPrimaryHover: "#fcd34d",
        colorText: "#020617",
      },
      Input: {
        colorBgContainer: "rgba(255,255,255,0.05)",
        colorBorder: "rgba(255,255,255,0.1)",
        colorTextPlaceholder: "#475569",
      },
      Select: {
        colorBgContainer: "#0f172a",
        colorBorder: "rgba(255,255,255,0.1)",
      },
    },
  };

  return (
    <ConfigProvider theme={antTheme}>
      <Routes>
        {/* ── Login routes: NO Header, Footer or ChatWidget ── */}
        <Route path="/login" element={<LoginPage currentView="signin" />} />
        <Route
          path="/forgot-password"
          element={<LoginPage currentView="forgot" />}
        />
        <Route
          path="/reset-password"
          element={<LoginPage currentView="newpassword" />}
        />
        <Route
          path="/password-updated"
          element={<LoginPage currentView="updated" />}
        />

        {/* ── Admin routes: NO public Header/Footer ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/add" element={<ProjectForm />} />
          <Route path="projects/edit/:id" element={<ProjectForm />} />
          <Route path="projects/preview/:id" element={<ProjectDetails />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="gallery/preview/:id" element={<AdminGalleryView />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route
            path="messages/preview/:id"
            element={<AdminMessageDetails />}
          />
          <Route path="aichat" element={<AdminAIChat />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="news/add" element={<NewsForm />} />
          <Route path="news/edit/:id" element={<NewsForm />} />
          <Route path="news/preview/:id" element={<NewsDetails />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/*"
          element={
            <div className="relative min-h-screen bg-slate-950 overflow-x-hidden">
              {/* Navigation header */}
              <Header
                currentLang={currentLang}
                setLang={setCurrentLang}
                t={t}
                onOpenConsultation={() => handleNavigate("consultation")}
                onNavigate={handleNavigate}
              />

              <main>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        <Hero
                          t={t}
                          onOpenConsultation={() =>
                            handleNavigate("consultation")
                          }
                        />
                        <Commitments t={t} />
                        <ServicesGrid t={t} onNavigate={handleNavigate} />
                        <ProjectsGrid t={t} onNavigate={handleNavigate} />
                        <Testimonials t={t} />
                        <NewsGrid t={t} />
                        <PartnersSection t={t} />
                      </>
                    }
                  />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="/about" element={<About t={t} />} />
                  <Route path="/services" element={<ServicesPage t={t} />} />
                  <Route
                    path="/projects"
                    element={<ProjectsPage t={t} onNavigate={handleNavigate} />}
                  />
                  <Route
                    path="/projects/:id"
                    element={<ProjectDetailPageWrapper t={t} />}
                  />
                  <Route
                    path="/resources"
                    element={
                      <ResourcesPage t={t} onNavigate={handleNavigate} />
                    }
                  />
                  <Route
                    path="/resources/:id"
                    element={
                      <ResourceDetailPageWrapper
                        t={t}
                        onNavigate={handleNavigate}
                      />
                    }
                  />
                  <Route path="/gallery" element={<GalleryPage t={t} />} />
                  <Route
                    path="/consultation"
                    element={<ConsultationPage t={t} />}
                  />
                  <Route path="/contact" element={<ContactPage t={t} />} />
                  <Route path="/faq" element={<FaqPage t={t} />} />
                  <Route
                    path="/services/:slug"
                    element={
                      <ServiceDetailPageWrapper
                        t={t}
                        onOpenConsultation={() =>
                          handleNavigate("consultation")
                        }
                      />
                    }
                  />
                </Routes>
              </main>

              {/* Footer */}
              <Footer
                t={t}
                onOpenConsultation={() => handleNavigate("consultation")}
                onNavigate={handleNavigate}
              />

              {/* Chat Widget */}
              <ChatWidget t={t} currentLang={currentLang} />
            </div>
          }
        />
      </Routes>
    </ConfigProvider>
  );
}
