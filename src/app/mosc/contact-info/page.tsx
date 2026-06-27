import React from 'react';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Contact Info | MOSC',
  description: 'Contact information for the Malankara Orthodox Syrian Church headquarters at Catholicate Palace, Kottayam, Kerala, India.',
  keywords: ['Contact', 'MOSC', 'Malankara Orthodox Church', 'Catholicate Palace', 'Kottayam'],
};

const ContactInfoPage = () => {
  const contactInfo = {
    organization: 'Malankara Orthodox Church',
    address: {
      building: 'Catholicate Palace',
      postOffice: 'Devalokam P.O.',
      via: 'Muttambalam',
      city: 'Kottayam',
      pin: '686 004',
      state: 'Kerala',
      country: 'India'
    },
    phone: {
      primary: '0481 2578500',
      secondary: '2578499'
    },
    email: {
      catholicos: {
        label: 'Office of H. H. The Catholicos',
        address: 'catholicos@mosc.in'
      },
      pro: {
        label: 'Public Relations Officer',
        address: 'pro@mosc.in'
      }
    }
  };

  const BANNER_DESCRIPTION =
    'Contact information for the Malankara Orthodox Syrian Church headquarters at Catholicate Palace, Kottayam, Kerala, India.';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Contact Info"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Address Card */}
            <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-syro-red/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-syro-red" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </div>
                <h2 className="font-syro-display font-semibold text-2xl text-syro-blue">
                  Address
                </h2>
              </div>
              <div className="space-y-2">
                <p className="font-syro-primary font-semibold text-lg text-syro-blue">
                  {contactInfo.organization}
                </p>
                <div className="font-syro-primary text-syro-dark-gray leading-relaxed">
                  <p>{contactInfo.address.building}</p>
                  <p>{contactInfo.address.postOffice}</p>
                  <p>(Via.) {contactInfo.address.via}</p>
                  <p>{contactInfo.address.city} – {contactInfo.address.pin}</p>
                  <p>{contactInfo.address.state}, {contactInfo.address.country}</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-syro-red/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-syro-red" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                    />
                  </svg>
                </div>
                <h2 className="font-syro-display font-semibold text-2xl text-syro-blue">
                  Phone
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <a 
                    href={`tel:+91${contactInfo.phone.primary.replace(/\s/g, '')}`}
                    className="font-syro-primary text-lg text-syro-red hover:text-syro-blue transition-all duration-300 block"
                  >
                    {contactInfo.phone.primary}
                  </a>
                </div>
                <div>
                  <a 
                    href={`tel:+91${contactInfo.phone.secondary.replace(/\s/g, '')}`}
                    className="font-syro-primary text-lg text-syro-red hover:text-syro-blue transition-all duration-300 block"
                  >
                    {contactInfo.phone.secondary}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Email Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
            {/* Catholicos Email */}
            <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-syro-red/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-syro-red" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h2 className="font-syro-display font-semibold text-xl text-syro-blue">
                  {contactInfo.email.catholicos.label}
                </h2>
              </div>
              <div>
                <a 
                  href={`mailto:${contactInfo.email.catholicos.address}`}
                  className="font-syro-primary text-lg text-syro-red hover:text-syro-blue transition-all duration-300"
                >
                  {contactInfo.email.catholicos.address}
                </a>
              </div>
            </div>

            {/* PRO Email */}
            <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-syro-red/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-syro-red" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h2 className="font-syro-display font-semibold text-xl text-syro-blue">
                  {contactInfo.email.pro.label}
                </h2>
              </div>
              <div>
                <a 
                  href={`mailto:${contactInfo.email.pro.address}`}
                  className="font-syro-primary text-lg text-syro-red hover:text-syro-blue transition-all duration-300"
                >
                  {contactInfo.email.pro.address}
                </a>
              </div>
            </div>
          </div>
          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default ContactInfoPage;




