import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'Oriental and Eastern Orthodox Churches | The Church | MOSC',
  description:
    'How different is the Eastern Orthodox Church? Who are the Orthodox – Protestants or Roman Catholics? What do they believe differently? The Indian Orthodox Church belongs to the Oriental Orthodox family.',
};

export default async function OrientalAndEasternOrthodoxChurchesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Oriental and Eastern Orthodox churches" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content - layout and image style match /mosc/administration/administration */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/church/oriental.jpg"
                    alt="Oriental and Eastern Orthodox churches"
width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
                    How Different is The Eastern Orthodox Church?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Several people have asked this question in several different forms:
                  </p>
                  <ul className="list-disc list-inside font-syro-primary text-syro-dark-gray leading-relaxed mb-6 space-y-2 pl-2">
                    <li>Who are these Orthodox – Protestants or Roman Catholics?</li>
                    <li>What do they believe differently from the others?</li>
                    <li>What is the difference between Orthodox and other Christians?</li>
                  </ul>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Let me try some simple answers to these three questions.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    Who are the Indian Orthodox?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    First, both Roman Catholics and Protestants are Western Christian groups. The
                    Orthodox Church is not Western Christianity. Eastern in origin, it was from the
                    beginning open to influences from all cultures. In the first century,
                    Christianity was primarily an Asian-African religion. Only by the 4th century
                    did the Roman Empire become increasingly Christian. The Strength of Christianity
                    in the early period was in Palestine, Syria, Greece, Asia Minor, Egypt, and
                    Libya. We can make a list of the earliest Churches – the Churches of the first
                    century.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the West, i.e. Italy: 2 Churches – Rome and Puteoli (today Pozzuoli near
                    Naples). Western Greece: 5 Churches – Nicopolis, Corinth, Athens, Thessalonica
                    and Philippi. Eastern Greece (Asia Minor, today Turkey): 15 Churches – Ephesus,
                    Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, Laodicea, Troas, Miletus,
                    Colossae, Perga, Pisidian Antioch, Iconium, Lystra, Derbe. Syria and the East:
                    6 Churches – Antioch, Tarsus, Edessa, Damascus, Tyre, Sidon. Palestine: 4
                    Churches – Caesarea, Jerusalem, Samaria, Pella. Cyprus: 2 Churches – Paphos and
                    Salamis. Egypt: Alexandria. Pentapolis (North Africa): Cyrene. India: Malabar.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As you can see, only 2 out of 37 Apostolic Churches are strictly Western. If
                    Western Greece and Cyprus are also regarded as Europe, then nine Churches are
                    in Europe, while 28 are in Asia and Africa. The Orthodox Church claims to be
                    the true successor of all these Apostolic Churches, including the Italian
                    Churches, which used Greek as their language of worship in that century. So
                    the Orthodox Church is neither Roman Catholic nor Protestant. It regards itself
                    as the true and faithful successor of the ancient Apostolic Church, and
                    regards the Western or Roman Catholic Church as a group that broke off and went
                    astray from the true tradition of the Christian Church. The Protestant Churches
                    broke off much later (in the 16th century and after) from the Roman Catholic.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Orthodox are today in two families – the Oriental Orthodox family, to which
                    the Indian Orthodox Church belongs, and the Byzantine Orthodox family, which is
                    four times as large. The Oriental Orthodox family has five Churches – India,
                    Armenia, Syria, Egypt and Ethiopia – three in Asia and two in Africa. Total
                    membership is over 25 millions.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Byzantine Orthodox family has over 100 million members – in Greece, Russia,
                    Romania, Bulgaria, Yugoslavia, Western Europe, America, Australia and so on.
                    Their members are mostly Slavic, Greek or Roman in origin. But they are also
                    regarded as Eastern, though they are a bit less Asian-African. Thus the Indian
                    Orthodox Church is a strictly Asian-African Church, an Apostolic Church in
                    continuity with the ancient West Asian Apostolic Church. This Church was
                    established in India in the very first century by the Apostle St. Thomas, one
                    of the twelve Apostles of Jesus Christ. It is one of the 40 or so ancient
                    Apostolic Churches of the world.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    What do they believe differently?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The very question is a Western one. In the West a Church is defined mainly by
                    what it believes, i.e. by its doctrines and teachings. This intellectualist
                    orientation of faith does not belong to the Eastern tradition. The Orthodox
                    confess the same faith as the ancient Church – the faith as was later formulated
                    in the fourth century in the councils of Nicea and Constantinople. We object to
                    certain later additions made by the Roman Catholics, for example the addition
                    of the word &apos;filioque&apos; in the Latin creed. They, for example, teach
                    that the Holy Spirit, one of the Three Persons of the Trinity, proceeds from
                    the Father and the Son (filioque means &apos;and from the Son&apos;). We do not
                    teach so. The Son is begotten by the Father; the Spirit proceeds from the
                    Father. The words &apos;begotten&apos; and &apos;proceeding&apos; delineate the
                    difference between the Son and the Spirit in their relation to the Father. In
                    later centuries, especially after the fifth century when the Western Church
                    broke from the Asian-African moorings, it misunderstood the word
                    &apos;proceeding&apos; as related to the coming of the Spirit in the Church on
                    Pentecost. This coming, of course, is from the Father and the Son, but that is
                    not what is meant by &apos;proceeding&apos;. The latter word denotes the
                    eternal relation between the Father and the Spirit, and not the relation in
                    time and history.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the eternal dimension we cannot say that the Spirit proceeds from the
                    Father and the Son. Therefore &apos;filioque&apos; is out of place, wrong and
                    misleading. There are other doctrines and dogmas which the Roman Catholic
                    Church has added to the Niceno-Constantinopolitan Creed – e.g. the dogma of the
                    Immaculate Conception, the dogma of Papal Infallibility, and the dogma of the
                    bodily assumption of the Blessed Virgin Mary. The first two are wrong and the
                    third is not dogma, for the Orthodox. We do not believe that there is any
                    special miracle called Immaculate Conception connected with the origin and
                    birth of the Blessed Virgin Mary. Nor do we believe that the Pope or any other
                    human being is infallible. As for the teaching about the bodily assumption of
                    Mary, we do teach it, but not as some central dogma of the Church. Nor do we
                    believe that believing in the right dogma is the evidence of a true Christian.
                    We put equal emphasis on the way of life, on the way of worship, on the way of
                    disciplining oneself as on the way of thinking and belief.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    What then is the difference between East and West?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is not so easy to pinpoint the difference in words. It seems the difference
                    is more one of ethos, of orientation, of spirit rather than of dogma or belief.
                    Let us state some of the more obvious differences.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Roman Catholic Church, for example, believes in a universal organizational
                    structure for the Church with one particular bishop, namely the Bishop of Rome
                    or the Pope, holding a unique position in the whole world. We Easterners do
                    not accept any one bishop as having universal jurisdiction or authority. So the
                    Orthodox have no Pope. What they have is really an Episcopal Synod for each
                    local or national Church. The President of the Synod may be a Patriarch, a
                    Catholicos, an Archbishop or even a Pope as in the case of the Coptic Church
                    of Egypt. But no such Synod or its president can have universal jurisdiction
                    over the Churches of other countries. Each local or national Church with its
                    Episcopal Synod and Patriarch is autocephalous, i.e. it has its own head, and
                    does not look to any other Church to exercise authority over it.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This difference in turn is based on a more profound understanding of what we
                    call the Church Catholic. The Church Catholic is not the Roman Catholic Church.
                    It is the whole Church, in all time and space, in its qualitative and
                    quantitative fullness. The universal Church is not the Church Catholic. The
                    latter includes all those who have ever lived on earth as Christians in former
                    times, i.e. Christ and the Apostles, the prophets, martyrs, confessors,
                    fathers, doctors, ordinary believers and so on. The universal Church is, of
                    course, composed only of those now living. The Orthodox Church had no category
                    called the universal Church. The attempt to create a category called the
                    &quot;ecumenical church&quot; by the Constantinople Church, has been virtually
                    rejected by the Orthodox tradition.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Now the Roman Catholic Church has something called the Universal Church, and
                    the Pope is the head of this Universal Church. So, for them, the fullness of
                    the Church means the Universal Church which is for them, the manifestation of
                    the Church Catholic. Because they think this way, the local Church is only
                    part of the Universal Church and cannot be autocephalous or having its own
                    head. The local church is ever incomplete, according to this view, without the
                    head of the Universal Church, the Pope, since the part is never complete
                    without the whole. Hence the insistence of the second Vatican Council that
                    &quot;The College or body of bishops has no authority unless it is
                    simultaneously conceived of in terms of its head, the Roman Pontiff,
                    Peter&apos;s successor…. Together with its head, the Roman Pontiff, and never
                    without this head, the Episcopal order is the subject of Supreme and full power
                    over the Universal Church. But this power can be exercised only with the
                    consent of the Roman Pontiff.&quot; (Lumen Gentium: 22) This teaching the
                    Eastern Orthodox regard as rank heresy, and based on a fundamental
                    misunderstanding of the relation between the local Church and the Church
                    Catholic. The Easterners believe that the Church Catholic is fully manifest in
                    the local Church, where the people are in communion with the bishops of the
                    Episcopal Synod. We do not regard the local Church as part, but as the
                    manifestation of the fullness, of the Church Catholic. The error in the
                    teaching of the Roman Church, we feel, is due to its breaking away from the
                    tradition of the Church Catholic in the 5th century.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Neither does the Orthodox Church teach that the bishop or college of bishops
                    alone exercise authority in the Church. Every baptised Christian shares in the
                    kingly, priestly and prophetic authority of the Church, though the bishop has
                    a certain fullness of spiritual power which others in the Church do not have.
                    But the bishop separated from the Church is nothing. It is only in communion
                    with the Church, with the college of presbyters and deacons and with the
                    people that he exercises his power. The Orthodox Church is thus much more
                    conciliar and communitarian in structure. Neither did the Orthodox Church ever
                    develop an aggressive or institutional mission such as Roman Catholics and
                    Protestants have developed. The witness of the Orthodox is a quiet one, based
                    more on worship and a holy life of love and service, than on preaching and
                    proselytism. This lack of aggressiveness is often criticized by Western
                    Christians as a lack of missionary fervour. But we know that the aggressive
                    Western missionary movement is intimately linked with the economic, cultural
                    and colonial expansionism of the West, and we would rather not be associated
                    with such an aggressive and institutionalized mission.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The worship of the Church is the centre of the Orthodox ethos, rather than its
                    mission. The mission follows naturally from true worship and feeds into it. It
                    is in the eucharistic worship of the Church that the Orthodox have a foretaste
                    of the Kingdom which is coming. To join with the angels and archangels in the
                    adoration of the one True God and to rejoice in his presence of the Spirit
                    through the Son – this is the heart of the Orthodox ethos. The Orthodox Churches
                    under Muslim or Communist oppression always survived because of this worship
                    orientation. The West separates action from contemplation, thought and prayer.
                    For us it is in and from eucharistic worship that all action, contemplation,
                    thought and prayer derive their significance.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-sm italic">
                      Dr. Paulos Mar Gregorios Metrpolitan
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="space-y-6 lg:col-span-1">
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

