'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const HERO_IMAGES = [
  { src: '/mosc/assets/images/mosc_images/bava_thirumeni_pope_visit.jpeg', alt: 'Malankara Orthodox Syrian Church' },
  { src: '/mosc/assets/images/mosc_images/Malankara_Orthodox_Palace_Slider_New.jpeg', alt: 'Malankara Orthodox Palace' },
];

export default function SyroHomeHeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-banner disable-select">
      <div className="hero-body disable-select">
        <div className="main-slider swiper">
          <div className="swiper-wrapper min-h-100vh" id="banners">
            {HERO_IMAGES.map((img, idx) => (
              <div
                key={`${img.src}-${idx}`}
                className={`swiper-slide min-h-100vh ${idx === currentIndex ? 'swiper-slide-active' : ''}`}
                style={{
                  display: idx === currentIndex ? 'block' : 'none',
                  position: 'relative',
                  minHeight: 'min(92vh, 600px)',
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="w-100"
                  sizes="100vw"
                  priority={idx === 0}
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
              </div>
            ))}
          </div>
          {/* Pagination bullets: one per slide (match HERO_IMAGES.length), vertical, right side, clickable */}
          <div
            className="swiper-pagination main-slider-pagination swiper-pagination-vertical swiper-pagination-bullets syro-hero-pagination"
            role="tablist"
            aria-label="Slider pagination"
            data-slide-count={HERO_IMAGES.length}
          >
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-label={`Go to slide ${idx + 1}`}
                aria-selected={idx === currentIndex}
                className={`swiper-pagination-bullet ${idx === currentIndex ? 'swiper-pagination-bullet-active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
