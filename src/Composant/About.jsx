import PageHeader from "./PageHeader";
import AboutMasonry from "./AboutComponents/AboutMasonry";
import AboutMission from "./AboutComponents/AboutMission";
import AboutValues from "./AboutComponents/AboutValues";
import AboutPositioning from "./AboutComponents/AboutPositioning";
import AboutOperations from "./AboutComponents/AboutOperations";
import AboutFactors from "./AboutComponents/AboutFactors";
import Testimonials from "./Testimonials";

export default function About({ t }) {
  return (
    <div className="w-full bg-white">
      {/* 1. Page Header (Réutilisable) */}
      <PageHeader
        tagline={t.aboutPage.tagline}
        title={t.aboutPage.title}
        subtitle={t.aboutPage.subtitle}
      />

      {/* 2. Masonry Grid Content */}
      <AboutMasonry t={t} />

      {/* 3. Mission & Vision Section */}
      <AboutMission t={t} />

      {/* 4. Values / How We Work Section */}
      <AboutValues t={t} />

      {/* 5. Positioning Section */}
      <AboutPositioning t={t} />

      {/* 6. Areas of Operation Section */}
      <AboutOperations t={t} />

      {/* 7. Factors Section */}
      <AboutFactors t={t} />

      {/* 8. Testimonials Section */}
      <Testimonials t={t} />
    </div>
  );
}
