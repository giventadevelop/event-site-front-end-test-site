import HeaderNavigation from '@/components/sections/header-navigation';
import HeroSection from '@/components/sections/hero-section';
import HeroCards from '@/components/sections/hero-cards';
import WhatWeDo from '@/components/sections/what-we-do';
import PeopleNeedHelp from '@/components/sections/people-need-help';
import CircularImagesSection from '@/components/sections/circular-images';
import AboutFoundation from '@/components/sections/about-foundation';
import CausesGrid from '@/components/sections/causes-grid';
import TeamSection from '@/components/sections/team-section';
import BecomeVolunteerSection from '@/components/sections/become-volunteer';
import ProjectsCarousel from '@/components/sections/projects-carousel';
import TestimonialsSection from '@/components/sections/testimonials';
import EventsSection from '@/components/sections/events-section';
import PartnersLogos from '@/components/sections/partners-logos';
import ChildrenCta from '@/components/sections/children-cta';
import Footer from '@/components/sections/footer';

export default function Home() {
  return (
    <main>
      <HeaderNavigation />
      <HeroSection />
      <HeroCards />
      <WhatWeDo />
      <PeopleNeedHelp />
      <CircularImagesSection />
      <AboutFoundation />
      <CausesGrid />
      <TeamSection />
      <BecomeVolunteerSection />
      <ProjectsCarousel />
      <TestimonialsSection />
      <EventsSection />
      <PartnersLogos />
      <ChildrenCta />
      <Footer />
    </main>
  );
}