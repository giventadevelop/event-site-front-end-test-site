import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kunnamkulam',
  description: 'Learn about the Diocese of Kunnamkulam of the Malankara Orthodox Syrian Church.',
};

const dioceseofkunnamkulamPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kunnamkulam" breadcrumbFrom="dioceses" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/diocese-of-kunnamkulam.jpg"
                    alt="Diocese of Kunnamkulam"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kunnamkulam
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      A Brief History Of Kunnamkulam Diocese

Kunnamkulam is the home of the people who bear in their hearts the natural piety of spiritualism, the fragrance of tradition and the steadfastness of true faith. The uniqueness of this region is that the Christian Church was established in this part of Malankara at the same time when Christian faith was established in Rome, Antioch and Alexandria. The entire history and glory of Kunnamkulam is associated with the The Chattukulangara (Arthat) Church. Being the permenant monument of the St. Thomas mission in Kerala, it has a long and glorious tradition and history. The Christian Community associated with the Church is believed to be the most ancient Christian community in Kerala, even a little bit earlier than the Niranam Christian Congregation.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      A Brief History Of Kunnamkulam Diocese Kunnamkulam is the home of the people who bear in their hearts the natural piety of spiritualism, the fragrance of tradition and the steadfastness of true faith. The uniqueness of this region is that the Christian Church was established in this part of Malankara at the same time when Christian faith was established in Rome, Antioch and Alexandria. The entire history and glory of Kunnamkulam is associated with the The Chattukulangara (Arthat) Church. Being the permenant monument of the St. Thomas mission in Kerala, it has a long and glorious tradition and history. The Christian Community associated with the Church is believed to be the most ancient Christian community in Kerala, even a little bit earlier than the Niranam Christian Congregation. Download List of Diocesan Assembly members 29-06-2013 &nbsp; Address: Bishop' House, Arthat, Kunnamkulam- 680521 Ph: 04885-225001 Email: mockkmdiocese@yahoo.in
                    </p>
                </div>
              </div>
              {/* Quick Links - below content (desktop, same as administration) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <DiocesesSidebar />
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

export default dioceseofkunnamkulamPage;