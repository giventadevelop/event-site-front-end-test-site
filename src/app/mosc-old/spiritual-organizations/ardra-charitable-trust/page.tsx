import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Ardra Charitable Society | MOSC',
  description: 'Ardra aims to work for the educational, social, cultural, spiritual and economic advancement of the marginalised people of India. President H.G. Dr. Abraham Mar Seraphim Metropolitan.',
};

const ArdraCharitableTrustPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Ardra Charitable Society">🤝</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Ardra Charitable Society
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ardra aims to work for the educational, social, cultural, spiritual and economic advancement of the marginalised people of India, irrespective of caste, creed or community.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <p>
                    Etymologically derived from the Sanskrit word Ardra – Ardram in Malayalam – the name means compassion, fellow-feeling or sorrow for the sufferings of another. Ardra strives to help the poor and needy by providing primary necessities, education, medical care, job-training, marriage assistance, employment etc. This charitable society derives its inspiration from our Lord whose compassion towards suffering humanity was boundless. The one who loved us with an everlasting love has often called upon us to translate our love and pity into deeds, into meaningful gestures.
                  </p>
                  <p>
                    Formed in August 2001, Ardra is under the direct patronage of H.H. Baselios Marthoma Paulose II, Catholicos of the East and Malankara Metropolitan. Registered (No. K. 451) under the provision of Travancore-Cochin Literary, Scientific and Charitable Societies Registration Act 12 of 1955 with its head office at Kottayam, Ardra is a non-profit charitable organisation operating throughout India.
                  </p>
                  <p>
                    All contributions made to Ardra will be eligible for exemption under Section 80G of the Income Tax Act. Ardra is a registered entity with the Office of the Registrar of Companies, Ministry of Corporate Affairs under the Government of India, for undertaking CSR activities.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H.G. Dr. Abraham Mar Seraphim Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    General Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Joseph Alexander
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: +91 9446360949
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Contact Address
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Catholicate Office , Devalokam P O<br />
                    Kottayam -686004<br />
                    Kerala, India
                  </p>
                  <p className="font-body text-muted-foreground">
                    Tel: 0481-2574457, 2578500
                  </p>
                  <p className="font-body text-muted-foreground">
                    Website:{' '}
                    <a href="https://www.ardramosc.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.ardramosc.in
                    </a>
                  </p>
                  <p className="font-body text-muted-foreground">
                    Email:{' '}
                    <a href="mailto:ardra@mosc.in" className="text-primary hover:underline">
                      ardra@mosc.in
                    </a>
                  </p>
                  <p className="font-body text-muted-foreground">
                    <a href="https://www.facebook.com/ardramosc" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.facebook.com/ardramosc
                    </a>
                    <br />
                    <a href="https://www.instagram.com/ardramosc" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.instagram.com/ardramosc
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/ardra-charitable-trust" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default ArdraCharitableTrustPage;
