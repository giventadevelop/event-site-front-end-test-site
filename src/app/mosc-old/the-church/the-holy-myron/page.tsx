import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'The Holy Myron',
  description:
    'The divine and life-giving mystery of the Holy Myron. By the divine power, we speak of the mysteries of the cross and the holy anointing—its origin, meaning, and consecration in the Orthodox tradition.',
};

const TheHolyMyronPage = () => {
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Holy Myron
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              By the divine power, we have spoken at length on the mysteries of the cross. We next
              write about the divine and life-giving mystery of the Holy Myron.
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
                {/* Featured Image */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/sacraments.jpg"
                      alt="The Holy Myron - Sacrament of Chrismation"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                    On the Divine and Life-Giving Myron
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-8">
                    Now that discourse on the holy cross has reached a conclusion, the discourse
                    proceeds speedily in order to indicate briefly concerning the holy and divine
                    Myron.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 1
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The word &apos;Myron&apos; is translated in the Syriac language as
                    &apos;muro&apos;. Etymologically the word muro—with which the dead are
                    embalmed—signifies mortality. Thus it signifies the mortality of Our Lord for
                    our sake. Solomon also called Him &quot;Oil of Myrrh&quot; (Songs 1:2). The
                    Greeks too call it Myron in the Greek language. In two ways it is called Myron:
                    first, because of the fragrance—every kind of oil composed from many fragrant
                    plants is called Myron; aromatic herbs are also called Myron.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 2
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The discussion investigates from which oils is Myron made? We say from the oil of
                    Balsam or the balm that comes from Egypt and from the olive oil that is found
                    everywhere.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 3
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    It is necessary to contemplate the Balsam oil. Josephus the historian says:
                    Jericho is one of the places of the Hebrews which was rich in palm trees and
                    other plants; there was also the Balsam plant. When they cut its roots with
                    sharp stones, they collected the gum that oozes out from its roots, because of
                    its fragrance, warmth and sweetness. Epiphanius, bishop of Cyprus, says when he
                    explains the verse &quot;the bunch of Cypress flower is my beloved in the garden
                    of Engedi&quot; (Song 1:14): Engedi is a place in Judea in which the Balsam is
                    produced, and there are gardens that provide it. When this wood is cut, that is
                    sliced, it gives the gum of Myron.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 4
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    People may ask: From where has the tradition of the Myron come down to us? We
                    say: From the time of Moses. When God took him up to the mountain and taught him
                    the mysteries of the Church, He also commanded him saying, &quot;Take the
                    finest aromatics: the flower of chosen Myron five hundred shekels, Cinnamon,
                    Cassia and Olive oil etc. and make the oil of anointing, and you shall anoint
                    the tent of the testimony, etc.&quot; (Ex. 30:23–26). And this type was handed
                    down till Christ and the old anointing of Moses came to an end, when Our Lord
                    handed over the key to Simon on the Mount Tabor. And thus the new anointing
                    originated. These things are enough.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 5
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    People again ask: From where did the apostles learn to consecrate the Myron?
                    Some of the doctors say they learnt it in the Upper Room when they ate the
                    Passover, and He taught them to perform the memory of His death through the
                    bread and wine. Similarly, He taught them to consecrate the Myron. This is
                    evident from the fact that on the same day Myron is consecrated on an altar
                    and the bread is blessed, as in the Upper Room. On a single evening, He taught
                    them to do the memory of His death through the Qurbana and His anointing through
                    the Myron. Others say that He taught them about the Myron on the Mount of
                    Olives when He ascended to heaven. This is evident from the fact that He
                    blessed His disciples and stretched His hands over them there. Others say that
                    the Holy Spirit taught the apostles to make the Myron when He descended upon
                    them in the form of the tongues of fire. This is evident from what the Son had
                    said: &quot;From that which is Mine He takes and informs you&quot; (cf. Jn.
                    16:13–15).
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 6
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Nestorians who oppose the truth as well as the faith ask: Did the apostles
                    consecrate the Myron or not? We say against them: Show us where is it written
                    that there was the horn of oil for the apostles? You say that it was raised up
                    amongst you. Again, show us where is it written that the apostles consecrated
                    the Myron for baptism, and that they anointed the baptized with it, as your
                    elders do—for when one wishes to baptize, he consecrates the oil? If you say
                    that it is not written that the apostles consecrated the Myron, and therefore
                    we do not consecrate it, then show us where is it written to adore the cross,
                    to build the churches in the eastward direction, to celebrate the baptism in the
                    church? Therefore according to this logic you should not practice these things
                    either. That the apostles did consecrate the Myron is evident from what James
                    says in his Epistle: &quot;If anybody is sick, let him call the elders of the
                    Church and let them pray over him and anoint him with oil in the name of the
                    Lord, and the prayer with faith will heal the sick man&quot; (James 5:15). And
                    in the Gospel it is written that they anointed the sick with the oil (Mk 6:13).
                    This oil which is named here is the one over which all the elders recite a
                    prayer when they are assembled for the consecration of the Myron. From this
                    oil, and from the oil that the Lord blessed and sanctified and gave to His
                    apostles to anoint the sick and possess, is evident that the apostles
                    consecrated the Myron. It is further evident from what Dionysius the Areopagite
                    had written at length on it, in the second discourse on the Myron and its
                    consecration. Mar Dionysius learnt of the consecration of the Myron from the
                    apostles. Let these things stop here.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 7
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    People ask: What does the Myron depict? In his letter to John the Roman, Saint
                    Severios said that the Myron signifies the Holy Spirit, the giver of gifts.
                    Others also say that the Myron depicts the Spirit, basing themselves on what
                    David says: &quot;Like the oil that descends upon the head and upon the
                    beard&quot; (Ps 133:2), calling the Holy Spirit &quot;the oil that descends upon
                    the head,&quot; that is upon Christ in His baptism. Other doctors including
                    Moses Bar Kepha say that the Myron indicates Christ, as it is written:
                    &quot;Your name is Myron poured out&quot; (Songs 1:3). These things are evident
                    from its composition and its operations, as we are going to show below.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 8
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Why is Christ called &apos;Myron&apos;? We say that as the Myron possesses
                    fragrance, the Word also has holiness and fragrance naturally. Whenever the
                    Myron is hidden in a vase and not revealed and not known, it does not give out
                    fragrance. But when it is revealed and seen, it gives out fragrance. Similarly,
                    when God the Word was hidden in His Father, He was concealed and hidden. When
                    He was &quot;poured out&quot; into the Virgin, it was known that He is the God
                    incarnate.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 9
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    How many anointings did the incarnate Word receive? We say five. First, when
                    the Word was anointed by the Spirit in the flesh, that is by the Holy Spirit,
                    when He was in the womb of the Virgin. Second, when He anointed His humanity
                    with His divinity. Third, when He was anointed in His body by His mother, as the
                    rest of the children. Fourth, when He received the anointing in His body, that
                    is the Holy Spirit at the baptism. Fifth, the anointing with the fragrant
                    Myron, when He was anointed by the women.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 10
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    When Myron is rubbed on the wings of doves, it gives fragrance and it attracts
                    other doves to this dove. When it is rubbed on the nostrils of impure vultures,
                    they die. Similarly, by the true Myron oil, many live and many others die. The
                    saints who believe in it and are saved live by it. The wicked who have renounced
                    it die by it.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 11
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again Christ is called &apos;Myron&apos; because He received it when He was
                    anointed by the women. On the fragrance: When the Balsam oil is squeezed and
                    pressed out, it gives out fragrance. Similarly, Christ was pierced with the
                    lance and He gave us the pleasant and sweet odour of His divinity. Again it is
                    called &apos;Myron&apos; because of the mortality that He received in the flesh
                    for us, according to the indication of the Syriac language, as we have said
                    above.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 12
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Why is the Myron composed from two oils? We say because Christ is known from
                    His divinity and humanity. The high priest pours the Balsam oil over the olive
                    oil, symbolizing that he had poured the divinity over the humanity. The Balsam
                    oil shows that the divinity is hidden and the olive oil indicates that the
                    humanity is present. Again Myron is composed from two oils, as the Word is
                    compounded with the flesh. As the Balsam naturally possesses fragrance, the
                    Word naturally possesses holiness. As the olive oil helps those who are anointed
                    with it, the body of the Word confers help and healing to men. As the Myron is
                    of one composed nature, Christ is of one incarnate nature. The oil of Balsam
                    is brought from Egypt, so also God said: &quot;From Egypt I called My Son&quot;
                    (Hos 11:1). Again it is made from two oils in order to show that Emmanuel is
                    composed from divinity and humanity. The Word, being God and consubstantial
                    with the Father and the Spirit, took upon Himself the economy with the flesh.
                    The same one is visible and invisible. Just as the constitution of the Myron is
                    from oils and substances that are separate and different in essence, yet nobody
                    says after the composition of Myron that there are many oils, but a single
                    Myron—similarly, it is not right to separate Christ, that true Myron, into two
                    natures after the union with the flesh.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 13
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    We say that the union of the Word with the body took place not in confusion, in
                    the way in which the oil of Myron is mixed, that is the oils with each other.
                    But Christ&apos;s union was like that of fire with iron, and light with heat,
                    and fire with wood, so that we do not provide an excuse for those who divide the
                    natures.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 14
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again through the &apos;fatness&apos; of the olive we see the holy flesh. The
                    olive plant is abundant in blessings and helps, and it is of advantage to all
                    species with which it is mixed. Cold plants when compounded with it become cold;
                    when it is mixed with hot ones, it becomes hot. Similarly, the economy of Christ
                    also gave healing to the sick and binding up to the bruised and resurrection
                    to the dead. From the Balsam we understand the eternity of the Word. As this
                    oil that oozes and flows from a stem is simple and naturally possesses
                    fragrance, the Word who is from the Father is simple in His eternal glory. He
                    has no need to enrich His naturally possessed magnificence from another source.
                    These things are sufficient.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 15
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    It has been asked: Why do the bishops alone compose the Myron? We say as an
                    argument that Christ united to Himself an animated body—and so the bishop alone
                    compounds it—for one is the Only-Begotten Son who is from the Father. Again, for
                    He alone, and His Holy Spirit, know how He was &apos;compounded&apos; with the
                    flesh.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 16
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    He compounds it secretly in a special place in order to indicate the particular
                    intention of the Father, Son and the Holy Spirit, in which the mystery of the
                    emptying out and the economy of the Word is hidden. Secondly, this place
                    indicates the Virgin Mary, in whom the Word was united with His flesh.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 17
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again the bishop pours the Balsam oil over the olive oil, indicating thus that
                    the divinity, which is exalted from all things, poured out its essence upon the
                    humanity. The Word empties out Himself into the womb of the Virgin without
                    being poured out, yet remaining completely in the bosom of His Father. That is
                    why He is called &quot;the Myron emptied out&quot; (Songs 1:3). The fact that He
                    was poured out teaches us this: His blood was poured out and He descended into
                    the womb of the Virgin, without His having departed from His Father.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 18
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The bishop is clothed in white, corresponding to the light of his soul and with
                    the purity of his person, as the mystery indicates to him that it should be
                    offered to God in purity. Again, having put on white garments, he consecrates
                    it, because it is necessary that he should be illuminated in the contemplation
                    and divine knowledge. Again it indicates that he should be pure from all kinds
                    of sin and perfect in a holy way of life; also so that he should indicate
                    through the white garments that the divine gifts which he has received from
                    above are pure and luminous. Again, the bishop is in the place of Christ and as
                    Christ is light, as He said &quot;I am the light of the world&quot; (Jn 9:5),
                    thus the bishop wears white garments that are luminous. Again he puts on white
                    garments because he is the image of the Father, who dwells in unapproachable
                    light. These are enough.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 19
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The fact that the bishop leaves the Holy of Holies and goes around and comes up
                    to the other end of the church, carrying the Myron, indicates that the divinity
                    of the Only-Begotten Word descended and came to us when He became man. As the
                    Word was hidden in the bosom of His Father, so too the Myron is hidden in the
                    hands of the bishop and is veiled when he goes around the nave. When he goes
                    out, the bishop is veiled, symbolizing that even though the Word was revealed
                    and came to us, yet when He became man, His dispensation is concealed from us.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 20
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    As the Myron is hidden, so too the divinity of the Word is concealed from the
                    angels and created beings do not comprehend it. Again Myron is veiled, just as
                    the divinity of the Word was veiled in the flesh when He came to the world. And
                    again it indicates the virtues of the saints that are concealed, as it is
                    written: &quot;Let your left hand not know what the right hand does&quot; (Mt
                    6:3).
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 21
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Myron leaves and goes around the nave and returns—just as the Word, when
                    He became flesh, left heaven (just as the Myron leaves the Holy of Holies), and
                    He went around the world (just as the Myron goes around the nave). He fulfilled
                    the divine economy and returned to heaven, from where He descended.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 22
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the middle of the church it is revealed and consecrated, as the Word, when
                    He became flesh, did realize the salvation in the middle of the earth. As David
                    said: &quot;In the midst of the church will I give praise&quot; (Ps 22:22 LXX).
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 23
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    When the Myron leaves the sanctuary, why does the procession move to the north?
                    We say: The eastern region is luminous and the western is dark; the northern is
                    high and elevated; the southern is deep and low. East and the North indicate
                    the divinity of the Word, and the West and the South His humanity. For His
                    divinity is luminous like the East, and high and elevated like the North. But
                    His humanity, consubstantial to ours, is dark like the West and lowly like the
                    South. Therefore it leaves from the East and moves to the North, which is high
                    and elevated, for His eternal divinity is pre-existing and His humanity is
                    temporal.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 24
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    He leaves the sanctuary, that is from the East, as a bridegroom from the bridal
                    chamber, while the Psalm of David is sung before him: &quot;Like a bridegroom
                    comes out of the chamber&quot; (Ps 19:5). He cries out from the East:
                    &quot;Glorify the Lord with a new song and His glory in the assembly of
                    justice&quot; (Ps 149:1). He comes to the North as if to forbid the Accuser
                    who blows from the North. The following Psalm is sung before him: &quot;I found
                    David my servant. And with my oil I have anointed him&quot; (Ps 89:21). And
                    &quot;the Mount Sion, on the northern border, I have called him.&quot; He comes
                    to the West teaching us to flee from Satan whose light had set because of his
                    pride. And we say: &quot;In the middle of the church shall I praise you&quot;
                    (Ps 22:22 LXX) and &quot;Glorify Him who rides to the West, His name is the
                    Lord&quot; (Ps 68:5 Pesh). And he comes to the luminous South, teaching that
                    the Father comes to everyone who is luminous by his virtues, and also the Spirit
                    and they make their habitation with him. They say: &quot;God came from the
                    South and the Holy One from the Mount Pharan&quot; (Dt 33:2), and &quot;You
                    have anointed my head with the oil&quot; (Ps 23:5), and &quot;O Lord our God,
                    illuminate us!&quot; (Ps 118:27); and &quot;Bind our festivals with chains
                    until the horn of the altar&quot; (Ps 118:27). When they come to the door of the
                    sanctuary, they say: &quot;Open to me the doors of justice&quot; (Ps 118:19).
                    This is enough regarding the procession of the divine Myron.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 25
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    On the Myron and its mysteries—it is necessary that we may continue with the
                    same contemplation (spiritual sense) and compare the types to the truth. Thus
                    the twelve deacons who surround the Myron represent the twelve legions of the
                    angels. Others say that the deacons represent the Seraphim who surround the
                    Word. Their fans indicate the six wings of the Seraphim, who covered their faces
                    with two (that is from His divinity), with two they covered their feet (that
                    is from His humanity)—as someone may say, they do not search out His divinity
                    and investigate about His humanity—and with the middle wings they fly, seeing
                    that they possess an intermediary knowledge about Him, because &quot;He is the
                    mediator between God and men,&quot; as Paul had said (1 Tim 2:5). Again, the
                    fact that the deacons conceal the Myron is the type of the Seraphim who conceal
                    the divinity on the exalted throne. Again they indicate that similarly, God the
                    Word, even after His self-emptying for us, was sanctified divinely by the holy
                    Seraphim, with His Father and the Holy Spirit, even though He had become flesh.
                    Similarly, the holy Myron, after its composition in the Holy of Holies, is
                    concealed and sanctified by the twelve wings. Again the fans indicate the holy
                    prophets who came from the twelve tribes and prophesied on Christ obscurely
                    and enigmatically. Again Myron is concealed with fans, indicating that it is not
                    right that the divine mysteries should be revealed to those who are unworthy.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 26
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again we say that the twelve priests represent the twelve Apostles.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 27
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The twelve censers indicate the preaching of the Gospel. Again the twelve
                    censers filled with incense and going before the Myron indicate for us the
                    twelve apostles through whom the fragrance of the Gospel of Christ was spread.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 28
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again the sweet incense symbolizes the fragrance of faith that is spread in
                    the four quarters.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 29
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again sub-deacons represent the prophets.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 30
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The twelve lamps in their hands symbolize the luminous revelations that descend
                    upon them, in accordance with &quot;every good gift and perfect grace&quot;
                    (James 1:17). Again the lamps indicate the light of the divine knowledge that is
                    in the Law and the Prophets. Again the twelve lights symbolize the doctors and
                    interpreters who were like lamps to the Church with their teachings.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 31
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The deacons stand nearer to the Myron than the priests who are superior in
                    rank, because the deacons represent the Seraphim who are nearer to Christ, and
                    the priests the apostles, and the sub-deacons the prophets.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 32
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The sub-deacons who are inferior go before the priests, because the prophets
                    preceded the Apostles.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 33
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The deacons, priests and the sub-deacons are nearer to the Myron than the
                    people, because the Seraphim, apostles and the prophets are nearer to Christ
                    than the faithful.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 34
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The number twelve—whether twelve censers, twelve lamps or twelve fans—indicates
                    the twelve tribes. As the tribes were twelve, the stones were twelve, and
                    twelve hours make a day, and there are twelve months in a year, and also man is
                    known in twelve parts.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 35
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again, the Myron is slowly carried around in the hands of the high priest and
                    proceeds until the procession returns to the sanctuary, and he places the vase
                    on the table. It indicates the course that Christ, followed by His disciples,
                    was travelling little by little in the divine preaching until He arrived at the
                    cross and He was hung on it. Thus the Myron also is placed on the altar. These
                    are enough.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 36
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Now it is necessary to open up the true types of Myron, so that the hearer might
                    be filled with the mystical fragrance of the noetic Myron. The hymns with which
                    the Myron is consecrated indicate the hymns of the Seraphim who cry out
                    &quot;Holy, Holy, Holy,&quot; and the hymns of the Cherubim who say:
                    &quot;Blessed is the honor of the Lord from His place&quot; (Ezek 3:12).
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 37
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The high priest places the vase of the Myron on the altar, because it refers to
                    and represents Christ. The altar represents also the wood on which He was
                    crucified.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 38
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    He signs three crosses over it indicating the Trinity who perfects the mystery.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 39
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Why is it consecrated on Thursday? We say: Since &apos;Myron&apos; in the Syriac
                    language indicates death, and on this day Our Lord revealed about His death, as
                    He said: &quot;One of you will betray me to death&quot; (Mt 26:21). Again
                    because it is close to Friday on which He tasted death. Again, it is
                    consecrated on this day because He was anointed three times and on this day He
                    received the last anointing. As say Matthew and Mark: &quot;Two days before the
                    Passover&quot; (Mt 26:1; Mk 14:1). Between our Passover, that is Sunday, and the
                    day in which He was anointed, there are two days: that is Friday and Saturday.
                    This interpretation has been given by Moses Bar Kepha. But we say:
                    &quot;Two days before the Passover&quot; means that it is on Tuesday that He
                    was anointed. He calls &apos;Passover&apos; the one of the Jews, and not our
                    Sunday. It is consecrated on Thursday because on that day Christ raised His
                    hands over His disciples and made them bishops. It is therefore meet that Myron
                    should be consecrated on the day in which the priesthood was given. It is
                    consecrated on Thursday because it should consecrate the five senses of the
                    body and the soul, because it is also sanctification for the five senses. It
                    sanctifies and gladdens the eyes with light and beautiful vision; the ears with
                    sound filled with melodies and lovely songs; the nostril with the sweet odour
                    of the incense; the mouth with praises and chants and the hands with the
                    sensation befitting God. In his epistle to John, Jacob of Edessa has said: Saint
                    Dionysius, who spoke spiritually of the service of the Myron, had not handed
                    down in writing why it is consecrated on the Thursday of the Mysteries. The rest
                    of the doctors also have not informed us on it. Is it lawful to consecrate on
                    other days or not, when it becomes necessary to perform it? But I know, in our
                    days, a bishop had happened to be in a city of the pagans. He lodged with a
                    certain Christian who was a deacon. When he was compelled to make this man
                    priest, he did not have an altar, that is the tablet with him, nor had he the
                    Myron, in order to anoint an altar with it and to offer the sacrifice of the
                    body and the blood and after that to ordain that man; being compelled in one
                    night to consecrate Myron, and to anoint the altar, and to offer the sacrifice
                    of the body and blood upon it and to make that deacon priest. He performed these
                    things without violating the canons of the Church and those for consecrating
                    Myron on a day other than the Thursday of the mysteries. But he did it because
                    of necessity. It has been prescribed that it be consecrated on the Thursday of
                    the mysteries, so that it should be nearer to the passion of Christ. As He said
                    about the woman who poured the oil over His head, &quot;she did it for my
                    burial&quot; (Mk 14:9; Mt 26:12). Therefore they have ordered that it be
                    consecrated on Thursday, so that it should be prepared for those who are to be
                    baptized in that noble night and on the feast of resurrection. These are enough.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 40
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    On the mystery of Myron: It is advantageous for us to add on the same subject.
                    People ask us: Why is Myron consecrated by day? We say, because it is a mystery
                    dressed with light.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 41
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    It is consecrated at the third hour, for it indicates Christ, who Himself
                    indicates the Trinity: the Father who anoints, and the Son who is anointed and
                    the Spirit who fulfills the role of oil.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 42
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The bishop alone consecrates it, so that he may have some proper function other
                    than that of the priests. Therefore he consecrates altars, that is tablets, and
                    performs ordinations.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 43
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again the high priest consecrates it because it is the sanctifying principle of
                    all the ecclesiastical affairs. And therefore the bishop alone consecrates the
                    Myron.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 44
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    After the consecration, he ascends to the Bema as Christ ascended to the Mount
                    of Olives with His twelve apostles and then to His Father.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 45
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    It is not right for him to remain in the same manner of life, but to advance
                    from his first manner of life to another more excellent one.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 46
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Thirdly, just as he is exalted in his being, so he should be exalted in his
                    knowledge and manner of life above the priests, deacons and the whole people.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 47
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again, in order to show the Myron to the people, just as Our Lord was suspended
                    on the cross in the sight of all the creation—He was seen.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 48
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    By extolling it, he indicates the following: When Emmanuel was raised on the
                    cross and extended, He received the anointing of the Spirit—not that He had not
                    yet received the Spirit, for Jesus had not yet been glorified.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 49
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the same way as Christ blessed His apostles when He ascended to heaven, the
                    bishop blesses the people when he ascends on the Bema.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 50
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    He extols it towards the four quarters, because Christ had commanded that His
                    Gospel should be transmitted to the four quarters. Also man is composed of four
                    elements. The twelve hours of the day have been divided into four watches, each
                    of three hours. The sun is directed by four winds. The yearly cycle has been
                    divided into four. Therefore it is extolled towards the four sides, so as to
                    sanctify the entire world. And to each side, three crosses are made with the
                    vase in its being extolled, for the name of Christ indicates the Trinity: the
                    Father who anoints, the Son who is anointed and the Spirit who fulfills the role
                    of the oil. Whenever we sign the cross, we indicate the Trinity. Through Him who
                    was crucified we understand the Trinity. The hymn of the bishop as he extols the
                    Myron is &quot;Kyrie eleison&quot; five times, which means &quot;Lord have
                    mercy upon us!&quot; These are enough.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 51
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the course of contemplation, we proceed and arrive at other things. When the
                    Myron descends from the Bema, it is placed on the altar, indicating that the
                    Word, even after He had ascended to heaven, dwells always on the holy altars. It
                    is not left in the vases in which it was consecrated, but poured into another,
                    because the vase in which it was consecrated represents the flesh that was united
                    to the Word. The one into which it is poured typifies our flesh, for through
                    baptism we receive it. Again the Myron is hidden in the Holy of Holies and is
                    not left revealed like the crosses and the similar orders in the church, for the
                    mystery of the economy of the Word—whom it typifies—is hidden. His judgments are
                    inscrutable, being a great depth, and therefore it is not lawful to show the
                    mysteries openly.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 52
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    It is given by the order and permission of the bishop, because the bishop
                    occupies the place of Christ. It is not lawful to be given without his
                    permission, for he holds the keys of the kingdom. Again, so that they should
                    show obedience to him, as Christ was obedient to the Father, and the apostles
                    to Christ. It shall not be given to the heretics and the pagans, in the way that
                    the blessings or the bones of the martyrs are given, because it confers its
                    graces only to the souls of the faithful. The souls of the non-believers are
                    injured by its proximity.
                  </p>

                  <h3 className="font-heading font-semibold text-lg text-foreground mt-8 mb-3">
                    Chapter 53
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Again it is consecrated by the bishop and it consecrates the baptismal water,
                    the tablets, the baptized as well as the churches. Thus the Myron represents
                    Christ Himself, who sanctifies and is sanctified. He sanctifies all, as He is
                    God. He is sanctified as He became man. Saint John Chrysostom, in the twentieth
                    homily of the commentary on the Second Epistle to the Corinthians, says: While
                    referring to the poor, he refers to this sanctuary that is the altar, of whom the
                    members of Christ are composed. This altar is not from the old one, but from the
                    present awesome one. This is of stone by nature. But it becomes holy because it
                    receives the body and blood of Christ. But that one, since it is the body of
                    Christ, is more awesome than the one near which you stand. You honor this altar,
                    because it receives the body of Christ, while the one that is the same body of
                    Christ, you dishonor and abhor when you disregard it. But people ask, if Myron,
                    Qurbana and the altar represent Christ, which is the most worthy among them and
                    bears the sign of excellence? Some of the doctors say that it is Myron, as it
                    is evident from its etymology, Myron having its origin from the divinity,
                    indicating a time of eternity, for the Word took this name even before He
                    became flesh: &quot;Your name is the myron poured out&quot; (Songs 1:3).
                    Qurbana and the altar were named during the time of the dispensation and the
                    person of humanity. Moses Bar Kepha, bishop of Mosul, says otherwise: Myron,
                    Qurbana, altar or bishop—one is not more valuable than the other, because all
                    four indicate Christ and occupy the place of Christ. Christ is the Myron. As
                    Paul had said, &quot;In the end of the world, He offered Himself once for all
                    through His sacrifice&quot; (Heb 9:26). He is the altar, as &quot;an altar not
                    built by hands.&quot; He is the high priest, as &quot;We have the high priest of
                    our confession&quot; (Heb 3:1). They indicate Christ not in a single way, but in
                    several ways. The Myron indicates the union and the Qurbana the offering for
                    us, the altar Him who became sacrifice on the wood for us. He is high priest
                    because He offered Himself to the Father for us and they sanctify and perfect
                    mutually, and are sanctified and perfected by others. Myron is consecrated so
                    that things might be anointed with it, and so that churches as well as baptismal
                    water might be consecrated, the baptized might be signed with it and so be
                    distinguished from the non-baptized—in order to confer adoption as sons and the
                    garment of life to those who wear it, to anoint our spiritual head, to gladden our
                    faces that were blackened with sins, to help the spiritual athletes and to give
                    virtue to those who have entered the world and good company to those who are
                    sent off. Qurbana is offered in order to confer us remission of sins, while
                    making us His members, and to acquire divine energies, such that fire gives to
                    iron when joined with it. Why is Myron consecrated once a year? We say, because
                    baptism is one, not many; Christ suffered once; each of the festivals is
                    celebrated once a year and the sheep have one sign. Why is Qurbana celebrated
                    every day? We say, because the sheep receive nourishment daily, and since we sin
                    many times a year, the Qurbana is offered, so that he who receives it might be
                    absolved by it every time. What do we obtain from Myron and from the Qurbana? We
                    say that we meditate with the eyes of the soul on God the Word, who unites
                    Himself with the bread and wine and the oil. He is the Qurbana; He is the
                    Myron, and the Word of Life to those who are saved, and death to those who
                    perish. The operations of the Myron precede the Qurbana—for without Myron, the
                    church is not consecrated, nor the altar, nor the baptism, the Qurbana nor the
                    priest, and these are the fundamental operations. The operations of the Qurbana
                    are the final and complete, because the church that is consecrated with Myron,
                    if Qurbana is not offered in it, is not completed. Therefore these do not
                    operate without the others.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mt-8 italic">
                    This discourse may take completion here. End of the discourse on the divine and
                    life-giving Myron.
                  </p>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
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

export default TheHolyMyronPage;
