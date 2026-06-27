import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Constitution of the Malankara Orthodox Church',
  description: 'The fundamental document that governs the structure and operation of our church.',
};
// test
const ConstitutionPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Constitution">📜</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Constitution of the Malankara Orthodox Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The fundamental document that governs the structure and operation of our church.
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
                {/* Featured Image - half size, no shadow */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="MOSC Logo"
                    width={125}
                    height={75}
                    className="rounded-lg w-full max-w-[125px] h-auto object-contain"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The church had no written constitution until 1934, but was governed by consensus, traditions and precedence. 
                    It was the vision of Mor Dionysius, Vattasseril to have a clearly defined uniform constitution to govern 
                    the church administration. He initiated action in this regard and appointed a sub-committee with O. M. Cherian 
                    as convener to submit a draft constitution. The committee members had discussed the fundamental issues with 
                    the Metropolitan in several rounds. However it was not finalized and passed (materialized) in his life time.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    After his demise, the constitution was presented in the Malankara Christian Association meeting of Dec 26, 1934, 
                    held at M. D. Seminary. It was adopted and brought to force. Three times the constitution was amended to meet 
                    specific situations and needs. It only shows that the church is alive to meet the challenges that arise from time to time.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The validity of the constitution was challenged by the Patriarch party in the Court, but the Supreme Court has 
                    given its final verdict declaring the validity of the Constitution. Every member of the Church is bound by the 
                    rules and regulations laid down in the Constitution.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Constitution upholds the autonomy and autocephaly of the Malankara Orthodox Church. It is Episcopal in its 
                    (polity) and not congregational. At the same time it upholds democratic principle by safeguarding the rights 
                    and privileges of the lay people. It was framed at a time when the Patriarch of Antioch was held in high esteem 
                    and hence his limited role is included.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The constitution enshrines the fundamental features of the Church, provides direction for its internal 
                    administration and preserves its integrity and autonomy. The essential features of the Church are provided 
                    in the preamble. The first article emphasizes the bond of relationship between the Church of Syria and Malankara. 
                    The second article deals with the foundation of the Malankara Church by St. Thomas and the primacy of the Catholicos. 
                    The third article refers to the name of the church and the fourth about the faith, traditions etc., and the fifth 
                    about the canons governing the administration of the Church.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed">
                    The whole constitution conceives the Malankara Church as self-sufficient in all her requirements, be it temporal, 
                    ecclesiastical or spiritual in nature and upholds that the Malankara Orthodox church is rightly autocephalous in character.
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
                    className="block px-3 py-2 bg-primary text-white rounded-md font-body text-sm reverent-transition"
                  >
                    The Constitution of the Malankara Orthodox Church
                  </Link>
                  <Link 
                    href="/mosc-old/administration/he-canon-law-of-the-malankara-orthodox-church" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
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

export default ConstitutionPage;
