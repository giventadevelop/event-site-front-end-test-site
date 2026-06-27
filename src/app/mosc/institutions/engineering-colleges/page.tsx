import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';
import { formatPhoneNumbers } from '../lib/formatPhone';

export const metadata: Metadata = {
  title: 'Engineering Colleges | Institutions | MOSC',
  description: 'Engineering colleges operated by the Malankara Orthodox Syrian Church, providing quality technical education.',
};

export default function EngineeringCollegesPage() {
  const colleges = [
    {
      name: 'Mar Baselios Christian College of Engineering & Technology',
      location: 'Kuttikkanam, Peermade, Kerala',
      description: "Mar Baselios Christian College of Engineering & Technology, Kuttikkanam, Peermade, Kerala is a self-financing institution for professional Education, affiliated to Mahatma Gandhi University, Kottayam, Kerala and approved by All India Council for Technical Education (AICTE), New Delhi. The College is owned and managed by the Malankara Orthodox Syrian Church, which plays a paternal role in the institution's establishment and operations.",
      mission: "The Mission of the management is to establish and manage a professional institution which promotes academic excellence among students for meeting the ever-growing demand of today's corporate world. The naturally air-conditioned ambience of MBC is the best bet in Kerala to translate one's transient ideas into real workouts and dreams into real achievements.",
      contact: {
        title: 'The Director',
        address: ['MBC College of Engineering & Technology', 'Catholicate Palace', 'Devalokam', 'Kottayam – 686 038'],
        phone: '0481 – 2574522, 2578500 (Extn. 46)',
        fax: '0481 – 2574522',
        emails: ['aramana@mbcpeermade.com', 'mbc@mbcpeermade.com'],
        website: 'www.mbcpeermade.com',
      },
    },
    {
      name: 'Baselios Mathews II College of Engineering',
      location: 'Lake View, Muthupilakadu, Sasthamcotta, Kollam',
      description: 'Baselios Mathews II College of Engineering was a long cherished dream of H. H. Baselios Mathews II. It began in 2002 with the intention of providing quality technical education to youth, especially of our church.',
      programs: [
        'Computer Science & Engineering',
        'Electronics & Communication Engineering',
        'Electrical & Electronics Engineering',
        'Electronics & Instrumentation Engineering',
      ],
      facilities: 'The college provides separate hostel facilities for boys & girls in the Trust premises.',
      spiritualNote: 'The premise is blessed by scenic beauty and the beautiful Mar Elia Chapel, where the remains of H. H. Baselios Marthoma Mathews II is entombed. The Ashramam members gather here for daily offices and Holy Qurbana. The intercession of Thirumeni along with the other saints is a stronghold for the monastic community and all those related to its activities.',
      contact: {
        address: ['Baselios Mathews II College of Engineering', 'Lake View, Muthupilakadu', 'Sasthamcotta', 'Kollam'],
        phone: '0476 2835579',
        emails: ['info@bmce.ac.in'],
        website: 'www.bmce.ac.in',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Engineering Colleges" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-syro-card-hover">
                    <Image src="/images/institutions/mbc.jpg" alt="Engineering Colleges" fill className="object-cover" priority />
                  </div>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  Institutions providing quality technical education, preparing the next generation of engineers with strong ethical foundations.
                </p>
              </div>

              <div className="mt-8 space-y-12">
            {colleges.map((college, index) => (
              <div key={index} className="bg-white rounded-lg shadow-syro-card p-8">
                <h2 className="font-syro-display font-semibold text-2xl lg:text-3xl text-syro-red mb-2">
                  {college.name}
                </h2>
                <p className="font-syro-primary text-lg text-syro-dark-gray mb-6 italic">
                  {college.location}
                </p>
                <p className="font-syro-primary text-lg text-syro-blue leading-relaxed mb-6">
                  {college.description}
                </p>
                {college.mission && (
                  <div className="bg-syro-bg-gray rounded-lg p-6 mb-6">
                    <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Our Mission</h3>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed">{college.mission}</p>
                  </div>
                )}
                {college.programs && (
                  <div className="mb-6">
                    <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Programs Offered</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {college.programs.map((program, i) => (
                        <li key={i} className="flex items-start font-syro-primary text-syro-dark-gray">
                          <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{program}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {college.facilities && (
                  <div className="bg-syro-red/5 rounded-lg p-6 mb-6">
                    <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Facilities</h3>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed">{college.facilities}</p>
                  </div>
                )}
                {college.spiritualNote && (
                  <div className="bg-gradient-to-br from-muted to-background rounded-lg p-6 mb-6">
                    <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Spiritual Heritage</h3>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed">{college.spiritualNote}</p>
                  </div>
                )}
                <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red">
                  <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">Contact Information</h3>
                  <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                    {college.contact.title && <p className="font-medium text-syro-blue">{college.contact.title}</p>}
                    {college.contact.address?.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    {college.contact.phone && (
                      <p>
                        <span className="font-medium text-syro-blue">Phone:</span>
                        <span className="block mt-1">
                          {formatPhoneNumbers(college.contact.phone).map((num, i) => (
                            <span key={i} className="block">{num}</span>
                          ))}
                        </span>
                      </p>
                    )}
                    {college.contact.fax && <p><span className="font-medium text-syro-blue">Fax:</span> {college.contact.fax}</p>}
                    {college.contact.emails?.map((email, i) => (
                      <p key={i}>
                        <span className="font-medium text-syro-blue">Email:</span>{' '}
                        <a href={`mailto:${email}`} className="text-syro-red hover:underline">{email}</a>
                      </p>
                    ))}
                    {college.contact.website && (
                      <p>
                        <span className="font-medium text-syro-blue">Website:</span>{' '}
                        <a href={`http://${college.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">{college.contact.website}</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <InstitutionsSidebar currentSlug="engineering-colleges" />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}


