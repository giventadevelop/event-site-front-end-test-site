"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Project {
  image: string;
  category: string;
  verticalText: string;
  title: string;
  description: string;
  href: string;
}

const projectsData: Project[] = [
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/port-3-480x731.jpg",
    category: "Water",
    verticalText: "Water",
    title: "Water delivery in hot places",
    description: "Pink salmon cherry salmon bonefish trahira bristlenose catfish, longnose...",
    href: "https://demo.artureanec.com/themes/philantrop/project/water-delivery-in-hot-places/",
  },
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/port-2-480x731.jpg",
    category: "Education",
    verticalText: "Education",
    title: "Help with education",
    description: "Pink salmon cherry salmon bonefish trahira bristlenose catfish, longnose...",
    href: "https://demo.artureanec.com/themes/philantrop/project/help-with-education/",
  },
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/port-4-480x731.jpg",
    category: "Donate",
    verticalText: "Donate",
    title: "Evacuation of people from Kyiv",
    description: "Pink salmon cherry salmon bonefish trahira bristlenose catfish, longnose...",
    href: "https://demo.artureanec.com/themes/philantrop/project/evacuation-of-people-from-kyiv-2/",
  },
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/port-5-480x731.jpg",
    category: "Trust",
    verticalText: "Trust",
    title: "The story of happy children",
    description: "Pink salmon cherry salmon bonefish trahira bristlenose catfish, longnose...",
    href: "https://demo.artureanec.com/themes/philantrop/project/the-story-of-happy-children/",
  },
    {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/port-1-480x731.jpg",
    category: "Helping",
    verticalText: "Helping",
    title: "Helping in village houses",
    description: "Pink salmon cherry salmon bonefish trahira bristlenose catfish, longnose...",
    href: "https://demo.artureanec.com/themes/philantrop/project/helping-in-village-houses/",
  },
  {
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/portfolio-480x731.jpg",
    category: "Building",
    verticalText: "Building",
    title: "Building school in Africa",
    description: "Pink salmon cherry salmon bonefish trahira bristlenose catfish, longnose...",
    href: "https://demo.artureanec.com/themes/philantrop/project/building-school-in-africa-2/",
  },
];

const ProjectCard = ({ project }: { project: Project }) => (
  <div className="group relative flex-shrink-0 w-[400px] h-[600px] overflow-hidden rounded-2xl">
    <Image
      src={project.image}
      alt={project.title}
      fill
      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300"></div>
    
    <div className="absolute inset-0 flex items-center justify-end p-6 pointer-events-none">
      <span
        className="text-white font-bold text-8xl uppercase opacity-20 group-hover:opacity-40 transition-opacity duration-300"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        {project.verticalText}
      </span>
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transition-all duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
      <span className="text-primary font-semibold text-sm uppercase tracking-wider">{project.category}</span>
      <h5 className="text-2xl font-semibold mt-2 mb-3">{project.title}</h5>
      <p className="text-muted-foreground text-[16px] leading-[1.6] text-gray-300 mb-4">{project.description}</p>
      <a href={project.href} className="text-white font-semibold flex items-center gap-2 hover:text-primary transition-colors">
        Explore more
        <ArrowRight size={16} />
      </a>
    </div>
  </div>
);

const ProjectsCarousel = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 430; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-[#2C3E50] text-white py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-8 md:mb-0">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Projects</span>
            <h3 className="text-4xl font-bold mt-2">
              We did it for many people <br /> around the world
            </h3>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleScroll('left')}
              className="w-14 h-14 rounded-full border border-gray-600 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors duration-300"
              aria-label="Scroll left"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-14 h-14 rounded-full border border-gray-600 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors duration-300"
              aria-label="Scroll right"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide pl-4 sm:pl-6 lg:pl-8 xl:pl-[calc((100vw-1200px)/2+32px)]"
      >
        {projectsData.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
        {/* Repeating for infinite feel */}
        {projectsData.slice(0, 2).map((project, index) => (
          <ProjectCard key={`clone-${index}`} project={project} />
        ))}
      </div>
    </section>
  );
};

export default ProjectsCarousel;