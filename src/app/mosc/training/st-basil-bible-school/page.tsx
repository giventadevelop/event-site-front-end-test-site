import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TrainingSidebar from '../components/TrainingSidebar';

export const metadata: Metadata = {
  title: 'St. Basil Bible School | Training | MOSC',
  description: 'St. Basil Bible School and Orientation Center - spiritual training and biblical education for the laity. Situated at Sasthamcotta lake, Kollam, Kerala. Contact: Muthupilakkadu P.O., India-690520.',
};

export default function StBasilBibleSchoolPage() {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="St. Basil Bible School" breadcrumbFrom="training" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
      {/* Single card: image + content + contact (catholicate layout) */}
      <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/training/bs.jpg"
            alt="St. Basil Bible School and Orientation Center"
            width={800}
            height={500}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
            priority
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        </div>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
          St. Basil Bible School and Orientation Center
        </h2>
        <div className="space-y-6 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
          <p>
            The origin of the St. Basil Bible School is attributed to the vision and efforts of <strong>H. H. Baselios Marthoma Mathews II</strong>. It began with the official decision of the Holy Episcopal Synod on <strong>10th March 2000</strong>. The Bible School is instrumental in creating spiritual awakening among the members of the Church.
          </p>
          <p>
            St. Basil Bible School aims at the enlightenment of the faithful of the Holy Orthodox Church. The Bible School provides spiritual training to the lay people of the Church. It teaches the scripture and faith of the church as handed over to us by the Holy Fathers and Mothers of the Church. The Bible School helps in experiencing the liturgical mysteries of the church. St. Basil Bible School and Orientation Centre is situated at a beautiful lake-shore scenic village area of <strong>60 acres of land</strong> surrounded by the famous <strong>Sasthamcotta fresh water lake</strong> in the District of Kollam, Kerala State, South India.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-syro-red/20">
          <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-2 border-b-2 border-syro-red">
            Contact Address
          </h2>
          <div className="space-y-5 font-syro-primary text-syro-dark-gray">
            <div>
              <p className="leading-relaxed">
                St.Basil Bible School and Orientation Centre,<br />
                Muthupilakkadu P.O.,<br />
                Dist.Kollam,<br />
                Kerala,<br />
                India-690520.
              </p>
              <p className="pt-2">
                <span className="font-medium text-syro-blue">Phone No :</span> 0476-2831712 ( Bible School )
              </p>
            </div>
            <div>
              <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-2">Contact Person for Course Details:</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-syro-blue">Fr. Samuel George</p>
                  <p>Dean of Academics, Bible School</p>
                  <p>Mt. Horeb Asram</p>
                  <p><span className="font-medium text-syro-blue">Mobile No :</span> 9526763518</p>
                  <p><span className="font-medium text-syro-blue">Mount. Horeb Ashramam :</span> 0476-2830778</p>
                </div>
                <div>
                  <p className="font-medium text-syro-blue">Fr. Abraham Varghese,</p>
                  <p>Dean of students</p>
                  <p>Mount Horeb Ashramam</p>
                  <p><span className="font-medium text-syro-blue">Mob No :</span> 9847837017</p>
                </div>
              </div>
            </div>
            <div>
              <p>
                <a href="http://www.orthodoxbibleschool.org/index.html" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
                  http://www.orthodoxbibleschool.org/index.html
                </a>
              </p>
              <p className="mt-2">
                <span className="font-medium text-syro-blue">email :</span>{' '}
                <a href="mailto:orthodoxbibleschool@gmail.com" className="text-syro-red hover:underline">
                  orthodoxbibleschool@gmail.com
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
              <TrainingSidebar currentSlug="st-basil-bible-school" />
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




