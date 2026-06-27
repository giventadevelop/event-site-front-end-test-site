import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'Spirituality',
  description:
    'Spirituality may be defined as the life in and with the Holy Spirit—an ascetic and pious struggle through repentance, prayer, fasting, and participation in the sacramental life of the Church.',
};

export default async function SpiritualityPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Spirituality" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained */}
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/spirituality.jpg"
                      alt="Spirituality - Life in the Holy Spirit"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
                    Introduction
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Spirituality may be defined as the life in and with the Holy Spirit. It is an
                    ascetic and pious struggle against sin through repentance, prayer, fasting and
                    participation in the sacramental life of the Church. St. Paul says:
                    &quot;Walk in the Spirit, and you shall not fulfill the lust of the flesh. For
                    the flesh lusts against the Spirit, and the Spirit against the flesh; and these
                    are contrary to one another, so that you do not do the things that you wish….
                    Now the works of the flesh are evident, which are adultery, fornication,
                    uncleanness, lewdness, idolatry, sorcery, hatred, contentions, jealousies,
                    outbursts of wrath, selfish ambitions, dissensions, heresies, envy, murders,
                    drunkenness, revelries, and the like…… But the fruit of the Spirit is love, joy,
                    peace, long suffering, kindness, goodness, faithfulness, gentleness and
                    self-control. And those who are Christ&apos;s have crucified the flesh with its
                    passions and desires. If we live in the Spirit, let us also walk in the
                    Spirit&quot; (Gal. 5:16-25). Orthodoxy has preferred always to use the terms
                    &apos;life in Christ&apos;, &apos;life in Spirit&apos;, &apos;the spiritual
                    life&apos;, and the &apos;life in God&apos; to describe the life of the
                    Christian in union with God, regardless of the level of this life. See
                    Galatians 3:28; 3:20; 2 Corinthians 4:11; 1 Corinthians 7:8; Romans 8:15;
                    Ephesians 3:16-17; Colossians 3:3; John 14:23; 1 John 3:24 etc.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    What is Orthodox Spirituality and what is its Goal?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Orthodox Spirituality presents the process of a Christian&apos;s progress on the
                    road to perfection in Christ, by the cleansing of passions and the winning of
                    the virtues, a process which takes place in a certain order. Spirituality
                    describes the manner in which the Christians can go forward from the cleansing
                    of one passion, to the cleansing of another, and the same to the acquiring of
                    the different virtues. Thus a certain level of perfection is reached and
                    culminates in love. This is a state that represents the cleansing of all
                    passions and the winning of all the virtues. As man/woman climbs toward this
                    peak, he/she simultaneously moves toward union with Christ and the knowledge of
                    Him by experience, which also means his/her deification.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The goal of Orthodox Spirituality is the perfection of the believer by his/her
                    union with God in Christ. But as God is unending, the goal of our union with
                    Him, or our perfection, has no point from which we can no longer progress. So
                    all the Eastern Fathers say that perfection is unlimited. Thus our perfection
                    is not only the goal but also an unending process. In this process two great
                    steps can be distinguished: first, the moving ahead toward perfection through
                    purification from the passions and the acquiring of the virtues and secondly a
                    life progressively moving ahead in the union with God. At this point,
                    man&apos;s work is replaced by God&apos;s. Man contributes by opening himself up
                    receptively to an ever-greater filling with the life of God.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In short, we may narrate the following features of Orthodox Spirituality:
                  </p>
                  <ol className="list-decimal list-inside font-syro-primary text-syro-dark-gray leading-relaxed mb-6 space-y-2 pl-2">
                    <li>
                      The culminating state of the spiritual life is a union of the soul with God,
                      lived or experienced.
                    </li>
                    <li>
                      This union is realized by the working of the Holy Spirit, but until it is
                      reached, man is involved in a prolonged effort of purification.
                    </li>
                    <li>
                      It takes place when man reaches the &apos;likeness of God&apos;. It is at
                      the same time knowledge and love.
                    </li>
                    <li>
                      Among other things, the effect of this union consists of a considerable
                      intensification of spiritual energies in man, accompanied by all kinds of
                      charisma.
                    </li>
                  </ol>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Orthodox use the word &apos;deification&apos; or participation in the
                    divinity to characterize the union with God. It, however, does not mean that
                    here there is a pantheistic identification of man with God. But it asserts with
                    courage the possibility of a &apos;union&apos; of man with God, of a direct
                    &apos;vision&apos; of Him, of a &apos;participation&apos; in Him, through grace.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    Orthodox Spirituality and this world
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is very important to note that Orthodox Spirituality does not call for an
                    indifference to life, for a withdrawal from its affairs and for a pre-mature
                    eschatology. The Church Fathers have demonstrated the movement of God&apos;s
                    creation (universe) and the need for every person to participate in it, if
                    he/she wants to reach the perfection represented by the mystical union with
                    God. There should be a synergia (co-operation) of human will and the divine
                    grace (human will and divine grace are two unequal but equally needed forces in
                    the movement to attain perfection. The Church denies any kind of teaching that
                    deny either the divine grace or the human will in the process of attaining
                    perfection). This movement is intended in general to elevate a person to the
                    level of the highest good and to perfection.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The road to Christian perfection does not exclude this world and the works in
                    it, but it does require that it contribute to the winning of virtues. No one
                    should imagine that the work he/she does is an end in itself; it has the role
                    of beautifying his nature, with the virtues of patience, of self-control, of
                    love for his neighbor, of faith in God, and in turn of opening his eyes to the
                    wise principles placed by God in all things. The ultimate purpose of work and
                    the taking part in the life of this world is not so much the development of
                    nature as it is the normal development of the dormant possibilities in man and
                    in his neighbours. Even in the enduring of troubles, which is one of the most
                    important means of Christian striving, we don&apos;t have to run away from the
                    life of the world, but persistence in it. The care for one&apos;s own formation
                    and that of our neighbours, by beautifying ourselves with virtues, does not
                    mean a non-participation in the life of the world.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The one who has reached the peaks of spiritual living is no longer pre-occupied
                    with external activity, but contemplation. Even so, he/she exerts an influence
                    on the development of the world, by an attraction and a power which touch his
                    neighbours, that they might become as he/she is, by the same fulfillment of the
                    commandments, by the same virtuous works. The person who has reached the peak
                    of perfection exerts an influence and an attraction on his/her neighbours,
                    which makes them strive to reach the ideal goal. Because the very highest of
                    the virtues, which the spiritual man struggles for, is love. In love there is
                    knowledge too and the love of God cannot be separated from the love of the
                    people.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    Holy Trinity is the basis and Love is the Hallmark of Orthodox Spirituality
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The very basis of Christian life is in the mystery of Holy Trinity and
                    Incarnation. Orthodox spirituality has as a basic conviction on the existence
                    of a personal God, who is incarnated and who is the supreme source of
                    radiating love. God prizes man and does not want to confuse him/her with
                    Himself, but maintains and raises him to an eternal dialogue of love.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    But the personal God, the supreme source of love, can&apos;t be conceived of as
                    a single person, but as a community of persons in a perfect unity. The God of
                    the New Testament and of the holy Fathers is living and irreducibly three in
                    one the Holy Trinity.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    We may describe the Trinitarian basis of our spirituality in the following
                    lines: Only a perfect community of supreme persons (the Father, the Son and the
                    Holy Spirit) can nourish, with its unending and perfect love, our thirst for
                    love in relation to it and between ourselves. The Father wants to extend love
                    in its paternal form. So after the creation of man, He wanted His Son to become
                    man so that His love for His Son, made man, would be a love which is directed
                    toward any human face, like that of His son. In the Son made flesh we are all
                    adopted by the Father. The Father loves all of us in His Son, because the Son
                    was made our brother. God the Son, too, thus shows His love as a supreme
                    brother. But the Son&apos;s love for us is not separated from the Father&apos;s
                    love for us, but in His love as a brother He makes the Father&apos;s love and
                    also His love for the Father, engulf us. In us the Father welcomes other loving
                    and loved sons because His Son was made our beloved brother. However, this
                    paternal love is poured out on us in the form of the Holy Spirit flooding the
                    Son. By the Incarnate Son the Holy Spirit radiates within humanity and the
                    world, as the love of God for us and of ours for God. The Holy Spirit brings
                    into creation inter-Trinitarian life and love. He raises us to the level of
                    deification. The invocation of the Holy Spirit in the Holy Qurbana (epiclesis)
                    hasn&apos;t only the purpose of changing the bread and wine into the Body and
                    Blood of Christ, but of bringing divine life into the creation. This is why the
                    Church invokes the Holy Spirit in all her sanctifying services. We are raised
                    up by the Holy Spirit to the divine world or in the other way the divine world
                    penetrates us. This is what really the meaning and goal of our spirituality or
                    spiritual life.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    The Soul of Orthodox spirituality
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The soul of Orthodox spirituality consists in the practice of virtues and
                    especially in the gift of prayer. There is no spiritual life without prayer
                    and there is no labour greater than praying to God. The Church has got
                    canonical prayer of hours (seven times a day) and the unceasing prayers that
                    can be recited privately even in the time of doing some jobs. Through prayer a
                    faithful will be illumined and prayer is the measuring rod of a person&apos;s
                    spiritual life. St. Dionysius the Areopagite divides the spiritual life into
                    three stages: Purification, illumination and deification (union). We may
                    compare these stages with the stages of the practice of virtues, the
                    contemplation of nature and the contemplation of God Himself. Practice of
                    virtues begins with repentance. The baptised Christian struggles with God&apos;s
                    help to escape from enslavement to passionate impulses. By fulfilling the
                    commandments, gradually he/she attains purity of heart and it is this that
                    constitutes the ultimate aim of the first stage. At the second stage, the
                    contemplation of nature, the Christian sharpens his/her perception of the being
                    of the created things, and discovers the Creator present in everything and thus
                    it leads him/her to respect and give honour to fellow creations. This leads
                    him/her to the third stage, the direct vision of God, who is not only in
                    everything but above and beyond everything. The full vision of the divine glory
                    is reserved for the age to come, yet even in the present life, the saints
                    enjoy sure pledge and first fruits of the coming harvest.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The first stage is called &apos;active life&apos; while the second and third
                    jointly designated the &apos;contemplative life&apos;. It is to be noted that
                    not only the social worker or family member or the missionary who is following
                    the active life, the hermit or the recluse is likewise doing so, in as much as
                    he/she is still struggling to overcome the passions and to grow in virtue. In
                    the same way the contemplative life is not restricted to the desert or the
                    solitude, but a miner, a clerk, a typist or a house wife may also possess
                    inward silence and prayer of the heart, and may therefore be in the true sense
                    a &apos;contemplative&apos;.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    Three Presuppositions
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong className="text-syro-blue">i)</strong> The Orthodox tradition is
                    intensely conscious of the ecclesial character of Christianity. It is of
                    course true that there are many who reject Christ and His Church, or who have
                    never heard of him; whether they will be saved or not cannot be answered
                    properly by us and let God will do as His will. But, as Church members, we
                    believe that even a solitary in the desert is as much a churchman as the
                    artisan in the city. The ascetic and mystical path is at the same time social
                    and communal. The Christian is the one who has brothers and sisters. He/she
                    belongs to a family and that family is the Church.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong className="text-syro-blue">ii)</strong> Spiritual life is not only a
                    life in the Church but also life in the sacraments. It is the sacraments that
                    constitute our life in Christ. Our path is the path of corporate worship,
                    centred around the sacraments and especially the sacrament of Eucharist. That
                    is to say that it is in the communion of the Body and Blood of Christ that the
                    Christian life is based and moved towards perfection.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong className="text-syro-blue">iii)</strong> The spiritual life is also
                    evangelical. At each step upon the path, we turn for guidance to the voice of
                    God speaking to us through the Bible. After being inspired by what is written
                    in the Bible, we lead ourselves to be the real witnesses of our Lord to our
                    neighbours. We are asked to preach the Gospel and witness our Lord by
                    practising the virtues of prayer, fasting and alms giving. Prayer unites us to
                    God; fasting sanctifies us and alms giving (Charity) is really an extension of
                    the divine Grace in us to our fellow beings and the rest of the creation. These
                    presuppositions obviously show the Trinitarian Christological, Pneumatological,
                    Sacramental and ecclesiastical character of Orthodox spirituality.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-8">
                    Conclusion
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Orthodox spirituality gives enough and equal space for family life and monastic
                    life. That means it gives equal value to those who follow family life and
                    monastic life and no clear marked distinction is given to their goal although
                    their style of life is different. The practice of virtues is highly extolled in
                    both ways of life in the manner that is befitting to each of them. Orthodox
                    spirituality is not an ecstatic movement like some contemporary so-called
                    spiritual movements. It gives us a lesson for the perpetual and continuing
                    bliss that one can really experience in the Eucharistic worship of the Church.
                    Flight from division, ascetic silence and hospitality are highly extolled in
                    Orthodox spirituality. For the Church Fathers, &apos;to flee from the
                    world&apos; means to flee from every thing that divides. Also, the spirituality
                    must ultimately be understood in terms of paschal mystery. It is an
                    affirmation of the Cross—as the path of resurrection. The ability to bear the
                    cross comes from the joy of being saved. Joy in our Lord is our strength. The
                    aim of the exercise that at times is found painful is a purified love of God,
                    of neighbours, and of the whole creation. But that also means an increase of
                    joy.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-sm italic">
                      H.G. Dr. Yuhanon Mar Diascoros Metropolitan
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

