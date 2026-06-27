'use client';

import React from 'react';
import HeroSection from '../../components/charity-sections/HeroSection';
import ServicesSection from '../../components/charity-sections/ServicesSection';
import AboutSection from '../../components/charity-sections/AboutSection';
import CausesSection from '../../components/charity-sections/CausesSection';
import TeamSection from '../../components/charity-sections/TeamSection';
import ProjectsSection from '../../components/charity-sections/ProjectsSection';
import TestimonialsSection from '../../components/charity-sections/TestimonialsSection';

export default function CharityWebsite() {
  return (
    <main className="charity-theme-layout">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <CausesSection />
      <TeamSection />
      <ProjectsSection />
      <TestimonialsSection />
      {/* Spacer section for clear separation before footer */}
      <div className="py-24 bg-white"></div>
    </main>
  );
}