import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';
import { ELECTED_MEMBERS, NOMINATED_MEMBERS } from '@/app/mosc/administration/the-managing-committee/managing-committee-data';

export const metadata = {
  title: 'The Managing Committee',
  description:
    'The managing committee of the Malankara Orthodox Syrian Church â€” elected and nominated members 2022-2027.',
};

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
        className="text-syro-blue hover:underline"
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

export default function ManagingCommitteePage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Managing Committee" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/managing-committee.jpg"
                    alt="The Managing Committee"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    In the Mulamthuruthy synod which formulated the Malankara association had laid
                    down the provision for the managing committee, a smaller body to look into the
                    financial and other administrative matters. The members are elected by the
                    association, two priests and four lay people representing each Diocese are
                    elected for a period of five years. Other than the elected members, a
                    proportionate number of members are nominated to the Managing Committee by the
                    Malankara Metropolitan. The members of the Working Committee are also members of
                    the Managing Committee.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mb-8">
                    <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-2 text-center">
                      PRESENT MEMBERS OF THE COMMITTEE
                    </h2>
                    <p className="font-syro-primary text-syro-dark-gray text-center font-semibold mb-1">
                      2022-2027
                    </p>
                    <p className="font-syro-primary text-syro-red font-semibold text-center mb-8">
                      (ELECTED MEMBERS)
                    </p>

                    <div className="space-y-8">
                      {ELECTED_MEMBERS.map(({ diocese, members }) => (
                        <div key={diocese}>
                          <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4 border-b border-syro-dark-gray/20 pb-2">
                            {diocese}
                          </h3>
                          <ul className="space-y-3 list-none pl-0">
                            {members.map((member, i) => (
                              <li key={i} className="bg-white rounded-lg p-4 border border-syro-dark-gray/10">
                                <p className="font-syro-primary text-syro-dark-gray text-sm leading-relaxed">
                                  <MemberText text={member} />
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-10 mb-4 border-b border-syro-dark-gray/20 pb-2">
                      (NOMINATED MEMBERS)
                    </h3>
                    <ol className="space-y-3 list-decimal list-inside">
                      {NOMINATED_MEMBERS.map((member, i) => (
                        <li key={i} className="font-syro-primary text-syro-dark-gray text-sm leading-relaxed">
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

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="the-managing-committee" />
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
