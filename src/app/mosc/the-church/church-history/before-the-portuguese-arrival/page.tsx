import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Before the Portuguese Arrival | History | The Church | MOSC',
  description:
    'The Thomas Christians before the Portuguese arrival: East Syrian connection, travelers’ records, migrations to Kerala, Persian sources, and possible conclusions.',
};

export default async function BeforePortugueseArrivalPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Before the Portuguese Arrival"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'History', href: '/mosc/the-church/church-history' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Church History – Before the Portuguese Arrival"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Thomas Christians Before the Portuguese Arrival
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    With regard to the status of the Indian St. Thomas Christians before the Portuguese arrival, it is admitted unanimously by all classical historians that it was in close connection with East Syrian Christianity. Apart from the evidence available in the 16th century, almost all the evidence from the 4th century onwards admits the same. Out of the study of this evidence, the following can be held. One, the expansion of Christianity in the East, especially in India, was not the work of Hellenist Christian missionaries from Antioch or from any other areas within the former Roman Empire. It was the work of Jewish Christian missionaries such as Adai in Edessa, Aggai and Mari in Persia, and Thomas in India. In the East Syrian tradition St. Thomas was the great Apostle. The Christian churches thus formed were ecclesiastically independent of Antioch or any other centre in the West. It is difficult to present the pre-Portuguese history of the St. Thomas Christians in India in a contiguous manner due to lack of sufficient historical records. But we get certain glimpses in the writings of foreign visitors, in the church traditions preserved in India and East Syria, occasionally in casual references by Indian writers, and from a few monuments and inscriptions. Out of these the following outline can be drafted.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Travelers&apos; Record
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The first truly substantial mention of the church of St. Thomas in our modern India is made by Western travellers of the late Middle Ages. They are Marco Polo (1298), John of Monte Corvino (1293), Friar Odoric (1325), John de Marignolli (1349) and Nicolo Conti (c. 1440). All these mention a church or shrine of St. Thomas in India at Mylapur. Similarly references to the nature of Christianity imply that it was East Syrian. Marco Polo is emphatic in the above said emphases. It is from the account of John Marignolli that one hears, for the first time, Indian Christians addressed as St. Thomas Christians. However, the first unquestionable historical evidence of an Indian church and of its relation with the East Syrian church is from Cosmas the Alexandrine traveller. Cosmas, who travelled the countries beyond the Red Sea between 520–530, mentions in his Christian Topography well-organized Christian churches in Ceylon, Malabar, Calliana, and Socotra with bishops appointed from Persia. What Cosmas intended from his book was to give a picture of a Persian church that had spread all over Asia. Although among them there were Persian immigrants, yet most of these churches were of native origin. The Indian church was not a daughter church of the East Syrian Church, because the East Syrians themselves admit that the Indian Church had a separate apostolic origin from the apostolic labours of St. Thomas.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Migration of East Syrians to Kerala
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Apart from the ecclesiastical relationship that had been established with the East Syrian church, there were at least two important waves of immigration of Persian Christians to India, one in the 4th century and the other in the 9th, which strengthened the already existing communities in India. The tradition about the first immigration is this: that 72 families of Persian Christians under the leadership of a merchant Thomas, including deacons, priests and a bishop, migrated and settled at Kodungalloor; Cheraman Perumal, the King of Malabar, invested them with royal privileges, land and other things inscribed on copper plates. They also built a town Mahadevarpattanam near Kodungallur. Since these Christians tried to preserve their ethnic separation, till date they are known as the Southists or Knanaya Christians among the St. Thomas Christians. They are now in a divided condition—a group adheres with the Roman Catholics and exists within the Syro-Malabar Church and another with the West Syrian Church under an Archbishop. Both of the groups are centred in Kottayam. Though the ecclesiastical relation between the Indian Christians and the East Syrians existed even before the arrival of the first immigrants, this arrival not only strengthened the existing Kerala Christian community but also influenced its liturgical life. It is said that it was after the arrival of Thomas C&apos;nai that the Christians of Malabar accepted the rites and ceremonies of the Syrian Church. This may not be a complete acceptance of the Syrian rites and ceremonies because there were indigenous traditions in the Indian church. However it is most likely that the arrival was the beginning of Syrian influence on the liturgical life and practice of the Indian Church.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The second migration is dated to the year AD 823 and the tradition claims that the Christian immigrants rebuilt the town of Quilon in AD 825, from which date the Malayalam era is reckoned. This Syrian colony was led by two saintly bishops Mar Sapor and Mar Prot with Sabrisho. Till the Synod of Udayamperoor there were churches among the Thomas Christians built in the name of these saintly bishops. The Synod, considering these bishops Nestorian, ordered the renaming of those churches in the name of &apos;All Saints&apos;. There are innumerable ancient churches among the St. Thomas Christians in the name of All Saints, which is clear indication that those churches were formerly the churches of Mar Sapor and Mar Prot. This evidence alone is enough to prove that the Indian Christians between the 9th century and 1599 were part of the East Syrian Church. The contemporary evidence to the arrival of this second colony of Persian Christians is available in five copper plates which are still in existence—three in the Catholicate Palace, Kottayam, and two with the Mar Thoma Church at Tiruvalla. These plates contain records of grants made to the Christians in Quilon by the kings. Among these grants certain rights are reserved in perpetuity to the Christians in Quilon. Most important of these is the guardianship of the steelyard, the weights and the royal stamp. The church is given land let out under certain conditions and also certain families of lower castes are assigned for the maintenance of the church. The Christians had the sole responsibility of administering justice in their territory. The Christians were to enjoy protection from the Venad militia called The Six Hundred and from the Jewish and Manigramman leaders. In the light of the royal grants the picture which emerges is important. The Christians are clearly a well-established community, accepted and highly respected. The granting of responsibility for the weights and measures is an unusual sign of confidence; it may indicate that the immigrants had a higher level of mathematical and commercial competence than the Indians among whom they had settled. There are also certain inscriptions and monuments surviving from this period, which speak of the connection between the Indian church and the Persian church. The monuments consist of five carved stone Crosses (known as St. Thomas Crosses), which have been discovered in South India, the first at St. Thomas Mount near Madras and others at Kottayam and some other places in Kerala. These are Persian Crosses and are dated to the 7th or the 8th century.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Witness of Persian Sources
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From Cosmas&apos;s account it was observed that there was a well-organized Christian church in India hierarchically connected with the East Syrian Church. The two immigrations from the East Syrian Church to Kerala suggest frequent contacts existed between the Indian and East Syrian Christians. Though small in number, the Indian Christians from the earliest centuries of the Christian era were not a group isolated from fellow Christians in Alexandria and Persia. We know of Pantaenus—an Alexandrine scholar, who visited India in the 2nd century. But we have no evidence of any relationship of the Indian church with the church in Alexandria. But in the case of the East Syrian or Persian church, there came into existence a sort of relationship from a very early date, though it is difficult to say when this relationship was established. One may wonder why the Indian church came to establish a relationship with the Persian church and not with others. A possible explanation is that both East Syria and India claimed St. Thomas as their Apostle and in that sense they had a common apostolic origin. Hence they were proud of their Thomistic origin and preferred to be in the same family. The Indian church claimed St. Thomas as their founder and the East Syrians had a special relationship with St. Thomas, as it was he who sent Addai to Edessa; Aggai and Mari who evangelized Persia were the disciples of Addai. Edessa and Persia always unquestionably upheld St. Thomas to be the Apostle of India. However we also have to note that according to certain traditions existing in India, St. Thomas on his way to India embarked at Basra in the Persian Gulf. In all probability St. Thomas might have preached in Basra and its neighbourhood; and thus they claimed him as the founder of their church. The first contact of the Indian church was with the church in Basra (Fars), the name of Thomas linking them together. The available evidence indicates that this relationship of the Indian church with the church in Basra existed at least from the 3rd century.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Chronicle of Seert, an important East Syrian document belonging to the 7th century, mentions that Dudi, bishop of Basra in the Persian Gulf, an eminent doctor, left his see between AD 295–300 and went to India where he evangelized many people. When the Episcopal hierarchy of the East Syrian Church was fully centralized and organized at the beginning of the 5th century (410), the bishopric of Rewardashir was elevated to a Metropolitanate and given jurisdiction over relations with India. Rewardashir was strategically located on the direct sea route to India near the head of the Persian Gulf on its eastern side, and the province included Basra. This arrangement continued till the 7th century when Patriarch Ishoyahb II (628–43) appointed a Metropolitan for India separately. The reason might have been the increase of Christians in India. Mingana mentions that between 6 and 12 suffragan bishops were consecrated for India and that the metropolitan of India outranked that of China and that China outranked that of Central Asia. Metropolitans of distant sees such as India, China and Samarkand were exempted from attending the general Synod of the Church because of the great distance. Instead they had to write a letter to the Patriarch declaring their allegiance to him and informing him of the state of their province.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    According to Mingana, the 5th century opens with an Indian Christianity which was in such a state of development that she was able to send her priests to be educated in the best schools of the East Syrian church, and to assist the doctors of that church in the revision of the ancient Syriac translations of the Pauline epistles. He says: &quot;In a precious Colophon to his commentary on the epistle to the Romans, Isshodad writes as follows: This epistle has been translated from Greek into Syriac by Mar Komai, with the help of Daniel the priest, the Indian.&quot; During the patriarchate of Ishoyahb III (650–60), there arose a rift between him and the Metropolitan Simon of Rewardashir. It is reflected in a letter of the former addressed to the latter which has come down to us, in which, related to the Indian church, three things can be noted: (1) Metropolitan Simon in his opposition to the Patriarch was violating the canons as he had closed the door of Episcopal succession in the face of the many people of India; (2) Consequently the Episcopal succession has been interrupted in India and the country has since sat in darkness; (3) Simon&apos;s negligence has affected not only India that extends from the borders of the Persian Empire to the country which is called Kalah, which is a distance of one thousand and two hundred parasangs, but also his own Fars. This letter is an important evidence that the Indian church was in close relation with the Persian church under the East Syrian Patriarch.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    While the great East Syrian Patriarch Timothy I (779–823) was ruling over the church, three incidents happened also bearing witness to the fact that the Indian church was looked after by the East Syrian Patriarchate. (1) The Patriarch, in a letter written to the monks of the Maron monastery in reply to the controversy concerning the use of the words &quot;Crucified for us&quot; in the Trisagion, says: &quot;in all countries of Babylon, of Persia, and of Assyria and in all countries of sunrise, that is to say among the Indians, the Chinese, the Tibetans, the Turks, and in all provinces under the jurisdiction of this Patriarchal See there is no use of &apos;Crucified for us&apos;.&quot; (2) A letter written by Patriarch Timothy to Hanon Isho of Sarbas shows that during those times the monks of the Persian church were being named as missionaries to India and China. (3) This Patriarch had finally reconciled with the rebellious metropolitan of Rewardashir, who refused to obey Patriarchal suzerainty over his diocese saying that Rewardashir is the See of Thomas and not that of Mari. Mingana notes that there is a lectionary composed at Cranganore in 1301, in the archives of the Vatican Library. The document gives the information that the lectionary was composed in the days of the East Syrian Patriarch Yahb Alaha V and of the Indian metropolitan Mar Jacob. The compiler refers to Mar Jacob as the leader of the Holy Indian church occupying the See of the Apostle St. Thomas, and to himself as deacon Zachariah. It is clear from this that the reference to the &quot;See of St. Thomas&quot; had been in use in those times and that the Indian church functioned then under the jurisdiction of the East Syrian Patriarch.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Possible Conclusions
                  </h3>
                  <ol className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-decimal pl-6 space-y-4">
                    <li>
                      The connection of the Indian church goes back to the second century itself or even to the Apostolic period because of the connection of St. Thomas both with India and Persia. The book Acts of the Apostle Thomas—a second-century Syriac document which originated in the Edessan circle—has testified that the relics of St. Thomas were deposited in Edessa as the result of their being transferred from Mylapore; this is strong evidence of an earlier connection between the Indian Church and the East Syrian church.
                    </li>
                    <li>
                      By and large Christianity in India till 1599 belonged to the East Syrian church. Its supreme head was the Catholicos-Patriarch of Babylon. It had no relation whatsoever with the churches and sees in the Roman Empire. India had bishops and enjoyed Metropolitan status and they resided in Kodungallur, Angamaly, or Bombay. Moreover the bishops always were East Syrian and never of Indian origin.
                    </li>
                    <li>
                      Though we do not have details of the extent of Indian Christianity, it would be a great mistake to think that in the early and medieval periods it was only found in South India. There are solid grounds for believing that fairly large Christian communities existed in North India and on the western coast of India from very early times. The majority of these were undoubtedly Indians by blood and ancestry. However the majority of its faithful was concentrated in Kerala or more precisely between Palayur in the north and Quilon in the south. There were strong but scattered Syrian Christian communities along the West Coast, in Goa, Saimur (Chaul), Thana, Sopara, Gujarat and Sind. The east coast also had a Christian community close to the shrine of St. Thomas at Mylapore. All sources of information available from the early and medieval periods point to the fact that there were scattered communities of St. Thomas Christians in different parts of the Indian continent. This was achieved especially due to the connection of the Indian church with the East Syrian Church, which in its missionary outreach was a Church without comparison.
                    </li>
                    <li>
                      The church of India never had a native ecclesiastical language. Syriac was its liturgical tongue. It is held that it was the lingua franca from eastern Persia to western India until the 7th century. The early Syrian Christians being converts from the Jews might also have had a love for Syriac. From the 4th century onwards the Persian influence was felt more and more in the liturgical life of the St. Thomas Christians, which certainly acted contrarily against the development of any native language of South India as conducive to ecclesiastical use. If one looks at the Malayalam decrees of Udayamperoor it is clear that the kind of Malayalam which prevailed was rough and uncultured.
                    </li>
                    <li>
                      It is also true that the Thomas Christians enjoyed a sound social status and lived a truly appreciable indigenous lifestyle identical to that of non-Christian natives. They lived in harmony and mutual respect with non-Christian religious communities. But in church matters the Thomas Christians were the followers of the East Syrian Church and its characteristics.
                    </li>
                    <li>
                      The Persian connection of the Thomas Christians was beneficial to the latter to a limited extent, especially for the fact that this connection opened the small Indian Christian community to a larger Christian world. But many see this relation as compromising the independent and indigenous growth of the community. A tighter control of the Persian Church over the St. Thomas Church adversely affected the spontaneous growth of the community into a genuine Indian Church with Indian patterns of thought, worship, lifestyle, etc. It meant that the Thomas Christians led a life not in one world but in two. This was a bit of a contradiction. The core element of Christian life remained foreign, adapted only peripherally, and that too in a country which possessed a rich culture, philosophy, and spiritual tradition. Hence with the coming of the Vasco da Gama era these Christians had to undergo various troubles, divisions and further foreignization from time to time.
                    </li>
                  </ol>
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
