"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Executive Director",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_9.jpg",
    bio: "Leading our foundation with over 15 years of experience in nonprofit management.",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Program Manager",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_10.jpg",
    bio: "Oversees all our community programs and ensures their successful implementation.",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Volunteer Coordinator",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_11.jpg",
    bio: "Manages our volunteer network and coordinates community outreach efforts.",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Fundraising Director",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_12.jpg",
    bio: "Develops strategic partnerships and fundraising initiatives to support our mission.",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  }
];

const TeamSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Meet Our Team
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our dedicated team of professionals and volunteers work tirelessly to make a positive impact in communities around the world.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="text-center group">
              {/* Member Image */}
              <div className="relative mb-6 overflow-hidden rounded-lg">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={400}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Social Links Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-4">
                    <Link href={member.social.facebook} className="text-white hover:text-primary transition-colors">
                      <Facebook className="w-6 h-6" />
                    </Link>
                    <Link href={member.social.twitter} className="text-white hover:text-primary transition-colors">
                      <Twitter className="w-6 h-6" />
                    </Link>
                    <Link href={member.social.linkedin} className="text-white hover:text-primary transition-colors">
                      <Linkedin className="w-6 h-6" />
                    </Link>
                    <Link href={member.social.instagram} className="text-white hover:text-primary transition-colors">
                      <Instagram className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {member.name}
              </h3>
              <p className="text-primary font-medium mb-3">
                {member.role}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Want to Join Our Team?
            </h3>
            <p className="text-muted-foreground mb-6">
              We're always looking for passionate individuals who want to make a difference. Join us in our mission to create positive change.
            </p>
            <Link
              href="/volunteer"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

