"use client";

import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Maria Rodriguez",
    role: "Volunteer",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_14.jpg",
    content: "Volunteering with this foundation has been one of the most rewarding experiences of my life. The impact we make in communities is truly inspiring.",
    rating: 5
  },
  {
    id: 2,
    name: "James Wilson",
    role: "Donor",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_15.jpg",
    content: "I've been supporting this foundation for years and I'm amazed by the transparency and effectiveness of their programs. Every dollar truly makes a difference.",
    rating: 5
  },
  {
    id: 3,
    name: "Lisa Chen",
    role: "Community Partner",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_16.jpg",
    content: "Working alongside this foundation has transformed our community. Their dedication to sustainable development is remarkable.",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What People Say
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from our volunteers, donors, and community partners about their experiences working with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-8 h-8 text-primary/30" />
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-primary rounded-lg p-8 max-w-2xl mx-auto text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Make a Difference?
            </h3>
            <p className="mb-6 opacity-90">
              Join our community of volunteers and donors who are making a positive impact around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/volunteer"
                className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Become a Volunteer
              </a>
              <a
                href="/donate"
                className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-colors"
              >
                Make a Donation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

