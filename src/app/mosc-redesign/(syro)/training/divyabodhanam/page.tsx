import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TrainingSidebar from '../components/TrainingSidebar';

export const metadata: Metadata = {
  title: 'Divyabodhanam (Theological Education Programme for the Laity) | Training | MOSC',
  description: 'Divyabodhanam - Theological Education Programme for the Laity of the Malankara Orthodox Syrian Church, inaugurated 1984 July 28. Contact: Orthodox Theological Seminary, Kottayam.',
};

export default function DivyabodhanamPage() {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Divyabodhanam (Theological Education Programme for the Laity)" breadcrumbFrom="training" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
      {/* Single card: image + content + contact (catholicate layout) */}
      <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/training/dvm.jpg"
            alt="Divyabodhanam - Theological Education Programme for the Laity"
            width={800}
            height={500}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
            priority
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        </div>

        <div className="space-y-6 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
          <p>
            A novel step in the field of theological studies of Malankara Orthodox Syrian Church was officially inaugurated in <strong>1984 July 28</strong> as a laymen training course of the church. The seedling of the concept of this project was sown by the world renowned theologian, philosopher, thinker and spokesperson of eastern spirituality, <strong>Late Lamented Paulose Mar Gregorios Metropolitan</strong>. The steadfast growth of this project shows the foresightedness of the Metropolitan.
          </p>
          <div className="bg-syro-red/5 rounded-lg p-6 border-l-4 border-syro-red">
            <p className="font-medium text-syro-blue">
              H.H. Baselious Marthoma Didymus I Catholicos announced the study course as a spiritual movement through the Kalpana No: 138/2009.
            </p>
          </div>
          <p>
            The Divyabodhanam family considers this proclamation as a recognition for the outstanding service rendered to the church. The leadership and effective influence of the professors of the Seminary is the service that we value the most in the proficiency and prospering nature of the course.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-syro-red/20">
          <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-2 border-b-2 border-syro-red">
            Contact Address
          </h2>
          <div className="space-y-5 font-syro-primary text-syro-dark-gray">
            <div>
              <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-2">Postal Address</h3>
              <p className="leading-relaxed">
                The Registrar,<br />
                Divyabodhanam Central Office,<br />
                Orthodox Theological Seminary,<br />
                P.B. No. 98, Kottayam – 686001
              </p>
              <p className="pt-2">
                <span className="font-medium text-syro-blue">Ph:</span> 0481 2568083
              </p>
            </div>
            <div>
              <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-1">Email</h3>
              <a href="mailto:divyabodhanamots@gmail.com" className="text-syro-red hover:underline">
                divyabodhanamots@gmail.com
              </a>
            </div>
            <div>
              <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-1">Website</h3>
              <a href="http://www.divyabodhanam.org/" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
                www.divyabodhanam.org
              </a>
            </div>
          </div>
        </div>
      </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <TrainingSidebar currentSlug="divyabodhanam" />
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




