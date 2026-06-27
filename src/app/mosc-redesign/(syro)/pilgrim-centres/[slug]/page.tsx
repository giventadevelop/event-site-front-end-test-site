'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { pilgrimCentresData } from '../pilgrimCentresData';

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

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
      {image && !imageError ? (
        <div className="relative w-full h-full">
          <Image
            src={image}
            alt={`${name} - ${location}`}
            width={1200}
            height={800}
            className="w-full h-full object-contain"
            style={{
              backgroundColor: 'transparent',
              borderRadius: '0.5rem'
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
        <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
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

export default function PilgrimCentreDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';
  
  const centre = pilgrimCentresData.find(c => c.slug === slug);

  if (!centre) {
    return (
      <div className="bg-syro-bg-gray min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">Pilgrim Centre Not Found</h1>
          <Link 
            href="/mosc-redesign/pilgrim-centres"
            className="inline-flex items-center space-x-2 text-syro-red hover:text-accent transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Pilgrim Centres</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-syro-bg-gray min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link 
            href="/mosc-redesign/pilgrim-centres"
            className="inline-flex items-center space-x-2 text-syro-red hover:text-accent transition-all duration-300 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-syro-primary font-medium">Back to Pilgrim Centres</span>
          </Link>

          {/* Heading */}
          <h1 className="font-syro-display font-semibold text-3xl lg:text-4xl text-syro-blue mb-4">
            {centre.name}
          </h1>

          {/* Location */}
          <div className="flex items-center space-x-2 mb-6">
            <svg className="w-5 h-5 text-syro-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-syro-primary text-lg text-syro-dark-gray">
              {centre.location}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Image */}
          <div className="mb-8">
            <PilgrimCentreImage 
              image={centre.image} 
              name={centre.name} 
              location={centre.location}
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="font-syro-primary text-base lg:text-lg text-syro-blue leading-relaxed">
              {centre.fullContent.split('\n\n').map((paragraph, index) => {
                // Check if paragraph is a heading (starts with **)
                if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                  const headingText = paragraph.trim().replace(/\*\*/g, '');
                  return (
                    <h3 key={index} className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-4 first:mt-0">
                      {headingText}
                    </h3>
                  );
                }
                return (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 pt-8 border-t border-syro-table-border">
            <div className="bg-syro-bg-gray rounded-lg p-6 text-center">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                Plan Your Visit
              </h3>
              <p className="font-syro-primary text-syro-dark-gray mb-6">
                This sacred site welcomes pilgrims throughout the year. Experience the beauty of our Orthodox tradition and the rich heritage of this holy place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/mosc-redesign/contact-info"
                  className="inline-flex items-center justify-center space-x-2 bg-syro-red text-syro-red-foreground rounded-md py-3 px-6 font-syro-primary font-medium hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Us</span>
                </Link>
                <Link
                  href="/mosc-redesign/pilgrim-centres"
                  className="inline-flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground rounded-md py-3 px-6 font-syro-primary font-medium hover:bg-secondary/90 transition-all duration-300 shadow-syro-card"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>View All Centres</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
