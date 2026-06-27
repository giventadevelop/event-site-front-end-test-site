import React from 'react';
import DsDemoDashboard from '../components/DsDemoDashboard';

export const metadata = {
  title: 'Dashboard',
  description: 'Malankara Orthodox Syrian Church dashboard - analytics, recent activity, and quick actions.',
};

export default function SyroDsDemoDashboardPage() {
  return (
    <div className="bg-syro-bg-gray min-h-screen font-syro-primary">
      <DsDemoDashboard />
    </div>
  );
}
