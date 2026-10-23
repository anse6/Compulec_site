import React from "react";
import f1 from "../../assets/f1.png";
import f2 from "../../assets/f2.png";
import f3 from "../../assets/f3.png";
import f4 from "../../assets/f4.png";
import f5 from "../../assets/f5.png";
import f6 from "../../assets/f6.png";
import f7 from "../../assets/f7.png";

const partners = [
  { id: 1, src: f1, alt: "Partner 1" },
  { id: 2, src: f2, alt: "Partner 2" },
  { id: 3, src: f3, alt: "Partner 3" },
  { id: 4, src: f4, alt: "Partner 4" },
  { id: 5, src: f5, alt: "Partner 5" },
  { id: 6, src: f6, alt: "Partner 6" },
  { id: 7, src: f7, alt: "Partner 7" },
];

// Duplication pour un défilement infini fluide
const duplicated = [...partners, ...partners, ...partners];

export default function PartnersSection({ t }) {
  const f = t.nous;

  return (
    <>
      <style>{`
        @keyframes scroll-partners {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-33.333%);
          }
        }

        .partners-track {
          display: flex;
          align-items: center;
          gap: 0;
          animation: scroll-partners 28s linear infinite;
          width: max-content;
        }

        .partners-track:hover {
          animation-play-state: paused;
        }

        .partner-item {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 56px;
          flex-shrink: 0;
        }

        .partner-item img {
          height: 34px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .partners-viewport {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );

          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }
      `}</style>

      {/* SECTION = fond BLANC */}
      <section
        style={{
          background: "#ffffff",
          paddingBottom: "80px",
        }}
      >
        {/* Conteneur pour les marges gauche/droite */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* CADRE = fond GRIS, arrondi */}
          <div
            style={{
              background: "#f3f5f7",
              borderRadius: "24px",
              paddingTop: "40px",
              paddingBottom: "44px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Ligne serpentée BLANCHE */}
            <svg
              viewBox="0 0 1440 260"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <path
                d="M-50,140 C150,60 300,220 500,130 C700,40 850,210 1050,120 C1200,60 1350,150 1490,110"
                fill="none"
                stroke="#ffffff"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>

            {/* Titre traduit */}
            <p
              style={{
                textAlign: "center",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#023B6A",
                letterSpacing: "0.01em",
                marginBottom: "32px",
                position: "relative",
                zIndex: 1,
              }}
            >
              {f.our}
            </p>

            {/* Bande défilante des logos */}
            <div
              className="partners-viewport"
              style={{
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div className="partners-track">
                {duplicated.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="partner-item">
                    <img src={p.src} alt={p.alt} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
