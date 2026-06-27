import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'The Constitution of the Malankara Orthodox Church',
  description: 'The fundamental document that governs the structure and operation of our church.',
};

export default function ConstitutionPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Constitution of the Malankara Orthodox Church" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
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

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church had no written constitution until 1934, but was governed by consensus, traditions and precedence.
                    It was the vision of Mor Dionysius, Vattasseril to have a clearly defined uniform constitution to govern
                    the church administration. He initiated action in this regard and appointed a sub-committee with O. M. Cherian
                    as convener to submit a draft constitution. The committee members had discussed the fundamental issues with
                    the Metropolitan in several rounds. However it was not finalized and passed (materialized) in his life time.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    After his demise, the constitution was presented in the Malankara Christian Association meeting of Dec 26, 1934,
                    held at M. D. Seminary. It was adopted and brought to force. Three times the constitution was amended to meet
                    specific situations and needs. It only shows that the church is alive to meet the challenges that arise from time to time.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The validity of the constitution was challenged by the Patriarch party in the Court, but the Supreme Court has
                    given its final verdict declaring the validity of the Constitution. Every member of the Church is bound by the
                    rules and regulations laid down in the Constitution.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Constitution upholds the autonomy and autocephaly of the Malankara Orthodox Church. It is Episcopal in its
                    (polity) and not congregational. At the same time it upholds democratic principle by safeguarding the rights
                    and privileges of the lay people. It was framed at a time when the Patriarch of Antioch was held in high esteem
                    and hence his limited role is included.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The constitution enshrines the fundamental features of the Church, provides direction for its internal
                    administration and preserves its integrity and autonomy. The essential features of the Church are provided
                    in the preamble. The first article emphasizes the bond of relationship between the Church of Syria and Malankara.
                    The second article deals with the foundation of the Malankara Church by St. Thomas and the primacy of the Catholicos.
                    The third article refers to the name of the church and the fourth about the faith, traditions etc., and the fifth
                    about the canons governing the administration of the Church.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    The whole constitution conceives the Malankara Church as self-sufficient in all her requirements, be it temporal,
                    ecclesiastical or spiritual in nature and upholds that the Malankara Orthodox church is rightly autocephalous in character.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="administration" />
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
