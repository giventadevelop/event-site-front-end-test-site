import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'The Malankara Orthodox Syrian Church',
  description:
    'Catholicate of the East. The Malankara Orthodox Syrian Church was founded by St. Thomas the Apostle in A.D. 52. Our faith, liturgy, and ecumenical relations.',
};

export default async function MalankaraOrthodoxSyrianChurchPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Malankara Orthodox Syrian Church" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - same style as administration/administration */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="Malankara Orthodox Syrian Church"
                    width={125}
                    height={125}
                    className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain"
                    priority
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
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

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    Faith and Liturgy
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    At present, the Church is using the West Syrian liturgy. The faith of the Church
                    is that which was established by the three Ecumenical Councils of Nicea (A.D.
                    325), Constantinople (A.D. 381) and Ephesus (A.D. 431).
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    Ecumenical Relations
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church is in communion with the other Oriental Orthodox Churches namely,
                    Syriac, Alexandrian, Armenian, Eritrean and Ethiopian Orthodox Churches. The
                    Church is in good ecumenical relationship with the Eastern Orthodox, Roman
                    Catholic and Protestant Churches.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    The Church Today
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
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
            <div className="space-y-6 lg:col-span-1">
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
}
