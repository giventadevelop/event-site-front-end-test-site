import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Yuhanon Mar Meletius Metropolitan',
  description:
    'His Grace Dr. Yuhanon Mar Meletius Metropolitan, Metropolitan of Thrissur Diocese. Scholar, visiting professor, and author.',
};

const HGDrYuhanonMorMeletiusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Yuhanon Mar Meletius Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content - from https://mosc.in/holysynod/h-g-dr-yuhanon-mor-meletius-metropolitan/ */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                    <Image
                      src="/images/holy-synod/milithios.jpg"
                      alt="H.G. Dr. Yuhanon Mar Meletius Metropolitan"
                      fill
                      className="object-contain rounded-lg"
                      priority
                      sizes="(max-width: 768px) 100vw, 280px"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    H.G. Dr. Yuhanon Mar Meletius Metropolitan
                  </h2>

                  <div className="prose prose-lg max-w-none">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      His Grace was born at Elakkaranadu, a typical village in the Ernakulam District of Kerala, to a
                      social worker Mr Markose and Mrs Saramma, Murimakkil. He had his primary education from the
                      Government School at Maneed. After his schooling, His Grace studied at St Peter&apos;s College,
                      Kolencherry, and passed out with his bachelors in Malayalam.
                    </p>

                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      Coming to the theological studies, he did his BD and MTh degrees from the United Theological
                      College, Bangalore. Thereupon, he took ThM and PhD (old testament theology) from Lutheran School of
                      Theology, Chicago. His Grace has submitted his PhD paper to Dharmaram Vidyashektram, Bangalore.
                      Meanwhile, he studied syriac at St Aphrem&apos;s Seminary, Damascus.
                    </p>

                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      Mar Meletius got into the services of Our Lord being ordained a deacon in 1973 by His Grace Paulose
                      Mar Phelexinos, the then metropolitan of Kandanad Diocese. He was ordained a priest in 1986 by His
                      Beatitude Catholicos Baselios Paulose II. HH Patriarch Ignatius Zakka I ordained him as Ramban on
                      22 December 1990 and as Bishop on 23 December 1990 in Damascus. Since then, he is serving the
                      Thrissur Diocese as its Metropolitan.
                    </p>

                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      As a priest, he was teaching at MSOT Seminary, Udaigiri. He was also serving as the vicar of St
                      Mary&apos;s Church, Valampur, for about four years. His Grace also served as the president of
                      Orthodox Christian Youth Movement.
                    </p>

                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      A scholar, His Grace is a visiting professor to the Orthodox seminaries at Nagpur and Kottayam. An
                      accomplished writer, Mar Meletius has few books—Verukal Thedi, Manavikathayude Kazhchapadukal,
                      Swatantravum Swayam Paryapthathayum—to his credit.
                    </p>

                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      This widely travelled Bishop has also published numerous articles in different publications. Visit
                      the new website of H.G. Mar Meletius Metropolitan:{' '}
                      <Link
                        href="https://www.yuhanonmeletius.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                      >
                        www.yuhanonmeletius.org
                      </Link>
                    </p>

                    {/* Contact */}
                    <div className="mt-8 pt-6 border-t border-syro-table-border">
                      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4 sr-only">
                        Contact
                      </h3>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Gedseemon Seminary, Mannuthy, Thrissur, Kerala, India – 680651
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Phone: 0487 2371039, 2371748, 9447037174
                      </p>
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                        Email:{' '}
                        <a
                          href="mailto:yuhanonmilitos@hotmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          yuhanonmilitos@hotmail.com
                        </a>
                        {' / '}
                        <a
                          href="mailto:mormilitos@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          mormilitos@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <SynodMembersSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HGDrYuhanonMorMeletiusMetropolitanPage;
