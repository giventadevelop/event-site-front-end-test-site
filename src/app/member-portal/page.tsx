import { Metadata } from 'next';
import MemberPortalClient from './MemberPortalClient';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import subpageStyles from '@/components/SubpageHomeDesign.module.css';

export const metadata: Metadata = {
  title: 'Members',
  description: 'Member portal – manage your membership and access member-only content.',
};

export default function MemberPortalPage() {
  return (
    <>
      <SubpageHomeDesignBackground bodyClass="member-portal-page-background" />
      <div
        className={`${subpageStyles.subpageRoot} home-page-layout relative z-[1] min-h-screen w-full overflow-x-hidden`}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: '120px', paddingBottom: '2rem' }}
        >
          <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
            <MemberPortalClient homepageDesign />
          </div>
        </div>
      </div>
    </>
  );
}
