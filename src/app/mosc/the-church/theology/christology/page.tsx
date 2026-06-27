import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Christology | Theology | MOSC',
  description:
    'The Christology of the Malankara Orthodox Syrian Church: the one incarnate nature of God the Word, the mystery of the Incarnation, and the Church\'s confession of faith.',
};

export default async function ChristologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Christology"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Theology', href: '/mosc/the-church/theology' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/church/theology.jpg"
                    alt="Christology - Malankara Orthodox Syrian Church"
                    width={125}
                    height={125}
                    className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain"
                    priority
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Orthodox Syrian Church (Indian Orthodox Church) belongs to the group of Churches called Oriental Orthodox Churches or Non-Chalcedonian Churches. The other members of this family are the Coptic, Ethiopic, Syrian, Armenian and Erethrian Churches. Together with the Roman Catholic Church and the Byzentine Churches they comprised the One Church for four centuries until the division arose on account of the Council of Chalcedon in 451 A. D. which insisted that Christ had the two natures of humanity and divinity in and after the union. Here we try to describe in brief the Christology of the Malankara Orthodox Syrian Church (Here after called Malankara Church).
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Mystery of Incarnation
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Faith in the Mystery of the Incarnation of God, together with the Mystery of the Holy Trinity, is the very basis for the existence of the Malankara Holy, Catholic, Apostolic and Orthodox Church. Mystery of Incarnation means the mystery of the descending of God the Son who is one of the Trinity from heaven and taking up flesh and rational soul from the Holy Virgin Mary. God the Son the second Person of the Trinity became man and He accepted the incarnate state as a dispensation for the salvation of the world. This dispensation is God&apos;s action in which the Son accepted a second birth from a human mother, in addition to his eternal generation from the Father. However, God the Son incarnate does not mean either that the universe was deprived of His divine care during His life time on earth, or that His providence was administered during that time from His Incarnate personal centre. In order to become incarnate, God the Son accepted on Himself a self-limitation. The Malankara Church believes that each one of the three persons of the Holy Trinity has the power to do every possible thing. But it is to the Person of the Son (Word/Logos) that the union with humanity (flesh with rational soul) is convenient. The property of filiation is constant to Word (the Son). Being Son, eternally generated from the Father, He again became the Son from a human mother. The Son of God became the Son of man, and thus He became one united (incarnate) nature of God the Word. This is the mystery of God becoming man and man becoming God: &quot;The Word became flesh and dwelt among us&quot; (Jn. 1:14).
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    The One Incarnate Nature of God the Word
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Jesus Christ is One Incarnate (united) Nature of God Word is the christological formula of the Malankara Church. The Church believes that this one united nature is composed of Godhead and manhood in their perfection. According to the Church, in the one Christ the two natures continued without confusion or mixture on the one hand, and without separation or division on the other. Here we may quote an early christological profession of faith by the Church:
                  </p>
                  <div className="bg-syro-red/5 rounded-lg p-6 mb-6 border border-syro-table-border italic">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      &quot;We believe that one of the Persons of the Holy Trinity came down from heaven although He did not cease to dwell in the bosom of the Father: that He dwelt in the womb of the Virgin, and was incarnate of the Holy Ghost and of the Virgin Mary, and was made man, while still continuing to be God, and was united to the flesh of the same substance as ours and endowed with a rational and living soul. Nor was it that He took up the tabernacle of the flesh first, and then the Word dwelt in the same. Whence it is believed, not that man become God, but that God became man; nor is He merely a wise man who is proved to be perfectly righteous by His action; nor did He bring for Himself a body from heaven nor appear in this world in mere seeming or phantasm; but one of the Persons of the Holy Trinity being Himself essentially God descended from His own highest heaven and became man and of His own grace and was born of the Virgin Mary and became incarnate, as the Apostles&apos; Creed teaches us. There are two natures in our Lord: the divinity and the humanity. The union of His divinity with His humanity is transcendent and ineffable by the Word without admixture, without confusion, without transformation or conversion, without change, and without mixture. Although preserving the distinctiveness of the nature in one Son , one (is) Christ, one (is) ousia, one is hypostasis, one (is) person, one (is) will, one (is) Power, and one (is) operation&quot;.
                    </p>
                  </div>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Ousia here is the one individuated ousia. It is hypostasis and the hypostasis is in its nature. The nature is one incarnate nature or one united nature and it is synonymous with the one composite hypostasis. The one nature or hypostasis of God the Word after the union became one person. The word &apos;nature&apos; (physis), when it is used with reference to Christ means only hypostasis, or a concrete being. For the Church, this meaning is crucial, because physis, if it is taken in the sense of hypostasis, is capable of conserving the idea that Jesus Christ lived a concrete human life on earth. The terms will, operation, etc. are also based on these affirmation. The anathemas St. Cyril of Alexandria (5th century against Nestorianism) insist that the words and deeds of Jesus Christ were the expressions of the one incarnate hypostasis of God the Word. For the Church, the one incarnate hypostasis of God the Word is the same as the one incarnate nature of God the Word. On this ground, we speak of the one will and one operation with reference to Christ. That is to say, Christ has disclosed in Himself the will of God on the one hand, and the &apos;will&apos; of the man fulfilled in the &apos;will&apos; of God and &apos;the will of God&apos; united with the &apos;will&apos; of man. Viewed in this way, it is not that there are two wills in the one Christ, but that His is the will in which the will of God and will of man found their absolute union. In the same way, the Church holds that there is one divine-human operation in Christ. This does not mean that the faculties of either of the natures became swallowed up by that of the other nature. The one incarnate nature was formed of the union of the two natures of godhead and manhood each with its own properties. Since these properties include will and operation, it is clear that they were in the one Christ.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Here, we may gather the following Christological affirmations of the Malankara Church: i) The oneness in the nature, will and authority of the Father and Son (this is a Trinitarian affirmation; ii) The uniqueness of the Sonship of Jesus Christ; iii) The manhood is perfect and it has all natural properties and faculties without any reduction, change or confusion; iv) The real and simultaneous union of the Divine with the soul and body without confusion, transformation and separation; v) Jesus Christ suffered and died only in His manhood and in His Godhead He was living; vi) After the Resurrection, Christ rendered the real body and it was not a phantom.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In short, the Church recognises the difference in the words and deeds of Jesus Christ, some of them are the acts befitting the divinity and some others the acts befitting the humanity. The one who acts is one - this is the Word of God incarnate - and the operation is also one, but the things (activities) are different. As no one can separate the Word from the flesh so do no one can separate or divide the operation also. The aim here is not to divide the words and deeds between the natures in such a way that some are ascribed to the divine nature and some to the human exclusively. They are of the one incarnate nature of God the Word. Here we try to analyze the main christological affirmations of the Malankara Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. One Nature Incarnated
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The one incarnate nature of God the Word is itself a result of the union of two natures which are irreducibly, invisibly, and really united in the one Christ. For the Church, to know Christ in two natures will lead one to think of the duality of the Son. The Church affirms that the manhood of Christ is real, but it does not exist in Christ in a state of independence or separation from the Godhead. In the case of the Trinity, the entire ousia is perfectly individuated in each of the hypostases (Persons). When the individual ousia (hypostasis) of the Son united itself with human flesh, it did not separate from the other two hypostases. This is the reason why the Church says that one cannot speak of nature deprived of hypostasis. In the case of manhood also, the Church sees the hypostatic nature of it, but only in union. There is neither reduction, nor absorption, nor confusion, nor separation in union. This union is real, hypostatic, mysterious and ineffable. Therefore, although - the two natures, each on in its own perfection and integrity, exist in Christ, it is not necessary to count them as two in order to escape from the division of Christ into two. Here it can be assumed that the Church insists on a basic asymmetry between the two natures. The centre is always the hypostasis of the Word. It is the nature of the Logos incarnate to be human. So, it is not necessary to put the natures side by side as if they were parallel and equal to each other. In short, the concern behind this affirmation is by no means to belittle the manhood of our Lord, but to confess it without falling into a position which implies a division of the one Christ.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. If the Hypostasis is One, Nature is also One
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Here it is obvious that this is an affirmation against the Chalcedonian definition of two natures and one hypostasis. The Chalcedonian definition is that the one hypostasis and one person of Christ should be known in two natures, and the union is hypostatic but not natural. Our Church, seeing the nature as synonymous with hypostasis, finds difficulty with this formula. According to our Church, one cannot demonstrate a nature deprived of hypostasis and it is argued that if Christ exists in two natures, it is necessary that there may be two hypostases also. The abstract ousia, in its perfection, is individuated in the hypostasis of the Son. Therefore one cannot separate the nature from its hypostasis. That is to say, the abstract, unless it has become concrete, cannot come into a real existence in the world of time and space. And this is the idea behind the affirmation that if the hypostasis of Christ is one, the nature also should be one. Therefore, as we believe, the Chalcedonians are mistaken in their claim that there is one hypostasis and two natures after the union. Maintaining two natures after the Incarnation they must speak of two hypostases as the Nestorians do.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. If Person is One, then nature and Hypostasis are also One
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is the argument of our Church against the Nestorian christological formula. For the Nestorians, Jesus Christ is one person, in two natures and two hypostases. Our Church cannot agree with this definition. According to us, if Jesus Christ is one person, He should also be one nature and one hypostasis.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Church tries to highlight the weakness of the Nestorian profession of the union by will and love only. The church believes that the union of will and love is a nominal one and it will lead one to think of the duality of sons. If the union is not hypostatic but personal by the will and love only, that union will be as that of the brotherly association between two persons. For the Church, the union of God the Word with the manhood is real and is hypostatic and natural, and it is free from confusion and mixture. If there are natures, which are, united themselves, it is necessary that their union must be natural. Because if the union is not natural, but hypostatic or personal only, not the natures that are united among each other, but the hypostases only or the persons, that which is absurd. Nobody in effect, among the Christians, dares to say the hypostases and the persons are united themselves without the natures. It is to be noted also that the will is not opposed to the nature in Christ. They generally accompany each other and they find themselves one with the other and agreeing among themselves.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    4. One from Two
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The one incarnate nature of God the Word is composed of two natures. Here, the emphasis is not a chronological priority of the nature, as concrete realities but as one incarnate nature of God the Word. Jesus Christ is composed of the two natures of Godhead and manhood, which are united in him in the same way as the body and the soul are united in every man. This formula is very important for two reasons, that is to say, to conserve the pure union and to safeguard the distinctive marks of the natures. God the Word is one hypostasis. He united to Himself hypostatically to the flesh endowed with a rational and intelligent soul, which was assumed from Mary. The natures therefore, which came in to union were hypostases although the manhood received its hypostatic status only in the union. The one from two is one person. This one person is not simply God the Son. Whereas God the Son is merely divine, Jesus Christ as person has been formed of a union of Godhead and manhood. Thus He is one double nature and one composite hypostasis. The concern here is not to explain away either of the natures, but to affirm the real unity.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    5. One Composite Hypostasis and One United / incarnate Nature
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The union of Godhead and manhood in Jesus Christ is not a union of two natures understood as abstract realities, but of God the Son with the manhood that became individuated in the union. Though the manhood was not a self-subsistent hypostasis over against God the Son, it is hypostatic in the union. Therefore the one hypostasis or one nature in Jesus Christ is not simple, but it is composite hypostasis and united nature. That is to say, God the Word, before the flesh, is one only nature and a simple hypostasis, but after the flesh, it is no more simple, but a united nature and composite hypostasis. It is by nature that Jesus Christ is perfect God and Perfect man, but a united nature formed from two natures, divine and human. The duality should be suppressed in order that the union may be confirmed. But the duplication is not stopped because of the non-mixing of natures from which is formed this one nature. The main emphasis is always with the term one nature incarnated.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    6. With and Without Change and Conversion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    With regard to the natural and hypostatic union, the Church uses the words Change and conversion both positively and negatively. In the union, the divine hypostasis and the human hypostasis remain what they were in their particular nature, without corruption nor confusion, without change nor conversion. Here these terms are used in a negative sense. But the divine and human natures do not remain as they were before the union. That is, in their relation, and in their action by the divine hypostasis acts on the human or the action undergone by the human hypostasis from the part of divine. Therefore one can be assured that, after the union, there is no corruption and confusion, but change and conversion, and more, change and conversion is not of nature or in nature, but in the relation and affinity, which respect to the similitude which is outside the nature. So one can conceive a union, which safeguard the essences, although it is above the intelligence.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This notion of &apos;change and conversion&apos; within the union allows us to say clearly and without contradiction that the Word became flesh, and how the incarnated Word suffered death on the cross. However, the assumption of flesh by God the Word is not conceived as a profession (as in the teaching attributed to Nestorians), but as natural and hypostatic.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the same way, the saying, &apos;the incarnate Word suffered death on the cross&apos; does not indicate that the divinity suffered passion and death. It is not natural that the Godhead should suffer death. However, because of His union with the flesh, the Malankara Church rightfully refers to the death of Christ, the incarnate Word. The same system can be applied to our teaching on the title &apos;Mother of God&apos; to Mary also.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    7. Without Mixture and Confusion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The concepts of without mixture and without confusion are absolutely fundamental to our Christology. So far we have been examining the way in which the hypostases were kept distinct within the union; here we shall see why and how we could not have mixed or confused them. The Eutychians upheld the doctrine of mixture and confusion. For us, the mixing and confusion are proper to the body and accidents. The divine nature is neither a body nor an accident and consequently it is beyond all substantial changes. Therefore, the mixing of it with the body or the accidents is impossible. The basic mistake of those who mix or confuse the natures or hypostases in Christ is that they are thinking in materialistic terms, as though the two natures in Christ are material substance that could be mixed together.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    8. The Impassible, Immortal and Incorruptible Body after the Resurrection
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The manhood of Christ was our manhood in reality, perfection and integrity; although it was itself untouched by sin, it was involved in the effects of the corporate sin of mankind; and that it gained the impassability and immortality only by the Resurrection, through a life of complete obedience, suffering and death. The body of our Lord, although it had possessed each one of the properties of the Word (to conquer the world, not being conquered by the passions, never been touched by any kind of sin etc.) from the beginning of the union, it has got the divine properties such as impassability, incorruptibility, immortality and without need for any nourishment), etc, only after His Resurrection. Here also one should not think that the body possessed all the properties of the divine nature. To state it more clearly, after the Resurrection also, the body of our Lord was created, finite, visible, and non-consubstantial to the Word, as it was before the Resurrection. As it was one with the Word-in its union and not in consubstantiality-it remained the same after the Resurrection also. Thus the Church affirms the non-confusion and the non-mixing of the natures even after the Resurrection. In short, Jesus Christ was not a mere man, but God the Son united with man (God-man). He continues to be that God-man after His Resurrection also. He confined His disciples in their faith that the body in which they see Him and know Him is not a phantasm, nor an appearance, but that He rose in reality as He had promised. His body gained impassability, incorruptibility and immortality only by Resurrection, following a life of complete obedience, suffering and death.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    9. Mary is the Mother of God
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The title of Mary as the Mother of God (yoldat Aloho) is central to the Christology of the Church. God the Word was born of her, not in the sense that the divinity of the Word took the beginning of its existence from her, but that the Word of God Himself, Who was born of the Father from all eternity, in these later days for our salvation&apos;s sake made the flesh without change and mixture, and born of her. The holy Virgin did not bring forth a mere man, but a true God, not God simply, but God Incarnate; not a body which came down from heaven and passed through her as through a canal, but the Word who took in Himself if the flesh of her which is consubstantial to us. Therefore, against those who teach that Jesus had a heavenly and imaginary body, the Church proves that body was in every way the same as ours. Against the Appillinarists, we insist that the Word united to himself a body which had a rational soul. Against the teaching of the Eutychians, we affirm that the human nature was not destroyed by the natural and hypostatic union. In this way, the Church affirms the perfect humanity of our Lord Jesus Christ which is from the Virgin Mary.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Church does not withhold the titles mother of man (Anthroptokos) and mother of Christ (Christotokos) from Mary, because, the Virgin has given birth to a perfect man and perfect God who is Christ. The title Mother of God, however, is the excellent one because it proves the Incarnation of God the Word. Mary was never for an instant the mother of a mere man. At the very moment of conception, the Word took of the holy Virgin the flesh animated by a rational soul, and an intellectual soul and was united to Him naturally and hypostatically. Thus, having been conceived and brought forth a God incarnate, the Son, and Christ, and Lord, Mary became the mother of God. The other two titles are included in this more superior title. The word &apos;incarnate&apos; is very crucial in Malankara Church&apos;s Christology. We strongly condemn those who denied the reality of Jesus&apos; body (Especially against Eutychians and Julians). The body that Mary brought forth was flesh of her flesh and blood of her blood. It was formed in her by the divine operation. Apollinarius granted that Christ assumed a body like a sensitive soul, and ours but he taught that the Word had taken the place of the rational soul. The Church objects that such a being would not be a man.. The Church states that the Word assumed all- a body, rational soul and intellectual soul and their properties. God the Word became a perfect man without sin, because sin is not constituent element of the human nature.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    God the Word Himself is the Only Begotten Son of God, who became man born of the holy Virgin. He was born corporeal in so far as He became man, not dwelling in a previously formed man as in prophet. Here we may see another sense of the use of the term Theotokos. That is to say, the other mothers are also called Christotokos or Anthropotokos-the mothers of the prophets and kings etc. but the only Theotokos is the Holy Mother of God, Mary.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In brief, God the Son became man. Though the Virgin was the mother of the manhood alone, because the manhood had come into being, and existed, only in union with God the Son, she gave birth to God incarnate, and therefore she was Theotokos. This confession is not to minimise the reality and perfection of Christ&apos;s manhood, but to insist of the unity of Christ.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Conclusion
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Church always affirms one important christological formula that our Lord Jesus Christ is the &quot;One Incarnate nature of God the Word&quot;. The one in the one incarnate nature cannot be taken in a single sense. The One nature of which the Church speaks is the one which includes the fullness of the Godhead and manhood. The Church never used the term one in the sense of single nature. The one nature is incarnated, and therefore it is one united nature. This united nature is one person. The incarnate nature is one because the coming together, without confusion, of two natures in the unity, namely of the one person, is indicative of the concurrence of both of them. Thus Jesus Christ is one united-nature. This does not imply any reduction and division of nature but only the affirmation of unity which the convergence of the two natures effected.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center">
                      The Malankara Orthodox Syrian Church confesses our Lord Jesus Christ as the One Incarnate nature of God the Word—perfect God and perfect man, one person, without confusion, without separation.
                    </p>
                  </div>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}
