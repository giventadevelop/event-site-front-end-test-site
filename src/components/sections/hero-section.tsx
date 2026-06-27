"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[900px] flex flex-col text-white overflow-hidden bg-[#2C3E50]">
      {/* Background Image */}
      <Image
        src="/images/charity-theme/hero_background.jpg"
        alt="A close-up of a person's face, representing the focus of the charity."
        fill
        className="z-0 object-cover"
        priority
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2c3e50]/90 via-[#2c3e50]/70 to-[#2c3e50]/40 z-10" />

      {/* PNG Texture Overlay */}
      <div
        className="absolute inset-0 z-10 bg-no-repeat bg-top"
        style={{
          backgroundImage: "url('/images/charity-theme/hero_background.jpg')",
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 flex-grow flex items-center justify-center">
        <div className="container text-center px-4">
          <h1 className="font-display text-white text-[90px] md:text-[120px] leading-none font-bold">
            Charity for <span className="font-script text-[#F9C23C]">people</span>
          </h1>
          <h2 className="mt-4 text-2xl md:text-4xl font-bold text-white">
            Give Hope to the world
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-200">
            Halosaur duckbilled barracudina, goosefish gar pleco, chum salmon armoured catfish gudgeon sawfish whitefish orbicular batfish paradise!
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-8 py-3 h-auto text-base font-medium">
              <Link href="#">Discover</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black rounded-lg px-8 py-3 h-auto text-base font-medium transition-all duration-300">
              <Link href="#about">Scroll Down</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-20 bg-white text-foreground">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-y-6 gap-x-4">
          <a href="https://www.youtube.com/embed/_sI_Ps7JSEk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <Play className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="font-medium group-hover:text-primary transition-colors text-sm tracking-wider uppercase">Watch Video</span>
          </a>

          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">Call us today!</p>
            <a href="tel:+18005726149" className="font-bold text-lg text-foreground hover:text-primary transition-colors">1-800 572 61 49</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

