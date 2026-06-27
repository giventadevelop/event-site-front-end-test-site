import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speeches | Malankara Orthodox Syrian Church',
  description: 'Speeches, messages, and addresses by His Holiness Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara.',
};

export default function SpeechesPage() {
  // Placeholder speeches data - this should be updated with actual content from mosc.in/speeches/
  const speeches = [
    {
      id: 'enthronement-speech-2021',
      title: 'Enthronement Address',
      date: 'October 15, 2021',
      venue: 'Catholicate Palace, Devalokam',
      occasion: 'Enthronement as the Ninth Catholicos of the East in Malankara',
      description: 'His Holiness delivered his first address as the Catholicos, emphasizing the unity of the church and the mission ahead.',
      category: 'Major Events',
    },
    {
      id: 'message-to-church-2022',
      title: 'Message to the Church Community',
      date: 'January 1, 2022',
      venue: 'Catholicate Palace, Devalokam',
      occasion: 'New Year Message',
      description: 'A message of hope, unity, and spiritual renewal for the new year, calling all faithful to strengthen their faith and service to the community.',
      category: 'Pastoral Messages',
    },
    {
      id: 'ecumenical-dialogue-2022',
      title: 'Address on Ecumenical Relations',
      date: 'May 2022',
      venue: 'Ecumenical Conference',
      occasion: 'Interfaith Dialogue',
      description: 'His Holiness speaks on the importance of unity among Christian denominations and the role of the Orthodox Church in ecumenical dialogue.',
      category: 'Ecumenical',
    },
  ];

  const categories = ['All', 'Major Events', 'Pastoral Messages', 'Ecumenical', 'Festivals', 'Special Occasions'];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Speeches
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Messages, addresses, and speeches by His Holiness Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara, sharing spiritual guidance and leadership with the faithful.
            </p>
          </div>
        </div>
      </section>

      {/* Speeches Grid Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter (if needed in future) */}
          {/* <div className="mb-8 flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-muted rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground reverent-transition"
              >
                {category}
              </button>
            ))}
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speeches.map((speech) => (
              <div
                key={speech.id}
                className="group bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition overflow-hidden border border-border flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-body font-medium rounded-full">
                      {speech.category}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="mb-3">
                    <span className="font-body text-sm text-muted-foreground">
                      {speech.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-heading font-semibold text-xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {speech.title}
                  </h2>

                  {/* Venue/Occasion */}
                  <div className="mb-4 space-y-2">
                    {speech.venue && (
                      <p className="font-body text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Venue:</span> {speech.venue}
                      </p>
                    )}
                    {speech.occasion && (
                      <p className="font-body text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Occasion:</span> {speech.occasion}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="font-body text-muted-foreground leading-relaxed mb-6 flex-1">
                    {speech.description}
                  </p>

                  {/* Read More / Download Link */}
                  <div className="mt-auto">
                    <Link
                      href={`/mosc-old/speeches/${speech.id}`}
                      className="inline-flex items-center font-body text-primary font-medium hover:gap-2 reverent-transition"
                    >
                      Read Full Speech
                      <svg 
                        className="w-5 h-5 ml-1 group-hover:ml-2 reverent-transition" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
              Words of Spiritual Guidance
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
              The speeches and messages of His Holiness the Catholicos provide spiritual guidance, pastoral care, and leadership to the faithful of the Malankara Orthodox Syrian Church. These addresses cover a wide range of topics including faith, unity, service, and the mission of the church in the modern world.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Through these messages, His Holiness addresses the spiritual needs of the community, shares wisdom from our ancient traditions, and guides the church forward in its mission of spreading the Gospel and serving humanity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

