'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';

type ServiceColor = 'green' | 'orange' | 'blue' | 'yellow';

type CulturalServiceItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: ServiceColor;
};

const culturalServices: CulturalServiceItem[] = [
  {
    icon: (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    title: 'Traditional Dance & Music',
    description: 'Experience the rich heritage of Kerala through dance and music workshops.',
    color: 'green'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
      </svg>
    ),
    title: 'Art & Craft Workshops',
    description: 'Learn traditional Kerala art forms and crafts through hands-on workshops.',
    color: 'orange'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Kerala Folklore and Tribal Traditions',
    description: 'Introduce lesser-known folk dances like Theyyam, Padayani, and Poothan Thira.',
    color: 'blue'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
    title: 'Kerala Cuisine Classes',
    description: 'Master the art of traditional Kerala cooking with expert chefs.',
    color: 'yellow'
  }
];

const TILT_MAX_RX = 6;
const TILT_MAX_RY = 8;

function CulturalGlassCard({ service, index }: { service: CulturalServiceItem; index: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, z: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      setInView(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const ry = Math.max(-TILT_MAX_RY, Math.min(TILT_MAX_RY, x * 2 * TILT_MAX_RY));
    const rx = Math.max(-TILT_MAX_RX, Math.min(TILT_MAX_RX, -y * 2 * TILT_MAX_RX));
    const z = 10 + (Math.abs(x) + Math.abs(y)) * 14;
    setTilt({ rx, ry, z: Math.min(26, z) });
  }, [reducedMotion]);

  const onMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, z: 0 });
  }, []);

  const iconBg =
    service.color === 'green'
      ? 'bg-green-100/85 backdrop-blur-sm border border-green-200/50 shadow-sm'
      : service.color === 'orange'
        ? 'bg-orange-100/85 backdrop-blur-sm border border-orange-200/50 shadow-sm'
        : service.color === 'blue'
          ? 'bg-blue-100/85 backdrop-blur-sm border border-blue-200/50 shadow-sm'
          : 'bg-yellow-100/85 backdrop-blur-sm border border-yellow-200/50 shadow-sm';

  const faceStyle: React.CSSProperties | undefined = reducedMotion
    ? undefined
    : {
        transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.z}px)`
      };

  return (
    <div
      ref={wrapRef}
      className={`services-glass-card-wrap${inView ? ' services-glass-card-wrap--visible' : ''}`}
      style={{ ['--services-reveal-delay' as string]: `${index * 80}ms` }}
    >
      <div
        role="article"
        aria-labelledby={`services-card-title-${index}`}
        className="services-glass-card-face services-cultural-card group relative"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={faceStyle}
      >
        <div className="services-glass-card-shine pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden />
        <div className="relative z-[1] flex items-start space-x-6">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
          >
            {service.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id={`services-card-title-${index}`}
              className="services-cultural-card-title mb-3 text-xl font-bold transition-colors duration-300 group-hover:text-emerald-800"
            >
              {service.title}
            </h3>
            <p className="services-cultural-card-desc text-sm leading-relaxed lg:text-base">{service.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const ServicesSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/90 via-green-50 to-emerald-50/80 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" aria-hidden />
      <HomeSectionRail
        eyebrow="What we do"
        containerClassName="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-16">
          <HomeSectionTitle className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Cultural Workshops and Educational Events
          </HomeSectionTitle>
        </div>

        <div className="services-cultural-cards grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {culturalServices.map((service, index) => (
            <CulturalGlassCard key={service.title} service={service} index={index} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50/90 px-6 py-3 text-sm font-medium text-blue-700 shadow-sm backdrop-blur-sm">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Join our cultural community and preserve Kerala's rich heritage</span>
          </div>
        </div>
      </HomeSectionRail>
    </div>
  );
};

export default ServicesSection;
