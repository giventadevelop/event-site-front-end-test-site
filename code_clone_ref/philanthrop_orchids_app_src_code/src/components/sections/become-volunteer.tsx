import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const BecomeVolunteerSection = () => {
  return (
    <section className="bg-background py-24">
      <div className="container">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          {/* Left Column: Titles */}
          <div className="w-full lg:w-1/2">
            <div className="relative">
              {/* Background "Become" (for shadow effect) */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[10px] top-[10px] select-none font-black leading-[0.8] text-[#0d4675] text-[18vw] lg:text-[200px]"
              >
                Become
              </span>

              {/* Foreground "Become" with gradient to approximate the original design */}
              <h2
                className="relative bg-gradient-to-r from-cyan-accent from-25% via-blue-accent to-foreground bg-clip-text font-black leading-[0.8] text-transparent text-[18vw] lg:text-[200px]"
              >
                Become
              </h2>

              <h3 className="-mt-3 ml-1 font-black leading-none text-foreground text-5xl md:-mt-5 md:text-[60px]">
                a volunteer
              </h3>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="flex w-full flex-col items-start gap-8 lg:w-1/2">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Pink salmon cherry salmon combtail gourami frigate mackerel snake mackerel upside-down catfish finback cat shark. Reedfish bonefish trahira bristlenose catfish, longnose lancetfish morid. Longnose lancetfish morid. Wahoo mora deep sea smelt cat shark
            </p>
            <a
              href="https://demo.artureanec.com/themes/philantrop/become-a-volunteer/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-yellow-accent px-8 font-medium text-foreground transition-shadow hover:shadow-lg"
            >
              <span>Join us</span>
              <ArrowUpRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeVolunteerSection;