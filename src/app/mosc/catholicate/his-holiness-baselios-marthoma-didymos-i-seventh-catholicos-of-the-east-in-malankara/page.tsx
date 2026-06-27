import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc/components/QuickLinks';
import SyroPageBanner from '@/app/mosc/components/SyroPageBanner';
import { SYRO_CATHOLICATE_SIDEBAR_LINKS } from '@/app/mosc/catholicate/catholicosLinks';

export const metadata = {
  title: 'His Holiness Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara (2005–2010)',
  description: 'Biography of His Holiness Baselios Marthoma Didymos I, the seventh Catholicos of the East in Malankara.',
};

const BaseliosMarthomaDidymosIPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="His Holiness Baselios Marthoma Didymos I" breadcrumbFrom="catholicate" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                  The Seventh Catholicos of the East in Malankara
                </p>
                <p className="font-syro-primary text-lg text-[#798daf] mb-8">2005–2010</p>

                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/catholicate/didymus.jpg"
                    alt="His Holiness Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                    Biography
                  </h2>
                  <p>
                    His Holiness was consecrated and enthroned at Parumala Seminary as Catholicos of the East in the Apostolic Throne of St. Thomas on 31 October 2005. He is the seventh Catholicos since the Catholicate of the East was relocated to India and 90th in the lineage of Catholicoi of the East in the Apostolic Throne of St. Thomas. He is also the 19th Malankara Metropolitan of the Church.
                  </p>
                  <p>
                    His Holiness Baselios Marthoma Didymos I was born on 29 October 1921 to Ittyavira Thomas of Mulamootil House in Nedumbram near Thiruvalla and Sosamma of Chiramel House in Mavelikara. He joined the Tabor Dayara in Pathanapuram in 1939 and completed his high school education. He passed his Intermediate from C.M.S. College, Kottayam in 1945, his B.A. from National College, Tiruchirapalli in 1951, his B.T. from Mason Training College, Madras in 1954, and his M.A. from Christ Church College, Kanpur in 1961. He completed his training for priesthood under the disciplined guidance of Thoma Mar Dionysius and His Holiness Baselios Augen, Catholicos of the East. He received from His Holiness Geevarghese II, Catholicos of the East, the order of Korooyo on 11 March 1942, full deaconship on 22 May 1947 and priesthood on 25 January 1950. He has served as headmaster of Ponnayya High School, Tiruchirapalli and St. Stephen&apos;s High School, Pathanapuram, as Professor of English in St. Stephen&apos;s College, Pathanapuram, and as President of the Orthodox Youth Movement. On 16 May 1965 His Holiness Baselios Augen made him Ramban. The Malankara Syrian Christian Association, which met on 28 December 1965 at M.D. Seminary, Kottayam, elected him to the high office of Metropolitan. On 24 August 1966 at Kolencherry His Holiness Baselios Augen Bava consecrated him as Metropolitan Thomas Mar Timotheos.
                  </p>
                  <p>
                    He became the Metropolitan of Malabar on 11 November 1966. He continued to serve as the General Superior of Mount Tabor Dayara and Convent in Pathanapuram. On 10 September 1992, the Malankara Association, which met at Parumala, elected him as successor-designate to the Malankara Metropolitan and Catholicos of the East.
                  </p>
                  <p>
                    His Holiness started his service to the Church as a monk when he was a teenager. He was called to the monastic life by the late Metropolitan Mar Dionysius of Niranam. He went through a rigorous monastic life that tuned his body through hard work, his mind through intense discipline and his spirit through spiritual exercise. Mor Baselios Didymos I is an exemplification of Eastern monastic life. Our tradition of selecting bishops from the monastic ranks has a long history. Unfortunately, due to discontinued monastic communities, we could not always select our bishops from thorough-bred ascetics. Mor Didymos is an exception to our recently fashioned monasticism as a preparation to receive the episcopate. He has been deeply rooted in his monastic practices and exercises long before he became a priest and a bishop. He has witnessed many late nights during which our Shepherd kept vigil in the chapel of Mount Tabor Monastery. The Church of Malankara is blessed to be shepherded by a monk of prayer.
                  </p>
                  <p>
                    Mar Didymos is not just a monk enamoured of some primitive practices of monasticism. He is endowed with erudition which he derived from his long career as a student of theology, mathematics and English literature. Prior to his consecration to the episcopate he had been a professional educator holding various positions in academia. He was a mathematics instructor for many years and was a high school headmaster for more than a decade. After receiving his postgraduate degree in English literature he held a lectureship in English literature when St. Stephen&apos;s College of Pathanapuram came into existence. His Holiness is also rightly credited with musical skills; his divine liturgies are musically mellifluous to the ears of the participants.
                  </p>
                  <p>
                    He entered the eternal realms on 26 May 2014 at Parumala Seminary. He was laid to rest at Mount Tabor Dayara, Pathanapuram.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  Quick Facts
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <div>
                    <span className="font-semibold text-syro-blue">Born:</span>
                    <p className="text-sm mt-0.5">29 October 1921, Nedumbram near Thiruvalla</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm mt-0.5">24 August 1966 (Thomas Mar Timotheos)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Reign:</span>
                    <p className="text-sm mt-0.5">2005–2010</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Passed Away:</span>
                    <p className="text-sm mt-0.5">26 May 2014 at Parumala Seminary</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Resting Place:</span>
                    <p className="text-sm mt-0.5">Mount Tabor Dayara, Pathanapuram</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  The Catholicate
                </h3>
                <Link
                  href="/mosc/catholicate"
                  className="syro-primary-button inline-flex items-center gap-2 w-full justify-center py-1.5 leading-tight hidden"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to The Catholicate</span>
                </Link>
                <div className="mt-3 space-y-1.5">
                  {SYRO_CATHOLICATE_SIDEBAR_LINKS.map((item) => {
                    const isActive = item.href === '/mosc/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara';
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg font-syro-primary text-sm leading-tight outline-none focus:outline-none transition-colors ${
                          isActive ? 'bg-syro-red text-white' : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray/50'
                        }`}
                      >
                        <span className={`font-syro-display font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                        {item.period ? <p className={`font-syro-primary text-xs font-medium mt-0 mb-0 ${isActive ? '!text-white' : 'text-syro-blue'}`}>{item.period}</p> : null}
                        {item.description ? <p className={`font-syro-primary text-xs leading-tight mt-0 mb-0 ${isActive ? '!text-white' : 'text-[#798daf]'}`}>{item.description}</p> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BaseliosMarthomaDidymosIPage;
