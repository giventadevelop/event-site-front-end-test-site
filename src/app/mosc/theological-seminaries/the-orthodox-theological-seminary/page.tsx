import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TheologicalSeminariesSidebar from '../components/TheologicalSeminariesSidebar';

export const metadata = {
  title: 'The Orthodox Theological Seminary (Old Seminary) | MOSC',
  description: 'The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ram...',
};

const TheOrthodoxTheologicalSeminaryPage = () => {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="The Orthodox Theological Seminary (Old Seminary)" breadcrumbFrom="theological-seminaries" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Single card: image + content + contact (training subpage layout) */}
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/theological/sem-300x176.jpg"
                    alt="The Orthodox Theological Seminary (Old Seminary), Kottayam"
                    width={300}
                    height={176}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    sizes="(max-width: 768px) 100vw, 28rem"
                  />
                </div>
                <div className="space-y-6 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  <p>
                    The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ramban Ittoop, a priest-monk of the Malankara Orthodox Syrian Church. The learned monk from Kunnamkulam was carrying out with singular courage a major decision of the church made at Kandanadu in 1809 to start two schools of theology (Padithaveedu), one in the North and the other in the South of Kerala.
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-syro-red/20">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-2 border-b-2 border-syro-red">
                    Contact Us
                  </h2>
                  <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                    <p className="font-medium text-syro-blue">ORTHODOX THEOLOGICAL SEMINARY</p>
                    <p className="leading-relaxed">
                      P. B. No. 98, Kottayam – 686 001<br />
                      Kerala, India.
                    </p>
                    <p>
                      <span className="font-medium text-syro-blue">Tel:</span> 2566526, 2568083, 2568500<br />
                      <span className="font-medium text-syro-blue">Fax:</span> 91-0481-2302571<br />
                      <span className="font-medium text-syro-blue">Principal Res:</span> 2568046
                    </p>
                    <p>
                      <span className="font-medium text-syro-blue">contact emails :</span><br />
                      <a href="mailto:info@ots.edu.in" className="text-syro-red hover:underline">info@ots.edu.in</a> (Office)<br />
                      <a href="mailto:principal@ots.edu.in" className="text-syro-red hover:underline">principal@ots.edu.in</a> (Principal),<br />
                      <a href="mailto:admin@ots.edu.in" className="text-syro-red hover:underline">admin@ots.edu.in</a> (Webmaster)
                    </p>
                    <p>
                      <a
                        href="http://www.ots.edu.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-syro-red hover:underline"
                      >
                        www.ots.edu.in
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
              <TheologicalSeminariesSidebar currentSlug="the-orthodox-theological-seminary" />
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

export default TheOrthodoxTheologicalSeminaryPage;
