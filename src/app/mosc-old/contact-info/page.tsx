import React from 'react';

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

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted min-h-[400px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <svg 
                className="w-10 h-10 text-primary-foreground" 
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
            <h1 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-4">
              Contact Info
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get in touch with the Malankara Orthodox Syrian Church headquarters. We're here to serve you and answer your questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Address Card */}
            <div className="bg-background rounded-lg sacred-shadow p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-primary" 
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
                <h2 className="font-heading font-semibold text-2xl text-foreground">
                  Address
                </h2>
              </div>
              <div className="space-y-2">
                <p className="font-body font-semibold text-lg text-foreground">
                  {contactInfo.organization}
                </p>
                <div className="font-body text-muted-foreground leading-relaxed">
                  <p>{contactInfo.address.building}</p>
                  <p>{contactInfo.address.postOffice}</p>
                  <p>(Via.) {contactInfo.address.via}</p>
                  <p>{contactInfo.address.city} – {contactInfo.address.pin}</p>
                  <p>{contactInfo.address.state}, {contactInfo.address.country}</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-background rounded-lg sacred-shadow p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-primary" 
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
                <h2 className="font-heading font-semibold text-2xl text-foreground">
                  Phone
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <a 
                    href={`tel:+91${contactInfo.phone.primary.replace(/\s/g, '')}`}
                    className="font-body text-lg text-primary hover:text-accent reverent-transition block"
                  >
                    {contactInfo.phone.primary}
                  </a>
                </div>
                <div>
                  <a 
                    href={`tel:+91${contactInfo.phone.secondary.replace(/\s/g, '')}`}
                    className="font-body text-lg text-primary hover:text-accent reverent-transition block"
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
            <div className="bg-background rounded-lg sacred-shadow p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-primary" 
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
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  {contactInfo.email.catholicos.label}
                </h2>
              </div>
              <div>
                <a 
                  href={`mailto:${contactInfo.email.catholicos.address}`}
                  className="font-body text-lg text-primary hover:text-accent reverent-transition"
                >
                  {contactInfo.email.catholicos.address}
                </a>
              </div>
            </div>

            {/* PRO Email */}
            <div className="bg-background rounded-lg sacred-shadow p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-primary" 
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
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  {contactInfo.email.pro.label}
                </h2>
              </div>
              <div>
                <a 
                  href={`mailto:${contactInfo.email.pro.address}`}
                  className="font-body text-lg text-primary hover:text-accent reverent-transition"
                >
                  {contactInfo.email.pro.address}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactInfoPage;




