import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Wind, EyeOff, Check, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type SakuraIntensity = 'gentle' | 'shower' | 'off';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  flipX: number;
  flipY: number;
  flipSpeedX: number;
  flipSpeedY: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmplitude: number;
  opacity: number;
  depth: number;
  colorIndex: number;
  isFlower: boolean;
  vx: number;
  vy: number;
}

// Sakura petal botanical color palettes
const SAKURA_PALETTES = [
  {
    base: 'rgba(244, 143, 177, 0.85)', // Rose blush base
    mid: 'rgba(255, 182, 193, 0.75)',  // Soft sakura pink
    tip: 'rgba(255, 228, 235, 0.65)',  // Translucent petal tip
    vein: 'rgba(233, 110, 150, 0.35)',
  },
  {
    base: 'rgba(248, 187, 208, 0.9)',
    mid: 'rgba(252, 215, 225, 0.8)',
    tip: 'rgba(255, 245, 248, 0.7)',
    vein: 'rgba(240, 98, 146, 0.3)',
  },
  {
    base: 'rgba(240, 98, 146, 0.75)',  // Kyoto cherry blossom deeper hue
    mid: 'rgba(255, 160, 185, 0.7)',
    tip: 'rgba(255, 210, 225, 0.6)',
    vein: 'rgba(216, 27, 96, 0.35)',
  },
  {
    base: 'rgba(255, 205, 210, 0.85)', // Alpine morning pale sakura
    mid: 'rgba(255, 235, 238, 0.75)',
    tip: 'rgba(255, 250, 252, 0.65)',
    vein: 'rgba(239, 154, 154, 0.25)',
  },
  {
    base: 'rgba(244, 143, 177, 0.8)',
    mid: 'rgba(255, 192, 203, 0.7)',
    tip: 'rgba(255, 255, 255, 0.7)',  // Snow tipped blossom
    vein: 'rgba(236, 64, 122, 0.3)',
  }
];

