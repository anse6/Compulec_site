import re1 from "../../assets/re1.png";
import re2 from "../../assets/re2.png";
import re3 from "../../assets/re3.png";
import e1 from "../../assets/e1.png";
import e2 from "../../assets/e2.png";
import e3 from "../../assets/e3.png";
import g4 from "../../assets/g4.png";
import g5 from "../../assets/g5.png";
import g6 from "../../assets/g6.png";
import z3 from "../../assets/z3.png";
import z4 from "../../assets/z4.png";
import z5 from "../../assets/z5.png";
import m3 from "../../assets/m3.png";
import m4 from "../../assets/m4.png";
import m5 from "../../assets/m5.png";
import n3 from "../../assets/n3.png";
import n4 from "../../assets/n4.png";
import n5 from "../../assets/n5.png";
import web1 from "../../assets/web1.png";
import web2 from "../../assets/web2.png";
import web3 from "../../assets/web3.png";
import software1 from "../../assets/software1.png";
import software2 from "../../assets/software2.png";
import software3 from "../../assets/software3.png";
import ia1 from "../../assets/ia1.png";
import ia2 from "../../assets/ia2.png";
import ia3 from "../../assets/ia3.png";
import lap1 from "../../assets/lap.png";
import lap2 from "../../assets/lap1.png";
import lap3 from "../../assets/lap2.png";
import phone1 from "../../assets/phone1.png";
import phone2 from "../../assets/phone2.png";
import phone3 from "../../assets/phone3.png";
import ph1 from "../../assets/ph1.png";
import ph2 from "../../assets/ph2.png";
import ph3 from "../../assets/ph3.png";
import cy1 from "../../assets/cy1.png";
import cy2 from "../../assets/cy2.png";
import cy3 from "../../assets/cy3.png";
import vi1 from "../../assets/vi1.png";
import vi2 from "../../assets/vi2.png";
import vi3 from "../../assets/vi3.png";
import bi1 from "../../assets/bi1.png";
import bi2 from "../../assets/bi2.png";
import bi3 from "../../assets/bi3.png";
import al1 from "../../assets/al1.png";
import al2 from "../../assets/al2.png";
import al3 from "../../assets/al3.png";
import ad1 from "../../assets/ad1.png";
import ad2 from "../../assets/ad2.png";
import ad3 from "../../assets/ad3.png";
import ic1 from "../../assets/ic1.png";
import ic2 from "../../assets/ic2.png";
import ic3 from "../../assets/ic3.png";
import er1 from "../../assets/er1.png";
import er2 from "../../assets/er2.png";
import er3 from "../../assets/er3.png";
import co1 from "../../assets/co1.png";
import co2 from "../../assets/co2.png";
import co3 from "../../assets/co3.png";
import tr1 from "../../assets/tr1.png";
import tr2 from "../../assets/tr2.png";
import tr3 from "../../assets/tr3.png";
import sp1 from "../../assets/sp1.png";
import sp2 from "../../assets/sp2.png";
import sp3 from "../../assets/sp3.png";
import it1 from "../../assets/it1.png";
import it2 from "../../assets/it2.png";
import it3 from "../../assets/it3.png";
import PageHeader from "../PageHeader";
import RelatedProjects from "./RelatedProjects";

const galleries = {
  "it-equipment-consumable": [re1, re2, re3],
  "software-development-integration": [software1, software2, software3],
  "infrastructure-networks": [g4, g5, g6],
  "computer-security": [z3, z4, z5],
  "cybersecurity": [cy1, cy2, cy3],
  "video-surveillance": [vi1, vi2, vi3],
  "biometric-access-control": [bi1, bi2, bi3],
  "fire-detection-alarms": [al1, al2, al3],
  "network-system-administration": [ad1, ad2, ad3],
  "cloud-solutions": [ic1, ic2, ic3],
  "electrical-energy-solutions": [er1, er2, er3],
  "meeting-room-solutions": [co1, co2, co3],
  "it-technology-training": [tr1, tr2, tr3],
  "technical-support": [sp1, sp2, sp3],
  "it-service-support": [n3, n4, n5],
  "website-development": [web1, web2, web3],
  "ai-integration": [ia1, ia2, ia3],
  "laptops-desktops": [lap1, lap2, lap3],
  "mobile-devices": [phone1, phone2, phone3],
  "it-equipment-gadgets": [ph1, ph2, ph3],
  "it-consumables": [it1, it2, it3],
};

