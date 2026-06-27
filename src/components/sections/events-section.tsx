"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const events = [
  {
    id: 1,
    title: "Annual Charity Gala",
    date: "December 15, 2024",
    time: "6:00 PM - 11:00 PM",
    location: "Grand Hotel, New York",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_26.jpg",
    description: "Join us for an evening of inspiration, entertainment, and giving. All proceeds support our education programs.",
    attendees: 200,
    price: "$150"
  },
  {
    id: 2,
    title: "Volunteer Training Workshop",
    date: "January 20, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Community Center, Los Angeles",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_27.jpg",
    description: "Learn essential skills and best practices for effective community service and volunteer work.",
    attendees: 50,
    price: "Free"
  },
  {
    id: 3,
    title: "Fundraising Walkathon",
    date: "March 8, 2025",
    time: "8:00 AM - 2:00 PM",
    location: "Central Park, New York",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_28.jpg",
    description: "Walk with us to raise awareness and funds for clean water projects in developing communities.",
    attendees: 500,
    price: "$25"
  }
];

const EventsSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Upcoming Events
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us at our upcoming events to learn more about our mission, meet our team, and contribute to making a difference.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  {event.price}
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {event.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/events/${event.id}`}>Register Now</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Events */}
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Link href="/events">View All Events</Link>
          </Button>
        </div>

        {/* Host an Event CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gray-50 rounded-2xl p-12 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Want to Host an Event?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Are you interested in organizing a fundraising event or awareness campaign? We'd love to help you make it a success!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/host-event">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Link href="/event-guidelines">Event Guidelines</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;

