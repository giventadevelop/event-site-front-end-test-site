import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';
import { formatPhoneNumbers } from '../lib/formatPhone';

export const metadata: Metadata = {
  title: 'Major Centres | Institutions | MOSC',
  description: 'Major spiritual and administrative centres of the Malankara Orthodox Syrian Church, including Devalokam Catholicate Palace and Parumala Seminary.',
};

export default function MajorCentresPage() {
  const centres = [
    {
      name: 'DEVALOKAM CATHOLICATE PALACE',
      description: 'Devalokam Aramana is the official residence of the Catholicos of the East and Malankara Metropolitan. The administrative headquarters of the Church also functions within the same premises. The holy relics of the Apostle St. Thomas is kept in the Devalokam Aramana chapel. The mortal remains of holy fathers – H.H. Baselius Geevarghese II, H.H. Baselius Augen I, H.H. Baselius Mar Thoma Mathews I, H.H. Baselios Marthoma Paulose II and Metropolitan Thomas Mar Macarios are entombed here.',
      contact: {
        phone: '0481 2578500, 2578499 (Fax) 2570569, 2573850',
        address: [
          'Malankara Orthodox Church',
          'Catholicate Palace, Devalokam',
          'Kottayam – 686 038',
          'Tel no: 0481 2570569, 2578500, 2574323',
        ],
        emails: ['catholicos@mosc.in (Office of H.H. The Catholicos)', 'pro@mosc.in (Public Relations Officer)'],
      },
    },
    {
      name: 'PARUMALA SEMINARY',
      description: 'Parumala Seminary is the major pilgrim centre of the Church, blessed by the shrine and mortal remains of St. Gregorios. The mortal remains of Metropolitan Yuyakim Mar Ivanios are also entombed here.',
      contact: {
        phone: '(O) 0479 2312202, (Dyanakendram) 2312226, (Manager) 2312328',
        website: 'www.parumalachurch.com',
        emails: ['manager@parumalachurch.com'],
      },
    },
    {
      name: 'VAKATHANAM VALLIKKATTU DAYARA',
      description: 'The mortal remains of Catholicos Baselius Geevarghese I and Metropolitan Augen Mar Dionysius are entombed in the chapel.',
      contact: {
        phone: '0481 2462550',
        website: 'www.augenthirumeni.com',
      },
    },
    {
      name: 'THIRUVITHAMCODE ST. MARY\'S CHURCH',
      description: 'Founded in A.D. 63 by the Apostle St. Thomas, keeping the ancient structure and architectural beauty, this Church is now an international pilgrim centre.',
      contact: {
        phone: '04651 250219, 241111, 09847876797, 09443500911',
        emails: ['barsleebiramban@yahoo.com', 'stthomasphigiramcentre@yahoo.com'],
        website: 'www.arappally.com, www.stthomasinternationalpilgriamcentre.com',
      },
    },
    {
      name: 'PAMPADY MAR KURIAKOSE DAYARA',
      description: 'The Dayara was started by Metropolitan Kuriakose Mar Gregorios (Pampady Thirumeni), whose mortal remains are interred in the chapel. The mortal remains of the Metropolitan Mathews Mar Ivanios are also entombed here. The Dayara is a holy place for pilgrims and a centre of so many educational, social service institutions.',
      contact: {
        phone: '0481 2505431',
      },
    },
    {
      name: 'VETTICKAL ST. THOMAS DAYARA',
      description: 'As the earliest place of monastic life in the Church, Vettickel Dayara had influenced many Church dignitaries. As a young monk and later as a metropolitan St. Gregorios stayed and spent long time here in fasting and praying.',
      contact: {
        phone: '0484 2740220, 2742250',
      },
    },
    {
      name: 'MATTANCHERY PILGRIM CENTRE',
      description: 'A portion of the holy relics of St. George is kept in this church. The historic monument of Coonen Cross Oath (A.D. 1653) is now a declared pilgrim centre.',
      contact: {
        phone: '0484 2116421',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Major Centres" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image src="/images/institutions/ca.jpg" alt="Major Centres" width={175} height={175} className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }} priority />
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-8">
                  The spiritual and administrative centres of the Malankara Orthodox Syrian Church, serving as places of pilgrimage, worship, and church governance.
                </p>
              </div>

              <div className="space-y-12 mt-8">
            {centres.map((centre, index) => (
              <div key={index} className="bg-white rounded-lg shadow-syro-card p-8">
                <h2 className="font-syro-display font-semibold text-2xl lg:text-3xl text-syro-red mb-4">
                  {centre.name}
                </h2>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
                  {centre.description}
                </p>
                {centre.contact && (
                  <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red">
                    <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                      {centre.contact.address && (
                        <div className="mb-4">
                          {centre.contact.address.map((line, i) => (
                            <p key={i} className="font-medium">{line}</p>
                          ))}
                        </div>
                      )}
                      {centre.contact.phone && (
                        <p>
                          <span className="font-medium text-syro-blue">Phone:</span>
                          <span className="block mt-1">
                            {formatPhoneNumbers(centre.contact.phone).map((num, i) => (
                              <span key={i} className="block">{num}</span>
                            ))}
                          </span>
                        </p>
                      )}
                      {centre.contact.emails && centre.contact.emails.map((email, i) => (
                        <p key={i}>
                          <span className="font-medium text-syro-blue">Email:</span>{' '}
                          <a href={`mailto:${email.split(' ')[0]}`} className="text-syro-red hover:underline">
                            {email}
                          </a>
                        </p>
                      ))}
                      {centre.contact.website && (
                        <p>
                          <span className="font-medium text-syro-blue">Website:</span>{' '}
                          {centre.contact.website.split(', ').map((site, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && ', '}
                              <a 
                                href={`http://${site}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-syro-red hover:underline"
                              >
                                {site}
                              </a>
                            </React.Fragment>
                          ))}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <InstitutionsSidebar currentSlug="major-centres" />
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


