import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Holy Qurbana | Liturgy | MOSC',
  description:
    'The Malankara Orthodox Liturgy: structure of the Eucharist, preparation rites, anaphora of St James, meaning of the Holy Qurbana and of the symbols.',
};

export default async function HolyQurbanaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Holy Qurbana"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Liturgy', href: '/mosc/the-church/liturgy-worship' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Holy Qurbana"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Malankara Orthodox Liturgy
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Since the 17th century, the Malankara Orthodox Church uses the Syrian Orthodox Liturgy, which belongs to the Antiochene liturgical tradition. The East Syrian (Persian), Byzantine, Armenian, Georgian, Maronite liturgies also belong to the same liturgical family. In the first half of the fifth century, the Antiochene Church adopted the anaphora of Jerusalem, known under the name of St James, the brother of Our Lord. In the fourth and the fifth centuries, the liturgical language of Jerusalem and Antioch was Greek. Therefore, the original form of St James liturgy was composed in Greek.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following the Council of Chalcedon (451), the Eastern Church was divided into two, one group accepting the council and the other opposing it. Both groups continued to use the Greek version of St James. The Byzantine emperor Justin (518-527) expelled the Non-Chalcedonians from Antioch and they took refuge in the Syriac speaking Mesopotamia on the Roman-Persian Border (modern Eastern Syria, Iraq and South East Turkey). Gradually, the Antiochene liturgical rites were translated into Syriac. New elements such as Syriac hymns were introduced into it.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It was Mar Gregorios of Jerusalem, who came to Malankara in 1665 who introduced Syrian Orthodox liturgical rites in our Church. The most striking characteristic of the Antiochene liturgy is the large number of anaphoras (Order of the celebration of the Eucharist). About 80 are known and about a dozen are used in India. All of them have been composed following the model of St James.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Structure of the Eucharist
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>1. Preparation rites (tuyobo):</strong> The important elements of the preparation rites are the vesting of the celebrant and the preparation of the bread and wine on the altar. The priest places the bread in the paten and pours the wine in the chalice and holds them in the form of a cross. Then he remembers the names of the faithful, the sick and the departed. Then he places the paten and the chalice on the altar and covers them with the veil (Sosappa). The preparation rites are concluded with censing.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>2. Public celebration or Pre-anaphora:</strong> The pre-anaphora begins with a solemn procession around the altar. Formerly at this time the bread and wine were solemnly brought to the altar in a procession. During the procession, the congregation sings the anthem (manitho) composed by Patriarch Mar Severios of Antioch (+518). This entrance hymn is a beautiful summary of our doctrine of Christ. In fact there are several liturgical hymns and prayers that describe the faith of the Church in a rather simple style. After the procession, the priest begins the Trisagion, which is addressed to Christ.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>3. Reading of the Scriptures:</strong> Then the Epistles and the Gospel are read. Formerly, the lessons from the Old Testament were also read at this moment. The Gospel is the &quot;life-giving proclamation&quot; of the words and deeds of our Lord Jesus Christ. Our worship and our hope are founded on the salvific work and the life-giving words of the Lord. In the early Church, the Scripture reading was followed by the sermon, a custom still followed by many Churches. Sermon is an important element of the worship and it aims at explaining the meaning and relevance of the text that was read.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>4. Promiun-Sedra and the Blessing of the Censer:</strong> The Syriac word Sedra means &apos;row&apos; or &apos;series&apos;. Sedra is a series of prayers and meditations. Promiun (Greek word means introduction) is the introduction to Sedra. Promiun and Sedra help us to participate in the Holy Qurbana with devotion and attention. Then as the first step of the censing of the whole church, the celebrant offers incense and blesses the censer. The blessing of the censer in the Name of the Holy Trinity implies that we offer our prayers to the Triune God. Incense and censer are the symbols of Christ, who &quot;offered Himself as a fragrant offering and sacrifice to God&quot; (Eph. 5:2). According to the Book of Revelation, &apos;the prayers of the saints ascend before God as an incense&apos; (Rev. 5:8). Therefore the offering of incense means that the prayers of the Church ascend towards God as a fragrant offering that pleases God.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>5. The Nicene Creed:</strong> Creed is the summary of the faith of the Church since the apostolic times. Chanting of the Creed in the Holy Qurbana and in all prayers and sacramental celebrations means that we are worshiping in accordance with the faith of the apostles and the Church fathers. Creed is the confession of our faith in the Holy Trinity, the Church, one baptism, the Kingdom of God and the final resurrection. These fundamental doctrines are regularly evoked in our prayers.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>6. Offering of the Holy Qurbana:</strong> The part of the celebration that follows the Creed is called &apos;Anaphora&apos; (Greek word means &apos;offering&apos;). As the first step, the priest washes his hands, symbolizing the purification of the heart. Then he kneels down before the altar and says an inaudible prayer and commemorates the names.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>7. Kiss of peace and the lifting up of the veil:</strong> Kiss of peace is exchanged in accordance with our Lord&apos;s words to reconcile each other before offering a sacrifice (Mt. 5:23-24). Then the deacon asks the people to bow down their heads and the priest prays God to send His blessings upon those who have assembled before Him. Then the priest lifts up the veil with which the paten and chalice are covered. The lifting up symbolizes that the life-giving and heavenly mysteries are revealed through the Holy Qurbana. This is followed by the Trinitarian blessing.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>8. Introductory Dialogue:</strong> With the dialogue (Lift up your hearts…, Let us give thanks to the Lord..) the central part of the celebration begins. The priest says the prayer of thanksgiving, which evokes God&apos;s mercy towards us. In fact the whole Holy Qurbana is a thanksgiving (Eucharist) for the great things that God had done for us by sending His Son for our salvation. Then the congregation chants the &apos;Sanctus&apos; (= holy) or the angelic hymn (Is. 6:3), implying that we are joining the heavenly worship and praising God along with innumerable angels.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>9. Words of Institution:</strong> The celebrant signs crosses over the bread and wine proclaiming the institution of the Eucharist by Christ in His Last Supper. Thus the event that took place in the Upper-room has been evoked and we are made participants in it. The Roman Catholic Church gives undue importance to the Words of Institution and teaches that the bread and wine are &apos;transformed&apos; into the body and blood of Christ when the priest pronounces them. This is known as &apos;transubstantiation&apos; and the Orthodox Churches do not accept this theory.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>10. Anamnesis or the Commemoration of the Salvific works:</strong> During the Last Supper, Our Lord instructed His disciples: &quot;Do this in remembrance of me&quot; (Lk. 22:19; 1 Cor. 11:24-25). Following this commandment, the priest evokes the events in the earthly life of our Lord and His second coming. The Holy Qurbana has been founded on the salvific works of our Lord and it anticipates His second coming and the life in the coming world.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>11. Invocation of the Holy Spirit (Epiclesis):</strong> Invocation of the Holy Spirit is one of the characteristic traits of the Orthodox liturgy. In the Anaphora of St James, we ask God the Father to &quot;send the Holy Spirit upon us and upon the Eucharist placed on the altar&quot;. The Holy Spirit descends and makes the bread and the wine the very body and blood of Christ. The same Spirit comes and abides in us to make us the Church, the Body of Christ.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>12. Intercessions (Tubden):</strong> The intercessions contain six canons (&apos;set of prayers&apos;), each consisting of three prayers. The first three canons commemorate the living and the rest the departed. The intercessions are the prayers for the well being of the whole members of the Church, both living and the departed. Among the departed saints, we remember those who have lived as witnesses to Christ, especially the Virgin Mary, the Apostles, the martyrs, and all the doctors of the Church who have zealously guarded the apostolic faith.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>13. Fraction:</strong> The fraction ceremony is the preparation for the communion. The prayer during the fraction evokes the passion, death and resurrection of Christ, the living bread who was &quot;broken&quot; on the cross for our salvation.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>14. The Lord&apos;s Prayer:</strong> Here the Lord&apos;s Prayer serves as the preparatory prayer for receiving the Holy Communion. The phrase Give us this day our daily bread has been often interpreted as a request for the Holy Communion. At the end of the Qurbana, we address God &quot;Our Father&quot; and thus we confess that we are His sons through our communion with Christ.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2"><strong>15. Holy Things to the Holy:</strong> This is an invitation to receive the Holy Qurbana, as well a warning about its sacredness. The entire congregation cries out: The One Holy Father…Holy Son, the Holy Spirit with us. This means that through the Holy Qurbana, we have been granted communion with the Holy Trinity. Then the service is concluded with the Kuklion, which is a cycle of prayers seeking the intercession of the Virgin Mary and the saints, as well as commemorating the departed priests and faithful.</p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6"><strong>16. Holy Communion and the Thanksgiving:</strong> The priest first receives the communion, followed by all those who are in the Madbaha. Then the Holy Mysteries are brought to the people to communicate them. In the thanksgiving prayer that follows, the priest gives thanks to God for His abundant mercy &quot;wherewith He has made us worthy to partake of His heavenly table&quot;. With the dismissal, the celebration is concluded.</p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Meaning of the Holy Qurbana
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Holy Qurbana is our participation in the Body and Blood of Christ. This faith has been founded on Our Lord&apos;s words during the Last Supper (This is my Body..my Blood..). Following our Lord&apos;s instruction Do this in remembrance of Me, we offer the Holy Qurbana. St Paul says: &quot;As often as you eat this bread and drink this cup, you proclaim the Lord&apos;s death until he comes&quot; (1 Cor. 11:26). Since the apostolic times, Holy Qurbana was the central act of the Sunday worship (cf. Acts 20:7). Since the Eucharist is the Body and Blood of Christ, St Paul instructs to participate in it with great devotion and care (1 Cor. 11:27-28).
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    According to St Paul, through our participation in the one Eucharistic bread we become one in Christ: &quot;The cup of blessing which we bless, is it not a participation in the blood of Christ? The bread which we break, is it not a participation in the body of Christ? Because there is one bread, we who are many are one body, for we all partake of the one bread&quot; (1 Cor. 10:16-17).
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In fact, the goal of the incarnation was to unite the humanity as the sons of God, because, as a result of sin, we had become alienated from God. Baptism and Eucharist are the means to bring human beings into union with Christ. Sacraments, daily prayers, Bible reading, the faith of the Church, all have one aim—to make us one in Christ. The Church and its arrangements, especially the symbols help us to meditate on Christ and to live in communion with Him and to worship the Triune God.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Meaning of the Symbols
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Symbols represent invisible divine realities. They are the means of creating a sense of divine presence. A symbol can either be an object or an action. Bread, wine, chalice, paten, altar, cross, candles, and censer are some of the symbols that we use in the celebration of the Holy Qurbana. They are used to express the depth of the meaning of the celebration and its divine character.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The use of symbols is not against the teaching of the Bible. In the Old Testament, the people of Israel used a large number of symbols. The second commandment prohibits the making of &apos;graven image, or any likeness of anything in heaven, on earth or in sea&apos; (Ex. 20:4). But the Jews never understood it as a prohibition of the use of symbols in their worship. Thus they considered the temple of Jerusalem and the objects in it as most holy. The temple, the altar and the Ark of the Covenant were the symbols of God&apos;s presence in the midst of Israel. The cover of the ark, known as &apos;the mercy seat&apos; and the images of two cherubim above it were considered as the most important liturgical objects (Ex. 25:10-22). The cover of the ark was qualified as Yahweh&apos;s throne or footstool. Christianity has inherited the custom of using symbols from the Old Testament.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 italic">
                    <strong>Rev. Fr. Dr. B. Varghese, Professor, Orthodox Theological Seminary, Kottayam</strong>
                  </p>
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
