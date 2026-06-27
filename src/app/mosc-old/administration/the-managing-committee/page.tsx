import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import { ELECTED_MEMBERS, NOMINATED_MEMBERS } from './managing-committee-data';

export const metadata = {
  title: 'The Managing Committee',
  description:
    'The managing committee of the Malankara Orthodox Syrian Church — elected and nominated members 2022-2027.',
};
// test
/** Renders member text and turns email addresses into mailto links */
function MemberText({ text }: { text: string }) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;
  while ((match = emailRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={`mailto:${match[0]}`}
        className="text-primary hover:underline"
      >
        {match[0]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts.length ? parts : text}</>;
}

const ManagingCommitteePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span
                className="text-primary-foreground text-4xl font-bold"
                role="img"
                aria-label="Managing Committee"
              >
                ⚙️
              </span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Managing Committee
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              In the Mulamthuruthy synod which formulated the Malankara association had laid down the
              provision for the managing committee, a smaller body to look into the financial and
              other administrative matters.
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
                {/* Featured Image - half size, centered */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/managing-committee.jpg"
                    alt="The Managing Committee"
                    width={1200}
                    height={720}
                    className="rounded-lg sacred-shadow w-1/2 h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                    quality={90}
                    priority
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-8">
                    In the Mulamthuruthy synod which formulated the Malankara association had laid
                    down the provision for the managing committee, a smaller body to look into the
                    financial and other administrative matters. The members are elected by the
                    association, two priests and four lay people representing each Diocese are
                    elected for a period of five years. Other than the elected members, a
                    proportionate number of members are nominated to the Managing Committee by the
                    Malankara Metropolitan. The members of the Working Committee are also members of
                    the Managing Committee.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 mb-8">
                    <h2 className="font-heading font-semibold text-2xl text-foreground mb-2 text-center">
                      PRESENT MEMBERS OF THE COMMITTEE
                    </h2>
                    <p className="font-body text-foreground text-center font-semibold mb-1">
                      2022-2027
                    </p>
                    <p className="font-body text-primary font-semibold text-center mb-8">
                      (ELECTED MEMBERS)
                    </p>

                    <div className="space-y-8">
                      {ELECTED_MEMBERS.map(({ diocese, members }) => (
                        <div key={diocese}>
                          <h3 className="font-heading font-semibold text-lg text-foreground mb-4 border-b border-border pb-2">
                            {diocese}
                          </h3>
                          <ul className="space-y-3 list-none pl-0">
                            {members.map((member, i) => (
                              <li key={i} className="bg-card rounded-lg p-4">
                                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                                  <MemberText text={member} />
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <h3 className="font-heading font-semibold text-xl text-foreground mt-10 mb-4 border-b border-border pb-2">
                      (NOMINATED MEMBERS)
                    </h3>
                    <ol className="space-y-3 list-decimal list-inside">
                      {NOMINATED_MEMBERS.map((member, i) => (
                        <li key={i} className="font-body text-muted-foreground text-sm leading-relaxed">
                          <span className="align-top ml-1">
                            <MemberText text={member} />
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6 sticky top-4">
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
                    className="block px-3 py-2 bg-primary text-white rounded-md font-body text-sm reverent-transition"
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

export default ManagingCommitteePage;
