import React, { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiturgyCalendarClient from './LiturgyCalendarClient';
import {
  fetchLiturgyDaysForMonthServer,
  getLiturgyCalendarConfiguredServer,
} from './ApiServerActions';
import type { LiturgyCalendarView, LiturgyLanguage } from './types';

export const metadata: Metadata = {
  title: 'Calendar | Malankara Orthodox Syrian Church',
  description: 'Access the liturgical calendar of the Malankara Orthodox Syrian Church with feast days, fasts, and important church dates.',
  keywords: ['MOSC Calendar', 'Liturgical Calendar', 'Orthodox Feast Days', 'Church Calendar', 'Fasting Days'],
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;

  const dateParam = typeof resolvedParams?.date === 'string' ? resolvedParams.date : undefined;
  if (dateParam) {
    const [y, m] = dateParam.split('-').map(Number);
    if (y && m) {
      year = y;
      month = m;
    }
  }

  const initialView = (typeof resolvedParams?.view === 'string' ? resolvedParams.view : 'month') as LiturgyCalendarView;
  const initialLng = (typeof resolvedParams?.lng === 'string' && resolvedParams.lng === 'ml' ? 'ml' : 'en') as LiturgyLanguage;
  const initialDate = dateParam ? new Date(dateParam + 'T12:00:00') : today;

  const configured = await getLiturgyCalendarConfiguredServer();
  const initialItems = configured
    ? await fetchLiturgyDaysForMonthServer(year, month, initialLng)
    : [];

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Liturgical Calendar"
        breadcrumbFrom="liturgical-calendar"
        description="Browse the liturgical calendar with feast days, fasting seasons, and daily readings from the Malankara Orthodox Syrian Church."
      />

      {/* Interactive liturgy calendar */}
      <section className="py-10 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 sm:p-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <span className="text-sm text-[#798daf] font-syro-primary">Loading calendar...</span>
                </div>
              }
            >
              <LiturgyCalendarClient
                initialItems={initialItems}
                initialYear={year}
                initialMonth={month}
                initialView={initialView}
                initialDate={initialDate}
                initialLng={initialLng}
                configured={configured}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* What's in the Calendar */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            What&apos;s in the Calendar
          </h3>
          <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto mb-10">
            The liturgical calendar guides our worship throughout the year
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Feast Days</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Major and minor feasts throughout the liturgical year
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Fasting Periods</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Great Lent, Three Days Lent, and other fasting seasons
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Daily Prayers</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Morning and evening prayer times and special services
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Special Days</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Commemorations, parish feasts, and special observances
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Liturgical Seasons */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            The Liturgical Year
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-l-4 border-syro-red">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">Koodosh Eetho (Sanctification)</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Beginning of the church year, celebrated on or after October 30th
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-l-4 border-syro-red">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">Christmas Season</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Yeldho (Incarnation) and related feasts celebrating Christ&apos;s birth
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-l-4 border-syro-red">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">Baptism of Our Lord (Danaha)</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                January 6th - Epiphany/Theophany, blessing of water
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-l-4 border-syro-red">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">Great Lent</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                50 days of fasting and spiritual preparation for Easter
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-l-4 border-syro-red">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">Kyomtho (Easter)</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Resurrection Sunday and the 50-day Easter season
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-l-4 border-syro-red">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">Pentecost</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Descent of the Holy Spirit, 50 days after Easter
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Related Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/mosc-redesign/lectionary"
              className="bg-white rounded-lg p-6 shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-2 group-hover:text-syro-red transition-all duration-300">
                Lectionary
              </h3>
              <p className="font-syro-primary text-sm text-syro-dark-gray">
                Scripture readings for each liturgical period
              </p>
            </Link>
            <Link
              href="/mosc-redesign/downloads/kalpana"
              className="bg-white rounded-lg p-6 shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-2 group-hover:text-syro-red transition-all duration-300">
                Kalpana
              </h3>
              <p className="font-syro-primary text-sm text-syro-dark-gray">
                Download the annual church calendar and directory
              </p>
            </Link>
            <Link
              href="/mosc-redesign/the-church/church-calendar"
              className="bg-white rounded-lg p-6 shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-2 group-hover:text-syro-red transition-all duration-300">
                Church Calendar Info
              </h3>
              <p className="font-syro-primary text-sm text-syro-dark-gray">
                Learn about the liturgical calendar structure
              </p>
            </Link>
          </div>
          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
