import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'St. Thomas Orthodox Theological Seminary, Nagpur (STOTS) | MOSC',
  description: 'The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora popu...',
};

const StThomasOrthodoxTheologicalSeminaryNagpurPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="St. Thomas Orthodox Theological Seminary, Nagpur (STOTS)">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              St. Thomas Orthodox Theological Seminary, Nagpur (STOTS)
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora population meaningfully but also does it create a new vision about the mission of the Church in a multi-lingual and multi-religious context.
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
                  About St. Thomas Seminary, Nagpur
                </h2>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                  <p>Introduction</p>
                  <p>The St.Thomas Seminary is gradually growing as a centre of the Orthodox Church in Central and North India. Not only does it cater the needs of the diaspora population meaningfully but also does it create a new vision about the mission of the Church in a multi-lingual and multi-religious context. Moreover, the Seminary offers a stage for fruitful dialogues of Christian theologians with people of other faith affirmations. In future, women of the Orthodox Church, who wish to study theology and to reflect to the challenges of the world will find it as a place, where their ideas will be influencing the theology of the Church.</p>
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
                      <p className="font-body text-muted-foreground text-sm">St. Thomas Orthodox Theological Seminary</p>
                      <p className="font-body text-muted-foreground text-sm">Brahmani P.O., Kalmeshwar 441 501</p>
                      <p className="font-body text-muted-foreground text-sm">Nagpur, India</p>
                    </div>
                  </div>


                    <div className="flex items-start space-x-3">
                      <span className="text-primary text-xl" role="img" aria-label="Phone">📞</span>
                      <div>
                        <h4 className="font-heading font-medium text-foreground">Phone</h4>
                        <p className="font-body text-muted-foreground text-sm">07118-271696 (office), 271994 (principal), 271991 (hostel)</p>
                      </div>
                    </div>


                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-primary text-xl" role="img" aria-label="Email">✉️</span>
                      <div>
                        <h4 className="font-heading font-medium text-foreground">Email</h4>
                        <a href="mailto:nagpurseminary@rediffmail.com" className="font-body text-primary hover:text-primary/80 text-sm reverent-transition">nagpurseminary@rediffmail.com</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-primary text-xl" role="img" aria-label="Website">🌐</span>
                    <div>
                      <h4 className="font-heading font-medium text-foreground">Website</h4>
                      <a 
                        href="http://www.orthodoxseminarynagpur.in" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-body text-primary hover:text-primary/80 text-sm reverent-transition"
                      >
                        www.orthodoxseminarynagpur.in
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

export default StThomasOrthodoxTheologicalSeminaryNagpurPage;