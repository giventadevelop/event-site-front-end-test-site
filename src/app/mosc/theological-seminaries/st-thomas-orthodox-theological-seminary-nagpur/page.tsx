import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TheologicalSeminariesSidebar from '../components/TheologicalSeminariesSidebar';

export const metadata = {
  title: 'St. Thomas Orthodox Theological Seminary, Nagpur (STOTS) | MOSC',
  description: 'The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora popu...',
};

const StThomasOrthodoxTheologicalSeminaryNagpurPage = () => {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="St. Thomas Orthodox Theological Seminary, Nagpur (STOTS)" breadcrumbFrom="theological-seminaries" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Single card: image + content + contact (training subpage layout) */}
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/theological/nag-300x176.jpg"
                    alt="St. Thomas Orthodox Theological Seminary, Nagpur (STOTS)"
                    width={300}
                    height={176}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    sizes="(max-width: 768px) 100vw, 28rem"
                  />
                </div>
                <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-2 border-b-2 border-syro-red">
                  Introduction
                </h2>
                <div className="space-y-6 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  <p>
                    The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora population meaningfully but also does it create a new vision about the mission of the Church in a multi-lingual and multi-religious context. Moreover, the Seminary offers a stage for fruitful dialogues of Christian theologians with people of other faith affirmations. In future, women of the Orthodox Church, who wish to study theology and to reflect to the challenges of the world will find it as a place, where their ideas will be influencing the theology of the Church.
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-syro-red/20">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-2 border-b-2 border-syro-red">
                    For Communications
                  </h2>
                  <div className="space-y-3 font-syro-primary text-syro-dark-gray leading-relaxed">
                    <p className="font-medium text-syro-blue">Principal</p>
                    <p>
                      St. Thomas Orthodox Theological Seminary<br />
                      Brahmani P.O., Kalmeshwar 441 501, Nagpur, India
                    </p>
                    <p>
                      <span className="font-medium text-syro-blue">Tel.</span> 07118-271696 (office), 271994 (principal) 271991 (hostel)
                    </p>
                    <p>
                      <span className="font-medium text-syro-blue">E-Mail:</span>{' '}
                      <a href="mailto:nagpurseminary@rediffmail.com" className="text-syro-red hover:underline">nagpurseminary@rediffmail.com</a>
                    </p>
                    <p>
                      <a
                        href="http://www.orthodoxseminarynagpur.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-syro-red hover:underline"
                      >
                        www.orthodoxseminarynagpur.in
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden" aria-hidden="true">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <TheologicalSeminariesSidebar currentSlug="st-thomas-orthodox-theological-seminary-nagpur" />
            </div>
          </div>
          <div className="hidden" aria-hidden="true">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default StThomasOrthodoxTheologicalSeminaryNagpurPage;
