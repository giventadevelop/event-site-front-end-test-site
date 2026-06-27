import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'History',
  description:
    'The Orthodox Church of India. The Malankara Orthodox Church is the second largest faction of the ancient church of the St. Thomas Christians in India, tracing its origins to the apostolic mission of St. Thomas.',
};

const ChurchHistoryPage = () => {
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              History
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Orthodox Church of India. The Malankara Orthodox Church—hereafter referred to as
              the Orthodox Church of India or the Indian Orthodox Church—is the second largest
              faction of the ancient church of the St. Thomas Christians in India.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image - centered, contained */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="MOSC - Malankara Orthodox Syrian Church"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                    The Orthodox Church of India
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Malankara Orthodox Church—hereafter referred to as the Orthodox Church of
                    India or the Indian Orthodox Church—is the second largest faction of the ancient
                    church of the St. Thomas Christians in India, which stood till 1657 as a single
                    and united Church with an indigenous character of its own. This ancient church
                    of the St. Thomas Christians is an Apostolic Church like all other Apostolic
                    Churches around the world and originated from the evangelical labours of St.
                    Thomas—the Apostle not only of Malabar and South India but also of India and all
                    of Asia. In that sense this church is one of the oldest churches in the
                    Christian world and also in India, because Roman Catholic Christians came to
                    India only in the 16th century and Protestant Christians in the 18th
                    century—all following Western colonialism. The Malankara Church is an
                    indigenous Church with a distinctive heritage and characteristics of its own,
                    deeply rooted in Indian soil. Moreover it is a church which stood for centuries
                    in close contact with the East Syrian Church which once flourished in the present
                    regions of Iraq and Iran.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Portuguese Contact and Roman Catholic Influence
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the 16th century it came in contact with the Roman Catholic Church through
                    Portuguese colonialism, which after a century&apos;s contact and interactions
                    resulted in the enforced domination of Roman Catholicism over the church of the
                    St. Thomas Christians. The Synod of Udayamperoor—1599 played the decisive role in
                    this regard. Thus this synod laid the firm foundation for all the problems which
                    arose later on in this church. For about 54 years thereafter the St. Thomas
                    Christians remained under Rome&apos;s occupation and then onwards in a divided
                    state.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    The Great Revolt of 1653
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In 1653 through an Oath, the St. Thomas Christians&apos; Church as a whole
                    overthrew their enforced subjection to Roman Catholicism and resolved to restore
                    their freedom as a church of India and to revive their Oriental Church heritage
                    and indigenous characteristics. But due to various pressures their unity was
                    broken, mainly due to the overwhelming action of the Roman Catholics who had
                    immense support from the Colonial powers; a group of the Thomas Christians were
                    induced to the Roman Catholic side and later on became the champions in the
                    propagation of Roman Catholicism among the Thomas Christians. Moreover they—i.e.,
                    those who were taken over to the Roman Catholic side—did not allow their
                    opponents, who had discarded Rome, to travel on freely to their destination as a
                    free church. After many years of intense tribulation, struggles and loss of
                    faithful to the Roman Catholics, those who stood against Rome emerged as an
                    independent Church, entering into free and friendly adherence with the bishops
                    who came from the West Syrian Patriarchate in South-West Asia. This began from
                    1665, soon after the change in the political and colonial scenario of South
                    India, when the Portuguese were ousted with the advent of the Dutch in the
                    region.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    The Mar Thoma Period and the Malankara Orthodox Syrian Church
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    This Church of the St. Thomas Christians who had freed themselves from Roman
                    Catholicism were led till 1816 by Indian bishops of their own native origin and
                    they were known by a common name—Mar Thoma. It is this church, which continued
                    thereafter under bishops known as Mar Dionysius; now known by the name the
                    Indian Orthodox Church. During the 17th, 18th and 19th centuries they were also
                    known by some names, which in most cases were appellations imposed upon them by
                    their opponents from time to time. These are: New party (Puthencoor), Non-Romo
                    Syrians, Malabar Syrians, Jacobite Syrians, etc. After the formation of the
                    Church&apos;s constitution in 1934 the name of this church became the Malankara
                    Orthodox Syrian Church. They believe that they are the faithful original
                    descendants and real continuation of the Church of the St. Thomas Christians of
                    India. Hence they claim they are an ancient and apostolic Church like any other
                    apostolic Church elsewhere in the world. The Church in India is eastern in its
                    ethos and worship and is clearly distinguished from western (Roman and
                    Protestant) church traditions.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Self-Governance and Indigenous Character
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The church is fully self-governed by its local leadership and is indigenous. No
                    foreign leadership is allowed to rule over this church now. This element of
                    self-awareness always echoed whenever they were threatened during the periods
                    of contact with Roman Catholicism, Protestantism and the West Syrians.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Tolerance and Harmony
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Moreover, a unique and noble feature of this church, even now, is its broad
                    vision of humanity, non-Christian religions and other ideologies. From time
                    immemorial this Church was at peace, oneness and tranquility with the
                    surrounding Hindu, Muslim, communities without prejudice, rivalry and
                    fanaticism. It respected those religions and those religions too respected this
                    church. Hindu rulers and others in recognition of the abilities of the faithful
                    of this church and its tolerant attitude had been benevolent in granting
                    material benefits of an everlasting nature towards this church. This church never
                    engaged in proselytism of Hindu or Muslim brothers and that is its notable
                    nobility in India. Its members serve in all noble spheres of life and actions of
                    humanity all over the globe.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Present Status
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    This Church now consists of about 3.5 million members, who are spread all over
                    the world, though the majority reside in Kerala state. The Supreme Head of the
                    Church and the present Catholicos is H.H. Baselios Marthoma Mathews III. His
                    residence and the headquarters of the Church is in Kottayam in the Kerala State
                    of South-West India. The Church as a whole is divided into 30 ecclesial units as
                    dioceses and each diocese is served by a bishop, administratively and
                    spiritually.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 mt-8 border border-border/50">
                    <h4 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Key Historical Milestones
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card rounded-lg p-4 sacred-shadow-sm border border-border/30">
                        <h5 className="font-heading font-medium text-foreground mb-2">52 AD</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          St. Thomas the Apostle arrives in India and establishes Christianity
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4 sacred-shadow-sm border border-border/30">
                        <h5 className="font-heading font-medium text-foreground mb-2">1599</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          Synod of Udayamperoor—Portuguese influence and enforced domination
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4 sacred-shadow-sm border border-border/30">
                        <h5 className="font-heading font-medium text-foreground mb-2">1653</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          The Great Revolt—Freedom from Roman Catholicism through the Oath
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4 sacred-shadow-sm border border-border/30">
                        <h5 className="font-heading font-medium text-foreground mb-2">1665</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          West Syrian connection established; Dutch replace Portuguese
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4 sacred-shadow-sm border border-border/30">
                        <h5 className="font-heading font-medium text-foreground mb-2">1934</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          Church constitution formed—Malankara Orthodox Syrian Church
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4 sacred-shadow-sm border border-border/30">
                        <h5 className="font-heading font-medium text-foreground mb-2">Present</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          About 3.5 million members worldwide; 30 dioceses; Catholicos at Kottayam
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
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

export default ChurchHistoryPage;
