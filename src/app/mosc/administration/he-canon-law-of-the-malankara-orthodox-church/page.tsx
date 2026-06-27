import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import AdministrationSidebar from '../components/AdministrationSidebar';

export const metadata = {
  title: 'The Canon Law of the Malankara Orthodox Church',
  description: 'The ecclesiastical laws and regulations that guide our church governance.',
};

export default function CanonLawPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Canon Law of the Malankara Orthodox Church" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/canon-law.jpg"
                    alt="The Canon Law of the Malankara Orthodox Church"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Canon Law accepted and followed by the Orthodox church of Malankara was collected and codified by
                    Mar Gregorios Bar Hebraeus, Catholicos of Edessa (AD. 1226-1286) in the thirteenth century. He was a
                    versatile genius who wrote about thirty books on a variety of subjects. He was a great scholar in church
                    History and Canon Law of the Church. Having carefully and judiciously scrutinized the verdicts of the
                    Church Fathers and the decrees of the provincial and ecumenical councils he collected them, edited and
                    classified under different heads. The original work in Syriac contains forty chapters and is called by
                    the name &apos;hoodoyo canon&apos;. The word &apos;hoodoyo&apos; means &quot;explanations&quot;.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The original syriac manuscript was edited and printed in Paris in 1898 by Paul Bedjan. The Pampakuda
                    Konat Library possesses a copy of this ancient canon which in every detail agrees with the Paris publication.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Patriarch party in Malankara maintains a varied version of this Canon which was prepared here to give
                    more power and claims to the Patriarch of Antioch. The original Syriac canon contains forty chapters of which
                    the first ten chapters have been translated into Malayalam by the late lamented Malpan Fr. Abraham Konat.
                    In his editorial note it is mentioned that the remaining thirty chapters contain subjects that are irrelevant
                    for the Malankara Church, but connected with the Middle East society of that period. The author of the
                    &apos;Hoodoyo canon&apos; has simply presented the verdict of different church fathers and early councils, but he
                    does not make any positive and conclusive pronouncements.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Certainly the Canon needs revision and updating to meet the challenges and needs of the Malankara Church
                    in the modern times. The Church leaders who framed the constitution of the Malankara Orthodox Church have
                    used this Canon as a basis.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                    The ten chapters contain matters related to church politics, sacraments, feasts and fasts, burial rites etc.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="he-canon-law-of-the-malankara-orthodox-church" />
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
