import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Theological Seminaries | MOSC',
  description: 'Theological seminaries of the Malankara Orthodox Syrian Church providing theological education and training for clergy and laity.',
  keywords: ['Theological Seminaries', 'Orthodox Theology', 'MOSC Education', 'Seminary Training'],
};

const TheologicalSeminariesPage = () => {
  const seminaries = [
    {
      slug: 'the-orthodox-theological-seminary',
      title: 'The Orthodox Theological Seminary',
      subtitle: 'Old Seminary, Kottayam',
      description: 'The first Orthodox Christian school of theology in Asia, founded in 1815 at Kottayam by Ramban Ittoop, a priest-monk of the Malankara Orthodox Syrian Church.',
      icon: '📚',
      location: 'Kottayam, Kerala',
      established: '1815'
    },
    {
      slug: 'st-thomas-orthodox-theological-seminary-nagpur',
      title: 'St. Thomas Orthodox Theological Seminary',
      subtitle: 'STOTS, Nagpur',
      description: 'A growing centre of the Orthodox Church in Central and North India, creating a new vision about the mission of the Church in a multi-lingual and multi-religious context.',
      icon: '⛪',
      location: 'Nagpur, India',
      established: 'Modern Era'
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted min-h-[400px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Theological Seminaries">🎓</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-4">
              Theological Seminaries
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Centers of theological excellence providing education and formation for the spiritual leadership of the Malankara Orthodox Syrian Church.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Centers of Learning and Formation
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Our theological seminaries have been serving the Church for generations, preparing clergy and lay leaders with deep theological knowledge, spiritual formation, and pastoral skills to serve God's people with wisdom and compassion.
            </p>
          </div>

          {/* Seminaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {seminaries.map((seminary) => (
              <Link
                key={seminary.slug}
                href={`/mosc-old/theological-seminaries/${seminary.slug}`}
                className="group"
              >
                <div className="bg-background rounded-lg sacred-shadow p-8 h-full reverent-hover group-hover:shadow-xl transition-all duration-300">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 reverent-transition">
                    <span className="text-4xl" role="img" aria-label={seminary.title}>{seminary.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading font-semibold text-2xl text-foreground mb-2 group-hover:text-primary reverent-transition">
                    {seminary.title}
                  </h3>
                  <p className="font-body text-sm text-primary mb-3">
                    {seminary.subtitle}
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    {seminary.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <span className="text-primary" role="img" aria-label="Location">📍</span>
                      <span className="font-caption text-sm text-muted-foreground">{seminary.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-primary" role="img" aria-label="Established">📅</span>
                      <span className="font-caption text-sm text-muted-foreground">Est. {seminary.established}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-6 flex items-center text-primary group-hover:translate-x-2 reverent-transition">
                    <span className="font-medium">Learn More</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground text-center mb-12">
            What We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <span className="text-3xl" role="img" aria-label="Academic Excellence">📖</span>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Academic Excellence
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Rigorous theological education grounded in Orthodox Christian tradition and contemporary scholarship.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <span className="text-3xl" role="img" aria-label="Spiritual Formation">🕊️</span>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Spiritual Formation
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Nurturing deep spiritual life through prayer, worship, and participation in the sacramental life of the Church.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <span className="text-3xl" role="img" aria-label="Pastoral Training">👥</span>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Pastoral Training
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Practical preparation for ministry, including counseling, liturgy, and community leadership skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Explore Our Seminaries
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn more about our theological programs, admission requirements, and how you can pursue theological education at our seminaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mosc-old/institutions"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 reverent-transition"
            >
              Church Institutions
            </Link>
            <Link
              href="/mosc-old"
              className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground border border-border rounded-lg hover:bg-muted reverent-transition"
            >
              Back to MOSC Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheologicalSeminariesPage;

