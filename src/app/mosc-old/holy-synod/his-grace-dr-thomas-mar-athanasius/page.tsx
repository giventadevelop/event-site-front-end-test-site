import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H. G. Dr. Thomas Mar Athanasius Metropolitan',
  description: 'Biography and information about H. G. Dr. Thomas Mar Athanasius Metropolitan.',
};

const HisGraceDrThomasMarAthanasiusPage = () => {
  return (
    <div className="bg-background">
      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden sacred-shadow-lg">
                      <Image
                        src="/images/holy-synod/ath.jpg"
                        alt="H. G. Dr. Thomas Mar Athanasius Metropolitan"
                        fill
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                        className="object-cover object-top"
                        style={{
                          objectPosition: 'center 15%'
                        }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      H. G. Dr. Thomas Mar Athanasius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 28 June 1952 at Arikuzha, Thodupuzha, to Rev. Fr Yohannan Puttanil and Mrs Mariam. He did his schooling at Government UPS School Arikuzha and NSS High School, Manakad. Thereupon he joined New Man College, Thodupuzha and passed out his Pre-degree and Degree from there. He did his MA from St John’s College, Agra.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        In the theological front, he took his BD degree from Serampore College and United Theological College, Bangalore. And went for his DTh from Protestant Faculty, University of Munich.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        He was ordained a priest in 1990 and the very same year was consecrated as Bishop and was given the charge of Kandanad Diocese. He was a teacher at Syrian Orthodox Theological Seminary at Vettickal during 1990-95. From 1992, His Grace was the President of Kerala Council of Churches till 1998.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Dr Athanasius is a known social worker and a philanthropist. He runs Swasraya Rehabilitation & Training Centre at Vettickal, Mulanthuruthy; Trinity Retirement Home, Kolenchery; Samanvaya Study and Dialogue Centre, Pampakuda; Sukhada Retreat Centre, Kolenchery; Santhula Hospital and Deaddiction Centre, Vadakara; and Giliyad, Retreat Centre & Orphanage, Vadkara.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace is an author of few well-known books. A Comparative Study of Theological Methodologies of Irenaeus and Sri Sankara (1990); Church and Society (1992); Neethi Samooham; and Anthyokya Malankara Bandham: Oru Punarchintanam are the main titles.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Bishop’s House, Cathedral Road, Moovattupuzha,Kerala – 686 661 ph : 0485 2833401 Cell: 9447083340
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: thomasmarathanasius@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SynodMembersSidebar />
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HisGraceDrThomasMarAthanasiusPage;
