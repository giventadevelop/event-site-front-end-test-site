import React from 'react';
import Header from '../../components/ui/Header';
import SectionHeader from './components/SectionHeader';
import StageShowBanner from './components/StageShowBanner';
import SponsorCard from './components/SponsorCard';
import Button from '../../components/ui/Button';

const SponsorDisplaySection = () => {
  // Mock event data
  const stageShowEvent = {
    type: "STAGE SHOW",
    title: "Cultural Extravaganza 2025",
    date: "21 September 2025",
    venue: "IKCC Knanaya Community Center",
    address: "400 Willow Grv Rd, Stony Point, NY 10980",
    image: "https://images.unsplash.com/photo-1580296071217-004f36a0cf26",
    imageAlt: "Colorful stage performance with traditional dancers in vibrant costumes under bright stage lights",
    performers: ["Traditional Dance", "Cultural Music", "Folk Arts", "Community Performances"]
  };

  // Mock sponsors data
  const sponsors = [
  {
    id: 1,
    name: "Kerala Tourism Development Corporation",
    level: "Title Sponsor",
    tagline: "Explore Gods Own Country",
    phone: "+91-471-2321132",
    email: "contact@ktdc.com",
    website: "www.ktdc.com",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1792893c8-1762723854157.png",
    logoAlt: "Kerala Tourism logo featuring green palm trees and backwaters landscape"
  },
  {
    id: 2,
    name: "Kerala State Beverages Corporation",
    level: "Silver Sponsor",
    tagline: "Quality in Every Drop",
    phone: "+91-471-2321234",
    email: "info@ksbc.kerala.gov.in",
    website: "www.ksbc.kerala.gov.in",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_10c86c28c-1762723851029.png",
    logoAlt: "Modern beverage company logo with blue and silver corporate branding"
  }];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {/* Section Header */}
        <SectionHeader
          title="Our Sponsors"
          subtitle="We are grateful to our valued sponsors who make this event possible"
          iconName="Building2" />

        
        {/* Stage Show Banner */}
        <StageShowBanner event={stageShowEvent} />
        
        {/* Sponsors Grid */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sponsors?.map((sponsor) =>
            <SponsorCard key={sponsor?.id} sponsor={sponsor} />
            )}
          </div>
        </div>
        
        {/* View More Section */}
        <div className="text-center">
          <div className="bg-muted/50 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Interested in Sponsoring?
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Join our community of valued sponsors and showcase your brand to thousands of attendees.
            </p>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              className="mb-4">

              Become a Sponsor
            </Button>
            <div className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                iconName="ChevronDown"
                iconPosition="right">

                View More Sponsors
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default SponsorDisplaySection;