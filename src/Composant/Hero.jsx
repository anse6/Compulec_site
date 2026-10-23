import { useEffect, useRef, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { animate, createTimer, stagger } from "animejs";
import * as THREE from "three";
import { getInstances } from "animejs/adapters/three";

function useCountUp(target, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startCounting]);
  return count;
}

export default function Hero({ t, onOpenConsultation }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 3D WebGL Background Animation
  useEffect(() => {
    if (!containerRef.current) return;

    const $container = containerRef.current;
    const width = $container.clientWidth || window.innerWidth;
    const height = $container.clientHeight || window.innerHeight;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // WebGL Renderer (fond transparent : le dégradé clair de la section reste visible)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    $container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 100);
    camera.position.set(0, 0, 2.1);
    scene.add(camera);

    // Grand écran : les cubes passent à droite, à côté du texte et non derrière
    const frame = (w, h) => {
      camera.aspect = w / h;
      // Écran étroit (portrait) : caméra reculée, sinon les cubes remplissent tout l'écran
      camera.position.z = w < 640 ? 3.6 : w < 1024 ? 2.8 : 2.1;
      if (w >= 1024) camera.setViewOffset(w, h, -w * 0.3, 0, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    frame(width, height);

    // Lights : relief marqué (fond sombre) + lumière d'appoint bleutée pour éviter les faces noires
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(2, 3, 4);
    scene.add(light);
    const fill = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fill.position.set(-3, -2, 2);
    scene.add(fill);

    // Instanced Mesh of Cubes
    const gridSize = 6;
    const cellSize = 2 / gridSize;
    const spread = ((gridSize - 1) / 2) * cellSize;
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);

    // MeshStandardMaterial for high-end shadows and light play
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.12,
    });
    const mesh = new THREE.InstancedMesh(
      geometry,
      material,
      gridSize * gridSize * gridSize,
    );
    scene.add(mesh);

    // AnimeJS adapter
    const instances = getInstances(mesh);

    // Compulec Corporate Color Palette: Amber/Gold and Technical Electric Blues
    const palette = [
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#3b82f6",
      "#2563eb",
      "#60a5fa",
      "#93c5fd",
      "#38bdf8",
    ];
    const gridAxis = (axis, span = spread) =>
      stagger([-span, span], { grid: [gridSize, gridSize, gridSize], axis });

    // Slowly rotate the whole mesh in 3D space
    const rotateAnim = animate(mesh, {
      rotateY: 360,
      rotateX: 360,
      duration: 24000,
      loop: true,
      ease: "linear",
    });

    // Stagger color, scale, and grid coordinates from center
    const instAnim = animate(instances, {
      color: palette,
      // Dispersion limitée à 70 % : le nuage de cubes reste dans la moitié droite
      x: [gridAxis("x", spread * 0.25), gridAxis("x", spread * 0.7)],
      y: [gridAxis("y", spread * 0.25), gridAxis("y", spread * 0.7)],
      z: [gridAxis("z", spread * 0.25), gridAxis("z", spread * 0.7)],
      scale: [0.1, 0.25, 0.1],
      delay: stagger([0, 3000], {
        grid: [gridSize, gridSize, gridSize],
        from: "center",
        reversed: true,
      }),
      duration: 2000,
      loopDelay: 500,
      loop: true,
      alternate: true,
      ease: "inOutQuad",
    });

    // Render updating frame by frame
    const timer = createTimer({
      onUpdate: () => {
        renderer.render(scene, camera);
      },
    });

    // Animation en pause quand le Hero n'est pas à l'écran ou que l'onglet est caché
    // (avant : le rendu WebGL tournait en permanence et consommait du CPU/GPU partout sur la page)
    const loops = [rotateAnim, instAnim, timer];
    let onScreen = true;
    const sync = () => {
      const run = onScreen && !document.hidden && !reduceMotion;
      loops.forEach((a) => (run ? a.play() : a.pause()));
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibilityObserver.observe($container);
    document.addEventListener("visibilitychange", sync);
    if (reduceMotion) {
      // Mouvement réduit demandé par le système : une seule image fixe
      sync();
      renderer.render(scene, camera);
    }

    // Suit la taille réelle du conteneur (pas seulement la fenêtre)
    const resizeObserver = new ResizeObserver(() => {
      const w = $container.clientWidth;
      const h = $container.clientHeight;
      if (!w || !h) return;
      frame(w, h);
      renderer.setSize(w, h);
      if (reduceMotion) renderer.render(scene, camera);
    });
    resizeObserver.observe($container);

    // Clean memory and event listeners when components unmount
    return () => {
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      rotateAnim.pause();
      instAnim.pause();
      timer.pause();
      geometry.dispose();
      material.dispose();
      mesh.dispose();
      renderer.dispose();
      if (renderer.domElement && $container.contains(renderer.domElement)) {
        $container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const serviceLines = useCountUp(11, 1800, visible);
  const deliveredProjects = useCountUp(6, 1400, visible);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#04152B] via-[#062B52] to-[#023B6A]"
    >
      {/* Grille technique très légère */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 70% 45%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 45%, black 20%, transparent 75%)",
        }}
      />

      {/* 3D WebGL Background container */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 full-container select-none pointer-events-none opacity-45 sm:opacity-60 lg:opacity-80"
        ref={containerRef}
      />

      {/* Voile sombre à gauche : le texte reste lisible au-dessus de l'animation */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none bg-gradient-to-r from-[#04152B] via-[#04152B]/75 to-transparent" />

      {/* Halos lumineux pour la profondeur */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div
        className="absolute top-1/3 right-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"
        style={{ animationDelay: "2s" }}
      />

      {/* Content Container (Left-aligned, full width, no mx-auto centering) */}
      <div className="relative z-20 w-full px-8 sm:px-16 lg:px-24 xl:px-32 pt-40 pb-20">
        <div className="max-w-5xl">
          {/* Tag */}
          <div
            className={`inline-block mb-8 text-sm sm:text-base font-bold tracking-[0.25em] text-amber-400 uppercase transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {t.hero.tagline}
          </div>

          {/* Main Title split into exactly 3 lines */}
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl xl:text-[5.2rem] font-black text-white leading-[1.08] mb-8 transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {t.hero.titlePart1}
            <br />
            {t.hero.titlePart2}
            <br />
            <span className="text-amber-400">{t.hero.titlePart3}</span>
            {/* <span className="text-amber-400">{t.hero.titlePart4}</span> */}
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg sm:text-xl lg:text-[1.35rem] text-slate-300 leading-relaxed max-w-2xl sm:max-w-3xl mb-12 transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-5 mb-16 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <button
              onClick={onOpenConsultation}
              className="group flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-4.5 rounded-xl shadow-lg shadow-amber-400/30 hover:shadow-xl hover:shadow-amber-400/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-base"
            >
              {t.hero.ctaConsultation}
              <ArrowRightOutlined className="text-base transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-3 border-2 border-white/25 hover:border-white/50 bg-white/5 backdrop-blur-sm text-white font-bold px-8 py-4.5 rounded-xl hover:bg-white/10 transition-all duration-200 text-base cursor-pointer"
            >
              {t.hero.ctaExplore}
            </button>
          </div>

          {/* Stats separator line */}
          <div
            className={`w-full max-w-3xl h-px bg-gradient-to-r from-white/25 to-transparent mb-12 transition-all duration-700 delay-400 ${
              visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`}
            style={{ transformOrigin: "left" }}
          />

          {/* Stats Row */}
          <div
            className={`flex flex-wrap gap-16 lg:gap-24 transition-all duration-700 delay-500 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Service Lines */}
            <div>
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-white leading-none">
                {serviceLines}+
              </div>
              <div className="text-sm sm:text-base text-slate-300 mt-3 font-semibold tracking-wide">
                {t.hero.statServiceLines}
              </div>
            </div>

            {/* Delivered Projects */}
            <div>
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-white leading-none">
                {deliveredProjects}+
              </div>
              <div className="text-sm sm:text-base text-slate-300 mt-3 font-semibold tracking-wide">
                {t.hero.statDeliveredProjects}
              </div>
            </div>

            {/* 24/7 Support */}
            <div>
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-amber-400 leading-none">
                24/7
              </div>
              <div className="text-sm sm:text-base text-slate-300 mt-3 font-semibold tracking-wide">
                {t.hero.statSupport}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Léger assombrissement en bas : ancre la rangée de chiffres */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#04152B]/70 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
