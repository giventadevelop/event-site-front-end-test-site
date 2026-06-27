import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'Orphanages | Institutions | MOSC',
  description: "Orphanages and children's homes operated by the Malankara Orthodox Syrian Church, providing care and support for children in need.",
};

export default function OrphanagesPage() {
  // Content from https://mosc.in/institutions/orphanages/ (order and wording preserved)
  const orphanages = [
    { name: 'Prathyasa, Prasanthi, Pretheesha, Meempara (Head Office)', location: 'Meempara', phone: '0484 2760286' },
    { name: 'Baselios Marthoma Didymus I Balika Bhavan', location: 'Pothukal, Nilambur', phone: '04931 241282' },
    { name: 'Zachariah Mar Dionysius Memorial Bala Bhavan', location: 'Thengali.', phone: '0469 2615014' },
    { name: "St. Mary's Boys' Home", location: 'Thalacode, Mulanthuruthy', phone: '0484 2711290/2713209' },
    { name: "St. Paul's Bala Bhavan", location: 'Puthuppady, Kozhikode', phone: '0495 2235247' },
    { name: "Mar Baselius Children's Home", location: 'Mannapra, Palakkad', phone: '0492 2255556' },
    { name: 'Mar Baselius Children\'s Home', location: 'Vadavucode – 682 310', phone: '0484 2730464' },
    { name: "St. Thomas Children's Home", location: 'Bhilai, (C.G.)', phone: '0788 2285309' },
    { name: 'St. Thomas Mission Centre', location: 'Haripad – 690 514', phone: '0479 2139032' },
    { name: 'M.G.D. Asram & Balabhavan', location: 'Karunagiri, Karukachal', phone: '0481 2486384' },
    { name: 'St. Gregorios Balagram', location: 'Nirmalagiri, Yacharam, A.P.', phone: '08414 243234' },
    { name: 'M.G.M. Abhaya Bhavan', location: 'Pothenpuram, Pampady', phone: '0481 2507741 2505935' },
    { name: "Holy Trinity Disabled Children's Home", location: 'Alathara, Sreekariyam, Tiruvananthapuram', phone: '0471 2418767' },
    { name: 'Mar Greogorios Asram & Children\'s Home', location: 'Kandanad, Mulamthuruthy', phone: '0484 2792140, 2243361, 2792424' },
    { name: 'Mar Greogorios Rehabilitation Centre', location: 'Kodunganoor P.O., Tiruvananthapuram – 695 013', phone: '0471 2378436' },
    { name: 'M.G. Bethel Karuna Centre', location: 'Karassery, Thathankulam P.O. (T.N.)', phone: '' },
    { name: "St. Mary's Balikamandiram", location: 'Kizhakambalam, Alwaye', phone: '0484 2680283' },
    { name: "Basalel Girls' Home", location: 'Sooranad – 690 522', phone: '0476 2851427' },
    { name: 'St. George Balikagram', location: 'St. Thomas Nagar, Mamurdy, Dehu Road, Cantt. P.O., Pune – 412 101', phone: '020 27671066, 27673783' },
    { name: 'Joseph Mar Pachomios Memorial Pratheeksha Bhavan', location: 'Karimpana P.O., Koothattukulam', phone: '0485 2253504' },
    { name: 'Mar Baselius Santhi Bhavan', location: 'Thalavoor, Kottarakkara', phone: '' },
    { name: 'Bethanya Bhavan', location: 'Tiruvalla – 689 101', phone: '0469 2600158' },
    { name: 'NAMS Snehasadan', location: 'No. 28, Vodarahalli, Vidyaranyapura, Bangalore – 560 097', phone: '080 65375538, 23648100' },
    { name: 'Mar Baselius Gregorios Mercy Home', location: 'Mannadisala, Vechoochira, Ranni', phone: '' },
    { name: 'St. Thomas Balabhavan', location: 'Nellipathy, Agali P.O., Palakkad', phone: '' },
    { name: 'Karunya Visranthi Bhavan', location: 'Kattela, Sreekaryam, Tvm. – 695 017', phone: '0471 2596418' },
    { name: 'Sr. Macreena Santhi Bhavan', location: 'Baselios Convent, Kottarakkara', phone: '' },
    { name: 'Cheppad Mar Dionysius Foundation Oldage Home', location: 'Cheppad', phone: '0479 2474182' },
    { name: "St. Paul's Balagram", location: 'P.B. 45, Raisalpur, Itarsi – 461110', phone: '07572 273943' },
    { name: 'BMM II Sneha Bhavan', location: 'Kizhakketheruvu, Kottarakara', phone: '0474 2652060' },
    { name: 'Vattasseril Mar Dionysius Home', location: 'Madavoor, Muvattupuzha', phone: '' },
    { name: 'St. Gregorios Balika Bhavan', location: 'Panamthop, Kunnathoor, Kollam', phone: '' },
    { name: 'St. Gregorios Balabhavan', location: 'Thadagom, Coimbatore', phone: '' },
    { name: 'BMM II Balabhavan', location: 'Chengamanadu, Kottarakara', phone: '' },
    { name: 'Karunyanilayam', location: 'Belavadi P.O., Mysore – 570018', phone: '0821 2404559' },
    { name: 'Kottukulam Visranthi Bhavan', location: 'Kuzhimattom', phone: '' },
    { name: 'Mar Athanasius Memorial Prathyasa Bhavan', location: 'Kuzhimattom', phone: '' },
    { name: 'Pulikottil Mar Dionysius Bhavan', location: 'Kottappady', phone: '0487 2553377' },
    { name: 'Mar Baselius Augen I Memorial Prathyasa Bhavan', location: 'Piramadom, Pampakkuda.', phone: '0485 2273402' },
    { name: 'Mar Baselius Paulose I Memorial Prasanthi Bhavan, Kadayirippu Asha Bhavan', location: 'Kozhimala P.O., Thiruvalla.', phone: '0469 2656561' },
    { name: 'Bethel Convent & Sneha Bhavan', location: 'Ambalam P.O., Tirunelvely', phone: '' },
    { name: 'Prerana Nikethan', location: 'St. Thomas OTS, Nagpur', phone: '07118 272622' },
    { name: 'St. Gregorios Daya Bhavan', location: 'No. 69, Bhaktharahalli P.O., Tumkur – 572 120', phone: '08132 320909' },
    { name: 'St. Gregorios Special School', location: 'Mount Olive, Kottakkunnu, S. Battery – 673 592', phone: '04936 224808' },
    { name: 'St. Gregorios Mission Centre', location: 'Sreevaikuntam P.O., Thoothukkudy, (T.N.) – 628 601', phone: '04630 255563 99446 94026' },
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
            <span className="text-foreground">Orphanages</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-muted/20">
              <Image
                src="/images/institutions/orp.jpg"
                alt="Orphanages"
                width={800}
                height={600}
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">Orphanages</h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Centers of hope and care providing shelter, education, and love to children in need, embodying Christ\'s compassion for the vulnerable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Orphanages List Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orphanages.map((orphanage, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-3">{orphanage.name}</h3>
                <div className="space-y-2 font-body text-muted-foreground">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{orphanage.location}</span>
                  </p>
                  {orphanage.phone && (
                    <p className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Ph: {orphanage.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8 text-center">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">Our Ministry to Children</h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Following Christ\'s teaching to &quot;let the little children come to me,&quot; our orphanages provide a loving, nurturing environment where children can grow in faith, receive quality education, and develop their God-given potential.
            </p>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-background">
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


