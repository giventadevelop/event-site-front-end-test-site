import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';

export const metadata: Metadata = {
  title: 'Training | Malankara Orthodox Syrian Church',
  description: 'Training programs of the Malankara Orthodox Syrian Church including Sruti School of Liturgical Music, Divyabodhanam theological education, and St. Basil Bible School.',
  keywords: ['MOSC Training', 'Liturgical Music', 'Theological Education', 'Bible School', 'Divyabodhanam', 'Sruti'],
};

export default function TrainingPage() {
  const programs = [
    {
      id: 'sruti',
      title: 'Sruti School of Liturgical Music',
      description: 'The Sruti School of Liturgical Music is the realization of a long-cherished desire of the Orthodox Theological Seminary to effect a systematised and organised form to the music and hymnody...',
      image: '/images/training/sruti.jpg',
      link: '/mosc-redesign/training/sruti-school-of-liturgical-music',
    },
    {
      id: 'divyabodhanam',
      title: 'Divyabodhanam (Theological Education Programme for the Laity)',
      description: 'A novel step in the field of theological studies of Malankara Orthodox Syrian Church was officially inaugurated in 1984 July 28 as a laymen training course of the church. The...',
      image: '/images/training/dvm.jpg',
      link: '/mosc-redesign/training/divyabodhanam',
    },
    {
      id: 'st-basil',
      title: 'St. Basil Bible School',
      description: 'St. Basil Bible School and Orientation Center - The origin of the St. Basil Bible School is attributed to the vision and efforts of H. H. Baselios Marthoma Mathews II. It began with...',
      image: '/images/training/bs.jpg',
      link: '/mosc-redesign/training/st-basil-bible-school',
    },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Training"
        breadcrumbFrom="home"
        description="Equipping the faithful with theological knowledge, liturgical understanding, and biblical wisdom through comprehensive training programs."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (matches administration .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Training Programs
          </h3>

          {/* Cards grid (matches administration .admin-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
              >
                <MoscHubCardMedia src={program.image} alt={program.title} />
                <div className="p-8 pt-0 flex flex-col flex-1">
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                    {program.title}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
                    {program.description}
                  </p>
                  <Link
                    href={program.link}
                    className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                  >
                    <span>Learn More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Empowering the Faithful - kept as requested */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
              Empowering the Faithful
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
              Our training programs are designed to deepen understanding of Orthodox theology, enhance liturgical participation, and strengthen biblical knowledge among clergy and laity alike.
            </p>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              Through systematic education and practical training, we equip members of our church to serve more effectively and to share their faith with confidence and wisdom.
            </p>
          </div>

          {/* Why Participate in Training - kept as requested */}
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Why Participate in Training
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                Deepen Faith
              </h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Gain deeper understanding of Orthodox theology and tradition
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                Serve Better
              </h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Develop skills to serve the church and community more effectively
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                Grow Spiritually
              </h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Enhance personal spiritual growth through structured learning
              </p>
            </div>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}




