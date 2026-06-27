import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import QuickLinks from '../../components/QuickLinks';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

export const metadata = {
  title: 'Early Church Fathers',
  description: 'Church Fathers during the 4th and 5th centuries - Pamphilus, Eusebius, Athanasius, Basil, the Gregories, John Chrysostom, Cyril of Jerusalem, Cyril of Alexandria.',
};

const currentSlug = '/mosc/saints/early-church-father';

export default async function EarlyChurchFatherPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'saints' ? 'saints' : 'home';
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Early Church Fathers" breadcrumbFrom={breadcrumbFrom} />
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/saints/early-church-father.jpg"
                    alt="Early Church Fathers"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>
                <div className="prose prose-lg max-w-none font-syro-primary text-syro-dark-gray leading-relaxed space-y-4">
                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue">Church Fathers during 4th and 5th Centuries</h2>
                  <p className="text-justify">
                    The fourth and fifth centuries may be regarded as the greatest centuries as far as the defense of faith is concerned. There were many heresies attacked the Church and the Church strongly defended its true faith through her faithful believers. The heroic children of the Church fought against the opponents of the Church through their teachings and literary works. We can say, without any doubt, these significant personalities are really heroes, the champions of Orthodoxy. The Church cherishes them in her heart as sources and models for Spirit inspired life.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">PAMPHILUS OF CAESAREA (+ ca AD. 309)</h3>
                  <p className="text-justify">
                    Pamphilus was born at Berytus in Phoenicia. After the primary education in his native place, he went to Alexandria for higher studies. He then reached Caesarea and read books on Theology and Philosophy from the library of Origen. He became a priest and votary of Origen. He took copies of many important works and added them to Origen&apos;s collection of books. Maximinus had started his persecutions and had imprisoned many Christians including Pamphilus. While imprisoned in the persecution of Maximinus, he wrote an Apology for Origen, highlighting the greatness of Origen&apos;s theology. He made many copies of the Greek Bible, which later led to the propagation of the Bible. Pamphilus&apos; Chief contribution was that he shaped Eusebius into a student of history who later became the father of Church history. Pamphilus suffered martyrdom by 309.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">EUSEBIUS PAMPHILUS OF CAESAREA (ca.AD 263-340)</h3>
                  <p className="text-justify">
                    Eusebius, the Father of Ecclesiastical History, was born at Caesarea in Palestine about the year 263 AD. Eusebius grew up as the disciple and spiritual son of Pamphilus and he got good education and training in research. In gratitude to Pamphilus, Eusebius took his name and called himself Eusebius Pamphili implying Eusebius, son of Pamphilus. When Pamphilus died, he fled to Tyre, then to Egypt and at the end, he returned to Caesarea in 313, and there he became a bishop. It was at this time that the disputes about Arius&apos; heresy rocked the whole Church of the Roman Empire. Eusebius also participated in some discussions. He put forward a proposal to solve the problem. Unfortunately, it created three groups in the Church: 1) those who favoured Arius, 2) those who favoured Athanasius and 3) those who favoured Eusebius, the mediator. He enjoyed the Emperor Constantine&apos;s friendship and it was a very influential one. He died around 340 AD.
                  </p>
                  <h4 className="font-syro-display font-medium text-base text-syro-blue mt-6 mb-2">LITERARY CONTRIBUTIONS OF EUSEBIUS OF CAESAREA</h4>
                  <p className="text-justify font-semibold">Historical writings</p>
                  <p className="text-justify">
                    History of the Church (inter.AD 300-325): Eusebius Ecclesiastical history is the principal source for the history of Christianity from the Apostolic Age to his own day. It contains an immense range of material on the Eastern Church, largely in the form extracts taken over bodily from earlier writers. It contains ten books. The first book is a historical analysis about Jesus Christ. The remaining books contain facts connected with the growth of Church. Importance is given to the description about martyrs.
                  </p>
                  <p className="text-justify">
                    The Chronicle (ca.AD 303): It contains a summary of universal history with a table of dates. Eusebius himself gives the work the title Chronicle Rolls and epitome of the complete History of the Greeks as well as of the Barbarians. This work is divided into two parts. The first part aims at giving a chronological account of the outstanding events of each nation. The second part gives a co-ordination of these events. Throughout this work, there runs the idea that the remote history of his own time is closely connected.
                  </p>
                  <p className="text-justify font-semibold">Apologetic works</p>
                  <p className="text-justify">
                    Preparation for the Gospel (inter AD. 314-320): It contains fifteen books. The object of the work is to refute pagan polytheism and to show the superiority of Judaism, which served to prepare for the gospel, the good news of man&apos;s salvation.
                  </p>
                  <p className="text-justify">
                    Proof of the Gospel (inter AD. 316-322): It contains twenty books and it answers the Jewish objection that Christianity has accepted from Judaism, its promises and blessings, and shows that Christianity is a divine development of Judaism.
                  </p>
                  <p className="text-justify font-semibold">Dogmatic works</p>
                  <p className="text-justify">
                    Against Marcellus: He wrote two books against Marcellus of Ancyra whom he accused of being Sabellian, in 336 AD. Ecclesiastical Theology: It is a work in three books, written in the year 337 or 338 AD. The work constitutes a more detailed refutation of Marcellus of Ancyra than his Against Marcellus, and it defends the true doctrine of the Logos.
                  </p>
                  <p className="text-justify font-semibold">Biographical work</p>
                  <p className="text-justify">
                    The Life of the Blessed Emperor Constantine is an inspiring work, contains four books. The circumstances of the conversion of the persecuted Church into the royal Church and the transformation of the heathen temples into Christian Churches are especially noteworthy.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">ATHANASIUS OF ALEXANDRIA</h3>
                  <p className="text-justify">
                    Athanasius was the great soldier of faith who fought bravely for truth. St. Basil describes him as the Divine doctor given to the Church. St. Gregory of Nazianzus depicts him as the Pillar of the Church. His life was eventful and he became famous as the fighter against Arius&apos; heresy.
                  </p>
                  <p className="text-justify">
                    Athanasius was born in Alexandria around AD.295. In those days, Alexandria was a great centre of learning and Athanasius was able to become familiar with the various branches of learning. He had heard a great deal about Christian heroes who had faced persecution with unflinching courage. He had also heard about the Saints who spent their lives in contact with God in the deserts and forests of Africa. Therefore, he decided to become a Christian full of saintliness, knowledge and faith. When he was boy, he once told his friends about Christian faith. The force of his words made them accept baptism. Alexander, the Metropolitan of Alexandria was surprised at this. Thereafter, Athanasius&apos;s studies and training were perused directly under his supervision.
                  </p>
                  <p className="text-justify">
                    Alexander, Bishop of Alexandria made Athanasius stay with him, taught him theology, logic, and physical sciences, and gave him training in spiritual life. Subsequently, Athanasius decided to have first-hand knowledge of the ascetic life of African forests and deserts. He went in search of St. Anthony with the blessings of Alexander of Alexandria. He met him and stayed with him for some time as his disciple and helper. This contact with the saint helped him produce the work Life of Anthony. Then, Athanasius returned to Alexandria. Bishop Alexander made him a deacon in 319 and appointed him as his secretary. It was at this time that he produced the works Against Pagans (Oratio Contra Gentes) and On the Incarnation.
                  </p>
                  <p className="text-justify">
                    Those were the days when Arius&apos; heresies were rocking the Church Athanasius realized that Arius&apos; denial of Christ&apos;s divinity would ruin the basis of Christian faith. Immediately he started using his tongue and pen against Arius. He argued that the basis of Christian faith is that God saved man by incarnation, and that if Jesus Christ is not God, we had not been saved. In the end, Emperor Constantine convened the synod of Nice to resolve the issues including this.
                  </p>
                  <p className="text-justify">
                    Athanasius attended the synod as the Secretary of Bishop Alexander. The synod lasted for three months and Athanasius&apos; voice reverberated in it. It was very difficult to take decisions against Arius. Athanasius stood firmly for the phrase homousion tō patri (of the same substance with the Father) to qualify the Son. He was not ready to accept even the phrase homoiousion tō patri (of the similar substance with the Father) suggested by moderates like Eusebius of Caesarea. The essential part of the Creed about faith in the Son of God was written in the Nicene Synod under the leadership of Athanasius.
                  </p>
                  <p className="text-justify">
                    In 328 AD, he succeeds Alexander in the see of Alexandria. Then he visited the Churches under his jurisdiction and confirmed the believers in true faith. The problem created by Arius was a headache to him. They influenced the Emperor and brought forward many allegations against Athanasius. At last, the exiled Arius and his companions were called back; Athanasius was accused of theft, adultery and murder. However, they failed to prove their allegations. Later he was accused of treason and false witnesses were presented against him. The allegation was that Athanasius blocked the ship bringing corn from Egypt to Byzantium. Hearing the words of the false witnesses the Emperor ordered Athanasius to be exiled to Tyre in 335 AD.
                  </p>
                  <p className="text-justify">
                    Athanasius was banished five times and brought back five times according to the disfavour or favour of the rulers who succeeded Emperor Constantine in the east and in the west. Athanasius had to spend seventeen years in banishment suffering persecution. However, he was not prepared to give up his faith or compromise it in any adversity. Once some one told him, The whole world opposes Athanasius. However, he retorted, Athanasius contra Mundum. The believers, gradually, realized the way in which Arius and his followers abused Athanasius and they prevailed upon Emperor Valence to call Athanasius back (366 AD) and entrust him with the administration of Alexandrian Church. Thereafter, Athanasius enjoyed peace in life. The great Athanasius consecrated Peter as Metropolitan to succeed him and died on 2 May 373.
                  </p>
                  <p className="text-justify font-semibold">LITERARY CONTRIBUTIONS OF ATHANASIUS OF ALEXANDRIA</p>
                  <p className="text-justify">
                    Apologetic works: Treatise against the Pagans (Oratio Contra Gentes); Treatise on the Incarnation of the Word (Oratio de incarnatione Verbi) (ca. AD. 318). Dogmatic works: Discourses against the Arians; Four letters to Serapin of Thmuis; Encyclical letter; Letter concerning the Decrees of the Council of Nicea; Letter to Adelphius; Letter to Epictetus of Corinth. Festal letters. Exegetical works (commentary on Psalms). Ascetical writings (Life of St. Anthony).
                  </p>
                  <p className="text-justify font-semibold">MAIN TEACHINGS OF ATHANASIUS OF ALEXANDRIA</p>
                  <p className="text-justify">Teachings of Athanasius may be summed up as follows:</p>
                  <ul className="list-disc pl-6 space-y-2 text-justify">
                    <li>Even though the Trinity is a mystery, it is the supreme Truth.</li>
                    <li>The incarnation and death for redemption are inseparable, because redemption is possible only by the incarnation of God himself who died for our sins.</li>
                    <li>He was not adopted by the father, but the father adopted us in Him.</li>
                    <li>To save us from our sins, Christ the only holy one who had no sin, carried our sins for us, died for us and was resurrected for us; His sinless perfection is the witness of the Bible (Jn.8:46; 8:29).</li>
                    <li>Christ is God&apos;s high priest (Heb.6:20) and the unique mediator between God and man (Heb.8:6; 9:15; 12:24; 1 Tim.2:5); He is God&apos;s perfect image (Col.1:15), first-born of all creation as well as responsible for all creation, truly begotten from the Father not made, and the first-born from the dead (Col.1:18).</li>
                    <li>Jesus Christ was not a servant, though He took the form of a servant; though by Himself He was not poor, yet He made Himself poor.</li>
                    <li>Jesus Christ is perfect God and perfect Man.</li>
                    <li>The Father, The Son and The Holy Spirit are of the same substance (homousios).</li>
                  </ul>
                  <p className="text-justify">
                    Athanasius&apos;s main teaching on Christ is contained in the phrase homousios (consubstantial) and in this statement: He became man so that we might be made God; and He manifested Himself in the flesh, so that we might grasp the idea of the unseen Father; and He endured the insolence of men, so that we might receive the inheritance of immortality (On Incarnation 54:3). The doctrine of salvation would have been in danger, if the heresy of Arius had gained momentum. Athanasius found in the Incarnation and Crucifixion a single act of God in His attempt to redeem humanity. He refused to see them as two different actions. Athanasius taught about the Divinity of the Holy Spirit and His emanation from God. If The Holy Spirit were not God, it would not be possible for human beings to become divine.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">4. BASIL THE GREAT OF CAESAREA</h3>
                  <p className="text-justify">
                    The three great lights who are so often referred to as the Three Cappadocians are Basil the Great of Caesarea, his friend Gregory of Nazianzus, and his own brother, Gregory of Nyssa. Basil the Great is the senior venerable member among them. He was the first ascetic leader of the Eastern (Greek) Church tradition. Also called Second Athanasius, he proved his personality not only in the ascetic movement but also in the realms of Church administration and theology.
                  </p>
                  <p className="text-justify">
                    Basil was one among the ten children of a rich family of Caesarea in Cappadocia around AD 330. His father, Baselius, was known, as a scholar and eminent writer throughout Cappadocea. His mother Emmelia was the daughter of a martyr. Of the ten children in the family, three became bishops: Basil himself, made bishop of Caesarea in 370, Gregory, bishop of Nyssa, and Peter, bishop of Sebasty. The eldest sister Macarena became a nun and started a nunnery.
                  </p>
                  <p className="text-justify">
                    As a student in Athens, Basil first met Gregory of Nazianzus, joining with him in a friendship so close that in his eulogy to Basil in 381 AD, Gregory could say that they were one soul with two bodies. In 359, he became a monk. He traveled through Syria and Egypt to study the life of monks. He came back, sold his property and other belongings and gave the money to the poor. He started a hermitage on the bank of the river Iris. The number of hermits gradually increased and Basil formulated a few rules for them. During this time, Gregory of Nazianzus visited him and together they codified Origen&apos;s Spiritual exhortations under the title Philokalia. They also reformed and enlarged the rules for monks. By this time, Eusebius (not the historian Eusebius) of Caesarea heard about Basil and invited him to be his assistant. Basil agreed. Eusebius ordained him a priest and gave him the responsibility of the diocesan administration.
                  </p>
                  <p className="text-justify">
                    After the death of Eusebius, Basil became the bishop of Caesarea. As the Metropolitan, he assumed the charge of administration of Caesarea and the whole of Pontus. Basil emphasized two things in administration: protection of true faith and social activities. He fought against Arius&apos; heresy, Macedonianism and Apollinarianism. He found many abuses to be corrected including the simony and the laxity ordination, and faced a good deal of opposition. Finally, he brought the clergy of Caesarea into a high standard of life. He undertook great social relief works. Among the Church Fathers, there seems to be none who gave more importance to social activities than Basil did. He established hospitals, Rest houses and centre to give training in jobs. He also started institution to help those who suffer from famine and poverty. After a life of hard works, he died on 1 January 379.
                  </p>
                  <p className="text-justify font-semibold">Literary Contributions of Basil the Great</p>
                  <p className="text-justify">
                    Basil&apos;s works may be classified as Books supporting faith (dogmatic works), Works about the Bible, those related to ascetic life and homilies, letters etc. Dogmatic: Against Eunomius; De Spiritu Sancto. Exegetical: homilies on Genesis, Psalms, Isaiah. Ascetical: Moralia, Monastic rules. The Holy Trinity is the main subject of his dogmatic writings. He opposed all those who regarded the Holy Spirit as subordinate to the Son. His teachings insist that the Father, the Son and the Holy Spirit are of the same essence. He used Ousia and Hypostasis to explain the unity and Trinity of God.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">5. GREGORY OF NAZIANZUS</h3>
                  <p className="text-justify">
                    Gregory was born around AD 330 at Arianzuz in Cappadocea. His father was Gregorios who was the Bishop of Nazianzus. His mother, Nonna, was an ideal woman. Gregory says in one of his speeches about the profound influence his mother had on him. &quot;My mother dedicated me to God even before I was born&quot;.
                  </p>
                  <p className="text-justify">
                    Gregory was educated first at Caesarea in Cappadocea and later at Caesarea in Palestine, Alexandria and Athens. He became acquainted with Basil for the first time when he was studying language and literature at Caesarea in Cappadocea. They kept that warm and intimate friendship until the end of their lives. When Gregory returned to his native place after completing his education, Basil invited him to his hermitage on the bank of river Iris in Pontus. There both together codified Philokalia and rules for hermits. When Gregory returned from Pontus, his father invited him to serve the Church. Probably, at Christmas 361, his father ordained him priest. He helped his father in Church affairs. His fame began to spread everywhere. He was a deep scholar who led a meek, ideal and simple life. In 379, the believers of Constantinople invited him and he went there. At that time, most of the believers in Constantinople were the followers of Arius. He lived in a small house, which he turned into a church, and from here in the space of two years, he restored the real Orthodox ascendancy. Emperor Theodosius gave him the important churches of Constantinople, including the Cathedral. It was when he was serving as the bishop of Constantinople that Emperor Theodosius convened the second Universal Council in 381. Some opposition cropped up about Gregory&apos;s position in the Church. He gladly abandoned his position and returned to Nazianzus. He died in 389.
                  </p>
                  <p className="text-justify font-semibold">Literary Contributions</p>
                  <p className="text-justify">
                    Gregory is one of the great Church Fathers, and one of the greatest orators of Christian antiquity. He alone, among the Fathers is given St.John&apos;s title, The Theologian. Orations (including five theological orations), Discourses on special occasions, Letters (about 243), Poems. Main teachings: The doctrine of Trinity is the heart of true Christian faith. He stressed the complete humanity of our savior along with His complete divinity. The union between the Godhead and perfect humanhood is very necessary for the perfect redemption of humanity.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">6. GREGORY OF NYSSA</h3>
                  <p className="text-justify">
                    Gregory of Nyssa is the younger brother of Basil of Caesarea, born about the year 335 AD., and the third of the Three Cappadocians. He was known as the star of the Nyssa. He was a devotee who became eloquent in silence and a spiritual spark burning in devotional ascents. He was an extraordinary gifted man as mystic, theologian and writer.
                  </p>
                  <p className="text-justify">
                    Gregory was educated under the guidance of his father and the elder brother, Basil. Hence, he sometimes called his brother my teacher. After his education, he became a rhetoric literaryast. He liked to visit and stay with the hermitage started by his elder brother, Basil of Caesarea. Persuaded by Basil, he became a deacon. However, ignoring the work of deacon, he did the work of a language teacher. It is believed that at this time he married a young woman called Theosebaya, and his wife died very soon. After the death of his wife, he was encouraged by his friends to become a priest. At the same time, he received a number of letters from his friend Gregory urging him for a life in a hermitage. Accordingly, he went to the hermitage on the bank of river Iris. There his life became brilliant, purified in the crucible of spiritual experiences. He got a lot of time to read, study and write.
                  </p>
                  <p className="text-justify">
                    It was at this time that Basil appointed Gregory as the Bishop of the small town of Nyssa. Since he had no experience or skill he was not successful in administration. However, he tried his best to confirm the believers in the true Nicene faith. Hence, the followers of Arius deposed him once. Realizing that his life was in danger he was forced to run away from Nyssa. On the death of the Arian Emperor Valencius in 373, Gregory returned in triumph to his see in 379. Gregory was given the responsibility of the greater diocese of Sebasta too. He played a significant role, along with his friend Gregory, in the Synod of Constantinople in 381, and he was one of the principal theologians there in the Council. He was often invited as the special guest and spiritual advisor of the royal palace in Constantinople. Generally, his physical health was not good; he died in 394.
                  </p>
                  <p className="text-justify font-semibold">Works and Contributions</p>
                  <p className="text-justify">
                    Works are classified into: exegetical, dogmatic, ascetical, discourses, letters. Main teachings: Men must be regarded as many because each of them acts independently; the Godhead is one because Father never acts independently of the Son or the Holy Spirit. The Divine action begins from the Father, proceeds through the Son and is completed in the Holy Spirit. About incarnation, Gregory taught that God came to be in human nature, but the manner of the union is as mysterious and inexplicable as the union between body and soul in man.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">7. JOHN CHRYSOSTOM</h3>
                  <p className="text-justify">
                    John Chrysostom succeeded Gregory of Nazianzus as the Patriarch of Constantinople. Both had brilliant personality. Nevertheless, both failed to please the envious and those in authority; hence, they had to give up their positions. The life history of John Chrysostom is the history of his unflinching fight against injustice.
                  </p>
                  <p className="text-justify">
                    John Chrysostom was born at Antioch, the capital of Syria in AD 344 or 347. His parents were Christians. His father, Secundus, was a high-ranking army officer, and his mother Anthusa was a very god-fearing woman. His earliest education came from his mother who was widowed at the age of twenty. John studied philosophy under Andragathius and rhetoric under Libanius, a famous pagan sophist and rhetorician. When John was about eighteen years of age, he met Meletius, the Bishop of Antioch. He learned Christian faith from Meletius and received baptism in 369. Meletius directed him to the school of Diodore of Tarsus. Here he met and formed a lifelong friendship with Theodore of Mopsuestia. After his education John lived an ascetical life, but his mother begged him not to leave her alone. After his mother&apos;s death in 370, he went to a mountain near Antioch and he spent four years there and two years in a cave in ascetic practices and study. In 381 AD he was ordained a deacon by Meletius, and in 386 AD a priest by Flavian. Under Flavian John was assigned for twelve years as preacher in the main church of Antioch. It is to his preaching and because of his eloquence that he is called Chrysostom, which means golden mouthed. The Emperor of Constantinople also came to know about him.
                  </p>
                  <p className="text-justify">
                    When Nectarios, the Patriarch of Constantinople died in 397, many bishops wished to succeed him. Because of this problem, Emperor Arcadius elected John Chrysostom as the Patriarch of Constantinople. Theophilus of Alexandria objected but he himself gave leadership to the consecration ceremony under the instruction of the Emperor. After his consecration, John Chrysostom began to reform the Church and aroused a great opposition. Emperor Arcadius was a weak, narrow minded man, and he was completely under the control of his minister, the eunuch Eutropius. Eutropius was an unprincipled, various and ambitious man. Chrysostom fearlessly opposed Eutropius. Eudoxia, the empress, was a woman of vanity and she became a bitter enemy of Chrysostom. Although Chrysostom was usually peaceful and patient, his zeal for God, Church and justice often led him to blunt speech and action offensive to those in high places. In 401 AD at a synod in Ephesus, he deposed six bishops as guilty of simony, with the result that all forces opposed to him consolidated in a united effort to destroy him.
                  </p>
                  <p className="text-justify">
                    Theophilus&apos; dislike of John turned to an active hatred when he had to come personally to Constantinople in 402 AD to answer charges brought against him by the desert monks of Nitria, before a synod presided over by Chrysostom. Theophilus had expelled some fifty desert monks on ground of their Origenist view in theology. In the meantime, the enemies of John falsified the sermons of Chrysostom and spread the news that he had slandered the empress. John Chrysostom often preached on the vanity and luxury of women, and Eudoxia was easily convinced that Chrysostom had aimed at her. Arcadius, influenced by Eudoxia and Eutropius, urged Theophilus to hold a synod and depose John Chrysostom. Theophilus called a synod at Oak, near Chalcedon in 403, together with thirty-six bishops, and deposed John Chrysostom. Arcadius then expelled John Chrysostom to Bithynia. However, on the day of exile a terrible earthquake occurred which filled the palace with fear. Suddenly, John Chrysostom was called back. His return was a great event.
                  </p>
                  <p className="text-justify">
                    The uneasy peace lasted only two months. The empress erected a statue of herself near the Cathedral, and the noise of the celebrations interrupted the liturgical ceremonies in the Church. From his pulpit, John Chrysostom attacked it bitterly and he requested the city prefect to put an end to the disturbance. Eudoxia considered it as a public insult. The emperor ordered him to retire and he refused. The emperor then forbade him the use of any church. On the Easter Vigil of 404 AD John Chrysostom and his followers went to the place where some 3000 catechumens assembled to be baptized. The soldiers broke up the service and the baptismal water flowed with blood. A few days after, to avoid more bloodshed, Chrysostom left secretly. On June 9, 404 AD, Chrysostom was ordered into exile to Cucusus in Lesser Armenia, where he remained three years. Arsacius first and then Atticus succeeded in Constantinople, but the people who were supporting John Chrysostom did not accept them. Eudoxia died a few months after. From Cucusus John Chrysostom maintained contact with his flock and with Antioch. When his enemies saw that his followers still visited him, they compelled the emperor to send him to a remote place, Pityus, on the eastern shore of the Black Sea in order to avoid his contact. Toward the end of June 407, the soldiers forced him to walk bare headed and bare foot in sun and rain to Pityus. Worn out with hardship and fever he died en route at Comana in the Pontus, uttering the words Glory to God for all things, on September 14, 407 AD. Later his mortal remains were brought to Constantinople during the rule of Theodosius II under royal escort, and buried in the church of the Apostles.
                  </p>
                  <p className="text-justify font-semibold">Literary contributions of John Chrysostom</p>
                  <p className="text-justify">
                    No one else among the Greek Fathers has so large a body of extant writings as has John Chrysostom. Exegetical: Homilies on Genesis, on the Gospel of John, on the Gospel of Mathew, on the Epistle to the Romans, on First Corinthians, on Galatians, on Philippians, on Second Timothy, Explanations of the Psalms, on Hebrews, on Thessalonians. Discourses: Homilies on the Incident of the Statues, The Proof that Christ is God, Homilies against the Anomians. Moral and Ascetical Treatises, Letters. Main teachings: The essence of the Father and the Son is same. The Word become flesh without having any change or mixing in their natures, and there is no separation. He applied the term mystery to the sacraments, to Incarnation and Crucifixion. The essence of Holy Eucharist is the uniting of the communicants with Christ. About priesthood, though the service of a priest takes place on earth it should be considered as taking place in heaven.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">8. CYRIL OF JERUSALEM</h3>
                  <p className="text-justify">
                    Cyril was born in Palestine around AD 313. He must have completed his education in Jerusalem and Caesarea. In 335, he was ordained deacon and in 345 Maximus II of Jerusalem ordained him priest. He became the bishop of Jerusalem when Maximus died. He did not engaged in any doctrinal controversies but he opposed Arianism in his writings, and thus, the Arians later troubled him. He was a scapegoat of many wrong notions and so he was exiled three times. It was during his time that a great famine occurred in Jerusalem and its suburbs. Cyril had to sell even the things of the Church to support the helpless that came to him. He was a spiritual father to the pilgrims who came to Jerusalem and to the hermits who lived there. He attended the Synod at Constantinople in 381 and signed the final decision against Arius and Macedonius. He enjoyed the peace that followed the Synod for four or five years. He died in 18 March 386.
                  </p>
                  <p className="text-justify font-semibold">Literary contributions of Cyril of Jerusalem</p>
                  <p className="text-justify">
                    Catechetical Lectures: The lectures are twenty-four in number. Of these, nineteen are pre-baptismal discourses delivered to the candidates during Lent. The last five, delivered to the newly baptized Christians during the Easter Vigil. These lectures give us an idea about the order of sacraments and worship that existed in the fourth century.
                  </p>
                  <p className="text-justify font-semibold">Teachings of Cyril of Jerusalem</p>
                  <p className="text-justify">
                    The main aim of Cyril was to make the Christians and catechumens to know the mysteries of the Church. He gave them the complete instruction on Baptism, Chrismation and Eucharist. He insisted the Church to administer the baptism and the Chrismation together with the Eucharist. According to him, once the Trinity has been invoked, the baptismal water possesses sanctifying power in view of the fact that it is no longer mere water, but water united with the Holy Spirit, Who acts in and through it (Cat.3,3). He gives the meaning of Baptism as follows; it is the bath of regeneration in which we are washed both with water and with Holy Spirit. Its effects can be summarized under three main heads. First, the baptized person receives the remission of sins, i.e., all sins committed prior to baptism. Secondly, baptism conveys the positive blessing of sanctification ie., the illumination and deification, the indwelling of the Holy Spirit, the putting on of the new man, spiritual rebirth and salvation, adoption as God&apos;s son by grace, union with Christ in His resurrection as in His suffering and death, the right to a heavenly inheritance. Thirdly, baptism impresses a seal on the believer&apos;s soul. This sealing takes place at the very moment of baptism, and as a result of it the baptized person enjoys the presence of the Holy Spirit.
                  </p>
                  <p className="text-justify">
                    About Chrismation, Cyril says that, after you had come up from the pool of the sacred streams, there was given chrism, and this is the Holy Spirit (21, 1). Beware of supposing that this is ordinary ointment. This ointment is symbolically applied to your forehead and to your other senses; and while your body is anointed with the visible ointment, your soul is sanctified by the Holy and Life creating Spirit (21, 3). The Lord has given a redemption of repentance, so that our chief sins, or rather, all our sins, may be cast off; and so that we may receive the seal of the Holy Spirit, and may thereby be made heirs of eternal life (4, 26).
                  </p>
                  <p className="text-justify">
                    He professed the real person of Christ in the Holy Eucharist. By partaking of the Body and Blood of Christ, you might become united in Body and Blood with Him. For thus do we become Christ-bearers, His Body and Blood being distributed through our members (22, 3). He emphasizes in many places that the holy Eucharist constitutes the blood and body of Christ. Do not regard the Bread and Wine as simply that; for they are, according to master&apos;s declaration, the Body and Blood of Christ. Even though the senses suggest to you other, let faith make you firm. Do not judge in this matter by taste, but be fully assured the faith, not doubting that you have been deemed worthy of the Body and Blood of Christ (22, 6). The explanation he gives is that, in response to the celebrant&apos;s prayer, God sends the Holy Spirit on the oblations so as to make them Christ&apos;s Body and Blood, for whatever the Spirit touches is sanctified and transformed.
                  </p>

                  <h3 className="font-syro-display font-medium text-lg text-syro-blue mt-8 mb-2">9. CYRIL OF ALEXANDRIA</h3>
                  <p className="text-justify">
                    Cyril was the nephew of Theophilus of Alexandria, and became the Patriarch of Alexandria in 412 after the death of his uncle. As soon as he became a bishop, Cyril started showing an uncompromising attitude to heresies. He said firmly that the true faith and security of the Church were his important concerns and that he would do anything to protect them. He closed the church of Novatians, a schismatic group that denied the power of the Church to observe those who have lapsed into idolatry during persecution. He was also involved in the expulsion of the Jews from Alexandria following their attacks upon Christians.
                  </p>
                  <p className="text-justify">
                    In matters related to Church disputes, two things influenced him much. 1. It was Alexandria alone that once gave chief contributions to the study of Christian theology. Alexandria had its own continuous thought too. It was at this time that another centre of Christian thought, with several differences developed in Antioch. Gradually there occurred disputes, feuds and rivalry among Christian thinkers because of these two basic traditions. This rivalry, in a way, influenced the attitudes of various groups to the heresies. The toughness that Cyril showed to Nestorius was to some extent due to this rivalry. 2. When Constantinople grew into a Second Rome, the position of the Patriarch of Constantinople also was raised accordingly. As a result, the importance of Alexandria was reduced. It was the anxiety caused by this development that the Alexandrian Patriarchs Theophilus and Cyril had against John Chrysostom. What we see in the life of Cyril is the hard attempt to reestablish the vanishing glory of Alexandria.
                  </p>
                  <p className="text-justify">
                    The beginning of Nestorianism and of the theological quarrel that has left its very distinct mark on all subsequent Christianity even to our own time dates to as early as 429 AD, when Nestorius, Patriarch of Constantinople preached that Mary should not be called the Theotokos or Mother of God, but the Christotokos, Mother of Christ. Eusebius, challenged him still a layman but afterwards Bishop of Dorylaeum, who posted on the doors of the Hagia Sophia a rebuttal accusing Nestorius of Adoptionism of Paul of Samosata. Eusebius sent copies of Nestorius&apos; sermons to Celestine, Pope of Rome. Cyril objected the position of Nestorius in a Festal Letter and in an encyclical letter to the monks of Egypt. Pope Celestine of Rome, hearing this news convened a Synod at Rome in 430, condemned the teaching of Nestorius, and warned him of deposition if he will not profess the Orthodoxy. In Alexandria Cyril called a Synod in November 430, at which Nestorius was condemned. Cyril then wrote his famous third letter to Nestorius, to which he attached twelve anathemas for Nestorius&apos; signature. Nestorius&apos; reply was to counter-charge Cyril with being an Apollinarist, and he invited the Emperor to call a council to settle the matter.
                  </p>
                  <p className="text-justify">
                    The third Ecumenical Council met in June 431. Emperor Theodosius II ordered Cyril to preside the Council. Pope Celestine sent three delegates from Rome. Memnon of Ephesus assisted Cyril of Alexandria. The Council started long after the appointed date because John of Antioch and his delegates did not arrive in time. After a period of waiting, the council started in the absence of John of Antioch. Nestorius refused to attend; and in the opening session, one hundred and fifty-three bishops were present. The first day itself, i.e., on 22 June 431 the Council declared, the letters and anathemas of Cyril to Nestorius were Orthodox and they condemned Nestorius as a heretic, deposed and excommunicated. Finally, more than two hundred bishops signed to the deposition of Nestorius. The council proclaimed Holy Virgin Mary as Theotokos. Four days after the first session John of Antioch and his delegates arrived at the city. They protested the Council had proceeded without them and opened their own synod and deposed Cyril and Memnon. On July 17, the fifth session of Ephesus deposed and excommunicated John. The Emperor Theodosius II recognized and confirmed both assemblies, and imprisoned both Cyril and Nestorius. Cyril was in Prison for almost three months. Then, the Emperor condemned Nestorius and reinstated Cyril. Nestorius was sent back to his monastery in Antioch, while Cyril was permitted to return to Alexandria as Patriarch. However, reconciliation was effected between Cyril and John and they together signed a new Creed (Formula of Reunion). Union of the two natures, without mixing and without division and Divine Maternity of Mary was main content of the Creed. Thus, a partial union was achieved in 433 AD. The last fifteen years of Nestorius&apos; life were spent in exile in Arabia, Libya, and finally in the desert of Upper Egypt. Cyril took great care in protecting the true faith. He also spent a lot of time in biblical studies. Gradually he withdrew from his eventful life and died in 444.
                  </p>
                  <p className="text-justify font-semibold">Literary works of Cyril of Alexandria</p>
                  <p className="text-justify">
                    Cyril was a prolific writer and even though many of his works are lost, the collected edition still fills ten volumes in Abbe J.P.Migne, Patrologiae cursus completes: Series Graeca (68-77). The following are his main works. Exegetical: Cyril&apos;s exegetical works are from the major portion of his literary production. His Old Testament exegesis was highly influenced by the Alexandrian allegory and typology. His New Testament exegesis was mystical and allegorical. Worship and Adoration in Spirit and in Truth (seventeen books, dialogue between Cyril and Palladius); Glaphyra or Polished Comments (thirteen books: seven on Genesis, three on Exodus, one each on Leviticus, Numbers and Deuteronomy); Commentary on the Psalms; Commentary on Isaiah (five books); Commentary on the Twelve Minor Prophets (twelve books); Commentary on Matthew; Homilies on the Gospel of Luke; Commentary on John (twelve books); Commentary on the Epistle to the Romans.
                  </p>
                  <p className="text-justify">
                    Dogmatic works: Treasury of the Holy and Consubstantial Trinity; Dialogues on the Holy and Consubstantial Trinity (seven dialogues against Arians); Scholia on the Incarnation of the Only Begotten; Memorials on the True Faith; Against the Blasphemies of Nestorius (Five Books of Contradiction); The Twelve Anathemas; Against those who do not wish to confess that the Holy Virgin is the Mother of God; Defence of Christianity against the books of the impious Emperor Julian; Against the Anthropomorphites. Letters and Sermons: Eighty-two letters preserved; twenty-nine festal letters; about twenty-two sermons extant. It is in Festal letter 17 for the year 429 AD that Cyril first raises objections to Nestorius.
                  </p>
                  <p className="text-justify font-semibold">Main Teachings of Cyril of Alexandria</p>
                  <p className="text-justify">
                    Cyril is known as the chief advocate among the Greek Fathers in defending Christological doctrine. He has been called Seal of the Fathers. He defended and expounded the Trinitarian doctrine of the Greek Fathers especially on the Holy Spirit against the so-called Arian, Macedonian and Eunomian heresies. His chief glory lies in his courageous and brilliant defense and exposition of the union between the divinity and the humanity in the one person Christ. He has the opinion that the union of the nature of God and man in Jesus Christ is beyond human comprehension. However, the incarnate Word of God is one nature of the one person who is the union of the nature of God and man. On his view, the union was real, and he liked to describe it as natural or hypostatic. This formula, he explained, that the nature or hypostasis of the Word, that is, the concrete being of the Word, being truly united to human nature, without any change or confusion, is understood to be, and is, one Christ. He who had existed outside flesh became embodied; the nature or hypostasis which was the Word became enfleshed; henceforth the Word was incarnate. This does not mean that God the Son changed into a man, but it affirms that having united to Himself in His own person the flesh animated with a rational soul, God the Son became man and was called Son of Man. Therefore, Immanuel was one, not bi-personal. There was not a single moment in which the divine nature of Jesus existed differently from the human nature. Therefore, Cyril argued that Virgin Mary must be called the Mother of God in that she gave birth to God on earth, and that was accepted as the official interpretation of the Church.
                  </p>
                  <p className="text-justify">
                    Cyril&apos;s Christology leads one to think of the reality of human salvation. Only if it is the same Christ, who is consubstantial with the Father and with man, can save us, because the meeting point between God and man is in the flesh of Christ. When He shed His blood for us, Jesus Christ destroyed death and corruptibility. For if He had not died for us, we should not have been saved; and if He had not gone down among the dead, death&apos;s cruel empire would never have been shattered. In addition, Cyril saw that the saviour&apos;s death was a sacrifice, the spotless offering obscurely foreshadowed in the Old Testament sacrificial system. According to Cyril, the process of deification, which is our redemption, will attain its climax after the Parousia and the resurrection, when the union of the elect with their Lord will be indissoluble. Baptism cleanses us from all defilements, making us God&apos;s holy temple. Perfect knowledge of Christ and complete participation in Him are only obtained by the grace of baptism and the illumination of the Holy Spirit. The baptismal initiation makes us the image of the archetype, i.e. of Him Who is Son of God by nature, and so sons of God by adoption. The rite of Chrismation is the symbol of our participation in the Holy Spirit. It signifies the perfecting of those who have been justified through Christ in Baptism.                     Christ&apos;s words at the Last Supper, This is my Body, and This is my Blood, (Mt.26:26-28)—lest you might suppose the things that are seen are a figure. Rather, by some secret of the all-powerful God the things seen are transformed into the Body and Blood of Christ, truly offered in a sacrifice in which we, as participants, receive the life-giving and sanctifying power of Christ.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">Saints Categories</h3>
                <nav className="space-y-2">
                  {SAINTS_SIDEBAR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href === '/mosc/saints' ? link.href : `${link.href}?from=saints`}
                      className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
                        link.href === '/mosc/saints' ? 'hidden' : link.href === currentSlug
                          ? 'bg-syro-red text-white'
                          : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
