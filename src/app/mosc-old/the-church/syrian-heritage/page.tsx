import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'Syrian Heritage',
  description:
    'Syrian Heritage of the St. Thomas Christians. Syriac is the liturgical language of the St. Thomas Christians from a very early date, even though their identity and culture remained always truly Indian.',
};

const SyrianHeritagePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section - MOSC styling */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 sacred-shadow-lg border border-border/50">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Syrian Heritage
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Syrian Heritage of the St. Thomas Christians. Syriac is the liturgical language of
              the St. Thomas Christians from a very early date, even though their identity and
              culture remained always truly Indian.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image - centered, contained */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/syrian_heritage.jpg"
                      alt="Syrian Heritage of the St. Thomas Christians"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                    Syrian Heritage of the St. Thomas Christians
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Syriac is the liturgical language of the St. Thomas Christians from a very
                    early date, even though their identity and culture remained always truly
                    Indian. This language, which belongs to the family of Semitic languages
                    developed as an independent dialect of Aramaic with its own script in the 1st
                    century A.D. Aramaic, believed to be in continuous use since 3000 years, was
                    one of the most prominent languages of the middle east. It was the language of
                    commerce and international relations in this region at least from 7th century
                    B.C., and was the official language of the Persian (Achaemenid) empire from the
                    6th century B.C. Aramaic dialects were spoken in Palestine in the time of Jesus
                    and thus it has the honor of being the language in which Christ and his
                    disciples spoke. The early forms of Christian worship conducted in Jerusalem
                    also would have been in Aramaic.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Edessa was the cradle of Syriac and it was primarily among the Christians of
                    Edessa that it began to be used as an independent language. Soon it acquired
                    the status of the language of Christian communities of Mesopotamia and Syria.
                    These Christians began to be called as Syrians after the Roman province in
                    which they lived—Syria—and their language was called Syriac. It did not take
                    long for this language to reach Persia and from there to India—where it
                    remains even today as the basic liturgical language of some Christian
                    communities—and even up to China.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Syriac Scripts: Estrangela, Serto, and Eastern (Chaldean)
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Estrangela was the script initially used to write Syriac. Later two different
                    scripts and pronunciations developed, one in the western parts of the Middle
                    East (especially in the Roman empire) known as the western script or
                    <em> serto</em> and another one in the eastern parts (especially in Persia)
                    known as the eastern script or Chaldean script. The serto is being used by the
                    Syrian Orthodox, the Maronite and Syrian Catholic denominations whereas the
                    Assyrian and Chaldean churches use the eastern script. Although remaining a
                    single language, the two employ distinctive variations in pronunciation and
                    writing system. The exact periods in which each of these forms developed is
                    still a disputed question. It was after the 8th century that the estrangela
                    script was steadily replaced in the west Syrian circles by the serto. However,
                    recent discoveries show that serto scripts were in use much earlier; but as
                    they were used more in business or administrative texts, ecclesiastical
                    institutions and libraries rarely preserved them. The eastern script, which
                    resembles more to the estrangela, came into regular use even later.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Syriac Literature and Its History
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Syriac literature covers numerous fields within and outside Christianity such
                    as Biblical interpretations, theology, apologetics, history, monasticism,
                    legends, civil and canon law, philosophy, natural and physical science,
                    astronomy and mathematics. St. Ephrem of Nisibis, Aphrahat the Persian Sage,
                    Jacob of Serugh etc. are some of the eminent Syriac writers of the early
                    centuries. With the invasion of the Middle Eastern region by the Arabs, Syriac
                    language slowly lost its prominence until it was gradually banned by the Arab
                    rulers. By the end of the 8th century, this language ceased to be spoken in
                    cities, but was kept alive in villages and as a liturgical language. Writers
                    like Moses Bar Kepha (9th cent.), Bar Salibi (12th cent.) continued to produce
                    important literary works. Gregorios Bar Hebraeus (13th century) can be
                    considered as the most renowned scholar and writer of the middle ages. A
                    considerable amount of both prose and poetry continued to be written during
                    the centuries that followed, but the language and literature could not flourish
                    as before; it underwent a period of decline until it became almost a dead
                    language. The late 19th century witnessed a revival of Syriac literary
                    activity thanks to the contributions of men like T&apos;oma Audo, Rahmani,
                    Patriarch Ephrem Barsaum etc. Today different dialects of Syriac are spoken as
                    the first language in small scattered communities in Syria, Lebanon, Turkey,
                    Iraq, Iran etc. Turoyo and Assyrian Neo-Aramaic are two of the important
                    dialects of modern Syriac. Attempts are being made to revive its use. It
                    remains as the basic liturgical language of some Christian denominations in
                    the Middle East, but most of the liturgy has been translated into and is
                    being conducted in Arabic.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    St. Thomas Christians and the Persian Church
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    As far as historical evidence is available, it is now more or less an
                    established fact that the St. Thomas Christians had very intimate relations
                    with the Persian Church from a very early date. Even though it is difficult to
                    precise dates due to scarcity of documents, most of the modern historians agree
                    that the Church of Malabar was under the Metropolitan of Riwadisher, belonging
                    to the Persian Church and they had adopted the east Syrian (Persian) liturgical
                    traditions at least from the 4th century. We do not know how far the ordinary
                    people of Malabar were proficient in this language, but at least the clergy
                    would have been well versed in Syriac and the people could follow the worship
                    conducted in it. Thus, even though Syriac neither is nor was the mother tongue
                    of the Thomas Christians, they have a longer acquaintance with it than with
                    their own mother tongue Malayalam (developed only in the 10th cent.). As Syriac
                    was already present during the formative period of Malayalam, a lot of Syriac
                    words have crept into it. Sleeba (cross), madbaha (altar), kasesa (priest),
                    qurbana (Eucharist) are examples.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    From East Syrian to West Syrian Liturgy
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The liturgy that was in use in this church when the Portuguese landed in
                    Malabar (end of 15th cent.) was the east Syrian liturgy of Addai and Mari, the
                    same as that of the Persian Church. Other liturgical practices also would have
                    been in line with that of the east Syrian tradition. Later when the church had
                    to face the threat of latinization under the Portuguese Archbishop Menezes,
                    the Archdeacon of India and other leaders of the Church were constantly trying
                    to establish contacts with churches in the Middle East following Syrian liturgy
                    and traditions. In the turbulent events that followed in the 17th century, the
                    St. Thomas Christians who resisted latinisation entered into an intimate
                    relation with the west Syrian Church of Antioch. During the succeeding
                    centuries (18th and 19th) the Church slowly accepted west Syrian liturgical
                    traditions. Thus the liturgy of St. James replaced that of Addai and Mari.
                    Other liturgical books such as order of sacraments of marriage, baptism, house
                    blessing, funeral rites etc. were brought to Malabar by visiting bishops and
                    Patriarchs of the Antiochian Church. Books of prayer such as shimo (prayer for
                    ordinary days), prayers for the holy week, prayers for lent, the
                    <em> penqitho</em> (prayers for feasts and special days) etc. followed suit.
                    Detailed rubrics conforming to Antiochian practices were slowly established
                    through bulls of Patriarchs and direct instructions given by visiting prelates.
                    Patriarch Peter III, who visited the Malankara Church during the last quarter
                    of the 19th century, did give the final touch to the antiochianisation of the
                    Malankara Church. It is inferred that he even tried to conform the dress of
                    the people of Malankara to that of the Syrians, an attempt which proved to be
                    a failure.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Syriac Printing and the Spread of West Syrian Traditions
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The establishment of Syriac printing presses, first in Cochin (St. Thomas
                    press), which was later shifted to Kottayam, and in Pampakuda (Mar Julius
                    press, in 1879) helped the spread of west Syrian liturgical traditions. A
                    Syriac periodical by name Simath Haye, published from the Mar Julius Press
                    popularized even patristic texts, side by side with books of worship.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Twentieth Century: The Era of Translations
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    If the 19th century saw the establishment of west Syrian traditions in Kerala,
                    the 20th century can be distinguished as the era of translations. Especially
                    during the second half of the past century most of the liturgical texts were
                    translated to Malayalam. Eminent linguists like St. Dionysius Vattasseril,
                    Konat Mathen Malpan and Mattackal Alexandreos Malpan gave the lead to this
                    trend while H.H. Mar Baselios Augen I, H.H. Mar Baselios Mathews I, H.G. Youhanon
                    Mar Severios and Konat Abraham Malpan followed suit in the next generation.
                    Now almost all liturgical texts, except some used in very rare and special
                    occasions, have been made available in Malayalam. Translations in other Indian
                    languages and English are under way.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Syrian Heritage and Indian Culture
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    It has to be borne in mind that the St. Thomas Christians, even while accepting
                    and feeling proud of their Syrian liturgical heritage, have always adopted
                    those traditions in combination with local customs and practices. For example,
                    customs related to birth, marriage and funeral have a lot of local elements.
                    As stated at the outset, though they have inherited Antiochian faith and
                    liturgy, their culture is Indian.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 mt-8 border border-border/50">
                    <p className="font-body text-muted-foreground leading-relaxed text-sm font-semibold text-foreground mb-1">
                      Written By:
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed text-sm italic">
                      Rev. Fr. Dr. Johns Abraham Konat
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed text-sm italic">
                      Professor
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed text-sm italic">
                      Orthodox Theological Seminary, Kottayam
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="lg:col-span-1">
              <TheChurchSidebar />
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

export default SyrianHeritagePage;
