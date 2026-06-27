import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'The Orthodox Theological Seminary (Old Seminary) | MOSC',
  description: 'The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ram...',
};

const TheOrthodoxTheologicalSeminaryPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="The Orthodox Theological Seminary (Old Seminary)">📚</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Orthodox Theological Seminary (Old Seminary)
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ramban Ittoop, a priest-monk of the Malankara Orthodox Syrian Church.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                  About Orthodox Theological Seminary
                </h2>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                  <p>The first Orthodox Christian school of theology in Asia, the Orthodox Seminary, was founded in 1815 at Kottayam, in the state of Kerala (ancient Malabar) by Ramban Ittoop, a priest-monk of the Malankara Orthodox Syrian Church. The learned monk from Kunnamkulam was carrying out with singular courage a major decision of the church made at Kandanadu in 1809 to start two schools of theology (Padithaveedu), one in the North and the other in the South of Kerala.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-primary text-xl" role="img" aria-label="Location">📍</span>
                    <div>
                      <h4 className="font-heading font-medium text-foreground">Address</h4>
                      <p className="font-body text-muted-foreground text-sm">Orthodox Theological Seminary</p>
                      <p className="font-body text-muted-foreground text-sm">P. B. No. 98, Kottayam – 686 001</p>
                      <p className="font-body text-muted-foreground text-sm">Kerala, India</p>
                    </div>
                  </div>


                    <div className="flex items-start space-x-3">
                      <span className="text-primary text-xl" role="img" aria-label="Phone">📞</span>
                      <div>
                        <h4 className="font-heading font-medium text-foreground">Phone</h4>
                        <p className="font-body text-muted-foreground text-sm">2566526, 2568083, 2568500</p>
                        <p className="font-body text-muted-foreground text-sm">Principal: 2568046</p>
                        <p className="font-body text-muted-foreground text-sm">Fax: 91-0481-2302571</p>
                      </div>
                    </div>


                  <div className="space-y-3">

                    <div className="flex items-start space-x-3">
                      <span className="text-primary text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-heading font-medium text-foreground">Office</h4>
                        <a href="mailto:info@ots.edu.in" className="font-body text-primary hover:text-primary/80 text-sm reverent-transition">info@ots.edu.in</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-primary text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-heading font-medium text-foreground">Principal</h4>
                        <a href="mailto:principal@ots.edu.in" className="font-body text-primary hover:text-primary/80 text-sm reverent-transition">principal@ots.edu.in</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-primary text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-heading font-medium text-foreground">Webmaster</h4>
                        <a href="mailto:admin@ots.edu.in" className="font-body text-primary hover:text-primary/80 text-sm reverent-transition">admin@ots.edu.in</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-primary text-xl" role="img" aria-label="Website">🌐</span>
                    <div>
                      <h4 className="font-heading font-medium text-foreground">Website</h4>
                      <a 
                        href="http://www.ots.edu.in" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-body text-primary hover:text-primary/80 text-sm reverent-transition"
                      >
                        www.ots.edu.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Related Pages
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/mosc-old/theological-seminaries" 
                    className="block text-primary hover:text-primary/80 font-medium reverent-transition"
                  >
                    ← All Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc-old/institutions" 
                    className="block text-primary hover:text-primary/80 font-medium reverent-transition"
                  >
                    Church Institutions
                  </Link>
                  <Link 
                    href="/mosc-old/training" 
                    className="block text-primary hover:text-primary/80 font-medium reverent-transition"
                  >
                    Training Programs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Interested in Theological Education?
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn more about theological programs and admission requirements at our seminaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mosc-old/theological-seminaries"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 reverent-transition"
            >
              Explore All Seminaries
            </Link>
            <Link
              href="/mosc-old"
              className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground border border-border rounded-lg hover:bg-muted reverent-transition"
            >
              Learn About MOSC
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheOrthodoxTheologicalSeminaryPage;