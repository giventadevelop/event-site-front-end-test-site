import React from 'react';
import { Metadata } from 'next';
import SyroHeader from './components/SyroHeader';
import SyroFooter from './components/SyroFooter';
import SyroStaticAssets from './components/SyroStaticAssets';
import '@/styles/syro-malabar.css';
import '@/styles/syro-news-articles.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Malankara Orthodox Syrian Church',
    default: 'Malankara Orthodox Syrian Church',
  },
  description: 'Official website of the Malankara Orthodox Syrian Church - Saint Thomas Christian Community',
  keywords: ['Malankara Orthodox Syrian Church', 'Catholic Christianity', 'Saint Thomas', 'Indian Catholic Church'],
  openGraph: {
    title: 'Malankara Orthodox Syrian Church',
    description: 'Official website of the Malankara Orthodox Syrian Church - Saint Thomas Christian Community',
    type: 'website',
  },
};

interface SyroLayoutProps {
  children: React.ReactNode;
}

export default function SyroLayout({ children }: SyroLayoutProps) {
  return (
    <div className="syro-layout min-h-screen flex flex-col">
      <SyroStaticAssets />
      <SyroHeader />

      <main id="mainContent" className="syro-main flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>

      <SyroFooter />
    </div>
  );
}