export const SakuraBloomBackground: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [intensity, setIntensity] = useState<SakuraIntensity>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('beautysphere_sakura_mode');
      if (saved === 'gentle' || saved === 'shower' || saved === 'off') {
        return saved;
      }
    }
    return 'gentle';
  });
  const [showControls, setShowControls] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  const mousePosRef = useRef<{ x: number; y: number; prevX: number; prevY: number; speed: number }>({
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    speed: 0
  });

  const petalsRef = useRef<Petal[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Save preference
  const handleSetIntensity = (newVal: SakuraIntensity) => {
    setIntensity(newVal);
    localStorage.setItem('beautysphere_sakura_mode', newVal);
    setShowControls(false);

    if (newVal === 'off') {
      setToastText('Sakura petals paused');
    } else if (newVal === 'shower') {
      setToastText('Sakura spring shower enabled');
    } else {
      setToastText('Gentle Sakura breeze active');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  useEffect(() => {
    if (intensity === 'off') {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse movement creates gentle breeze disturbance
    const handleMouseMove = (e: MouseEvent) => {
      const prevX = mousePosRef.current.x;
      const prevY = mousePosRef.current.y;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      mousePosRef.current = {
        x: e.clientX,
        y: e.clientY,
        prevX,
        prevY,
        speed: Math.min(speed, 25)
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const prevX = mousePosRef.current.x;
        const prevY = mousePosRef.current.y;
        const dx = touch.clientX - prevX;
        const dy = touch.clientY - prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        mousePosRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          prevX,
          prevY,
          speed: Math.min(speed, 25)
        };
      }
    };

    const handleMouseLeave = () => {
      mousePosRef.current = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // Determine target petal count based on screen size and intensity
    const isMobile = width < 768;
    let targetCount = intensity === 'shower' 
      ? (isMobile ? 42 : 72)
      : (isMobile ? 24 : 44);

    // Helper to generate a single petal
    const createPetal = (startY?: number): Petal => {
      const depth = 0.4 + Math.random() * 0.6; // 0.4 to 1.0 (foreground vs background)
      const isFlower = Math.random() < 0.12;   // 12% chance of full 5-petal blossom
      const baseSize = isFlower ? (14 + Math.random() * 10) : (11 + Math.random() * 12);
      
      return {
        x: Math.random() * (width + 100) - 50,
        y: startY !== undefined ? startY : Math.random() * height,
        size: baseSize * depth,
        speedY: (0.7 + Math.random() * 1.3) * depth,
        speedX: (0.2 + Math.random() * 0.7) * depth,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02,
        flipX: Math.random() * Math.PI * 2,
        flipY: Math.random() * Math.PI * 2,
        flipSpeedX: 0.015 + Math.random() * 0.03,
        flipSpeedY: 0.01 + Math.random() * 0.025,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.012 + Math.random() * 0.02,
        swayAmplitude: 1.5 + Math.random() * 2.5,
        opacity: (0.5 + Math.random() * 0.4) * (0.6 + depth * 0.4),
        depth,
        colorIndex: Math.floor(Math.random() * SAKURA_PALETTES.length),
        isFlower,
        vx: 0,
        vy: 0
      };
    };

    // Initialize or adjust petals
    const petals: Petal[] = [];
    for (let i = 0; i < targetCount; i++) {
      petals.push(createPetal(Math.random() * height));
    }
    petalsRef.current = petals;

    // Draw single botanical Sakura petal with organic cleft/notch at tip
    const drawSinglePetal = (
      pCtx: CanvasRenderingContext2D,
      size: number,
      palette: typeof SAKURA_PALETTES[0],
      opacity: number
    ) => {
      const w = size * 0.6;
      const h = size * 0.95;

      pCtx.beginPath();
      // Petal base (stem attachment)
      pCtx.moveTo(0, h * 0.5);
      // Left curve
      pCtx.bezierCurveTo(-w * 1.15, h * 0.15, -w * 0.95, -h * 0.42, -w * 0.28, -h * 0.5);
      // Signature Sakura notched tip indentation
      pCtx.lineTo(0, -h * 0.38);
      pCtx.lineTo(w * 0.28, -h * 0.5);
      // Right curve
      pCtx.bezierCurveTo(w * 0.95, -h * 0.42, w * 1.15, h * 0.15, 0, h * 0.5);
      pCtx.closePath();

      // Soft botanical petal gradient
      const grad = pCtx.createLinearGradient(0, h * 0.5, 0, -h * 0.5);
      grad.addColorStop(0, palette.base);
      grad.addColorStop(0.5, palette.mid);
      grad.addColorStop(1, palette.tip);

      pCtx.fillStyle = grad;
      pCtx.globalAlpha = opacity;
      pCtx.fill();

      // Delicate translucent center vein
      pCtx.beginPath();
      pCtx.moveTo(0, h * 0.42);
      pCtx.quadraticCurveTo(0, 0, 0, -h * 0.28);
      pCtx.strokeStyle = palette.vein;
      pCtx.lineWidth = Math.max(0.6, size * 0.04);
      pCtx.stroke();
    };

    // Main animation loop
    let globalTime = 0;

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 16.666, 2.5);
      lastTimeRef.current = currentTime;
      globalTime += 0.015 * dt;

      ctx.clearRect(0, 0, width, height);

      // Global breeze oscillation (soft wind drifting west to east)
      const naturalBreeze = Math.sin(globalTime * 0.6) * 0.6 + 0.35;

      const mouse = mousePosRef.current;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Sway oscillation
        p.swayPhase += p.swaySpeed * dt;
        const swayX = Math.sin(p.swayPhase) * p.swayAmplitude;

        // Interactive mouse breeze repulsion
        if (mouse.x > -100) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 1.8;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force * 0.5;
            p.angularSpeed += (Math.random() - 0.5) * 0.04;
          }
        }

        // Apply friction to mouse disturbance
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Advance position
        p.x += (p.speedX + naturalBreeze + swayX + p.vx) * dt;
        p.y += (p.speedY + p.vy) * dt;

        // 3D rotation update
        p.angle += p.angularSpeed * dt;
        p.flipX += p.flipSpeedX * dt;
        p.flipY += p.flipSpeedY * dt;

        // Recycle petal when it drifts off screen (bottom or far right)
        if (p.y > height + 40 || p.x > width + 60 || p.x < -80) {
          // Re-enter from top or left edge
          if (Math.random() < 0.75) {
            p.y = -30 - Math.random() * 30;
            p.x = Math.random() * (width + 60) - 60;
          } else {
            // Enter from left with wind
            p.x = -40;
            p.y = Math.random() * (height * 0.7);
          }
          p.vx = 0;
          p.vy = 0;
        }

        // Render petal / flower
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // 3D scale flip for realistic fluttering effect
        const scaleX = Math.cos(p.flipX);
        const scaleY = Math.sin(p.flipY);
        // Avoid division by zero
        ctx.scale(Math.abs(scaleX) < 0.1 ? 0.1 : scaleX, Math.abs(scaleY) < 0.1 ? 0.1 : scaleY);

        const palette = SAKURA_PALETTES[p.colorIndex];

        if (p.isFlower) {
          // Draw miniature 5-petal Sakura blossom
          const flowerRadius = p.size * 0.58;
          for (let f = 0; f < 5; f++) {
            ctx.save();
            ctx.rotate((f * Math.PI * 2) / 5);
            drawSinglePetal(ctx, flowerRadius, palette, p.opacity);
            ctx.restore();
          }

          // Delicate golden pistil at center
          ctx.beginPath();
          ctx.arc(0, 0, flowerRadius * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 168, 76, ${p.opacity * 0.95})`;
          ctx.globalAlpha = p.opacity;
          ctx.fill();

          // Outer pistil dots
          for (let d = 0; d < 5; d++) {
            const da = (d * Math.PI * 2) / 5 + 0.3;
            const dr = flowerRadius * 0.32;
            ctx.beginPath();
            ctx.arc(Math.cos(da) * dr, Math.sin(da) * dr, flowerRadius * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(205, 133, 63, ${p.opacity * 0.9})`;
            ctx.fill();
          }
        } else {
          // Draw standard single falling Sakura petal
          drawSinglePetal(ctx, p.size, palette, p.opacity);
        }

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return (
    <>
      {/* Full Page Background Sakura Bloom Canvas */}
      <canvas
        ref={canvasRef}
        id="sakura-bloom-canvas"
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
        style={{
          display: intensity === 'off' ? 'none' : 'block'
        }}
        aria-hidden="true"
      />

      {/* Sakura Bloom Ambient Floating Toggle Pill - Positioned at Right Side */}
      <div className="fixed bottom-5 right-5 z-40">
        <div className="relative">
          {/* Main Toggle Button */}
          <button
            id="sakura-breeze-toggle-btn"
            onClick={() => setShowControls((prev) => !prev)}
            className="group flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F5]/95 hover:bg-[#FAF8F5] text-[#332A24] backdrop-blur-md border border-[#E5D7CA] hover:border-[#D4AF37] rounded-full shadow-md hover:shadow-lg transition-all text-xs font-medium cursor-pointer"
            title={t('sakura.title', 'Sakura Bloom Animation Settings')}
          >
            <span className="text-sm transition-transform group-hover:scale-125 inline-block">
              🌸
            </span>
            <span className="font-serif-luxury tracking-wider text-[11px] text-[#4A3B32]">
              {t('sakura.title', 'Sakura Bloom')}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                intensity === 'off'
                  ? 'bg-stone-300'
                  : intensity === 'shower'
                  ? 'bg-rose-400 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
          </button>

          {/* Interactive Density / Mode Selector Popup */}
          {showControls && (
            <div 
              id="sakura-controls-menu"
              className="absolute bottom-11 right-0 mb-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl p-2.5 border border-[#E8DFD5] shadow-2xl text-xs space-y-1 animate-fadeIn z-50"
            >
              <div className="px-2.5 py-1.5 border-b border-[#F0EAE1] flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6B3E]">
                  {t('sakura.atmosphere', 'Sakura Atmosphere')}
                </span>
                <span className="text-xs">🌸</span>
              </div>

              {/* Gentle Mode */}
              <button
                onClick={() => handleSetIntensity('gentle')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                  intensity === 'gentle'
                    ? 'bg-[#FAF5EE] text-[#1F1B18] font-semibold border border-[#E2D5C4]'
                    : 'text-[#5C534B] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🍃</span>
                  <div>
                    <p className="text-xs leading-none">{t('sakura.gentle', 'Gentle Breeze')}</p>
                    <p className="text-[10px] text-[#8C8075] mt-0.5">{t('sakura.gentle_desc', 'Ethereal soft petal drift')}</p>
                  </div>
                </div>
                {intensity === 'gentle' && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </button>

              {/* Spring Shower Mode */}
              <button
                onClick={() => handleSetIntensity('shower')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                  intensity === 'shower'
                    ? 'bg-[#FAF5EE] text-[#1F1B18] font-semibold border border-[#E2D5C4]'
                    : 'text-[#5C534B] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌸</span>
                  <div>
                    <p className="text-xs leading-none">{t('sakura.shower', 'Blossom Shower')}</p>
                    <p className="text-[10px] text-[#8C8075] mt-0.5">{t('sakura.shower_desc', 'Full spring bloom rain')}</p>
                  </div>
                </div>
                {intensity === 'shower' && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </button>

              {/* Pause / Off Mode */}
              <button
                onClick={() => handleSetIntensity('off')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                  intensity === 'off'
                    ? 'bg-[#FAF5EE] text-[#1F1B18] font-semibold border border-[#E2D5C4]'
                    : 'text-[#5C534B] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-[#8C8075]" />
                  <div>
                    <p className="text-xs leading-none">{t('sakura.off', 'Pause Bloom')}</p>
                    <p className="text-[10px] text-[#8C8075] mt-0.5">{t('sakura.off_desc', 'Static minimal view')}</p>
                  </div>
                </div>
                {intensity === 'off' && <Check className="w-3.5 h-3.5 text-[#8C8075]" />}
              </button>

              {/* Language Change Option (English / Bangla) */}
              <div className="pt-2 border-t border-[#F0EAE1]">
                <div className="px-1 py-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6B3E] flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#D4AF37]" />
                    <span>Language / ভাষা</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setToastText('Language: English');
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 2000);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#1F1B18] text-white font-bold shadow-xs'
                        : 'bg-[#FAF5EE] text-[#5C534B] hover:bg-[#EFE7DC]'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('bn');
                      setToastText('ভাষা: বাংলা');
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 2000);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                      language === 'bn'
                        ? 'bg-[#1F1B18] text-white font-bold shadow-xs'
                        : 'bg-[#FAF5EE] text-[#5C534B] hover:bg-[#EFE7DC]'
                    }`}
                  >
                    বাংলা (BN)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Temporary Toast feedback on mode change */}
      {showToast && (
        <div className="fixed bottom-16 right-5 z-50 bg-[#1F1B18]/90 backdrop-blur-md text-[#FAF8F5] px-3.5 py-2 rounded-xl border border-[#3A322C] text-xs font-medium flex items-center gap-2 shadow-lg animate-fadeIn">
          <span>🌸</span>
          <span>{toastText}</span>
        </div>
      )}
    </>
  );
};