export default function ServiceDetailPage({ item, onOpenConsultation }) {
  if (!item) return null;

  const deliverables = item.deliverables || [];
  const benefits = item.benefits || [];

  const currentGallery = galleries[item.slug] || [re1, re2, re3];

  return (
    <div className="w-full bg-white min-h-screen">
      {/* ── Dark Blue Header – using PageHeader component ── */}
      <PageHeader
        tagline={item.tag}
        title={item.detailTitle || item.title}
        subtitle={item.detailDesc || item.desc}
      >
        <button
          onClick={onOpenConsultation}
          className="bg-[#ffde58] hover:bg-yellow-300 text-slate-950 font-bold px-6 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer shadow-md"
        >
          {item.requestBtn || "Request this service"}
        </button>
      </PageHeader>

      {/* ── Content Section ── */}
      <div className="w-full px-8 sm:px-16 lg:px-24 xl:px-32 py-20 bg-white">
        {/* Intro Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-14 items-start">
          <h2 className="text-2xl sm:text-3xl font-black text-[#023B6A] leading-tight">
            {item.introTitle || "Reliable technology for everyday operations."}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed pt-1">
            {item.introDesc ||
              "COMPULEC provides IT equipment to support businesses, institutions and individuals with the technology they need to work efficiently and stay connected."}
          </p>
        </div>

        {/* 3-Image Gallery */}
        <div className="flex items-end mb-16 overflow-hidden w-full">
          <div className="w-[45%] h-[200px] sm:h-[300px] md:h-[400px] bg-slate-100 overflow-hidden">
            <img
              src={currentGallery[0]}
              alt="Gallery 1"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="w-[30%] h-[160px] sm:h-[240px] md:h-[320px] bg-slate-100 overflow-hidden">
            <img
              src={currentGallery[1]}
              alt="Gallery 2"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="w-[25%] h-[130px] sm:h-[200px] md:h-[260px] bg-slate-100 overflow-hidden">
            <img
              src={currentGallery[2]}
              alt="Gallery 3"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* What we deliver + CTA Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Left: deliverables */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-[#023B6A] mb-6">
              {item.deliversTitle || "What we deliver"}
            </h2>
            <ul
              className={`gap-x-12 gap-y-3 ${deliverables.length > 6 ? "grid grid-cols-1 sm:grid-cols-2" : "space-y-3"}`}
            >
              {deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 mt-2 flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Talk to an engineer CTA */}
          <div className="bg-[#0E2037] rounded-2xl p-8 flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">
                {item.ctaTitle || "Talk to an engineer"}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {item.ctaDesc ||
                  "Tell us about your environment and constraints. We respond with a structured proposal."}
              </p>
            </div>
            <button
              onClick={onOpenConsultation}
              className="w-full bg-[#ffde58] hover:bg-yellow-300 text-slate-950 font-bold py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer"
            >
              {item.ctaBtn || "Request a Consultation"}
            </button>
          </div>
        </div>

        {/* Business Benefits */}
        {benefits.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#023B6A] mb-6">
              {item.benefitsTitle || "Business benefits"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {benefits.map((b, i) => (
                <span
                  key={i}
                  className="px-5 py-2.5 border border-[#023B6A] text-[#023B6A] text-sm rounded-lg bg-white hover:border-[#023B6A] hover:text-[#023B6A] transition-colors cursor-default"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Projects Block */}
      {item.relatedProjects && (
        <RelatedProjects
          title={item.relatedProjectsTitle}
          tagline={item.relatedProjectsTagline}
          projects={item.relatedProjects}
          viewCaseText={item.viewCaseText}
        />
      )}
    </div>
  );
}
