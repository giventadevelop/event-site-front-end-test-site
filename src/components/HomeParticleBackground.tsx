'use client';

import { useEffect, useRef } from 'react';
import './home-particle-background.css';

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  colorIndex: number;
  wobble: number;
  layer: number;
};

const PARTICLE_COLORS: ReadonlyArray<readonly [number, number, number]> = [
  [251, 191, 36],
  [236, 72, 153],
  [168, 85, 247],
  [99, 102, 241],
  [56, 189, 248],
  [244, 114, 182],
];

const PARTICLE_COUNT = 220;

function createParticles(): Particle[] {
  const spread = Math.min(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    angle: Math.random() * Math.PI * 2,
    radius: 60 + Math.random() * spread * 0.42,
    speed: 0.0006 + Math.random() * 0.0018,
    size: 0.8 + Math.random() * 2.2,
    colorIndex: i % PARTICLE_COLORS.length,
    wobble: Math.random() * Math.PI * 2,
    layer: Math.random(),
  }));
}

export default function HomeParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles = createParticles();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const cx = width * 0.52;
      const cy = height * 0.48;
      const t = time * 0.001;

      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#1a0a2e');
      bg.addColorStop(0.35, '#2d1b4e');
      bg.addColorStop(0.7, '#1e1b4b');
      bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const gridStep = 44;
      ctx.fillStyle = 'rgba(139, 92, 246, 0.12)';
      for (let gx = gridStep / 2; gx < width; gx += gridStep) {
        for (let gy = gridStep / 2; gy < height; gy += gridStep) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed * (0.7 + p.layer * 0.6);

        const ripple = Math.sin(t * 1.2 + p.wobble) * 35;
        const spiral = Math.sin(p.angle * 2.5 + t) * 25;
        const r = p.radius + ripple + spiral;
        const squash = 0.62 + p.layer * 0.12;
        const x = cx + Math.cos(p.angle + t * 0.15) * r;
        const y = cy + Math.sin(p.angle + t * 0.12) * r * squash;

        const [cr, cg, cb] = PARTICLE_COLORS[p.colorIndex]!;
        const alpha = 0.25 + Math.sin(t * 2 + p.wobble) * 0.2 + p.layer * 0.15;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        if (i % 4 === 0) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.5)`;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-particle-background" aria-hidden />;
}
