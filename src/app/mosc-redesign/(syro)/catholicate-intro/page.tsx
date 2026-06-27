import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc-redesign/(syro)/components/QuickLinks';
import SyroPageBanner from '@/app/mosc-redesign/(syro)/components/SyroPageBanner';
import { SYRO_CATHOLICOS_LINKS } from '@/app/mosc-redesign/(syro)/catholicate/catholicosLinks';

export const metadata = {
  title: 'The Catholicate — Introduction',
  description: 'Learn about the Catholicate of the Malankara Orthodox Syrian Church, its historical development from Archdeacons to Catholicos, and significance in the Orthodox tradition.',
};

const CatholicateIntroPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Catholicate — Introduction" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="The Catholicate of the Malankara Orthodox Syrian Church"
                    width={125}
                    height={75}
                    className="rounded-lg w-full max-w-[125px] h-auto object-contain"
                    priority
                  />
                </div>

                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  {/* Introduction */}
                  <div>
                    <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                      Introduction
                    </h2>
                    <p>
                      The word &apos;Catholicos&apos; means &quot;the general head&quot; or &quot;general bishop&quot;. It can be considered as equivalent to &quot;universal Bishop&quot;. This title and rank is much more ancient than the title Patriarch in the church.
                    </p>
                    <p>
                      In the ministry of the early church there were only three ranks namely; Episcopos (Bishop), Priest and Deacon. By the end of the third century or by the beginning of the fourth century certain bishops of certain important cities or provincial capitals in the Roman empire gained pre-eminence than other bishops and they came to be known as Metropolitans. The Ecumenical councils of the fourth century recognized the authority of these Metropolitans.
                    </p>
                    <p>
                      By the fifth century the Bishops in major cities like Rome, Constantinople, Alexandria, Antioch etc. gained control over the churches in the surrounding cities. Gradually they became the heads of each independent regional church and were called Patriarch which means &apos;common father&apos;. The same rank in the Churches outside the Roman Empire was called Catholicos. There were three ancient Catholicates in the Church before the fifth century. They were the Catholicate of the East (Persia), the Catholicate of Armenia and the Catholicate of Georgia. None of these ranks and titles are the monopoly of any church. Any Apostolic and national church has the authority to declare and call its head, Catholicose, Pope, or Patriarch.
                    </p>
                    <p>
                      Even though the title Catholicose had not existed in India before the 20th century, the idea behind the Catholicate or Patriarchate as the head of a national independent Church was there from the early centuries and there was similar native position or authority in the Indian Church. As we say that St. Peter was the first Pope of Rome, St. Thomas was the first Head or the Catholicos of India. As all other Apostles did, he also established Church in India and made a set up to continue its administration in India. That was the Apostolic authority existed in India throughout the centuries. In India the position and authority of the catholicose is development in the history of the Church throughout the past centuries. The first stage of the apostolic ministry in the Malankara Church is from the time of St. Thomas till the middle of the fourth century when the authority of the Church was vested in the hands of the Archdeacon. The second stage is the period of the reign of the Arcdeacons which started from the middle of the fourth century and lasted till the sixteenth century.
                    </p>
                    <p>
                      The third stage started when the archdeacon was elevated to the position of a Bishop by the community with the name Marthoma I in 1653.
                    </p>
                    <p>
                      Since then the head of the community was the Marthoma Metrans and later the position was developed to Malankara Metropolitan with more recognition.
                    </p>
                    <p>
                      When in a religious turmoil the Patriarch of Antioch interfered and suspended the Malankara Metropolitan demanding complete surrender, in 1912 the Church consecrated the senior Metropolitan as the Catholicose and head of the Church.
                    </p>
                    <p>
                      In 1934, through the meeting of the Malankara Association the authority and powers of the Malankara Metropolitan was entrusted to the Catholicose. Thus both the spiritual and temporal authorities of the Church was vested in one person who is the Catholicose cum Malankara Metropolitan and the development of authority in that direction was completed in the Church.
                    </p>
                  </div>

                  {/* Historical Development */}
                  <div>
                    <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pl-4 border-l-4 border-syro-red">
                      Historical Development of Catholicate in India
                    </h2>

                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">Archdeacons</h3>
                    <p>
                      In India St. Thomas founded the church and appointed prelates to continue apostolic ministry in the church. It is believed that the prelates were appointed from for ancient families namely, Pakalomattom, Sankarapuri, Kalli, and Kaliankal. Gradually the Pakalomattom family gained prominence in the ministry and chief prelates of the community where hailed from that family. During the reign of Marthoma VIII, the metropolitan of the community in the early 19th century, the Madras government once asked him a review of the history of the Malankara church and gave him seventeen questions to answer. On the 20th of April 1812 he gave written answer to all the questions. The last question was about the position and authority of the Malankara Metropolitan in the church. In his answer, he said, that from 335 AD for 1308 years ie. Till the coonan cross oath, the church was ruled by the Archdeacons of Pakalomattom family. He also said that after the coming of the Portuguese the church had, besides him six Metrans and one metropolitan. The Metran or Malankara Metropolitan of the community was the continuation of the apostolic authority in the Malankara Church. Our historical evidences say that in the early time, the title of the head of the community was Arch deacon. Sometimes the title was known as the Arch deacon of whole Indian. The native language it was usually called Jathikku Karthavyan. The Arch deacon of the community was the unquestioned social and political leader and he got even local soldiers under his command to protect himself and protect the interest of the community. The Arch deacon was the unquestioned leader of the community when the Portuguese arrived Malabar in the 16th century.
                    </p>
                    <p>
                      The Portuguese tried to bring the Archdeacon under their control. Through the Synod of Udayamperur (1599) they tried their level best to control the Archdeacon and for a short period they brought him under the authority of the Roman Arch bishop. The community revolted against this through the coonan cross oath of 1653.
                    </p>

                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 mt-6">The Archdeacon as Bishop</h3>
                    <p>
                      After the coonan cross oath the Church ordained the Arch deacon as a bishop with the name Mar Thoma I. This ordination of the archdeacon as a bishop was a very important turning point in the history of the development of authority in the Malankara Church. All the powers of the century old arch deacon with some more spiritual authority was given to the Archdeacon when he was elevated to the position of a bishop.
                    </p>
                    <p>
                      The Marthoma Metrans continued in succession till the early 19th century with the names Mar Thoma I, II, etc. till Mar Thoma VIII. and they ruled the church from 1653 to 1816. The spiritual as well as the administrative authority of the community were vested on the Mar Thoma Metrans during this period.
                    </p>

                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 mt-6">Malankara Metropolitan</h3>
                    <p>
                      In 1816 Pulikottil Joseph Mar Dioysius became a bishop and he got an approval letter known as the Royal Proclamation from the Travancore government to function as the Metropolitan of the community. Now on wards the head of the Church came to be known as Malankara Metropolitan. The position of the Malanakara Metropolitan in the 19th century is a growth from the position of the Marthoma Metrans. The power and authority of the Malanakara Metropolitan got more recognition than the power and authority of the Archdeacons and Marthoma Metrans because of some political changes in the country through the establishment of British rule.
                    </p>
                    <p>
                      From 1816, Dionysius II, Dionysius III, Dionysius IV, Mar Athanasios and Dionysius V were the Malanakara Metropolitans in the 19th century. Among these Mar Athanasios and Mar Dionysius V exercised enormous spiritual as well as temporal powers inside and outside the community. Mar Dionysius V was the Malankara Metropolitan at the time of the Synod of Mulanthuruthy (1876). During the later half of the 19th century there occurred a split in the community because of the works of the CMS missionaries and the reformation supported by them. This invited a closer interference of the Patriarch of Antioch.
                    </p>
                    <p>
                      To get over the difficulties caused by the reformation and to support Mar Dionysius V against the reformers the Church invited the Patriarch to come over to India. The Patriarch Peter III of Antioch came here in 1875. Instead of healing the division in the community the Patriarch tried to make use of the situation to establish his authority in the church by suppressing the authority of the Malankara Metropolitan. He strongly stood with Mar Dionysius and called the Synod of Mulanthuruthy. The Patriarch presided over the synod and directed its proceedings and took some decisions justifying the actions of the Patriarch in the Malankara Church. After the Synod he divided the church into seven dioceses and consecrated six new bishops to rule each diocese. By these actions the Patriarch was trying to reduce the authorities of the Malankara Metropolitan.
                    </p>

                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 mt-6">The way to Catholicate</h3>
                    <p>
                      After the synod of Mulanthuruthy the Church became more conscious about establishing a Catholicate (Maphrianate) in the Malanakra Church mainly to avoid unnecessary interference of the Patriarch of Antioch in the internal affairs of the Church.
                    </p>
                    <p>
                      The patriarch himself directed the Synod of Mulanthuruthy and attained more powers through its decisions. He claimed as the spiritual and temporal head of the Church. The Malankara Church which was in dare need of the Patriarch to fight against the reformers yielded to all the demands of the Patriarch. The legal fights against the reformers ended up in the final judgment of the Travancore Royal court in 1889.
                    </p>
                    <p>
                      The Royal Court judgment was a success to both the Patriarch and Mar Dionysius V in various aspects. The court declared that the Patriarch got spiritual supervisory powers over the Malankara Church. But it also declared that the Patriarch does not have any temporal authority in the Church. The Patriarch was not satisfied about this decision.
                    </p>
                    <p>
                      The Patriarch used all his ways and means to establish his spiritual and temporal authority in the Church. Mar Dionysius V died in 1909 and Mar Dionysius VI became the Malankara Metropolitan.
                    </p>
                    <p>
                      When Mar Dionysius VI became the Malankara Metropolitan, the Patriarch demanded a registered deed from Mar Dionysius declaring perfect allegiance to the patriarch. Mar Dionysius strongly refused to yield to the demands of the Patriarch. The Patriarch excommunicated Mar Dionysius VI on 31 May 1911. The excommunication of Mar Dionysius created lots of confusions and divisions in the Malankara Church. Most of the influential lay leaders and many clergy in the Church supported Mar Dionysius and stood firm with him. The Malankara Metropolitan was the supreme authority in the Church throughout the past years and the Patriarchs were always trying with all their means to exterminate that position from the Church. The Church clearly understood the intention of the Patriarch when he excommunicated Mar Dionysis VI.
                    </p>

                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 mt-6">The consecration of the Catholicose</h3>
                    <p>
                      When the Patriarch excommunicated mar Dionysius VI, there were two Patriarchs of Antioch; one was Abdulla who had powers according to the legal documents knows as Firman of the Turkish government and the other was Abdedmassiah who was senior and at the same time inactive at Turkey since the government withdrew his firman.
                    </p>
                    <p>
                      Abdulla was the one who excommunicated the Malankara Metropolitan Mar Dionysius. The Malankara Church contacted Abdedmassiah and invited him to Malankara. The patriarch came and presided over the meetings of the Episcopal Synod of the Malankara church that decided to consecrate a Catholicose for the Malankara Church. Mar Ivanios Metropolitan of the Kandanadu Diocese was unanimously proposed to the post of Catholicose.
                    </p>
                    <p>
                      On 15th September 1912, at St. Marys Church founded by St. Thomas in Niranam, Mar Ivanios Metropolitan was consecrated with the name Mar Baselios Paulose First as the first Catholicose of Malankara Church. The chief celebrant of the consecration ceremony was the Patriarch Mar Abdedmassiah himself. After the consecration the Patriarch issued two Kalpanas declaring the importance, privileges, powers and functions of the Catholicose.
                    </p>
                    <p>
                      All the authorities and privileges enjoyed by the Patriarch in the Church as its head was given to the Catholicose also.
                    </p>
                    <p>
                      By the consecration of the Catholicose the Indian Church asserted and declared its full autonomy and became a full autocephalous (having its own head) Church.
                    </p>
                    <p>
                      After the demise of the Catholicose Baselius Paulose I, the Bishops in Malankara together with Mar Dionysius VI consecrated Mar Philoxenos of Vakathanam as the second Catholicos with the name Baselius Geevarghese I. When he died in 1928, Mar Gregorios was elected as his successor. He was consecrated by the Indian Bishops in February 13, 1929 with the title Baselius Geevarghese II.
                    </p>
                    <p>
                      The Patriarchal group questioned the validity of the Catholicate in law courts and the litigation went on up to the Supreme court. In September 12, 1958, the constitutional bench of the supreme court of India recognized the validity of the Catholicate and unanimously declared that the Patriarch of Antioch does not have any authority over the Malankara church and that the Indian church is completely free under the Catholicos of the East. Without doubt the judgment stated that all the parishes and properties of the Malankara church are under the authority of the Catholicos.
                    </p>
                    <p>
                      Moved by the final judgment of the Supreme Court of India, the Patriarch&apos;s group unanimously recommended to the Patriarch Ignatius Yacob III to accept the Catholicos as the head of the Indian church. In December 1958, the Patriarch and the Catholicos subjected to the constitution of the Malankara church and accepted each other by exchanging letters.
                    </p>
                    <p>
                      The peace in the Indian Orthodox church which started with the mutual acceptance of the Catholicos and the Patriarch continued without much problem till the demise of the Catholicose Geevarghese II in 1964. The Malankara Association (representative body for the church) elected Mar Augen Thimothios as the next Catholicose, According to the constitution of the church, the Syrian Patriarch who was on friendly terms with the Malankara church, was also invited officially to participate in the consecration of the Catholicose. The Patriarch accepted the invitation of the Malankara church and came down to India and co-operated with the Malankara synod to consecrate the Catholicose.
                    </p>

                    <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3 mt-6">Conclusion</h3>
                    <p>
                      In all the Churches the position of the Patriarch or the Catholicose was a development of authority in their history. In Rome, Alexandria, Antioch and Constantinople and in the Persian Church it achieved almost full development and recognition in the 4th century itself. Jerusalem became a Patriarchate at the council of Chalcedone in 451. The Georgian and Armenian Catholicose were also developed in the same period.
                    </p>
                    <p>
                      The Patriarchate was developed in Russian Orthodox Church between 1448 and 1589. In Rumenia it was established in 1885. The Serbian Patriarchate was established in 1879 and the Bulgarian patriarchate was established in 1883. The patriarchate of Ethiopia was established in 1958 only. It happened in the Malankara Orthodox Church in 1912.
                    </p>
                    <p>
                      The Catholicate in India was a growth and development through centuries within the Malankara Church. Of course the developments in other churches like Persia, Antioch Rome and external interferences has influenced the growth in different stages.
                    </p>
                    <p>
                      It should always be considered as a symbol of Apostolic origin, authority and heritage as well as nationality and independence of the Malankara Orthodox Church. Throughout centuries the Metropolitan heads of the Thomas Christians were known as the apostolic successors of St. Thomas, the founder of the Indian church. The Vatican Syriac codex 22 written in 1301 at Kodungalloor refers to the Metropolitan of the church as &quot;The Metropolitan Bishop of the See of St. Thomas, and of the whole church of Christians in India&quot;. The church always asserted that St. Thomas had his apostolic throne in India as St. Peter had it in Rome or Antioch. When the Catholicate was established the catholicose as the head of the Malankara church, took the title &quot;The successor of the Apostolic throne of St. Thomas&quot;.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar - Back to Catholicate + Catholicate History page links */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  The Catholicate
                </h3>
                <Link
                  href="/mosc-redesign/catholicate"
                  className="syro-primary-button inline-flex items-center gap-2 w-full justify-center py-1.5 leading-tight hidden"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to The Catholicate</span>
                </Link>
                <div className="mt-3 space-y-1.5">
                  <Link
                    href="/mosc-redesign/catholicate-intro"
                    className="block px-3 py-2 rounded-lg bg-syro-red text-white font-syro-primary text-sm leading-tight outline-none focus:outline-none transition-colors"
                  >
                    The Catholicate — Introduction
                  </Link>
                  {SYRO_CATHOLICOS_LINKS.map((catholicos) => (
                    <Link
                      key={catholicos.name}
                      href={catholicos.href}
                      className="block px-3 py-2 rounded-lg text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray/50 font-syro-primary text-sm leading-tight outline-none focus:outline-none transition-colors"
                    >
                      <span className="font-syro-display font-medium">{catholicos.name}</span>
                      {catholicos.period ? <p className="font-syro-primary text-xs text-syro-blue font-medium mt-0 mb-0">{catholicos.period}</p> : null}
                      {catholicos.description ? <p className="font-syro-primary text-xs text-[#798daf] leading-tight mt-0 mb-0">{catholicos.description}</p> : null}
                    </Link>
                  ))}
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

export default CatholicateIntroPage;
