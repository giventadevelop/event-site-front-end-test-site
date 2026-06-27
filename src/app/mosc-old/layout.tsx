import React from 'react';
import { Metadata } from 'next';
import MOSCHeader from './components/MOSCHeader';
import MOSCFooter from './components/MOSCFooter';
import NavigationBreadcrumb from './components/NavigationBreadcrumb';
import './mosc-globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Malankara Orthodox Syrian Church',
    default: 'Malankara Orthodox Syrian Church',
  },
  description: 'Official website of the Malankara Orthodox Syrian Church - Saint Thomas Christian Community',
  keywords: ['Malankara Orthodox Church', 'Orthodox Christianity', 'Saint Thomas', 'Indian Orthodox Church'],
  openGraph: {
    title: 'Malankara Orthodox Syrian Church',
    description: 'Official website of the Malankara Orthodox Syrian Church - Saint Thomas Christian Community',
    type: 'website',
  },
};

interface MOSCLayoutProps {
  children: React.ReactNode;
}

export default function MOSCLayout({ children }: MOSCLayoutProps) {
  return (
    <div className="mosc-layout min-h-screen bg-background flex flex-col">
      <MOSCHeader />

      <main className="mosc-main flex-1">
        <NavigationBreadcrumb />
        {children}
      </main>

      <MOSCFooter />
    </div>
  );
}
