import React from 'react';
import { Metadata } from 'next';
import MoscRedesignHeader from '@/components/mosc-redesign/MoscRedesignHeader';
import MoscRedesignFooter from '@/components/mosc-redesign/MoscRedesignFooter';
import SyroStaticAssets from './components/SyroStaticAssets';
import '@/styles/syro-malabar.css';
import '@/styles/syro-news-articles.css';
import '@/styles/mosc-redesign-shell.css';

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
    <div className="mosc-redesign-subpage-shell syro-layout min-h-screen flex flex-col bg-parchment font-dm-sans text-warmGray-dark antialiased">
      <SyroStaticAssets />
      <MoscRedesignHeader />

      <main id="mainContent" className="syro-main flex-1 min-w-0 overflow-x-hidden bg-parchment">
        {children}
      </main>

      <MoscRedesignFooter />
    </div>
  );
}
