'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroSection from '../../components/charity-sections/HeroSection';
import ServicesSection from '../../components/charity-sections/ServicesSection';
import AboutSection from '../../components/charity-sections/AboutSection';
import CausesSection from '../../components/charity-sections/CausesSection';
import TeamSection from '../../components/charity-sections/TeamSection';
import ProjectsSection from '../../components/charity-sections/ProjectsSection';
import TestimonialsSection from '../../components/charity-sections/TestimonialsSection';

export default function CharityWebsite() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const targetId = searchParams?.get('scrollTo');
    if (!targetId) return;

    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (!target) return false;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    };

    if (scrollToTarget()) return;

    const timeout = window.setTimeout(scrollToTarget, 500);
    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  return (
    <main className="charity-theme-layout">
      <div id="home">
        <HeroSection />
      </div>
      <div id="donate">
        <ServicesSection />
      </div>
      <div id="about-us">
        <AboutSection />
      </div>
      <div id="causes">
        <CausesSection />
      </div>
      <div id="volunteer">
        <TeamSection />
      </div>
      <div id="fundraise">
        <ProjectsSection />
      </div>
      <div id="sponsor">
        <TestimonialsSection />
      </div>
      {/* Spacer section for clear separation before footer */}
      <div id="newsletter" className="py-24 bg-white"></div>
    </main>
  );
}