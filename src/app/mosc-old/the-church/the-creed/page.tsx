import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'The Creed',
  description:
    'The Ecumenical Council of Nicea and Nicene Creed. The Oriental Orthodox Churches recognize only three ecumenical councils; the Council of Nicea (A.D. 325) established the foundations of orthodox Christian belief.',
};

const TheCreedPage = () => {
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Creed
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Ecumenical Council of Nicea and Nicene Creed. The Oriental Orthodox Churches
              recognize only three ecumenical councils; the Council of Nicea (A.D. 325) established
              the foundations of orthodox Christian belief.
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
                      src="/images/church/creed.jpg"
                      alt="The Creed - Ecumenical Council of Nicea"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                    The Ecumenical Council of Nicea and Nicene Creed
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Oriental Orthodox Churches recognize only three ecumenical councils and the
                    council of Nicea is the first among them. The Nicene Council, also known as
                    First Ecumenical Council, was held in 325 and is one of the most important
                    councils in Christian history. It was originally called by Emperor Constantine
                    in order to address the challenges posed by Arianism. The council established
                    the foundations of orthodox Christian belief with the Nicene Creed.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Two reasons are usually cited to justify the council&apos;s ecumenical status.
                    Firstly, the Emperor ordered that all legitimate bishops from the whole Church
                    shall participate and secondly, a problem that affected the whole Church,
                    namely, the Arian controversy was discussed and decided upon in the council.
                    It was the Emperor Constantine himself, who opened the council on 20th May 325.
                    He affirmed that the decision of the council shall be binding to the whole
                    Church and he promised himself as the guarantor of unity between the state and
                    the Church so that the decision of the council shall be universally binding.
                    Also he declared that his successors would follow his policy.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    318 bishops participated in the council, who are called &apos;holy fathers of
                    Nicea&apos; or just &apos;holy 318&apos;. The number 318 has a biblical
                    significance as the bishops are seen like 318 servants of Abraham (Gen 14:14).
                    Main participants were Ossius of Cordoba, Alexander of Alexandria, his deacon
                    and secretary Athanasius, Eusthathius of Antioch, who was consecrated to the
                    see of Antioch shortly before the council, and Eusebius of Caesarea, who
                    accepted the homo-ousius teaching just before the council of Nicea. Arius and
                    Eusebius of Nicomedia and some other Arian supporters were also present in the
                    proceedings. The council concluded on 19th of June officially, although, some
                    records say that the council went on for some more time.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The council gave out four documents: 1. Confession of faith (Symbol), which
                    Arius and two of his supporters declined to undersign and were thereby
                    excommunicated and exiled to Illiricum. 2. The council decided upon the date
                    of Easter and controversies on this issue were settled. 3. 20 Canons to the
                    question of ecclesiastical discipline. 4. A synodal letter, which was sent to
                    all sister Churches to explain the proceedings of the council and thereby a
                    call to obey the decisions of the council.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Symbol of the Council of Nicea
                  </h2>
                  <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border/50">
                    <p className="font-body text-muted-foreground leading-relaxed italic">
                      &quot;We believe in one true God, the Father almighty, maker of all things
                      visible and invisible; And in one Lord Jesus Christ, the Son of God, the only
                      begotten, begotten of the Father, that is, out of the ousia of the Father,
                      God out of God, Light out of Light, true God out of true God, begotten, not
                      made, of the same ousia as the Father, through whom all things were made,
                      both those things in heaven and those on earth, who for us men and our
                      salvation came down, took flesh, and was made human, suffered and rose up on
                      the third day, ascended unto heaven and will come to judge both the quick and
                      the dead; And in the Holy Spirit.
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed italic mt-4">
                      But those who say that there was a when, when He was not, and that He was
                      made out of nothing (what did not exist), or who say that He is of another
                      hypostasis or ousia, or that the Son of God is created or subject to
                      change or alteration, the Catholic and Apostolic Church anathematize.&quot;
                    </p>
                  </div>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Date of Easter
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    From the time of Polycarp of Smyrna (first half of the second century), the
                    date of Easter was a matter of dispute. Irenaeus of Lyon has also expressed
                    his opinion on this issue, but there was no consensus about this problem among
                    the Church as a whole and therefore, the council of Nicea decided upon this
                    question. Alexandrine Church as well as the Western Church celebrated Easter on
                    the first Sunday after the first full moon in spring season and this was
                    according to the Synoptic tradition. The Church in Asia Minor celebrated
                    Easter according to the Jewish pattern, namely, the first Sunday after Nissan
                    14th, which was eventually the Johannine one too. The council of Nicea decided
                    that Easter was to be celebrated according to the Alexandrine-Western
                    practice, namely, on the first Sunday after the first full moon in spring
                    season.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Canons of the Council
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Council of Nicea issued 20 canons on issues that matter to the discipline of
                    the Church. Ecclesiastical structures are dealt with in canons 4–7, 15 and 16.
                    Dignity of ordained people is mentioned in canons 1–3, 9, 10 and 17. The
                    problem of open confession of sins during a liturgical action is the theme in
                    canons 11–14. The question how to reinstate the lapsed, schismatic and
                    heretics etc. into the Church is dealt with in canons 8 and 19. Liturgical
                    admonitions are given in canons 18 and 20. From the above narration, it is
                    clear that there is no systematic treatment of problems in the order of
                    canons. Yet, these canons are considered as most important and binding to the
                    whole Christian Church even today.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    The History of Nicene Creed
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    As it is seen above, the Nicene Creed was first adopted in 325 at the First
                    Universal Christian Council of Nicaea. The Coptic Church has the tradition
                    that the original creed was authored by Athanasius. There is also a strong
                    tradition that the Nicene Creed was the local creed of Caesarea brought to the
                    council by Eusebius of Caesarea. However, the creed was not in the full form
                    that we see and use today! It is in the second Ecumenical Council in 381 added
                    the section that follows the words &quot;We believe in the Holy Spirit&quot;
                    hence the creed is also known in the history as
                    &quot;Nicene-Constantinopolitan Creed&quot;, referring to the Creed as it was
                    after the modification in Constantinople.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The third Ecumenical Council, Ephesus in 431, reaffirmed the 381 version, and
                    decreed that &quot;it is unlawful for any man to bring forward, or to write, or
                    to compose a different Faith as a rival to that established by the holy
                    Fathers assembled with the Holy Ghost in Nicæa.&quot;
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    The Filioque Controversy
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Amongst the Latin-speaking churches of Western Europe, the words &quot;and the
                    Son&quot; (Filioque) were added to the description of the procession of the
                    Holy Spirit, in what many have argued is a violation of the Canons of the
                    Third Ecumenical Council. Those words were not included by either the Council
                    of Nicaea or that of Constantinople, and hence Eastern Orthodox theologians
                    consider their inclusion to be a heresy. The dispute over the Filioque clause
                    was one of the reasons for the East-West Schism. The clause had been adopted
                    in the west, although the Third Ecumenical Council (431) had prohibited to
                    individuals the promulgation of any other creed. The manner of the
                    clause&apos;s adoption was therefore controversial and in the 10th century
                    Photius, the Patriarch of Constantinople, used this clause in his conflict
                    with the Pope. He accused the West of having fallen into heresy and thereby
                    turned the Filioque clause into the doctrinal issue of contention between
                    East and West.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Conclusion
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Eastern Orthodox Churches those who follow the uncorrupted faith of the
                    Three Holy Ecumenical Synods have thus the Creed in the following formula.
                    Since it is the declaration of our Faith and cream of our theological stand
                    point, it is the duty of the Church and believers to recite it in all our
                    liturgical prayers and keep hold its faith in their daily life.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    A biblical analysis of the Nicene Creed shows how much its words and usages
                    are owed and quoted from the Holy Bible, the word of God and the chief
                    resource of the Church. One could see many more quotations from the word of
                    God; what follows is a model study of it.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    The Nicene Creed
                  </h2>
                  <div className="bg-muted/30 rounded-lg p-6 border border-border/50 space-y-4">
                    <p className="font-body text-muted-foreground leading-relaxed text-sm">
                      We believe in one true God (Heb 11:6, 1 Corinthians 8:4-6, Romans 3:29-31,
                      Eph 4:6) The Father Almighty (1Cor. 8:6 Rev. 1:8) Maker of heaven and earth
                      (Ex. 20:11, Gen. Ch. 1 & 2) and of all things visible and invisible (Jer.
                      32:17. Col. 1:16) And in the one Lord (Acts 10:36) Jesus (Matt. 1:21) Christ
                      (John 4:25-26), the only-begotten Son of God (John 1:14), begotten of the
                      Father before all worlds (1 John 4:9), Light of Light, very God of very God
                      (John 1:4, 1 John 1:5-7, John 12:35-37, John 5:18), begotten, not made (John
                      8:58), being of the same substance with the Father (John 10:30); and by whom
                      all things were made (John 1:3); + who for us men and for our salvation (Mat
                      1:21) came down from heaven (John 3:31), + and was incarnate of the Holy
                      Virgin Mary, Mother of God (Luke 2:6), by the Holy Ghost (Luke 1:35), and
                      became man (John 1:14); + and was crucified for us (Mark 15:25) in the days
                      of Pontius Pilate (Matt 27:22-26); and suffered, and died, and was buried
                      (Matt 27:50-60); And the third day rose again (Matt 28:6) according to His
                      will (1.Cor 15:4), and ascended into heaven (Luke 24:51), and sat on the
                      right side of the Father (Mark 16:19); and shall come again in His great
                      glory (Matt 25:31), to judge both the quick and the dead (2 Tim 4:1); whose
                      kingdom shall have no end (Luke 1:33); And in the one living Holy Spirit
                      (John 14:26), the life-giving Lord of all (2cor 3:17-18, Is. 6:8, Acts
                      28:25 Rom 8:2, 2.Cor 3:6), who proceeds from the Father (John 15:26): and
                      who with the Father and the Son is worshiped and glorified (Rev. 4:8), who
                      spoke by the Prophets and Apostles (2 Peter 1:21); And in the One (John
                      10:16), Holy (Eph 5:26-27, 2 Peter 2:5 & 9), Catholic (Rom 10:18
                      &quot;Catholic&quot; means universal or comprehensive, as well as
                      &quot;relating to the ancient undivided Christian church&quot;) and
                      Apostolic (Eph 2:20) Church; and we acknowledge one Baptism (Eph. 4:5) for the
                      remission of sins (Acts 2:38), and look for the resurrection of the dead
                      (Rom 6:5), and the new life in the world to come (Mat. 25:34., Rev. 21:1-7).
                      Amen.
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-6 mt-8 border border-border/50">
                    <p className="font-body text-muted-foreground leading-relaxed text-sm italic">
                      Prepared by: H.G. Dr. Geevarghese Mar Yulios Metropolitan
                    </p>
                  </div>
                </div>
              </div>

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

export default TheCreedPage;
