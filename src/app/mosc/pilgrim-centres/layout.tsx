import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Pilgrim Centres - MOSC',
    default: 'Pilgrim Centres - MOSC',
  },
  description: 'Explore the sacred pilgrim centres and historic churches of the Malankara Orthodox Syrian Church.',
};

interface PilgrimCentresLayoutProps {
  children: React.ReactNode;
}

export default function PilgrimCentresLayout({ children }: PilgrimCentresLayoutProps) {
  return (
    <div className="mosc-layout min-h-screen bg-syro-bg-gray flex flex-col">
      <main className="mosc-main flex-1">
        {children}
      </main>
    </div>
  );
}













