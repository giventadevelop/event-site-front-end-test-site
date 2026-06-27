import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';

export const metadata: Metadata = {
  title: 'Medical College | Institutions | MOSC',
  description: 'Malankara Medical Mission Hospital and Medical College, Kolencherry - providing quality medical education and healthcare services.',
};

export default function MedicalCollegePage() {
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Medical College" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-syro-card-hover">
                    <Image src="/images/institutions/med.jpg" alt="Medical College" fill className="object-cover" priority />
                  </div>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-8">
                  Malankara Medical Mission Hospital and Medical College at Kolencherry, dedicated to excellence in medical education and compassionate healthcare delivery.
                </p>
              </div>

              <div className="mt-8 bg-white rounded-lg shadow-syro-card p-8">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
              Malankara Medical Mission Hospital
            </h2>
            <p className="font-syro-primary text-lg text-syro-blue mb-6">
              Kolencherry – 682 311
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Main Departments
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <p className="flex justify-between">
                    <span className="font-medium">Hospital:</span>
                    <span>04843055 555</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Enquiry IP:</span>
                    <span>04843055 211</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Enquiry OP:</span>
                    <span>04843055 621</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Administration:</span>
                    <span>04843055 411</span>
                  </p>
                </div>
              </div>
              <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Educational Programs
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <p className="flex justify-between">
                    <span className="font-medium">Medical College:</span>
                    <span>04843055 527</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Nursing College:</span>
                    <span>04843055 661</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">School Of Nursing:</span>
                    <span>04843055 367</span>
                  </p>
                </div>
              </div>
              <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Additional Services
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <p className="flex justify-between">
                    <span className="font-medium">Health Package:</span>
                    <span>04843055 700</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Casualty PRO:</span>
                    <span>04843055 733</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Telephone Booking:</span>
                    <span>04843055 621</span>
                  </p>
                </div>
              </div>
              <div className="bg-syro-red/5 rounded-lg p-6 border-l-4 border-syro-red flex flex-col justify-center">
                <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                  Website
                </h3>
                <a 
                  href="http://moscmm.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-syro-red hover:underline font-syro-primary text-lg"
                >
                  moscmm.org
                </a>
              </div>
            </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <InstitutionsSidebar currentSlug="medical-college" />
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


