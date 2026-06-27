import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Orthodox Syrian Sunday School Association of the East (SUNDAY SCHOOL) | MOSC',
  description: 'Orthodox Syrian Sunday School Association of the East is a spiritual organization functioning in all the parishes of the Malankara Orthodox Church throughout the world. It takes care of the spiritual nurturing of the children, by bringing them up in the knowledge and fellowship of Jesus Christ and His Church.',
};

const OrthodoxSyrianSundaySchoolAssociationOfTheEastPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Orthodox Syrian Sunday School Association of the East (SUNDAY SCHOOL)">📚</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Orthodox Syrian Sunday School Association of the East (SUNDAY SCHOOL)
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Orthodox Syrian Sunday School Association of the East is a spiritual organization functioning in all the parishes of the Malankara Orthodox Church throughout the world. It takes care of the spiritual nurturing of the children, by bringing them up in the knowledge and fellowship of Jesus Christ and His Church.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-0 overflow-hidden">
                {/* Featured Image */}
                <div className="relative w-full h-48 bg-muted overflow-hidden flex items-center justify-center">
                  <Image
                    src="/images/spiritual/OSSSAE.png"
                    alt="Orthodox Syrian Sunday School Association of the East"
                    fill
                    className="object-contain object-center"
                    style={{ objectPosition: 'center center', backgroundColor: 'transparent' }}
                    sizes="(min-width: 1024px) 75vw, 100vw"
                  />
                </div>
                <div className="p-8">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    About O.S.S.A.E.
                  </h2>
                  <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                    <p>
                      Orthodox Syrian Sunday School Association of the East is a spiritual organization functioning in all the parishes of the Malankara Orthodox Church throughout the world. It takes care of the spiritual nurturing of the children, by bringing them up in the knowledge and fellowship of Jesus Christ and His Church. The classes are conducted for the children. It has a separate wing for the Outside Kerala Region (OKR).
                    </p>
                    <p>
                      The classes range from Pre-primary to the twelfth (Vedapraveen Diploma). We follow a curriculum, jointly prepared and published by the Oriental Orthodox Churches which is revised from time to time. The Vacation Bible School conducted (OVBS) is a very vibrant wing of the O.S.S.A.E. The movement publish textbooks, devotional materials, song books, songs and animations for the OVBS every year. The headquarters of O.S.S.A.E is located in the complex of the Devalokom Catholicate Aramana, Kottayam.
                    </p>
                  </div>

                  {/* Office Bearers */}
                  <div className="mt-10 space-y-6">
                    <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                      President
                    </h3>
                    <ul className="space-y-2 font-body text-muted-foreground">
                      <li>H.G. Dr. Joseph Mar Dionysius Metropolitan</li>
                      <li>H.G. Dr. Youhanon Mar Demetrios Metropolitan (President, Outside Kerala Region)</li>
                    </ul>

                    <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                      Director General
                    </h3>
                    <p className="font-body text-muted-foreground">
                      Rev. Fr. Dr. Varghese Varghese, Mob: +91 9947362708
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                      Office Administrator
                    </h3>
                    <p className="font-body text-muted-foreground">
                      Rev. Fr. Jobsam Mathew, Mob: +91 9846670920
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                      Outside Kerala Region
                    </h3>
                    <p className="font-body text-muted-foreground">
                      Director: Rev. Fr. Dr. Jossi Jacob, Mob: +91 9400352724
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                      Address
                    </h3>
                    <address className="font-body text-muted-foreground not-italic leading-relaxed">
                      O.S.S.A.E Central Office,<br />
                      Catholicate Aramana,<br />
                      Devalokam P.O, Kottayam,<br />
                      Kerala<br />
                      Phone: 0481 2572890
                    </address>

                    <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                      Websites
                    </h3>
                    <ul className="space-y-2 font-body text-muted-foreground">
                      <li>
                        <a href="http://www.ossae.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline reverent-transition">
                          www.ossae.org
                        </a>
                      </li>
                      <li>
                        <a href="https://ossaebodhanam.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline reverent-transition">
                          ossaebodhanam.org
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/orthodox-syrian-sunday-school-association-of-the-east" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default OrthodoxSyrianSundaySchoolAssociationOfTheEastPage;
