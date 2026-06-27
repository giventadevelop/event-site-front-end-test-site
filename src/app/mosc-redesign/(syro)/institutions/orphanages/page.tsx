import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';
import { formatPhoneNumbers } from '../lib/formatPhone';

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
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Orphanages" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
                    <Image
                      src="/images/institutions/orp.jpg"
                      alt="Orphanages"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                      priority
                    />
                  </div>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  Centers of hope and care providing shelter, education, and love to children in need, embodying Christ&apos;s compassion for the vulnerable.
                </p>
              </div>

              <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orphanages.map((orphanage, index) => (
              <div key={index} className="bg-syro-bg-gray/20 rounded-lg p-6 shadow-syro-card-sm border-l-4 border-syro-red hover:shadow-syro-card transition-all duration-300">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">{orphanage.name}</h3>
                <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-syro-red mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{orphanage.location}</span>
                  </p>
                  {orphanage.phone && (() => {
                    const numbers = formatPhoneNumbers(orphanage.phone);
                    return (
                      <p className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-syro-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="min-w-0 flex flex-col">
                          {numbers.map((num, i) => (
                            <span key={i} className="block">
                              {i === 0 ? <>Ph: {num}</> : num}
                            </span>
                          ))}
                        </span>
                      </p>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
              </div>

              <div className="mt-8 bg-white rounded-lg shadow-syro-card p-8 text-center">
                <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">Our Ministry to Children</h2>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  Following Christ&apos;s teaching to &quot;let the little children come to me,&quot; our orphanages provide a loving, nurturing environment where children can grow in faith, receive quality education, and develop their God-given potential.
                </p>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <InstitutionsSidebar currentSlug="orphanages" />
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


