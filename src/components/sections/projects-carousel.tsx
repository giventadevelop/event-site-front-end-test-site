"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, MapPin, Users, Calendar } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: "Clean Water Initiative",
    location: "Rural Kenya",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_29.jpg",
    description: "Installing water wells and purification systems to provide clean drinking water to 5,000 people.",
    volunteers: 25,
    duration: "6 months",
    progress: 75,
    category: "Environment"
  },
  {
    id: 2,
    title: "School Building Project",
    location: "Nepal",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_30.jpg",
    description: "Constructing a new school building to serve 300 children in a remote mountain village.",
    volunteers: 40,
    duration: "12 months",
    progress: 60,
    category: "Education"
  },
  {
    id: 3,
    title: "Medical Clinic Setup",
    location: "Uganda",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_31.jpg",
    description: "Establishing a medical clinic to provide healthcare services to underserved communities.",
    volunteers: 30,
    duration: "8 months",
    progress: 45,
    category: "Healthcare"
  }
];

const ProjectsCarousel = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Our Active Projects
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See the real impact of your support through our ongoing projects around the world.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  {project.category}
                </div>
                <div className="absolute top-4 right-4 bg-white text-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {project.progress}%
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Project Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{project.volunteers} volunteers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{project.duration}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/projects/${project.id}`}>Learn More</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Projects */}
        <div className="text-center mb-16">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>

        {/* Get Involved CTA */}
        <div className="text-center">
          <div className="bg-primary rounded-2xl p-12 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Get Involved in Our Projects
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Whether you want to volunteer, donate, or simply learn more, there are many ways to support our mission and make a real difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link href="/volunteer">Volunteer</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link href="/donate">Donate</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsCarousel;

