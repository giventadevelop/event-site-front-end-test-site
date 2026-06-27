import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Institutions | Malankara Orthodox Syrian Church',
  description: 'Educational, medical, and spiritual institutions of the Malankara Orthodox Syrian Church, serving communities across India and beyond.',
  keywords: ['MOSC Institutions', 'Orthodox Schools', 'Orthodox Hospitals', 'Orthodox Colleges', 'Monasteries', 'Convents'],
};

export default function InstitutionsPage() {
  const institutions = [
    {
      id: 'major-centres',
      title: 'Major Centres',
      description: 'DEVALOKAM CATHOLICATE PALACE - Devalokam Aramana is the official residence of the Catholicos of the East and Malankara Metropolitan. The administrative headquarters of the Church also functions within the same...',
      image: '/images/institutions/ca.jpg',
      link: '/mosc-old/institutions/major-centres',
    },
    {
      id: 'monasteries',
      title: 'Monasteries',
      description: "Mount Tabore Dayara, Pathanapuram - 689 695 Ph: 0475 2352231 2352475, Bethlehem Asram, Chengamanad, Kottarakara Ph: 0474 2402543, St. George Dayara, Othera, Tiruvalla Ph: 0469 2656808, St. Paul's Asram, Puthuppady,...",
      image: '/images/institutions/mon.jpg',
      link: '/mosc-old/institutions/monasteries',
    },
    {
      id: 'convents',
      title: 'Convents',
      description: 'Bethany Convent, Ranni - Perunad - 689 711 Ph: 04735 240224 (Boarding 240583), Mount Tabore Convent, Pathanapuram Ph: 0475 2353483, 255447, St. Mary Magdalene Convent, Adupputty, Kunnamkulam Ph: 04885 222960...',
      image: '/images/institutions/conv.jpg',
      link: '/mosc-old/institutions/convents',
    },
    {
      id: 'orphanages',
      title: 'Orphanages',
      description: 'Prathyasa, Prasanthi, Pretheesha, Meempara (Head Office) Ph: 0484 2760286, Baselios Marthoma Didymus I Balika Bhavan, Pothukal, Nilambur Ph: 04931 241282, Zachariah Mar Dionysius Memorial Bala Bhavan, Thengali. Ph: 0469 2615014...',
      image: '/images/institutions/orp.jpg',
      link: '/mosc-old/institutions/orphanages',
    },
    {
      id: 'hospitals',
      title: 'Hospitals',
      description: "St. Gregorios Mission Hospital, Parumala Ph: 0479 2312266 2312465 2312466, St. Mary's Hospital, Eraviperoor - 689 542 Ph: 0469 2664447, Malankara Medical Mission Hospital, Kolencherry - 682...",
      image: '/images/institutions/parumala.jpg',
      link: '/mosc-old/institutions/hospitals',
    },
    {
      id: 'medical-college',
      title: 'Medical College',
      description: 'Malankara Medical Mission Hospital, Kolencherry - 682 311 - Hospital 04843055 555, Enquiry IP 04843055 211, Enquiry OP 04843055 621, Administration 04843055 411, Medical College 04843055 527, Nursing College 04843055...',
      image: '/images/institutions/med.jpg',
      link: '/mosc-old/institutions/medical-college',
    },
    {
      id: 'engineering-colleges',
      title: 'Engineering Colleges',
      description: 'Mar Baselios Christian College of Engineering & Technology, Kuttikkanam, Peermade, Kerala - a self-financing institution for professional Education, affiliated...',
      image: '/images/institutions/mbc.jpg',
      link: '/mosc-old/institutions/engineering-colleges',
    },
    {
      id: 'moc-colleges',
      title: 'MOC Colleges',
      description: "Catholicate College, Pathanamthitta Ph: 0468 2222223 2325253, Baselius College, Kottayam - 686 001 Ph: 0481 2563918 2565958, St. Mary's College, S. Battery - 673 592 Ph: 04936 220246, St. Gregorios...",
      image: '/images/institutions/moc.jpg',
      link: '/mosc-old/institutions/moc-colleges',
    },
    {
      id: 'schools',
      title: 'Schools',
      description: 'Catholicate and M D Schools - Manager: H.G. Dr. Gabriel Mar Gregorios Metropolitan. HIGHER SECONDARY SCHOOLS: M.D. Seminary Higher Secondary School, Kottayam. Ph: 0481 - 2563949, M.G.M Higher Secondary School, Thiruvalla....',
      image: '/images/institutions/raj.jpg',
      link: '/mosc-old/institutions/schools',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Institutions
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              The Malankara Orthodox Syrian Church operates a wide network of educational, medical, and spiritual institutions serving communities across India and around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Institutions Grid Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {institutions.map((institution) => (
              <Link
                key={institution.id}
                href={institution.link}
                className="group bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition overflow-hidden"
              >
                <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-muted/20">
                  <Image
                    src={institution.image}
                    alt={institution.title}
                    fill
                    className="object-contain group-hover:scale-105 reverent-transition"
                    style={{ objectPosition: 'center center' }}
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {institution.title}
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {institution.description}
                  </p>
                  <span className="inline-flex items-center font-body text-primary font-medium group-hover:gap-2 reverent-transition">
                    Read more
                    <svg 
                      className="w-5 h-5 ml-1 group-hover:ml-2 reverent-transition" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
              Our Mission of Service
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
              Following the example of Christ who came to serve, the Malankara Orthodox Syrian Church has established numerous institutions dedicated to education, healthcare, and social welfare.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              From schools and colleges to hospitals and orphanages, from monasteries to medical missions, these institutions embody our commitment to serving humanity with love and compassion.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-3xl text-foreground mb-2">
                100+
              </h3>
              <p className="font-body text-muted-foreground">
                Educational Institutions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-3xl text-foreground mb-2">
                25+
              </h3>
              <p className="font-body text-muted-foreground">
                Healthcare Facilities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-3xl text-foreground mb-2">
                15+
              </h3>
              <p className="font-body text-muted-foreground">
                Monasteries & Convents
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-3xl text-foreground mb-2">
                10+
              </h3>
              <p className="font-body text-muted-foreground">
                Orphanages & Care Centers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


