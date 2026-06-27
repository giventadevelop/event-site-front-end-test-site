import React from 'react';
import { Droplet, Home, Lightbulb } from 'lucide-react';

const TreeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21V11" />
    <path d="M18 11L12 3L6 11H18Z" />
  </svg>
);

interface Service {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: React.ReactNode;
  color: string;
}

const servicesContent: Service[] = [
  {
    icon: Droplet,
    title: "Water delivery",
    description: (
      <>
        Starry flounder <br />
        sablefish <br />
        yellowtail barracuda <br />
        long-finned
      </>
    ),
    color: "text-blue-accent",
  },
  {
    icon: TreeIcon,
    title: "Environment",
    description: (
      <>
        Starry flounder <br />
        sablefish <br />
        yellowtail barracuda <br />
        long-finned
      </>
    ),
    color: "text-green-accent",
  },
  {
    icon: Home,
    title: "Build and repair",
    description: (
      <>
        Starry flounder <br />
        sablefish <br />
        yellowtail barracuda <br />
        long-finned
      </>
    ),
    color: "text-primary",
  },
  {
    icon: Lightbulb,
    title: "Education",
    description: (
      <>
        Starry flounder <br />
        sablefish <br />
        yellowtail barracuda <br />
        long-finned
      </>
    ),
    color: "text-yellow-accent",
  },
];

const ServiceCard = ({ icon: Icon, title, description, color}: Service) => (
  <div className="flex items-start gap-5">
    <div className="flex-shrink-0">
      <Icon className={`w-12 h-12 ${color}`} strokeWidth={1.2} />
    </div>
    <div>
      <h4 className="text-xl font-semibold text-foreground">{title}</h4>
      <p className="mt-2 text-base text-medium-gray leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const WhatWeDo = () => {
  return (
    <section className="bg-background py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-sm font-semibold uppercase tracking-widest text-medium-gray">
                What we do
              </p>
            </div>
            <h2 className="text-5xl font-bold text-foreground leading-tight">
              Various things we
              <br />
              help in whole
              <br />
              world
            </h2>
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {servicesContent.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;