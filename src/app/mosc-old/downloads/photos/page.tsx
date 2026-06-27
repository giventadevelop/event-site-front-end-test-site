'use client';

import React from 'react';
import Link from 'next/link';

export default function PhotosPage() {
  const photoCategories = [
    {
      id: 'saints',
      title: 'Saints',
      description: 'Official photographs and icons of saints venerated in the Malankara Orthodox Syrian Church for display in churches and homes.',
      icon: '✝️',
      link: '#', // Will list saint photos
    },
    {
      id: 'bishops',
      title: 'Bishops',
      description: 'Official photographs of current and former bishops, metropolitans, and hierarchs of the Church.',
      icon: '👤',
      link: '#', // Will list bishop photos
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc-old/downloads" className="hover:text-primary reverent-transition">Downloads</Link>
            <span>/</span>
            <span className="text-foreground">Photos</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Photos
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Official photographs of saints, bishops, and church leaders for reference, veneration, and display.
            </p>
          </div>
        </div>
      </section>

      {/* Photo Categories Grid */}
      <section className="py-16 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {photoCategories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className="group bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition p-8"
                onClick={(e) => {
                  if (category.link === '#') {
                    e.preventDefault();
                    alert(`${category.title} photos will be available for download soon.`);
                  }
                }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                    <span className="text-4xl">{category.icon}</span>
                  </div>
                  <h2 className="font-heading font-semibold text-2xl text-foreground group-hover:text-primary reverent-transition">
                    {category.title}
                  </h2>
                </div>
                <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                  {category.description}
                </p>
                <span className="inline-flex items-center font-body text-primary font-medium group-hover:gap-2 reverent-transition">
                  View Photos
                  <svg 
                    className="w-5 h-5 ml-1 group-hover:ml-2 reverent-transition" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              Guidelines for Using Church Photos
            </h2>
            <div className="space-y-4 font-body text-lg text-muted-foreground leading-relaxed">
              <p>
                These official photographs are provided for appropriate use in churches, homes, and educational materials. Please observe the following:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Photos of saints are for veneration and display in appropriate sacred spaces</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Bishop photographs should be treated with respect and dignity</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Do not alter or modify images without proper authorization</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>For commercial use, please contact the Catholicate office for permission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc-old/downloads" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Downloads
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

