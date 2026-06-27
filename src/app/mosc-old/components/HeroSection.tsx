'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from './AppImage';

const HeroSection = () => {
  return (
    <section className="mosc-hero-section relative min-h-[650px] flex items-center py-8 lg:py-12 overflow-hidden">
      {/* Warm Parchment Background with Subtle Texture */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 20%, rgba(245, 241, 232, 0.95) 0%, rgba(237, 231, 211, 0.9) 40%, rgba(222, 213, 190, 0.85) 100%),
            linear-gradient(180deg, #F5F1E8 0%, #E8E0D0 50%, #DED5BE 100%)
          `,
        }}
      />

      {/* Decorative Light Rays */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 40%, rgba(255, 248, 230, 0.4) 0%, transparent 60%)
          `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Church Logo / Subtitle */}
        <div className="mb-8 lg:mb-10 text-center">
          <p
            className="font-caption text-base lg:text-lg tracking-wide"
            style={{ color: '#72553E', letterSpacing: '0.15em' }}
          >
            Saint Thomas Christian Community
          </p>
        </div>

        {/* Three Circular Images - Redesigned Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 mb-12 lg:mb-16 items-center">

          {/* LEFT: Patriarch Image with Name & Links Below */}
          <div className="flex flex-col items-center justify-start order-2 md:order-1">
            {/* Circular Image Frame - Solid White Border */}
            <div className="mosc-hero-circle-frame group relative">
              {/* Solid White Outer Ring */}
              <div
                className="absolute -inset-3 rounded-full pointer-events-none"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                }}
              />
              {/* Image Container */}
              <div
                className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
                style={{
                  border: '6px solid #FFFFFF',
                  boxShadow: '0 4px 25px rgba(0, 0, 0, 0.2)',
                }}
              >
                <AppImage
                  src="/images/logos/Hero-Section-Image-MOSC.jpg"
                  alt="H.H. Baselios Marthoma Mathews III - Catholicos of the East"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'brightness(1.05) contrast(1.02) saturate(1.1)',
                  }}
                />
              </div>
            </div>

            {/* Text Below image */}
            <div className="mt-4 text-center md:text-left">
              {/* Name - with light brown transparent background */}
              <h3
                className="leading-tight mb-2 px-4 py-2 rounded-md inline-block"
                style={{
                  fontFamily: "'Lora', serif",
                  color: '#8B2323',
                  background: 'rgba(160, 130, 100, 0.15)',
                }}
              >
                <span className="block text-lg lg:text-xl font-bold">H.H. Baselios</span>
                <span className="block text-lg lg:text-xl font-bold">Marthoma Mathews III</span>
              </h3>

              {/* Navigation Links - Bolder with different color */}
              <nav className="flex items-center justify-center md:justify-start gap-x-2 text-sm lg:text-[15px] font-body">
                <Link
                  href="/mosc-old/holy-synod/his-holiness-baselios-marthoma-mathews-iii"
                  className="mosc-hero-link hover:text-[#8B2323] transition-colors duration-200 font-semibold"
                  style={{ color: '#6B4E3D' }}
                >
                  Biography
                </Link>
                <span style={{ color: '#6B4E3D', fontWeight: '600' }}>|</span>
                <Link
                  href="/mosc-old/photo-gallery/reception-to-his-holiness-baselios-marthoma-mathews-iii"
                  className="mosc-hero-link hover:text-[#8B2323] transition-colors duration-200 font-semibold"
                  style={{ color: '#6B4E3D' }}
                >
                  Photos
                </Link>
                <span style={{ color: '#6B4E3D', fontWeight: '600' }}>|</span>
                <Link
                  href="/mosc-old/speeches"
                  className="mosc-hero-link hover:text-[#8B2323] transition-colors duration-200 font-semibold"
                  style={{ color: '#6B4E3D' }}
                >
                  Speeches
                </Link>
              </nav>
            </div>
          </div>

          {/* CENTER: Church Cross - Larger & More Prominent */}
          <div className="flex flex-col items-center justify-center order-1 md:order-2">
            <div className="mosc-hero-circle-frame mosc-hero-center-circle group relative">
              {/* Solid White Outer Ring - Larger */}
              <div
                className="absolute -inset-4 rounded-full pointer-events-none"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 6px 30px rgba(0, 0, 0, 0.15)',
                }}
              />
              {/* Image Container - Larger */}
              <div
                className="relative w-56 h-56 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden p-4 transition-transform duration-500 group-hover:scale-[1.01]"
                style={{
                  border: '8px solid #FFFFFF',
                  boxShadow: '0 6px 35px rgba(0, 0, 0, 0.2)',
                  background: 'transparent',
                }}
              >
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Center-Image.png"
                  alt="Malankara Orthodox Syrian Church Sacred Emblem"
                  className="w-full h-full object-contain scale-105"
                  style={{
                    background: 'transparent',
                    filter: 'brightness(1.02) contrast(1.05)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: St. Thomas Icon / Church Logo */}
          <div className="flex flex-col items-center justify-start order-3">
            <div className="mosc-hero-circle-frame group relative">
              {/* Solid White Outer Ring */}
              <div
                className="absolute -inset-3 rounded-full pointer-events-none"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                }}
              />
              {/* Second White Ring (inner) */}
              <div
                className="absolute -inset-1 rounded-full pointer-events-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                }}
              />
              {/* Image Container - Cream/Parchment inner background */}
              <div
                className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden flex flex-col items-center justify-center gap-0 p-3 transition-transform duration-500 group-hover:scale-[1.02]"
                style={{
                  border: '6px solid #FFFFFF',
                  boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.8), 0 4px 25px rgba(255, 255, 255, 0.3)',
                  background: '#EDE7D3',
                }}
              >
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                  alt="MOSC Sacred Cross"
                  className="w-full h-[55%] object-contain"
                  style={{
                    background: 'transparent',
                    filter: 'brightness(1.05) contrast(1.02)',
                  }}
                />
                <AppImage
                  src="/images/logos/Current_Edits/MOSC-Text-only.png"
                  alt="Malankara Orthodox Syrian Church"
                  className="w-[85%] h-auto object-contain -mt-2"
                  style={{
                    background: 'transparent',
                    filter: 'brightness(1.02)',
                  }}
                />
              </div>
            </div>
            {/* Empty space for visual balance */}
            <div className="mt-5 h-[76px] lg:h-[84px]"></div>
          </div>
        </div>

        {/* Welcome Text - floating text, no background */}
        <div className="text-center max-w-4xl mx-auto px-4">
          <h2
            className="text-2xl sm:text-3xl lg:text-[2rem] mb-6"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: '#6B4E3D',
              fontWeight: 700,
              letterSpacing: '0.01em',
              textShadow: '0 0 1px rgba(107, 78, 61, 0.4), 0.5px 0.5px 0px rgba(107, 78, 61, 0.2)',
            }}
          >
            Welcome to Our Sacred Community
          </h2>
          <p
            className="text-base lg:text-lg leading-relaxed lg:leading-loose text-justify"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: '#6B4E3D',
              fontWeight: 400,
              textShadow: '0 0 1px rgba(107, 78, 61, 0.3), 0.3px 0.3px 0px rgba(107, 78, 61, 0.15)',
            }}
          >
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