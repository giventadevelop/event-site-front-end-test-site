import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hospitals | Institutions | MOSC',
  description: 'Healthcare facilities operated by the Malankara Orthodox Syrian Church, providing compassionate medical care to communities across India.',
};

export default function HospitalsPage() {
  const hospitals = [
    { name: 'St. Gregorios Mission Hospital', location: 'Parumala', phone: '0479 2312266, 2312465, 2312466', email: 'sgmhospital@sify.com, sgmhospital@gmail.com' },
    { name: 'St. Mary\'s Hospital', location: 'Eraviperoor – 689 542', phone: '0469 2664447' },
    { name: 'Malankara Medical Mission Hospital', location: 'Kolencherry – 682 311', phone: '0484 2760251 – 259' },
    { name: 'Paret Mar Ivanios Hospital', location: 'Puthuppally, Kottayam', phone: '0481 2352873, 2351036' },
    { name: 'MGDM Hospital', location: 'Devagiri, Kangazha – 686 555', phone: '0481 2496246, 2495054' },
    { name: 'M.D. Cheriapally Hospital', location: 'Kottayam', phone: '0481 2566588' },
    { name: 'Mar Theodosius Memorial Bethany Hospital', location: 'Ranni – Perunad 689 711', phone: '04735 240225, 240536' },
    { name: 'Mar Theodosius Medical Mission Hospital', location: 'Sasthamkotta, Poruvazhy P.O., Kollam – 690 520', phone: '0476 2830258, 2831758' },
    { name: 'St. George\'s Hospital', location: 'Puthuppady, Kozhikode – 673 586', phone: '0495 2235245' },
    { name: 'Joseph Mar Pachomios Medical Centre', location: 'Piravom', phone: '0485 2243443/2242727' },
    { name: 'Idukki Orthodox Medical Centre', location: 'Nettithozhu, Kumily', phone: '04868 285056' },
    { name: 'Malankara Medical Mission Hospital', location: 'Kunnamkulam – 680 503', phone: '04885 222944, 222764' },
    { name: 'Kurisupally General Eye Clinic', location: 'Puthenangady, Kottayam', phone: '0481 2580047' },
    { name: 'Bishop Walsh Medical Memorial Hospital', location: 'Thadagom, Coimbatore (T.N.)', phone: '0422 2658619, 9965233444' },
    { name: 'Madras Medical Mission', location: '4-A, JJ Nagar, Mogappair, Chennai – 600 050', phone: '044 26259801 – 10' },
    { name: 'BPM Mission Hospital', location: 'Uditnarayanpur P.O., Kalahandi – 766 001', phone: '06670 231099' },
    { name: 'M.G. Asram Medical Aid Clinic', location: 'Mulamthuruthy', phone: '0484 2792475' },
    { name: 'Malankara Medical Mission Eye Hospital', location: 'Kariampady', phone: '04936247274, 248034' },
    { name: 'Mount Tabore Medical Mission Hospital', location: 'Mathur, Pudukottai Dt. (T.N.)', phone: '04339 250589' },
    { name: 'St. Thomas Mission Hospital', location: 'Attappady, Agali P.O., Palakkad' },
    { name: 'BGM Trust Hospital', location: 'Kundara, Kollam Dt.' },
    { name: 'St. Mary\'s Hospital', location: 'Pothanikad, Muvattupuzha' },
    { name: 'St. Paul\'s Dispensary', location: 'Panimunda P.O., Orissa – 766 110' },
    { name: 'St. Mary\'s Medical Centre', location: 'Aya Nagar, New Delhi', phone: '011 65653587' },
    { name: 'St. Thomas Charitable Dispensary', location: 'Kolkata 700 013' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc-old/institutions" className="hover:text-primary reverent-transition">Institutions</Link>
            <span>/</span>
            <span className="text-foreground">Hospitals</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/institutions/parumala.jpg" alt="Hospitals" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">Hospitals</h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Healthcare facilities providing compassionate medical care, embodying Christ\'s healing ministry to serve all people regardless of background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hospitals List Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hospitals.map((hospital, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-3">{hospital.name}</h3>
                <div className="space-y-2 font-body text-muted-foreground">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{hospital.location}</span>
                  </p>
                  {hospital.phone && (
                    <p className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{hospital.phone}</span>
                    </p>
                  )}
                  {hospital.email && (
                    <p className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{hospital.email}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc-old/institutions" className="inline-flex items-center px-6 py-3 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Institutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


