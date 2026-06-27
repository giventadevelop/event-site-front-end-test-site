import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara (1991–2005)',
  description: 'Biography of His Holiness Baselios Marthoma Mathews II, the sixth Catholicos of the East in Malankara.',
};

const catholicosLinks = [
  { name: 'The Catholicate Overview', href: '/mosc-old/catholicate/catholicate' },
  { name: 'H.H. Baselios Paulos I', period: '1912–1913', description: 'The First Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese I', period: '1925–1928', description: 'The Second Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese II', period: '1929–1964', description: 'The Third Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Augen I', period: '1964–1975', description: 'The Fourth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews I', period: '1975–1991', description: 'The Fifth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews II', period: '1991–2005', description: 'The Sixth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Didymos I', period: '2005-2010', description: 'The Seventh Catholicos of the East in Malankara', href: '/mosc-old/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Paulose II', period: '2010–2021', description: 'The Eighth Catholicos of the East in Malankara', href: '/mosc-old/catholicate/h-h-baselios-marthoma-paulose-ii' },
];

const BaseliosMarthomaMathewsIIPage = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Crown">👑</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              H.H. Baselios Marthoma Mathews II
            </h1>
            <p className="font-body text-lg text-primary mb-2 font-medium">
              The Sixth Catholicos of the East in Malankara
            </p>
            <p className="font-body text-lg text-muted-foreground">
              1991–2005
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="mb-8">
                  <Image
                    src="/images/catholicate/sas.jpg"
                    alt="H.H. Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow mb-6"
                    priority
                  />
                </div>
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <div className="space-y-6">
                    <h2 className="font-heading font-semibold text-2xl text-primary mb-4">
                      Biography
                    </h2>
                    <p className="mb-6">
                      His Holiness Moran Mar Baselios Marthoma Mathews II, Catholicos of the East, and 89th successor to the Holy Apostolic Throne of St. Thomas was enthroned on 29 April 1991.
                    </p>
                    <p className="mb-6">
                      He was born on January 30, 1915 at Perinad in Kollam District of Kerala. His Holiness had his early education in a local school. After his High School education he had his training at Old Seminary Kottayam and also at Basil Dayara, Pathanamthitta. Later he joined Bishop's College, Calcutta for his B.D. Degree. He had his higher education in Theology at General Theological Seminary, New York.He was ordained as Deacon in 1938 and as Priest in 1941. It was during his stay at St. George Dayara. Othara that Father Mathews made a mark as a devoted and an able priest of the Indian Orthodox Church. He was noted for his spiritual leadership and loving nature and could endear himself to everyone who came in contact with him. He was known as "Father Angel" at that time. The Catholicos His Holiness Baselios Geevarghese II took special interest to see that the services of Father Mathews are utilized in a still better way for the church and the community. On May 15, 1953 he was ordained as a Bishop of Orthodox church. He was only thirty eight years at that time. The young Bishop grew in stature very soon. As Metropolitan of the Diocese of Kollam he was fully responsible for its growth and progress and the number of parishes almost doubled within a short period. Several monasteries and convents were started. A large number of educational institutions and hospitals were established. His services in the field of education and social service are all very well known. Several Colleges, Schools, Hospitals and other service institutions are successfully established and administered under his direct control and leadership. He has traveled wide in various countries: the United States, Canada, Europe, Malaya, Singapore, Gulf countries etc. and has attended various international meetings and conferences. It was in 1980 that he was unanimously elected by the Malankara Syrian Christian Association as successor to the throne of Catholicos of the East and Malankara Metropolitan. In recent years some of the new schemes started under his directions are found to be of much help and benefit for the community at large. A Civil Service Academy was started at Thiruvananthapuram, to give proper training for candidates appearing for IAS, IPS, IFS and other Central Service Examinations. With a view to provide shelter for the poor, an House Building Assistance project was started. The Community Marriage Scheme is found beneficial for the marriage of poor girls. Human Resources Development and Services Wing is also helpful for the community in general. As President of the Ecumenical committee in Kerala and also in various other Inter-Church Committees he has shown excellent leadership. He keeps in touch with Heads of other Churches constantly and is keenly interested to promote Ecumenism. He has very friendly relations with leaders of other religions as well and has fully demonstrated by his activities the role the Head of a Christian Church has to play in the Secular, Socialist, Democratic, Republic of India. He encourages all activities directed towards the progress and development of the Nation and promotion of communal harmony and maintenance of peace in the country. A good orator, an eminent scholar, a renowned theologian, an able administrator and a man of the Word of God, he has all the qualities needed for a spiritual leader and a good shepherd. With his intelligence, wisdom, love and vision and with his vast experience in various fields he has proved himself successful as a skillful ecclesiastical head of an ancient Church. With his devotion and dedication in life and sincerity of purpose, no doubt the community at large is benefited by his true Christian life as a servant of God in the service of mankind.
                    </p>
                    <p>
                      He entered into eternal rest on 26 Jan 2006 and laid to rest in Mar Elia Chapel Shastamcotta.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (same as holy-synod) - desktop only in column */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Catholicate History
                </h3>
                <div className="space-y-3">
                  {catholicosLinks.map((catholicos, index) => (
                    <Link
                      key={catholicos.name}
                      href={catholicos.href}
                      className={`block p-3 rounded-lg hover:bg-muted/50 reverent-transition group ${index === 6 ? 'bg-primary/5 border border-primary/20' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 reverent-transition">
                          <span className="text-sm text-primary" role="img" aria-label="Catholicos">👑</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-medium text-sm text-foreground group-hover:text-primary reverent-transition">
                            {catholicos.name}
                          </h4>
                          {catholicos.period && (
                            <p className="font-body text-xs text-primary font-medium">{catholicos.period}</p>
                          )}
                          {catholicos.description && (
                            <p className="font-body text-xs text-muted-foreground">{catholicos.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-foreground">Born:</span>
                    <p className="text-sm text-muted-foreground">30 January 1915</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Consecrated as Bishop:</span>
                    <p className="text-sm text-muted-foreground">15 May 1953</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Reign:</span>
                    <p className="text-sm text-muted-foreground">1991–2005</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Passed Away:</span>
                    <p className="text-sm text-muted-foreground">26 January 2006</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Resting Place:</span>
                    <p className="text-sm text-muted-foreground">Mar Elia Chapel, Shastamcotta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BaseliosMarthomaMathewsIIPage;
