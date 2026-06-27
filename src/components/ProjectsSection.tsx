'use client';

import React from 'react';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';

const projects = [
  {
    id: 1,
    title: 'Helping in village houses',
    category: 'Building',
    description: '',
    color: '#37E085'
  },
  {
    id: 2,
    title: 'Building schools',
    category: 'Building',
    description: '',
    color: '#FF8159'
  },
  {
    id: 3,
    title: 'Water delivery in hot places',
    category: 'Water',
    description: '',
    color: '#34BDC6'
  },
  {
    id: 4,
    title: 'Help with education',
    category: 'Education',
    description: '',
    color: '#FFCE59'
  }
];

const ProjectsSection: React.FC = () => {
  return (
    <div className="home-projects-section py-24 bg-gray-800 text-white relative overflow-hidden">

      <HomeSectionRail eyebrow="Projects" containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <HomeSectionTitle className="text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-4xl mx-auto">
            Our latest projects around the world
          </HomeSectionTitle>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover:-translate-y-2 hover:bg-white/15 transition-all duration-300 ease-in-out"
            >
              <div
                className="w-3 h-3 rounded-full mb-4"
                style={{ backgroundColor: project.color }}
              ></div>

              <h3 className="text-lg font-semibold mb-3">
                {project.title}
              </h3>

              <div className="mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${project.color}20`,
                    color: project.color
                  }}
                >
                  {project.category}
                </span>
              </div>

              <p className="text-white/80 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </HomeSectionRail>
    </div>
  );
};

export default ProjectsSection;