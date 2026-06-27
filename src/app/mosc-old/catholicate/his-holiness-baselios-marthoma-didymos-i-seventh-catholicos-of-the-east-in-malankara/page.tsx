import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.H. Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara (2005-2010)',
  description: 'Biography of His Holiness Baselios Marthoma Didymos I, the seventh Catholicos of the East in Malankara.',
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

const BaseliosMarthomaDidymosIPage = () => {
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
              H.H. Baselios Marthoma Didymos I
            </h1>
            <p className="font-body text-lg text-primary mb-2 font-medium">
              The Seventh Catholicos of the East in Malankara
            </p>
            <p className="font-body text-lg text-muted-foreground">
              2005–2010
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
                    src="/images/catholicate/didymus.jpg"
                    alt="H.H. Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara"
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
                      His Holiness was consecrated and enthroned at Parumala Seminary as Catholicoi of the East in the Apostolic throne of St. Thomas on 31 October 2005. He is the seventh Catholicos since the Catholicate of the East was relocated to India and 90th in the lineage of Catholicoi of the East in the Apostolic throne of St. Thomas. He is also the 19th Malankara Metropolitan of the Church.
                    </p>
                    <p className="mb-6">
                      His Holiness Baselios Marthoma Didimos I was born on 29 October 1921 to Ittyavira Thomas of Mulamootil House in Nedumbram near Thiruvalla and Sosamma of Chiramel House in Mavelikara. He joined the Tabor Dayara in Pathanapuram in 1939 and completed his high school education. He passed his Intermediate from C.M.S College, Kottayam in 1945, his B.A from National College, Tiruchirapalli in 1951, his B.T from Maston Training College, Madras in 1954, and his M.A from Christ Church College, Kanpur in 1961. He completed his training for priesthood under the disciplined guidance of Thoma Mar Dionysius and His Holiness Baselios Oughen, Catholicos of the East. He received from His Holiness Geevarghese II Catholicos of the East the order of Korooyo on 11 March 1942, full deaconship on 22 May 1947 and priesthood on 25 January 1950. He Has served as headmaster of Ponnayya High School, Thiruchirapalli and St. Stephen&apos;s High School, Pathanapuram, as Professor of English in St. Stephens College Pathanapuram and President of the Orthodox Youth Movement.
                      On 16 May 1965 His Holiness Baselios Oughen made him Ramban. The Malankara Syrian Christian Association, which met on 28 December 1965 at M.D Seminary, Kottayam, elected him to the high offer of Metropolitan. On 24 August 1966 at Kolencherry His Holiness Baselios Oughen Bava consecrated him as Metropolitan Thomas Mar Timotheos..
                    </p>
                    <p className="mb-6">
                      He became the Metropolitan of Malabar on 11 November 1966. He continues to serve as the General Superior of Mount Tabor Dayara and Convent in Pathanapuram. On 10 September 1992, the Malankara Association, which met at Parumala, elected him as successor- designate to the Malankara Metropolitan and Catholicos of the East.
                    </p>
                    <p className="mb-6">
                      His Holiness started his service to the Church as a monk when he was a teenager. He was called to the monastic life by the late Metropolitan Mar Dionysius of Niranam. He went through a rigorous monastic life that tuned up his body through hard work and his mind through intense discipline and his spirit through spiritual exercise. This writer believes Mor Baselios Didimos I is an exemplification of eastern monastic life. Our tradition of selecting bishops from the monastic ranks has a long history.    Unfortunately due to discontinued monastic communities, we could not always select our bishops from thorough-bred ascetics period. Mor Didimos is an exemption to our recently fabricated monasticism as a preparation to receive the episcopate. He has been deeply rooted in his monastic practices and exercises long before he became a priest and a bishop. He has witnessed many late nights during which our new Shepherd kept vigil in the chapel of Mount Tabor Monastery. Yes, indeed the church of Malankara is blessed to be shepherded by a monk of prayer.
                    </p>
                    <p className="mb-6">
                      Mar Didimos is not just a monk, who is enamored of some primitive practices of monasticism. He is endowed with erudition which he derived from his long career as a student of theology, mathematics and English literature. Prior to his consecration to the episcopate he had been a professional educator holding various positions in the academia. He was a mathematics instructor for many years, and was a high school headmaster for more than a decade. After receiving his post graduate degree in English literature he held his lectureship in English literature when St. Stephen&apos;s college of Pathanapuram came into existence. His Holiness is also rightly credited with his musical skills; his divine liturgies are musically mellifluous to the ears of the participants.
                    </p>
                    <p>
                      He entered the eternal realms on 26 May 2014 at Parumala Seminary. He was laid to rest at Mount Tabor Dayara, Pathanapuram.
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
                      className={`block p-3 rounded-lg hover:bg-muted/50 reverent-transition group ${index === 7 ? 'bg-primary/5 border border-primary/20' : ''}`}
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
                    <p className="text-sm text-muted-foreground">29 October 1921</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Consecrated as Bishop:</span>
                    <p className="text-sm text-muted-foreground">24 August 1966 (Thomas Mar Timotheos)</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Reign:</span>
                    <p className="text-sm text-muted-foreground">2005–2010</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Passed Away:</span>
                    <p className="text-sm text-muted-foreground">26 May 2014</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Resting Place:</span>
                    <p className="text-sm text-muted-foreground">Mount Tabor Dayara, Pathanapuram</p>
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

export default BaseliosMarthomaDidymosIPage;
