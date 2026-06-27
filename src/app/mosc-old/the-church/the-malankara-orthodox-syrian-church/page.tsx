import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'The Malankara Orthodox Syrian Church',
  description:
    'Catholicate of the East. The Malankara Orthodox Syrian Church was founded by St. Thomas the Apostle in A.D. 52. Our faith, liturgy, and ecumenical relations.',
};

const MalankaraOrthodoxSyrianChurchPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section - MOSC styling */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 sacred-shadow-lg border border-border/50">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-2">
              The Malankara Orthodox Syrian Church
            </h1>
            <p className="font-body text-lg text-primary font-medium mb-4">
              Catholicate of the East
            </p>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Founded by St. Thomas the Apostle in A.D. 52. We preserve the Orthodox faith and the
              Catholicate of the East, in communion with the Oriental Orthodox Churches.
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
                {/* Featured Image - centered, contained */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[250px] h-auto">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Malankara Orthodox Syrian Church"
                      width={250}
                      height={150}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Malankara Orthodox Syrian Church was founded by St. Thomas, one of the twelve
                    apostles of Jesus Christ, who came to India in A.D. 52. At least from the fourth
                    century, the Indian Church entered into a close relationship with the Persian or
                    East Syrian Church. From the Persians, the Indians inherited the East Syrian
                    language and liturgies, and gradually came to be known as Syrian Christians. In
                    the sixteenth century Roman Catholic missionaries came to Kerala. They tried to
                    unite the Syrian Christians to the Roman Catholic Church and this led to a split
                    in the community. Those who accepted Roman Catholicism are the present
                    Syro-Malabar Catholics. Later, Western Protestant missionaries came to Kerala
                    and worked among the Syrian Christians. This also created certain divisions in
                    the community. In the seventeenth century, the Church came into relationship with
                    the Antiochene Church, which again caused splits. As a result of this
                    relationship, the Church received West Syrian liturgies and practices. The
                    Church entered into a new phase of its history by the establishment of the
                    Catholicate in 1912.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Faith and Liturgy
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    At present, the Church is using the West Syrian liturgy. The faith of the Church
                    is that which was established by the three Ecumenical Councils of Nicea (A.D.
                    325), Constantinople (A.D. 381) and Ephesus (A.D. 431).
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Ecumenical Relations
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Church is in communion with the other Oriental Orthodox Churches namely,
                    Syriac, Alexandrian, Armenian, Eritrean and Ethiopian Orthodox Churches. The
                    Church is in good ecumenical relationship with the Eastern Orthodox, Roman
                    Catholic and Protestant Churches.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    The Church Today
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    This Church now consists of about 2.5 million members, who are spread all over
                    the world, though the majority reside in the state of Kerala in South West India.
                    The Supreme Head of the Church and the present Catholicos is H.H. Baselios
                    Marthoma Mathews III. H.H.&apos;s residence and the headquarters of the Church
                    is in Kottayam in the Kerala State of the South-West India. The Church as a
                    whole is divided into 30 ecclesial units called dioceses and each diocese is
                    served by a bishop, administratively and spiritually.
                  </p>
                </div>
              </div>

              {/* Quick Links - same as holy-synod / administration sub-pages (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="lg:col-span-1">
              <TheChurchSidebar />
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

export default MalankaraOrthodoxSyrianChurchPage;
