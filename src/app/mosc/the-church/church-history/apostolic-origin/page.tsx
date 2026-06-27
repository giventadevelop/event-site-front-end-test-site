import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Apostolic Origin | History | The Church | MOSC',
  description:
    'The apostolic origin of the St. Thomas Christians: traditions, the tomb at Mylapur, East Syrian and Graeco-Roman testimony, the Acts of Judas Thomas, liturgical traditions, and Portuguese witness.',
};

export default async function ApostolicOriginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Apostolic Origin"
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
                      alt="Apostolic Origin – St. Thomas Christians"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    St. Thomas Christians Origin
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church of the St. Thomas Christians is an ancient Christian Church and an apostolic Church originated out of the evangelical endeavours of St. Thomas. The following sources can be utilized and analysed:
                  </p>
                  <ol className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-decimal pl-6 space-y-2">
                    <li>The living community of St. Thomas Christians in South India and their traditions.</li>
                    <li>The witness of the Tomb of St. Thomas at Mylapore and its traditions.</li>
                    <li>The tradition of the East Syrian Christianity and the tradition of the Universal Christianity (Graeco-Roman).</li>
                    <li>The testimony of the Fathers.</li>
                    <li>The Liturgical Traditions.</li>
                    <li>Ancient writings and legends—Acta Thoma.</li>
                    <li>The Portuguese witness of the 16th Century.</li>
                    <li>Opinions of Historians.</li>
                  </ol>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Church of St. Thomas Christians and Their Traditions About Their Origin
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The traditions current among the St. Thomas Christians of India with regard to their origin are these: St. Thomas, one among the 12 apostles of Christ, after visiting Socotra came to Muzris (Kodungallore/Cranganore) on the Periyar estuary, north of Cochin, in about AD 52. He preached to the Jewish colony and made converts. He converted natives of sound social and religious standing and established Christian communities at seven places: Maliankara (Kodungallore), Palayur, Paravur (Kottakavu), Gokamangalam (Kokamangalam, i.e. at present Pallipuram in Cherthala taluk of Alappuzha district in Kerala), Niranam (Trippaleswaram), Chayal (Nilackal) and Kollam (Quilon). He also appointed leaders from the leading families from whom he had converts to look after and lead the church. Those families were Kalli, Kaliankal, Shankarapuri and Pakalomattam.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From Kerala St. Thomas proceeded to the eastern parts of South India where also he had converts, and then he moved as far as Malacca and China. Later returning to India he was martyred and buried at Mylapur (near Madras) in AD 72. His mortal remains are entombed at Mylapur, now known as St. Thomas Mount (well-known from the 3rd cent. AD onwards on the basis of written evidence as the burial place of the apostle). The above is the substance of the tradition presented and transmitted by the living community of the St. Thomas Christians of India about their apostolic origin. Details can be found in a few folk songs like Ramban Pattu, Veeradiyan Pattu, Margam Kali Pattu etc., which they used to sing during festival occasions and which now exist in written records. The Portuguese who were present among them in the 16th cent. have clearly attested to the tomb of the apostle at Mylapore. Moreover the tradition of the East Syrian Christianity, with whom the St. Thomas Christians had very close relationship till the 16th century, and of Christianity in the Graeco-Roman world, was that St. Thomas was martyred in India. The non-Christian neighbours of the Thomas Christians also testify to the truth of this tradition.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Liveliness of the St. Thomas Tradition
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    A few important aspects of this tradition which draw our serious attention are these: the seven places where St. Thomas established Christian communities are even now seeable and locatable. In almost all these places there is a strong presence of St. Thomas Christian communities with their tradition, apart from the stories of how they were subsequently diffused into other and surrounding localities. Similarly the port where the apostle landed in Kerala, the places where he preached and did miracles and made converts, the leading families whom he baptized and appointed as caretakers of his communities, and the site where he met martyrdom are traceable, lively and important. So all these are still lively parts of the ancient tradition. Those places where St. Thomas established churches again attract our attention because all those places lay located not only in or near the former Jewish colonies but also in important trading centres near the sea or on back lagoons or river shores (e.g. Kodungallur, Niranam, Palayur, Gokamangalam, Kollam etc.). The leading families from whom the apostle had converts and appointed as leaders exist even now with their hereditary claims from generations. Therefore all the local, physical and circumstantial evidences are in favour of the tradition witnessed by the St. Thomas Christians. It is important to note that there is no rival tradition in the church of the Thomas Christians in Kerala with regard to its origin, and there is no other country in the world which claims that St. Thomas is their apostle and died there.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the absence of such claims and due to the presence of the living community of the Thomas Christians in Kerala along with the presence of the burial place of the apostle at Mylapur from centuries, it is just to admit the prevailing claim that out of the evangelical works of St. Thomas the church of the St. Thomas Christians in India had its origin. The St. Thomas Christians hold their apostolic origin as an article of their church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Tomb of St. Thomas at Mylapur
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is another unquestionable and strong witness to the Indian apostolate of St. Thomas than any other in that respect. Moreover for the vestige of the Thomas tradition this is an evidence of unique importance. In almost every century (commencing from the 3rd century till the 16th) we have one or more testimonies to the existence of the St. Thomas tomb in India. According to all the early documents St. Thomas worked and died in India. From the 7th century the place in India was identified as Calamina or Qalimaya. In the 12th–14th centuries it is in Calamina or Myluph or in Meilan. From that time onwards undoubtedly it was identified as the present Mylapur.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Various Testimonies to the Tomb
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    According to all traditions (Indian, East Syrian, Graeco-Roman, Mylapur etc.) St. Thomas met a martyr&apos;s death, and that event according to the traditions found within the St. Thomas Christians of India and Mylapur was at Mylapur in the Pandiyan kingdom. The Thomas Christians used to go on pilgrimage to this tomb from time immemorial. Testimonies from the 3rd century onwards include: the 3rd-century Syrian writing the Acts of Apostle Judas Thomas (Acta Thoma), which says that the apostle worked in India and met death on the top of a hill in the kingdom of Mazdai; a part of his bones was taken to Edessa by a Syrian merchant called Khabin and a church was built in Edessa in the name of the Apostle. St. Ephrem testifies to this fact and in the 4th century he composed many hymns on St. Thomas on his mission in India, martyrdom and removal of bones to Edessa etc. About the shrine and church of St. Thomas at Edessa there is information from Egeria&apos;s pilgrimage diary at the end of the 4th century. St. John Chrysostom merely says that the site of St. Thomas&apos;s tomb is as much known as the sites of the tombs of St. Peter, St. Paul and St. John, although he does not give definite indication of its location. Gregory of Tours (AD 594) gives an account of the monastery of St. Thomas in India based on the report he had heard from a monk called Theodore who had visited that monastery. In 841 Suleiman, a Muslim traveller, mentions Bethuma (House of Thomas), which can be reached in 10 days from Quilon. Pseudo-Sophronius (7th century AD) seems to be the first to indicate the place name &apos;Calamina&apos; where St. Thomas was martyred and buried. Isidore of Seville (AD 636) and many others following him echo this tradition and all of them definitely say that Calamina is a city in India. Ishoyahb bishop of Saba (i.e. Nisibis) (AD 1187–1222) attests that the body of St. Thomas the apostle is in India; while Solomon his contemporary specifies the place as Mayluph, a city in the land of the Indians. At the end of the century Marco Polo the Venetian traveller visited India and wrote (AD 1293): &quot;It is in this province of Maabar which is styled the greater India at the gulf between Ceylon and the mainland that the body of Messer St. Thomas lies at a certain town having no great population.&quot; The Arab Christian historian Amr Ibn Matte wrote in 1340: &quot;Thomas&apos;s tomb is on the island of Meilan in India, on the right hand of the altar in his monastery.&quot; John Marignolli (AD 1349), John of Monte Corvino (1291), Oderic (1325), Nicolo Conti (1440) all refer to the church of St. Thomas at Mylapur and to the presence of his tomb. In 1504 four East Syrian bishops who arrived in Kerala, in a letter to their Patriarch, clearly say that Mylapur was the house of the holy Apostle Thomas; their letter clearly shows that they knew where Mylapur is: &quot;in the province of Silan which is one of the provinces of India&quot;. When the Portuguese reached India in 1498 the St. Thomas Christians of that country were unanimous that the apostle St. Thomas suffered martyrdom and was buried at Mylapur. The Portuguese also admitted the same since 1517, when during their investigation they interviewed many natives around Mylapur who were mostly non-Christians. The people conveyed to the Portuguese their common belief that St. Thomas had been buried there and that Christian settlements existed in the vicinity. Thus all the above evidences confirm the time-honoured tradition of the Thomas Christians of India which by all means with undeniable evidences attest to the apostolate of St. Thomas in India.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Tradition of the East Syrian and Mediterranean Christianities About the Apostolate of St. Thomas
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Portuguese arrived in South India and met the Thomas Christians who maintained very close contact with the East Syrian Christianity from time immemorial. What was the attitude of this Christianity with regard to the origin of Christianity in India? Before the arrival of the Portuguese there had prevailed a view about the apostolate of St. Thomas within the ancient Christian world around the Mediterranean Sea, which could be named in another way as the Greek-Roman Christian world. Here we analyse these two views.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Tradition of the East Syrian Church on St. Thomas and His Apostolate
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Similar to the Indian tradition it is the strong tradition of the Eastern Christianity, especially that of the East Syrian Church, that St. Thomas was the apostle of Christianity in India. From the 3rd cent. onwards their writings are full of this information. Mingana&apos;s observation in this regard is quite interesting and worth noting here. He writes: &quot;It is the constant tradition of the Eastern Church that the Apostle Thomas evangelized India; and there is no historian, no poet, no breviary, no liturgy, and no writer of any kind who having the opportunity of speaking of Thomas does not associate his name with India. Some writers mention also Parthia and Persia among the lands evangelized by him, but all of them are unanimous in the matter of India.&quot; &quot;For them,&quot; Mingana continues, &quot;India means St. Thomas and St. Thomas means India and they are in such a way synonymous.&quot; Moreover he is emphatic that for the East Syrians India is well-known and when they refer to it, it is always our modern India.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The earliest available record and a detailed account of St. Thomas&apos;s travel and missionary work in India from the side of Syrian Christianity is the book The Acts of Judas Thomas, written in Syriac by an Edessan Syrian Christian around AD 200. The account is a lively one and it ends with this note: &quot;The Acts of Judas Thomas are completed which he wrought in the land of the Indians fulfilling the Command of Him (Jesus), to whom be glory for ever and ever. Amen.&quot; We shall detail the account of this book under the proceeding subtitle in this same chapter. What we want to notice here is this: so far this book was considered a non-canonical or unorthodox production, but modern scholarship has denied such allegations, telling that this book was Orthodox and of historical value. For them this book belonged to an authentic tradition of the Syrian Christianity till the 4th century. The Teaching of the Apostles, a Syriac book written in AD 250, underlines the prevailing tradition in this way: &quot;India and all its countries and those bordering on it, even to the farthest Sea, received the Apostle&apos;s Hand of Priesthood from Judas Thomas, who was Guide and Ruler in the Church which he built and ministered there.&quot; Among the East Syrian writers the most important is St. Ephrem (4th cent. AD), who lived in Edessa, the centre of Syrian Christianity, for some time and was a great hymn writer. While Ephrem was in Edessa it was the resting place of the bones of St. Thomas, which had been brought from India by a Syrian merchant, and an annual festival on 3 July was celebrated there commemorating the martyrdom of St. Thomas. Ephrem composed several hymns in honour of St. Thomas with the themes of his preaching of the Gospel in India, his martyrdom there, the bringing of his bones to Edessa, the honour that the church in Edessa received due to the depositing of the apostle&apos;s bones, the miracles at the shrine etc. What Ephrem in his hymns attested are not his mere personal imaginations purely as a poet but the assent and tradition of the whole Syrian Christianity especially at Edessa. Most of these hymns were sung thereafter in the liturgy of this church for which undoubtedly its Christian people had given most emphatic support with due consideration that those were facts with reference to St. Thomas. From the above observation what is clear in the Syrian church&apos;s position with regard to the origin of Indian Christianity: (1) that the tradition of the Syrian Christianity especially East Syrian was always that St. Thomas was the founder of Christianity in India, that he was martyred there, buried there, and a part of his mortal remains were later carried to Edessa; and (2) that their tradition was never that the Indian Christianity was founded by the missionary efforts of the East Syrian church—because some modern writers like Brown, Firth etc. have ventured, ignoring this fact, to state that the Indian Christianity was founded by the East Syrian Christianity and their missionaries or through immigration of their people into India.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Acts of Judas Thomas
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As stated above this is the earliest available record and a detailed account of St. Thomas&apos;s travel and missionary works in India from the side of Syrian Christianity. In 13 chapters it is narrated. According to this book to the portion of Judas Thomas India fell as the field of his mission, which Thomas refused all along saying to Christ: Lord! Send me anywhere but not to India. As a result Thomas was sold to a merchant called Abban from India, who was looking for a carpenter for his king Gundaphorous to build him a palace. They travelled and reached Andrapolis and then India. Having met the king, Thomas undertook to build the palace for the king and received money. But Thomas instead of building the palace distributed the money to the poor. The king knowing this made enquiries, for which Thomas answered that he had built the palace in heaven which the king will not be able to see now but only after death. Thereupon the infuriated king caught both Thomas and Abban and imprisoned them. The king&apos;s brother Gad died at this time and went to heaven, where angels took him to a beautiful palace which he desired to have. But the angels told him that is built by Thomas for his brother Gundaphorous. Now Gad with permission from the angels returned to Gundaphorous to buy for him the place, and as Gundaphorous came to know about such a beautifully built palace for him by Thomas he became very sad for imprisoning him and immediately released both at his order. Not only that, the king became Christian along with his relatives and people. Thomas continued his mission and converted many not only in this kingdom but also in another kingdom, that of Mazdai in another part of India. Here the apostle met a martyr&apos;s death and was entombed.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Acts describes the miraculous activities of Thomas in India before and after his death. The intention of the book is that St. Thomas, according to the command of his master Lord Jesus Christ, had fulfilled his mission of proclaiming the gospel to the Indians. The author of this Acts and to what purpose it was written etc. have been disputed so far among scholars. But now modern scholarship has admitted these facts: (1) It is the earliest available record and detailed account about St. Thomas&apos;s mission in India from the side of the Syrian Christianity. (2) The allegation that the book is unorthodox is not accepted by modern scholarship; their opinion is that this book belonged to an authentic tradition which had prevailed till the 4th century within the Syrian Christianity. (3) The Acts is a very imaginative reconstruction of the world of Judas Thomas in India; it is neither fiction nor history but it is both—it contains truth and fiction written in a very lively narrative form to reflect both the theology of the East Syrian Christianity and the history of the origins of Christianity in India. Now historians have accepted that the King Gundaphorous mentioned in the Acts was a historical figure, an Indo-Parthian King, because of the availability of coins with his name. According to this account Thomas&apos;s mission was a genuine Indian mission and the book is sufficient to prove the fact that the Indian Christianity had its origin out of the labours of St. Thomas and that he was martyred and entombed there. So he is the Apostle of India.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Tradition of the Graeco-Roman Christianity
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Among the non-East Syrian Fathers and writers, especially those belonging to the Graeco-Roman world, Gregory of Nazianzus, Ambrose, Jerome (4th century AD) hold that St. Thomas preached in India and established the Church there. Origen, Clementine Recognition, Eusebius of Caesarea, Rufinus of Aquileia and Socrates say that Thomas worked in Parthia. Here we are not to see any contradiction as the Parthian empire extended up to North India at that time. By the end of the 4th cent. the Western sources are more or less unanimous that St. Thomas worked in India. Among these come St. Gaudentius bishop of Brescia (AD 410–27), St. Paulinus bishop of Nola (AD 353–431), St. Bede the Venerable (673–735), Gregory of Tours (538–93), Isidore of Seville (636), etc. Cosmas an Alexandrine traveller in the 6th century also states that there was Christianity in India which was definitely the Thomas Christians. In brief a number of fragmentary passages in the writings of the Fathers and writers from the 3rd century speak in unambiguous terms that St. Thomas is the apostle of India. From the 4th century the major churches in the Graeco-Roman Christian world are unanimous in their witness to the above tradition.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Eusebius of Caesarea</strong>—Quoting Origen he writes in his Ecclesiastical History thus: &quot;When the Holy Apostles of Our Saviour were scattered all over the world, Thomas, the tradition has it, obtained as his possession Parthia…&quot; During this period Parthia extended to North West India. Persian tradition too claims Thomas as the apostle of Persia.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Jerome</strong>—He writes about India, the route to India, its people especially the Brahmins. When he writes about Christians and the apostles he mentions Thomas also: &quot;He was indeed at one and the same time with the Apostles during the forty days…. He dwelt in all places; with Thomas in India, with Peter in Rome, with each apostolic man in each and all countries.&quot;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Gregory of Nazianzus</strong>—Gregory says that even though the apostles were strangers to the places they went, they took real efforts to go to the respective places allotted to them. He wrote: &quot;What? Were not the Apostles strangers amidst the many nations and countries over which they spread themselves, that the Gospel might penetrate into all parts…? Peter indeed may have belonged to Judea… Thomas to India, Mark to Italy…&quot;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Ambrose of Milan</strong>—Ambrose had much information about India, its geography and its people. He knew of Muzris (Cranganore) and the river Ganga. He also relates Thomas with India when he writes: &quot;Even those kingdoms which were shut out by rugged mountains become accessible to them as India to Thomas…&quot;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Gregory of Tours</strong>—Gregory says about the martyrdom of Thomas in India and of a monastery there: &quot;Thomas the Apostle according to the history of his passion is declared to have suffered in India. After a long time his blessed body was taken to a city which… is called Edessa in Syria. In that Indian place where he first rested there is a monastery and a church.&quot;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Isidore of Seville</strong>—He had a good knowledge about India. He writes that the apostle Thomas preached the Gospel to Parthians and Indians. He also says that Thomas was martyred in Calamina and was buried there.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>Cosmas the Alexandrine Traveller</strong>—Though Cosmas does not state the apostolate of St. Thomas, he was the first reliable historical evidence of an Indian church on the West coast of India. In Ceylon, Malabar and Kalyan he saw Christians who were definitely from the evangelistic labours of St. Thomas. Moreover they had a bishop at Kalyan who was appointed from Persia.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Testimony of Liturgical Traditions of Ancient Churches
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The unanimous testimony of the Fathers and writers of the early centuries, a few of which are listed earlier, confirm that the Indian Christianity was due to the apostolate of St. Thomas. Since liturgy is the official form of worship which celebrates the faith of the churches, it forms an essential part of the early traditions of churches. The Church universal values the early liturgical traditions of the Churches as authentic sources of the authentic Christian tradition. The major earlier liturgical traditions of the Eastern and Western Churches confirm the tradition of the Indian apostolate of St. Thomas. The East Syrian liturgical tradition, the common heritage of the churches founded by St. Thomas and his disciples, gives great importance to the feasts of St. Thomas. 3 July according to this tradition is the commemoration day of St. Thomas, which in the Indian tradition is known as the feast of Dukrana. According to a Syriac manuscript of 1443 it has the following: &quot;July 3… St. Thomas who was pierced with a lance in India. His body is at Urhai (Edessa) having been brought there by a merchant Khabin. A great festival.&quot; In the liturgy of the Syro-Malabar church for the feast of Dukrana there is a prayer: &quot;St. Thomas built a palace in heaven, beautified it richly, furnished it with all good things and invited the King and people of India to dwell in it and enjoy the bliss.&quot; The liturgy of the Indian Orthodox church also confirms that St. Thomas was killed by an evil man while involved in preaching in South India on 3 July and his mortal remains were carried away to Urhai and placed there by a devotee who came from there. The Martyrology and liturgical calendar of the Roman Church too associate the Church in India with the Apostle Thomas. According to the Roman Martyrology (known after St. George) the martyrdom of St. Thomas is commemorated on 21 December; it refers to the removal of his relics as well to Edessa. According to the Roman Breviary Thomas was martyred at Calamina, pierced with lances. The Byzantine liturgical tradition too refers to the martyrdom by lance. The Menologion of the Greek Church commemorates the martyrdom of St. Thomas in India on 6 October; it is stated that the apostle was led to a hillock where he was killed with a lance by the Indians. The Alexandrine tradition also follows the date of the Byzantine Calendar for the feast of St. Thomas and calls him the apostle of India.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Portuguese Witness of the 16th Century
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    When the Portuguese arrived in South India they met in Kerala the so-called St. Thomas Christians. With them thereafter they had deep contacts for more than a century. Moreover it was entirely due to their efforts that the Thomas Christians were forcefully brought under the Roman Church through an arbitrary meeting which met at Udayamperoor in 1599. Therefore the Portuguese information about the Thomas Christians, their traditions, the tomb of St. Thomas at Mylapur etc. are of immense importance for assessing the origin of Christianity in India. (For Portuguese sources see A. M. Mundadan, History of Christianity in India, Vol. 1, Bangalore: TPI, 1984, 4–5, 377.) As the Thomas Christians came into closer contact with the Portuguese, these Indian Christians told the Portuguese their oral traditions about their origin. Making ample use of these and similar other sources the inquisitive Portuguese wrote down their accounts in the form of letters, reports, depositions and well-composed histories. These are today the richest, and perhaps the earliest written sources of the Indian tradition on the apostolate of St. Thomas and his tomb. The Portuguese also went to Mylapur and settled there from 1517 and collected all information about the tomb of St. Thomas not only from the Christians but also from the natives. Today all these are a wealth of information in various Portuguese documents. According to the Portuguese what one can have about the origin of Christianity in India could be summarized under these three points: (1) That St. Thomas is the apostle of India. (2) That out of his labour the so-called church of St. Thomas Christians had its origin in India. (3) That the apostle met a martyr&apos;s death at Mylapur where also he was entombed at a place which they excavated in 1523.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Opinions of Historians
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The general consensus of opinion among scholars about the origin of Christianity in India is that the foundations of it in India were laid by St. Thomas the apostle. Almost all serious historians do not subscribe to the view that Christianity in India had its origin out of the missionary works of the East Syrian church or of the Roman Catholic Church, because these churches themselves never made any such unique claim. Instead what they always said was that it was due to the apostolic labours of St. Thomas. Two evidences to this are: (1) The living church of the St. Thomas Christians with their tradition, and (2) The presence of the tomb of St. Thomas at Mylapur and its witnesses. Other evidences which support these are: (1) There were frequent trade contacts between India and the Middle East, Greece and Rome even before the time of Christ, so it was possible for St. Thomas to come to India. (2) The presence of the Jewish settlements in South India even before the Christian era has been proven without doubt. There prevailed the presence of an active trade relation between Jews in Israel and South India. Cranganore, Palur, Paravoor etc. where St. Thomas established Christian communities were also Jewish settlements and were great trading centres. It was the presence of the Jews that invited Thomas to those places, where he as a result of his labours established Christianity.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Conclusion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Therefore &quot;The age-old consciousness of the church of St. Thomas Christians—that their origin as Christians is from the mission of St. Thomas the Apostle in India—stands sufficiently justified.&quot; Hereafter we move on to trace how the Orthodox Thomas Christians after 1653 moved as an independent church encountering all oppositions which came before them from the Roman Catholics, and how they came in contact with the West Syrian Christianity.
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
