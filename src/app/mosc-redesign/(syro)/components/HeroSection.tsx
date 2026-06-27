'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from './AppImage';

const HeroSection = () => {
  return (
    <section className="relative min-h-[650px] flex items-center py-8 lg:py-12 overflow-hidden bg-syro-bg-gray">
      {/* Syro gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 20%, rgba(245, 246, 247, 0.95) 0%, rgba(235, 237, 240, 0.9) 40%, rgba(234, 235, 239, 0.85) 100%),
            linear-gradient(180deg, #f5f6f7 0%, #eaebef 50%, #e8e9ed 100%)
          `,
        }}
      />

      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 40%, rgba(255, 248, 230, 0.4) 0%, transparent 60%)
          `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="mb-8 lg:mb-10 text-center">
          <p className="font-syro-primary text-base lg:text-lg tracking-wide text-syro-dark-gray" style={{ letterSpacing: '0.15em' }}>
            Saint Thomas Christian Community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 mb-12 lg:mb-16 items-center">
          <div className="flex flex-col items-center justify-start order-2 md:order-1">
            <div className="group relative">
              <div className="absolute -inset-3 rounded-full pointer-events-none bg-white shadow-syro-card" />
              <div className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] border-[6px] border-white shadow-syro-card">
                <AppImage
                  src="/images/logos/Hero-Section-Image-MOSC.jpg"
                  alt="H.H. Baselios Marthoma Mathews III - Catholicos of the East"
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(1.05) contrast(1.02) saturate(1.1)' }}
                />
              </div>
            </div>
            <div className="mt-4 text-center md:text-left">
              <h3 className="leading-tight mb-2 px-4 py-2 rounded-md inline-block font-syro-display text-syro-maroon bg-syro-red/10">
                <span className="block text-lg lg:text-xl font-bold">H.H. Baselios</span>
                <span className="block text-lg lg:text-xl font-bold">Marthoma Mathews III</span>
              </h3>
              <nav className="flex items-center justify-center md:justify-start gap-x-2 text-sm lg:text-[15px] font-syro-primary">
                <Link href="/mosc-redesign/holy-synod/his-holiness-baselios-marthoma-mathews-iii" className="font-semibold text-syro-blue hover:text-syro-red transition-colors duration-200">
                  Biography
                </Link>
                <span className="text-syro-blue font-semibold">|</span>
                <Link href="/mosc-redesign/photo-gallery/reception-to-his-holiness-baselios-marthoma-mathews-iii" className="font-semibold text-syro-blue hover:text-syro-red transition-colors duration-200">
                  Photos
                </Link>
                <span className="text-syro-blue font-semibold">|</span>
                <Link href="/mosc-redesign/speeches" className="font-semibold text-syro-blue hover:text-syro-red transition-colors duration-200">
                  Speeches
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center order-1 md:order-2">
            <div className="group relative">
              <div className="absolute -inset-4 rounded-full pointer-events-none bg-white shadow-syro-card" />
              <div className="relative w-56 h-56 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden p-4 transition-transform duration-500 group-hover:scale-[1.01] border-[8px] border-white shadow-syro-card bg-transparent">
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Center-Image.png"
                  alt="Malankara Orthodox Syrian Church Sacred Emblem"
                  className="w-full h-full object-contain scale-105"
                  style={{ background: 'transparent', filter: 'brightness(1.02) contrast(1.05)' }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-start order-3">
            <div className="group relative">
              <div className="absolute -inset-3 rounded-full pointer-events-none bg-white shadow-syro-card" />
              <div className="absolute -inset-1 rounded-full pointer-events-none bg-white/85" />
              <div className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden flex flex-col items-center justify-center gap-0 p-3 transition-transform duration-500 group-hover:scale-[1.02] border-[6px] border-white shadow-syro-card bg-syro-bg-gray">
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                  alt="MOSC Sacred Cross"
                  className="w-full h-[55%] object-contain"
                  style={{ background: 'transparent', filter: 'brightness(1.05) contrast(1.02)' }}
                />
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Text-only.png"
                  alt="Malankara Orthodox Syrian Church"
                  className="w-[85%] h-auto object-contain -mt-2"
                  style={{ background: 'transparent', filter: 'brightness(1.02)' }}
                />
              </div>
            </div>
            <div className="mt-5 h-[76px] lg:h-[84px]" />
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto px-4">
          <h2 className="text-syro-h3 font-bold text-syro-blue mb-6 font-syro-display">
            Welcome to Our Sacred Community
          </h2>
          <p className="text-syro-body leading-relaxed lg:leading-loose text-justify text-syro-dark-gray font-syro-primary">
            The Malankara Orthodox Syrian Church traces its origins to the Apostolic ministry of St. Thomas in India.
            We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations
            while serving our members with love, compassion, and spiritual guidance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
