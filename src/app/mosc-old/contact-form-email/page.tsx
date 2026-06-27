import React from 'react';
import type { Metadata } from 'next';
import ContactForm from '../email/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Malankara Orthodox Syrian Church. Send us your questions, feedback, or prayer requests.',
};

export default function ContactFormEmailPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <svg
                className="w-10 h-10 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-4">
              Contact Us
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              We would love to hear from you. Please fill out the form below and we will get back to you as soon as
              possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Form */}
          <div className="bg-card rounded-lg sacred-shadow p-8 md:p-12">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-heading font-semibold text-2xl text-foreground">Send us a Message</h2>
                <p className="font-body text-sm text-muted-foreground">
                  Fill out the form below and we&apos;ll respond promptly
                </p>
              </div>
            </div>

            <ContactForm />
          </div>

          {/* Additional Contact Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Email Address</h3>
                  <a
                    href="mailto:info@mosc.in"
                    className="font-body text-primary hover:underline reverent-transition"
                  >
                    info@mosc.in
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Phone Number</h3>
                  <a
                    href="tel:+914812300700"
                    className="font-body text-primary hover:underline reverent-transition"
                  >
                    +91-481-2300-700
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="mt-8 bg-card rounded-lg sacred-shadow p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Visit Us</h3>
                <address className="font-body text-muted-foreground not-italic leading-relaxed">
                  Malankara Orthodox Church
                  <br />
                  Catholicate Palace
                  <br />
                  Devalokam P.O., (Via) Muttambalam
                  <br />
                  Kottayam – 686 004
                  <br />
                  Kerala, India
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


