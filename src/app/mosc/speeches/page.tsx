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
    <div className="min-h-screen bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-syro-red rounded-full flex items-center justify-center shadow-syro-card">
                <svg className="w-6 h-6 text-syro-red-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <h1 className="font-syro-display font-semibold text-4xl lg:text-5xl text-syro-blue mb-4">
              Speeches
            </h1>
            <p className="font-syro-primary text-lg lg:text-xl text-syro-dark-gray max-w-3xl mx-auto">
              Messages, addresses, and speeches by His Holiness Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara, sharing spiritual guidance and leadership with the faithful.
            </p>
          </div>
        </div>
      </section>

      {/* Speeches Grid Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter (if needed in future) */}
          {/* <div className="mb-8 flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-syro-bg-gray rounded-lg text-syro-blue hover:bg-syro-red hover:text-syro-red-foreground transition-all duration-300"
              >
                {category}
              </button>
            ))}
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speeches.map((speech) => (
              <div
                key={speech.id}
                className="group bg-white rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 overflow-hidden border border-syro-table-border flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-syro-red/10 text-syro-red text-xs font-syro-primary font-medium rounded-full">
                      {speech.category}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="mb-3">
                    <span className="font-syro-primary text-sm text-syro-dark-gray">
                      {speech.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 group-hover:text-syro-red transition-all duration-300">
                    {speech.title}
                  </h2>

                  {/* Venue/Occasion */}
                  <div className="mb-4 space-y-2">
                    {speech.venue && (
                      <p className="font-syro-primary text-sm text-syro-dark-gray">
                        <span className="font-medium text-syro-blue">Venue:</span> {speech.venue}
                      </p>
                    )}
                    {speech.occasion && (
                      <p className="font-syro-primary text-sm text-syro-dark-gray">
                        <span className="font-medium text-syro-blue">Occasion:</span> {speech.occasion}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 flex-1">
                    {speech.description}
                  </p>

                  {/* Read More / Download Link */}
                  <div className="mt-auto">
                    <Link
                      href={`/mosc/speeches/${speech.id}`}
                      className="syro-primary-button inline-flex items-center gap-2 font-syro-primary w-fit"
                    >
                      <span>Read Full Speech</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
              Words of Spiritual Guidance
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
              The speeches and messages of His Holiness the Catholicos provide spiritual guidance, pastoral care, and leadership to the faithful of the Malankara Orthodox Syrian Church. These addresses cover a wide range of topics including faith, unity, service, and the mission of the church in the modern world.
            </p>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              Through these messages, His Holiness addresses the spiritual needs of the community, shares wisdom from our ancient traditions, and guides the church forward in its mission of spreading the Gospel and serving humanity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

