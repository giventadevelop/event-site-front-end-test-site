'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { pilgrimCentresData } from './pilgrimCentresData';

// Helper function to generate slug from name - must match slugs in [slug]/page.tsx
function getSlug(name: string): string {
  const slugMap: Record<string, string> = {
    'Thiruvithamcode Arappally': 'thiruvithamcode-arappally',
    'Parumala Church': 'parumala-church',
    'St. Mary\'s Orthodox Syrian Church (Niranam Valiyapally)': 'niranam-valiyapally',
    'Arthat St. Mary\'s Cathedral, Kunnamkulam': 'arthat-st-marys-cathedral',
    'Pampady Dayara': 'pampady-dayara',
    'Puthuppally Church': 'puthuppally-church',
    'Koonan Kurishu Pilgrim Centre': 'koonan-kurishu-pilgrim-centre',
    'Old Seminary (Pazhaya Seminary), Kottayam': 'old-seminary-pazhaya-seminary',
    'St. George Orthodox Church kadamattom': 'st-george-orthodox-church-kadamattom',
    'Kottayam Cheriapally': 'kottayam-cheriapally',
    'St. Mary\'s Orthodox Church, Kallooppara': 'st-marys-orthodox-church-kallooppara',
    'St. George Orthodox Church, Chandanapally': 'st-george-orthodox-church-chandanapally',
  };
  
  return slugMap[name] || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// Using shared data from pilgrimCentresData.ts - no need for duplicate data

// Image component with error handling - fixed height for consistency
function PilgrimCentreImage({ 
  image, 
  name, 
  location 
}: { 
  image: string; 
  name: string; 
  location: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fixed height container for all images
  const imageHeight = 'h-64'; // 256px fixed height

  return (
    <div className={`relative w-full ${imageHeight} rounded-t-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center`}>
      {image && !imageError ? (
        <div className="relative w-full h-full">
          <Image
            src={image}
            alt={`${name} - ${location}`}
            width={800}
            height={600}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            style={{
              backgroundColor: 'transparent',
              borderRadius: '0.5rem 0.5rem 0 0'
            }}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <div className="text-center">
                <svg className="w-12 h-12 text-syro-red/40 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`w-full ${imageHeight} flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20`}>
          <div className="text-center px-4">
            <svg className="w-16 h-16 text-syro-red/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="font-syro-primary text-xs text-syro-red/60 font-medium uppercase tracking-wider">
              {name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PilgrimCentresPage() {
  return (
    <div className="bg-syro-bg-gray min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-syro-red rounded-full flex items-center justify-center shadow-syro-card-hover">
                <svg className="w-12 h-12 text-syro-red-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="font-syro-display font-semibold text-4xl lg:text-5xl text-syro-blue mb-6">
              Pilgrim Centres
            </h1>

            {/* Description */}
            <p className="font-syro-primary text-lg lg:text-xl text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
              Explore the sacred pilgrim centres and historic churches of the Malankara Orthodox Syrian Church. 
              These holy places have been sanctified by centuries of prayer, devotion, and the witness of saints and martyrs.
            </p>
          </div>
        </div>
      </section>

      {/* Pilgrim Centres Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Sacred Sites of Faith
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto">
              Visit these hallowed places where the faithful have gathered for generations to worship, 
              pray, and experience the grace of God.
            </p>
          </div>

          {/* Grid of Pilgrim Centres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pilgrimCentresData.map((centre) => (
              <div
                key={centre.id}
                className="bg-white rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 group overflow-hidden"
              >
                {/* Image Container - Following image containment pattern */}
                <PilgrimCentreImage 
                  image={centre.image} 
                  name={centre.name} 
                  location={centre.location}
                />

                {/* Content */}
                <div className="p-6">
                  {/* Location */}
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-syro-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-syro-primary text-xs text-syro-red font-medium uppercase tracking-wider">
                      {centre.location}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 group-hover:text-syro-red transition-all duration-300">
                    {centre.name}
                  </h3>

                  {/* Description */}
                  <p className="font-syro-primary text-sm text-syro-dark-gray leading-relaxed line-clamp-3 mb-4">
                    {centre.description}
                  </p>

                  {/* Read More Link */}
                  <Link
                    href={`/mosc/pilgrim-centres/${getSlug(centre.name)}`}
                    className="syro-primary-button inline-flex items-center gap-2 font-syro-primary mt-auto w-fit"
                  >
                    <span>Read More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-syro-card p-8 lg:p-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-syro-card">
                <svg className="w-10 h-10 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            <h2 className="font-syro-display font-semibold text-2xl lg:text-3xl text-syro-blue mb-4">
              Plan Your Pilgrimage
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray mb-8 leading-relaxed">
              These sacred sites welcome pilgrims throughout the year. Whether you seek spiritual renewal, 
              historical insights, or simply wish to experience the beauty of our Orthodox tradition, 
              we invite you to visit these holy places.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/mosc/contact-info"
                className="inline-flex items-center justify-center space-x-2 bg-syro-red text-syro-red-foreground rounded-md py-3 px-6 font-syro-primary font-medium hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Us</span>
              </a>

              <a
                href="/mosc-old"
                className="inline-flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground rounded-md py-3 px-6 font-syro-primary font-medium hover:bg-secondary/90 transition-all duration-300 shadow-syro-card"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

