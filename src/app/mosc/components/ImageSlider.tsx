'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageSliderProps {
  images?: string[];
  autoPlayInterval?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ 
  images = [
    '/images/ecumenical/catholic-church.jpg',
    '/images/ecumenical/oriental-orthodox.jpg',
    '/images/mosc/gallery/vatican-visit/00001_11092023-1024x683.jpg',
    '/images/mosc/gallery/reception-mathews-iii/R15-2.jpg',
    '/images/mosc/gallery/metropolitan-hilarion/IMG-20190916-WA0025.jpg',
    '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0023-300x200.jpg',
  ],
  autoPlayInterval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-syro-bg-gray to-white">
      {/* Image Container */}
      <div className="relative w-full h-full bg-syro-bg-gray">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className="object-contain"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator - Vertical on Right Center */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'h-8'
                : 'bg-white border-2'
            }`}
            style={{
              backgroundColor: index === currentIndex ? 'rgb(191, 69, 30)' : 'white',
              borderColor: 'rgb(191, 69, 30)',
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
