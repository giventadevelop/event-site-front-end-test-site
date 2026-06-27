import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'Church Calendar',
  description: 'Feast days, fasts, and liturgical seasons.',
};

export default async function ChurchCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  const liturgicalSeasons = [
    {
      name: 'Nativity Fast',
      period: 'November 15 - December 24',
      description: "A period of preparation for the celebration of Christ's birth, marked by fasting and prayer.",
      color: 'bg-blue-50 border-blue-200'
    },
    {
      name: 'Nativity',
      period: 'December 25 - January 5',
      description: 'The celebration of the birth of our Lord Jesus Christ, the Incarnation of God.',
      color: 'bg-green-50 border-green-200'
    },
    {
      name: 'Epiphany',
      period: 'January 6',
      description: 'The revelation of Christ to the world, commemorating His baptism and the visit of the Magi.',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      name: 'Great Lent',
      period: 'Variable (40 days before Easter)',
      description: 'A period of intense fasting, prayer, and repentance in preparation for Easter.',
      color: 'bg-red-50 border-red-200'
    },
    {
      name: 'Holy Week',
      period: 'Week before Easter',
      description: "The most sacred week of the year, commemorating Christ's passion, death, and resurrection.",
      color: 'bg-gray-50 border-gray-200'
    },
    {
      name: 'Easter',
      period: 'Variable (calculated annually)',
      description: 'The Feast of Feasts, celebrating the resurrection of our Lord Jesus Christ.',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      name: 'Pentecost',
      period: '50 days after Easter',
      description: 'The descent of the Holy Spirit upon the Apostles, marking the birth of the Church.',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      name: 'Apostles\' Fast',
      period: 'Variable (after Pentecost)',
      description: 'A fasting period in honor of the Holy Apostles, lasting until their feast day.',
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      name: 'Dormition Fast',
      period: 'August 1-14',
      description: 'A fasting period in preparation for the feast of the Dormition of the Theotokos.',
      color: 'bg-pink-50 border-pink-200'
    },
    {
      name: 'Dormition',
      period: 'August 15',
      description: 'The falling asleep of the Virgin Mary, commemorating her death and assumption into heaven.',
      color: 'bg-rose-50 border-rose-200'
    }
  ];

  const majorFeasts = [
    { name: 'Nativity of Christ', date: 'December 25', icon: '🎄' },
    { name: 'Epiphany', date: 'January 6', icon: '⭐' },
    { name: 'Annunciation', date: 'March 25', icon: '👼' },
    { name: 'Palm Sunday', date: 'Variable', icon: '🌴' },
    { name: 'Easter', date: 'Variable', icon: '✝️' },
    { name: 'Ascension', date: 'Variable', icon: '☁️' },
    { name: 'Pentecost', date: 'Variable', icon: '🔥' },
    { name: 'Transfiguration', date: 'August 6', icon: '✨' },
    { name: 'Dormition', date: 'August 15', icon: '🌹' },
    { name: 'Nativity of Theotokos', date: 'September 8', icon: '👶' },
    { name: 'Exaltation of the Cross', date: 'September 14', icon: '🏴' },
    { name: 'Presentation of Theotokos', date: 'November 21', icon: '🏛️' }
  ];

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Church Calendar" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/church/church-calendar.jpg"
                    alt="Church Calendar"
                    width={125}
                    height={125}
                    className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    The Liturgical Year
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    The Orthodox Church follows a liturgical calendar that organizes the year around 
                    the life of Christ and the major events of salvation history. This calendar 
                    includes feast days, fasts, and liturgical seasons that help us to live out 
                    our faith throughout the year, participating in the eternal mysteries of God.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-6">
                    Liturgical Seasons
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {liturgicalSeasons.map((season, index) => (
                      <div key={index} className={`rounded-lg border-2 p-4 ${season.color}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-syro-display font-semibold text-lg text-syro-blue">
                            {season.name}
                          </h4>
                          <span className="font-syro-primary text-sm text-syro-dark-gray bg-white px-2 py-1 rounded">
                            {season.period}
                          </span>
                        </div>
                        <p className="font-syro-primary text-syro-dark-gray text-sm leading-relaxed">
                          {season.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-6">
                    Major Feast Days
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {majorFeasts.map((feast, index) => (
                      <div key={index} className="bg-syro-bg-gray rounded-lg p-4 hover:bg-syro-bg-gray/50 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl" role="img" aria-label={feast.name}>{feast.icon}</span>
                          <div>
                            <h4 className="font-syro-display font-medium text-syro-blue">
                              {feast.name}
                            </h4>
                            <p className="font-syro-primary text-sm text-syro-dark-gray">
                              {feast.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    The Purpose of the Liturgical Calendar
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The liturgical calendar serves several important purposes in Orthodox Christian life. 
                    It helps us to remember and celebrate the great events of salvation history, 
                    particularly the life, death, and resurrection of our Lord Jesus Christ. Through 
                    the calendar, we participate in the eternal mysteries of God, experiencing them 
                    anew each year as we grow in faith and understanding.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The calendar also provides structure to our spiritual life, with periods of fasting 
                    and feasting that help us to develop discipline and joy in our relationship with 
                    God. The fasts prepare us for the feasts, teaching us to hunger for God and to 
                    appreciate the blessings He gives us. The feasts celebrate God's love and mercy, 
                    filling us with joy and gratitude.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    Fasting and Feasting
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Orthodox calendar alternates between periods of fasting and feasting. The 
                    four major fasting periods are: the Nativity Fast (Advent), Great Lent, the 
                    Apostles' Fast, and the Dormition Fast. These periods of fasting are not merely 
                    about abstaining from certain foods, but are times of increased prayer, repentance, 
                    and spiritual discipline.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The feast days, on the other hand, are times of celebration and joy. They remind 
                    us of God's great love for us and the wonderful works He has done for our salvation. 
                    On feast days, we break our fasts and celebrate with special foods, music, and 
                    fellowship, giving thanks to God for His blessings.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8">
                    <h4 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                      Living the Liturgical Year
                    </h4>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                      The liturgical calendar is not just a schedule of events, but a way of life. 
                      It teaches us to live in harmony with God's plan for our salvation, participating 
                      in the eternal mysteries of Christ through the rhythm of the Church year. 
                      By following the calendar, we learn to see our lives in the context of God's 
                      great story of love and redemption, finding meaning and purpose in every season 
                      of life.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />

              {/* Quick Links */}
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/downloads/kalpana" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Kalpana
                  </Link>
                  <Link 
                    href="/mosc/downloads" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Downloads
                  </Link>
                  <Link 
                    href="/mosc/institutions" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Institutions
                  </Link>
                  <Link 
                    href="/mosc/training" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Training
                  </Link>
                  <Link 
                    href="/mosc/publications" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Publications
                  </Link>
                  <Link 
                    href="/mosc/spiritual" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Spiritual Organisations
                  </Link>
                  <Link 
                    href="/mosc/theological" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc/lectionary" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Lectionary
                  </Link>
                  <Link 
                    href="/mosc/gallery" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/mosc/contact-info" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Contact Info
                  </Link>
                  <Link 
                    href="/mosc/faqs" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    FAQs
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

