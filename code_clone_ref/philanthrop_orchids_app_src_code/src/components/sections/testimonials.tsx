"use client";

import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    text: "Halosaur duckbilled barracudina, goosefish gar pleco, chum salmon armoured catfish gudgeon sawfish whitefish orbicular batfish mummichog paradise fish! Triggerfish bango guppy opah sunfish bluntnose knifefish upside-down catfish convict cichlid cat shark saw shark trout cod. Pink salmon cherry salmon combtail gourami frigate mackerel snake.",
    author: "Samanta Edwards",
    role: "Pensioneer",
    image:
      "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/testimonials_photo_2.jpg",
  },
  {
    text: "A second testimonial to demonstrate the carousel functionality. This charity has truly made a difference in our community with their dedicated efforts and transparent operations. It is inspiring to see such commitment.",
    author: "John Doe",
    role: "Supporter",
    image:
      "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/testimonials_photo_2.jpg",
  },
];

const QuoteIcon = () => (
  <svg
    width="60"
    height="42"
    viewBox="0 0 60 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-6 text-yellow-accent"
  >
    <path
      d="M19.9688 0C15.8594 0.234375 12.1875 1.52344 8.95312 3.86719C5.71875 6.21094 3.4375 9.17969 2.10938 12.7734C0.78125 16.3672 0.109375 20.2188 0.109375 24.3281C0.109375 27.5625 0.539062 30.5625 1.40625 33.3281C2.27344 36.0938 3.53906 38.4844 5.21094 40.5L9.65625 35.8594C8.53125 34.2891 7.71875 32.7188 7.21875 31.1484C6.71875 29.5781 6.46875 27.9375 6.46875 26.2188C6.46875 20.3672 8.42188 15.3281 12.3281 11.0938C16.2344 6.85938 20.9219 4.74219 26.3906 4.74219V0H19.9688ZM53.5312 0C49.4219 0.234375 45.75 1.52344 42.5156 3.86719C39.2812 6.21094 36.9688 9.17969 35.6406 12.7734C34.3125 16.3672 33.6406 20.2188 33.6406 24.3281C33.6406 27.5625 34.0703 30.5625 34.9375 33.3281C35.8047 36.0938 37.0703 38.4844 38.7422 40.5L43.1875 35.8594C42.0625 34.2891 41.25 32.7188 40.75 31.1484C40.25 29.5781 40 27.9375 40 26.2188C40 20.3672 41.9531 15.3281 45.8594 11.0938C49.7656 6.85938 54.4531 4.74219 59.9219 4.74219V0H53.5312Z"
      fill="currentColor"
    />
  </svg>
);

const TestimonialsSection = () => {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-16 items-center">
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative w-[345px] h-[345px]">
              <svg width="100" height="100" viewBox="0 0 100 100" className="absolute z-0" style={{ bottom: '0px', right: '40px', transform: 'rotate(-45deg)' }}>
                <path d="M 0 100 L 100 0 L 100 100 Z" fill="white" />
                <path d="M 0 100 L 100 0" stroke="#FF6B35" strokeWidth="2.5" fill="none" />
              </svg>
              <div className="relative z-10 w-full h-full rounded-full border-2 border-primary p-2 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                <div className="w-full h-full rounded-full border border-dashed border-gray-300 p-2">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={testimonials[0].image}
                      alt={testimonials[0].author}
                      width={345}
                      height={345}
                      className="w-full h-full object-cover filter grayscale"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-sm text-medium-gray tracking-[0.2em] uppercase mb-4">
              Testimonials
            </p>
            <h3 className="text-[36px] font-bold text-foreground leading-tight mb-8">
              What people say about our charity company
            </h3>

            <Carousel opts={{ loop: true }} className="relative">
              <CarouselContent>
                {testimonials.map((item, index) => (
                  <CarouselItem key={index}>
                    <div className="pr-4">
                      <QuoteIcon />
                      <p className="text-lg text-medium-gray leading-relaxed mb-6">
                        {item.text}
                      </p>
                      <p className="text-base font-bold text-foreground">
                        {item.author} / <span className="text-medium-gray font-normal">{item.role}</span>
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center gap-4 mt-8">
                <CarouselPrevious className="relative static translate-x-0 translate-y-0 w-12 h-12 rounded-full border border-gray-300 bg-white text-foreground hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </CarouselPrevious>
                <CarouselNext className="relative static translate-x-0 translate-y-0 w-12 h-12 rounded-full border border-gray-300 bg-white text-foreground hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </CarouselNext>
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;