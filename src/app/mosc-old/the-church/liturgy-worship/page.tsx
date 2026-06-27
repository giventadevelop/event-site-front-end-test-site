import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'Liturgy',
  description:
    '"We have seen the true Light, we have received the heavenly Spirit; we have found the true Faith, worshiping the undivided Trinity: for He has saved us." The Liturgy of St. John Chrysostom.',
};

const LiturgyWorshipPage = () => {
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Liturgy
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              &quot;We have seen the true Light, we have received the heavenly Spirit; we have
              found the true Faith, worshiping the undivided Trinity: for He has saved us.&quot;
              The Liturgy of St. John Chrysostom
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
                      src="/images/church/liturgy-worship.jpg"
                      alt="Liturgy and Worship - Malankara Orthodox Syrian Church"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border/50">
                    <p className="font-body text-muted-foreground leading-relaxed text-center italic text-lg">
                      &quot;We have seen the true Light, we have received the heavenly Spirit; we
                      have found the true Faith, worshiping the undivided Trinity: for He has saved
                      us.&quot;
                    </p>
                    <p className="font-body text-primary font-semibold text-center mt-2">
                      The Liturgy of St. John Chrysostom
                    </p>
                  </div>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                    THE MEANING OF THE LITURGY
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    When Moses led the people of Israel out of Egypt, he was given a very explicit
                    set of instructions on how they were to worship the God who freed them. These
                    instructions were revealed by God on Mount Sinai and are found in the books of
                    Exodus, Leviticus, Numbers and Deuteronomy in the Old Testament. From this
                    beginning arose the complex liturgical Temple worship of ancient Israel.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the New Testament, we find that Jesus&apos; disciples, who were all Jewish,
                    at first continued to worship in the Temple and afterwards gathered at a private
                    home to celebrate the particularly Christian &quot;breaking of bread,&quot; the
                    Holy Eucharist.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-2">
                    1. Christian life at that time is described in the Book of Acts as continuing
                    &quot;steadfastly in the apostle&apos;s doctrine and fellowship, in the breaking
                    of bread, and in the prayers&quot;
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-2">
                    2. Christians would &quot;break bread&quot; on the first day of the week, the
                    day the Lord had risen from the dead.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    3. Christians came to see their worship as the legitimate maturation of the
                    worship given to Moses, supplanting the cult of the Temple in Jerusalem. Inasmuch
                    as Christ had established a better covenant between God and the fallen world, He
                    obtained for us &quot;a more excellent liturgy&quot;: &quot;For if [Jesus] were
                    on earth, He would not be a priest, since there are priests who offer gifts
                    according to the law (i.e., the Jewish priests in Jerusalem); who serve the
                    copy and shadow of the heavenly things, as Moses was divinely instructed when he
                    was about to make the tabernacle. For He said, &apos;See that you make all
                    things according to the pattern shown you on the mountain.&apos; But now He has
                    obtained a more excellent ministry (leitourgias, or &quot;liturgy&quot; in
                    English), inasmuch as He is also Mediator of a better covenant, which was
                    established on better promises.&quot;
                  </p>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    1. Acts 2:46; 3:1.<br />
                    2. It is unclear whether &quot;the prayers&quot; referred to here are the
                    prayers said when celebrating the Eucharist or the Jewish prayer said when the
                    Christians &quot;went up together into the Temple at the hour of prayer&quot;
                    (Acts 3:1).<br />
                    3. Acts 20:7.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Like the worship given to Moses, which as we read above was &quot;a copy and
                    shadow of the heavenly things,&quot; Christians also saw their liturgical
                    worship as mirroring the worship of the heavenly hosts. As Saint Germanus, the
                    eighth century Patriarch of Constantinople, would later put it, &quot;The church
                    is an earthly heaven in which the super-celestial God dwells and walks
                    about.&quot;
                  </p>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    6. Saint Germanus of Constantinople, <em>On the Divine Liturgy</em>.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The word &quot;liturgy&quot; is a contraction of two Greek words, the word{' '}
                    <em>laos</em> meaning &quot;common,&quot; as in &quot;belonging to the
                    people,&quot; and the word <em>ergon</em>, meaning &quot;work.&quot; Thus
                    &quot;liturgy&quot; refers to the work of the common people in praising God. In
                    this work, the bishop or priest presides as an image, or icon, of Jesus Christ,
                    conducting the worship along with the Faithful. In the words of Saint Ignatius,
                    the third bishop of Antioch who was martyred around A.D. 110, &quot;Wherever the
                    bishop appears let the congregation also be present; just as wherever Jesus
                    Christ is, there is the catholic (Greek: the &quot;whole&quot;) Church.&quot;
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-2">
                    7. The word &quot;liturgy&quot; is routinely used in the New Testament,
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    8. and is used as well in the Greek translation of the Old Testament known as the
                    Septuagint (made in Alexandria).
                  </p>
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

export default LiturgyWorshipPage;
