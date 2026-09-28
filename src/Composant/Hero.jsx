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

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    $container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 100);
    camera.position.set(0, 0, 1.6);
    scene.add(camera);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(2, 3, 4);
    scene.add(light);

    // Instanced Mesh of Cubes
    const gridSize = 6;
    const cellSize = 2 / gridSize;
    const spread = ((gridSize - 1) / 2) * cellSize;
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);

    // MeshStandardMaterial for high-end shadows and light play
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.15,
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
      "#1d4ed8",
      "#60a5fa",
      "#93c5fd",
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
      x: [gridAxis("x", spread * 0.25), gridAxis("x")],
      y: [gridAxis("y", spread * 0.25), gridAxis("y")],
      z: [gridAxis("z", spread * 0.25), gridAxis("z")],
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

    // Handle resize smoothly
    const handleResize = () => {
      if (!$container) return;
      const w = $container.clientWidth;
      const h = $container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Clean memory and event listeners when components unmount
    return () => {
      window.removeEventListener("resize", handleResize);
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
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-slate-950"
    >
      {/* 3D WebGL Background container */}
      <div
        className="absolute inset-0 z-0 full-container select-none pointer-events-none opacity-60"
        ref={containerRef}
      />

      {/* Linear overlay to protect text contrast */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
      <div className="absolute inset-0 z-0 select-none pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

      {/* Glowing orbs for depth */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div
        className="absolute top-1/3 right-1/3 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow"
        style={{ animationDelay: "2s" }}
      />

      {/* Content Container (Left-aligned, full width, no mx-auto centering) */}
      <div className="relative z-10 w-full px-8 sm:px-16 lg:px-24 xl:px-32 pt-40 pb-20">
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
            className={`text-lg sm:text-xl lg:text-[1.35rem] text-slate-400 leading-relaxed max-w-2xl sm:max-w-3xl mb-12 transition-all duration-700 delay-200 ${
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
              className="group flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 py-4.5 rounded-xl shadow-xl hover:shadow-amber-400/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-base"
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
              className="flex items-center gap-3 border-2 border-white/20 hover:border-white/40 text-white font-bold px-8 py-4.5 rounded-xl hover:bg-white/5 transition-all duration-200 text-base cursor-pointer"
            >
              {t.hero.ctaExplore}
            </button>
          </div>

          {/* Stats separator line */}
          <div
            className={`w-full max-w-3xl h-px bg-gradient-to-r from-white/20 to-transparent mb-12 transition-all duration-700 delay-400 ${
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
              <div className="text-sm sm:text-base text-slate-400 mt-3 font-semibold tracking-wide">
                {t.hero.statServiceLines}
              </div>
            </div>

            {/* Delivered Projects */}
            <div>
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-white leading-none">
                {deliveredProjects}+
              </div>
              <div className="text-sm sm:text-base text-slate-400 mt-3 font-semibold tracking-wide">
                {t.hero.statDeliveredProjects}
              </div>
            </div>

            {/* 24/7 Support */}
            <div>
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-amber-400 leading-none">
                24/7
              </div>
              <div className="text-sm sm:text-base text-slate-400 mt-3 font-semibold tracking-wide">
                {t.hero.statSupport}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
