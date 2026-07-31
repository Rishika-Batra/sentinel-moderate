import { useEffect, useRef } from 'react';

interface Ribbon {
  color: string;
  glowColor: string;
  lineWidth: number;
  baseYOffset: number;
  angle: number;
  wave1: { freq: number; amp: number; speed: number; phase: number };
  wave2: { freq: number; amp: number; speed: number; phase: number };
  wave3: { freq: number; amp: number; speed: number; phase: number };
}

interface Streak {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  baseOpacity: number;
  width: number;
  pulsePhase: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  swayAmp: number;
  opacity: number;
  phase: number;
}

interface BloomOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
}

export default function LuminousRibbonBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Generate 256x256 tileable noise texture pattern (2.5% opacity)
    const createNoisePattern = () => {
      const nCanvas = document.createElement('canvas');
      nCanvas.width = 256;
      nCanvas.height = 256;
      const nCtx = nCanvas.getContext('2d');
      if (nCtx) {
        const imgData = nCtx.createImageData(256, 256);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.floor(Math.random() * 255);
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 12;
        }
        nCtx.putImageData(imgData, 0, 0);
      }
      return ctx.createPattern(nCanvas, 'repeat');
    };

    let noisePattern = createNoisePattern();

    // Mouse tracking
    let targetMouse = { x: width / 2, y: height / 2 };
    let currentMouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5 Vibrant Luminous Ribbons (original wave brightness)
    const ribbons: Ribbon[] = [
      {
        color: 'rgba(168, 85, 247, 0.95)',   // Neon Violet #A855F7
        glowColor: 'rgba(168, 85, 247, 0.7)',
        lineWidth: 30,
        baseYOffset: -160,
        angle: -0.22,
        wave1: { freq: 0.0018, amp: 65, speed: 2.2, phase: 0 },
        wave2: { freq: 0.0035, amp: 35, speed: -1.8, phase: 1.2 },
        wave3: { freq: 0.0009, amp: 22, speed: 1.5, phase: 2.4 },
      },
      {
        color: 'rgba(236, 72, 153, 0.95)',   // Neon Pink #EC4899
        glowColor: 'rgba(236, 72, 153, 0.7)',
        lineWidth: 26,
        baseYOffset: -80,
        angle: -0.20,
        wave1: { freq: 0.0022, amp: 55, speed: -2.5, phase: 0.8 },
        wave2: { freq: 0.004, amp: 28, speed: 2.0, phase: 2.1 },
        wave3: { freq: 0.0011, amp: 18, speed: -1.4, phase: 0.5 },
      },
      {
        color: 'rgba(6, 182, 212, 0.95)',    // Neon Cyan #06B6D4
        glowColor: 'rgba(6, 182, 212, 0.7)',
        lineWidth: 34,
        baseYOffset: 0,
        angle: -0.24,
        wave1: { freq: 0.0016, amp: 75, speed: 2.8, phase: 1.5 },
        wave2: { freq: 0.0032, amp: 40, speed: -1.6, phase: 0.3 },
        wave3: { freq: 0.0008, amp: 25, speed: 1.8, phase: 1.9 },
      },
      {
        color: 'rgba(245, 158, 11, 0.95)',   // Amber #F59E0B
        glowColor: 'rgba(245, 158, 11, 0.7)',
        lineWidth: 28,
        baseYOffset: 80,
        angle: -0.21,
        wave1: { freq: 0.002, amp: 50, speed: -2.1, phase: 2.7 },
        wave2: { freq: 0.0038, amp: 28, speed: 2.3, phase: 1.0 },
        wave3: { freq: 0.001, amp: 20, speed: -1.7, phase: 3.1 },
      },
      {
        color: 'rgba(16, 185, 129, 0.95)',   // Neon Green #10B981
        glowColor: 'rgba(16, 185, 129, 0.7)',
        lineWidth: 32,
        baseYOffset: 160,
        angle: -0.23,
        wave1: { freq: 0.0015, amp: 60, speed: 2.4, phase: 1.1 },
        wave2: { freq: 0.0034, amp: 32, speed: -1.9, phase: 2.8 },
        wave3: { freq: 0.0009, amp: 22, speed: 1.6, phase: 0.2 },
      },
    ];

    // 2 Bright Ambient Bloom Orbs
    const bloomOrbs: BloomOrb[] = [
      {
        x: width * 0.3,
        y: height * 0.4,
        radius: 480,
        color: 'rgba(120, 80, 235, 0.25)',
        vx: 0.15,
        vy: 0.1,
      },
      {
        x: width * 0.7,
        y: height * 0.6,
        radius: 520,
        color: 'rgba(6, 182, 212, 0.25)',
        vx: -0.12,
        vy: -0.15,
      },
    ];

    // Bright animated streaks
    const streaks: Streak[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 20 + Math.random() * 35,
      angle: -0.22 + (Math.random() - 0.5) * 0.1,
      speed: 0.15 + Math.random() * 0.25,
      baseOpacity: 0.14 + Math.random() * 0.22,
      width: 1.2 + Math.random() * 1.2,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Bright upward drifting dust motes
    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.2 + Math.random() * 2.0,
      speedY: 0.2 + Math.random() * 0.35,
      swayAmp: 0.3 + Math.random() * 0.4,
      opacity: 0.22 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      noisePattern = createNoisePattern();
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const render = () => {
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06;

      time += 0.008;

      // 1. Pure black canvas base
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 2. Pass 1: Draw Ambient Bloom Orbs
      ctx.globalCompositeOperation = 'lighter';
      for (let b = 0; b < bloomOrbs.length; b++) {
        const orb = bloomOrbs[b];
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < 50 || orb.x > width - 50) orb.vx *= -1;
        if (orb.y < 50 || orb.y > height - 50) orb.vy *= -1;

        const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        orbGrad.addColorStop(0, orb.color);
        orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Pass 2: Animated Streaks with Edge Mask
      ctx.shadowBlur = 0;
      ctx.lineCap = 'round';
      const edgeMargin = 120;

      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        if (s.x > width + 60) s.x = -60;
        if (s.y > height + 60) s.y = -60;
        if (s.x < -60) s.x = width + 60;
        if (s.y < -60) s.y = height + 60;

        let edgeAlpha = 1;
        if (s.x < edgeMargin) edgeAlpha *= Math.max(0, s.x / edgeMargin);
        else if (s.x > width - edgeMargin) edgeAlpha *= Math.max(0, (width - s.x) / edgeMargin);

        if (s.y < edgeMargin) edgeAlpha *= Math.max(0, s.y / edgeMargin);
        else if (s.y > height - edgeMargin) edgeAlpha *= Math.max(0, (height - s.y) / edgeMargin);

        const opacityPulse = Math.sin(time * 0.08 + s.pulsePhase) * 0.04;
        const currentOpacity = Math.max(0.04, Math.min(0.4, s.baseOpacity + opacityPulse)) * edgeAlpha;

        if (currentOpacity > 0.005) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.lineWidth = s.width;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(
            s.x + Math.cos(s.angle) * s.length,
            s.y + Math.sin(s.angle) * s.length
          );
          ctx.stroke();
        }
      }

      // 4. Pass 3: Upward Drifting Dust Motes
      for (let p = 0; p < particles.length; p++) {
        const pt = particles[p];
        pt.y -= pt.speedY;
        pt.x += Math.sin(time * 1.5 + pt.phase) * pt.swayAmp;

        if (pt.y < -20) {
          pt.y = height + 20;
          pt.x = Math.random() * width;
        }

        let ptEdgeAlpha = 1;
        if (pt.x < edgeMargin) ptEdgeAlpha *= Math.max(0, pt.x / edgeMargin);
        else if (pt.x > width - edgeMargin) ptEdgeAlpha *= Math.max(0, (width - pt.x) / edgeMargin);

        if (pt.y < edgeMargin) ptEdgeAlpha *= Math.max(0, pt.y / edgeMargin);
        else if (pt.y > height - edgeMargin) ptEdgeAlpha *= Math.max(0, (height - pt.y) / edgeMargin);

        const ptOpacity = pt.opacity * ptEdgeAlpha;

        if (ptOpacity > 0.005) {
          ctx.fillStyle = `rgba(255, 255, 255, ${ptOpacity})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Pass 4: 5 Luminous Diagonal Ribbons (balanced wave brightness)
      const centerY = height / 2;
      const step = 6;

      for (let i = 0; i < ribbons.length; i++) {
        const r = ribbons[i];

        const ribbonCenterYAtMouseX = centerY + r.baseYOffset + (currentMouse.x - width / 2) * Math.sin(r.angle);
        const perpDistToCursor = Math.abs(currentMouse.y - ribbonCenterYAtMouseX);

        const isCursorOverThisRibbon = perpDistToCursor < 40;

        const points: { x: number; y: number }[] = [];

        for (let x = -120; x <= width + 120; x += step) {
          const diagonalBaseY = centerY + r.baseYOffset + (x - width / 2) * Math.sin(r.angle);

          const shift1 = x - time * r.wave1.speed * 120;
          const shift2 = x + time * r.wave2.speed * 90;
          const shift3 = x - time * r.wave3.speed * 60;

          const w1 = Math.sin(shift1 * r.wave1.freq + r.wave1.phase) * r.wave1.amp;
          const w2 = Math.sin(shift2 * r.wave2.freq + r.wave2.phase) * r.wave2.amp;
          const w3 = Math.sin(shift3 * r.wave3.freq + r.wave3.phase) * r.wave3.amp;

          let ptY = diagonalBaseY + w1 + w2 + w3;

          if (isCursorOverThisRibbon) {
            const distX = Math.abs(x - currentMouse.x);
            if (distX < 200) {
              const gaussianFalloff = Math.exp(-Math.pow(distX / 85, 2));
              const pushDirection = ptY >= currentMouse.y ? 1 : -1;
              ptY += pushDirection * gaussianFalloff * 15;
            }
          }

          points.push({ x, y: ptY });
        }

        // Bloom Glow Pass
        ctx.shadowBlur = 45;
        ctx.shadowColor = r.glowColor;
        ctx.strokeStyle = r.glowColor;
        ctx.lineWidth = r.lineWidth + 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let p = 0; p < points.length; p++) {
          if (p === 0) ctx.moveTo(points[p].x, points[p].y);
          else ctx.lineTo(points[p].x, points[p].y);
        }
        ctx.stroke();

        // High Intensity Core Pass
        ctx.shadowBlur = 22;
        ctx.shadowColor = r.color;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.lineWidth;

        ctx.beginPath();
        for (let p = 0; p < points.length; p++) {
          if (p === 0) ctx.moveTo(points[p].x, points[p].y);
          else ctx.lineTo(points[p].x, points[p].y);
        }
        ctx.stroke();
      }

      // 6. Pass 5: Soft Radial Vignette
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      const vignetteGrad = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.4,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, width, height);

      // 7. Pass 6: Subtle Film Grain / Noise Texture Overlay (2.5% opacity)
      if (noisePattern) {
        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full bg-black pointer-events-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
