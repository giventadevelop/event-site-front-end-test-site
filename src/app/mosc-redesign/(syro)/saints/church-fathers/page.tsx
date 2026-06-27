import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import QuickLinks from '../../components/QuickLinks';

export const metadata = {
  title: 'Church Fathers',
  description: 'The early church fathers and their theological contributions',
};

export default async function ChurchFathersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'saints' ? 'saints' : 'home';
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Church Fathers" breadcrumbFrom={breadcrumbFrom} />
      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/saints/church-fathers.jpg"
                    alt="Church Fathers"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Early Church Fathers
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      &nbsp;
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Church Fathers during 4th and 5th Centuries
The fourth and fifth centuries may be regarded as the greatest centuries as far as the defense of faith is concerned. There were many heresies attacked the Church and the Church strongly defended its true faith through her faithful believers. The heroic children of the Church fought against the opponents of the Church through their teachings and literary works. We can say, without any doubt, these significant personalities are really heroes, the champions of Orthodoxy. The Church cherishes them in her heart as sources and models for Spirit inspired life.
                    </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Saints Categories
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc-redesign/saints" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300 hidden"
                  >
                    Saints Overview
                  </Link>
                  <div className="border-t border-syro-table-border my-2"></div>
                  <Link 
                      href="/mosc-redesign/saints/the-apostles" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      The Apostles
                    </Link>
                  <Link 
                      href="/mosc-redesign/saints/st-mary-mother-of-god" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      St. Mary Mother of God
                    </Link>
                  <Link 
                      href="/mosc-redesign/saints/church-fathers" 
                      className="block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Church Fathers
                    </Link>
                  <Link 
                      href="/mosc-redesign/saints/indian-saints" 
                      className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                    >
                      Indian Saints
                    </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
