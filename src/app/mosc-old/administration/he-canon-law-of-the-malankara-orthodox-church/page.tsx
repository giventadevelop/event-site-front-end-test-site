import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Canon Law of the Malankara Orthodox Church',
  description: 'The ecclesiastical laws and regulations that guide our church governance.',
};
// test
const CanonLawPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Canon Law">⚖️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Canon Law of the Malankara Orthodox Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The ecclesiastical laws and regulations that guide our church governance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image - half size, centered */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/canon-law.jpg"
                    alt="The Canon Law of the Malankara Orthodox Church"
                    width={1200}
                    height={720}
                    className="rounded-lg sacred-shadow w-1/2 h-auto"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                    quality={90}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Canon Law accepted and followed by the Orthodox church of Malankara was collected and codified by 
                    Mar Gregorios Bar Hebraeus, Catholicos of Edessa (AD. 1226-1286) in the thirteenth century. He was a 
                    versatile genius who wrote about thirty books on a variety of subjects. He was a great scholar in church 
                    History and Canon Law of the Church. Having carefully and judiciously scrutinized the verdicts of the 
                    Church Fathers and the decrees of the provincial and ecumenical councils he collected them, edited and 
                    classified under different heads. The original work in Syriac contains forty chapters and is called by 
                    the name 'hoodoyo canon'. The word 'hoodoyo' means "explanations".
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The original syriac manuscript was edited and printed in Paris in 1898 by Paul Bedjan. The Pampakuda 
                    Konat Library possesses a copy of this ancient canon which in every detail agrees with the Paris publication.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Patriarch party in Malankara maintains a varied version of this Canon which was prepared here to give 
                    more power and claims to the Patriarch of Antioch. The original Syriac canon contains forty chapters of which 
                    the first ten chapters have been translated into Malayalam by the late lamented Malpan Fr. Abraham Konat. 
                    In his editorial note it is mentioned that the remaining thirty chapters contain subjects that are irrelevant 
                    for the Malankara Church, but connected with the Middle East society of that period. The author of the 
                    'Hoodoyo canon' has simply presented the verdict of different church fathers and early councils, but he 
                    does not make any positive and conclusive pronouncements.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Certainly the Canon needs revision and updating to meet the challenges and needs of the Malankara Church 
                    in the modern times. The Church leaders who framed the constitution of the Malankara Orthodox Church have 
                    used this Canon as a basis.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed">
                    The ten chapters contain matters related to church politics, sacraments, feasts and fasts, burial rites etc.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Administration Structure
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc-old/administration/administration" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Constitution of the Malankara Orthodox Church
                  </Link>
                  <Link 
                    href="/mosc-old/administration/he-canon-law-of-the-malankara-orthodox-church" 
                    className="block px-3 py-2 bg-primary text-white rounded-md font-body text-sm reverent-transition"
                  >
                    The Canon Law of the Malankara Orthodox Church
                  </Link>
                  <Link 
                    href="/mosc-old/administration/the-holy-episcopal-synod" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Holy Episcopal Synod
                  </Link>
                  <Link 
                    href="/mosc-old/administration/malankara-association" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Malankara Association
                  </Link>
                  <Link 
                    href="/mosc-old/administration/the-managing-committee" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Managing Committee
                  </Link>
                  <Link 
                    href="/mosc-old/administration/the-working-committee" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Working Committee
                  </Link>
                  <Link 
                    href="/mosc-old/administration/the-diocesan-general-body" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Diocesan General Body
                  </Link>
                  <Link 
                    href="/mosc-old/administration/the-parish-managing-committee" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Parish Managing Committee
                  </Link>
                  <Link 
                    href="/mosc-old/administration/the-parish-general-body" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Parish General Body
                  </Link>
                </nav>
              </div>

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

export default CanonLawPage;
