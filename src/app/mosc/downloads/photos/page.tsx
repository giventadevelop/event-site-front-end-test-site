'use client';

import React from 'react';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';

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
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Photos" breadcrumbFrom="downloads" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-syro-red rounded-full flex items-center justify-center shadow-syro-card">
                <svg className="w-6 h-6 text-syro-red-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="font-syro-primary text-lg lg:text-xl text-syro-dark-gray max-w-3xl mx-auto">
              Official photographs of saints, bishops, and church leaders for reference, veneration, and display.
            </p>
          </div>
        </div>
      </section>

      {/* Photo Categories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {photoCategories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className="group bg-white rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 p-8"
                onClick={(e) => {
                  if (category.link === '#') {
                    e.preventDefault();
                    alert(`${category.title} photos will be available for download soon.`);
                  }
                }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center group-hover:bg-syro-red/20 transition-all duration-300">
                    <span className="text-4xl">{category.icon}</span>
                  </div>
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue group-hover:text-syro-red transition-all duration-300">
                    {category.title}
                  </h2>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-4">
                  {category.description}
                </p>
                <span className="inline-flex items-center font-syro-primary text-syro-red font-medium group-hover:gap-2 transition-all duration-300">
                  View Photos
                  <svg 
                    className="w-5 h-5 ml-1 group-hover:ml-2 transition-all duration-300" 
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
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-syro-card p-8">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
              Guidelines for Using Church Photos
            </h2>
            <div className="space-y-4 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              <p>
                These official photographs are provided for appropriate use in churches, homes, and educational materials. Please observe the following:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Photos of saints are for veneration and display in appropriate sacred spaces</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Bishop photographs should be treated with respect and dignity</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Do not alter or modify images without proper authorization</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>For commercial use, please contact the Catholicate office for permission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc/downloads" className="inline-flex items-center px-6 py-3 bg-syro-red text-syro-red-foreground font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card">
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

