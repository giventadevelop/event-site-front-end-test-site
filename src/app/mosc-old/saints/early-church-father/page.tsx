import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

export const metadata = {
  title: 'Early Church Fathers',
  description: 'Church Fathers during the 4th and 5th centuries—Pamphilus, Eusebius, Athanasius, Basil, the Gregories, John Chrysostom, Cyril of Jerusalem.',
};

const currentSlug = '/mosc-old/saints/early-church-father';

export default function EarlyChurchFatherPage() {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Church Fathers">📜</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Early Church Fathers
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Church Fathers during the 4th and 5th centuries
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="mb-8">
                  <Image
                    src="/images/saints/early-church-father.jpg"
                    alt="Early Church Fathers"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto object-contain"
                    priority
                  />
                </div>
                <div className="prose prose-lg max-w-none font-body text-muted-foreground leading-relaxed space-y-4">
                  <h2 className="font-heading font-semibold text-xl text-foreground">Church Fathers during 4th and 5th Centuries</h2>
                  <p className="text-justify">
                    The fourth and fifth centuries may be regarded as the greatest centuries as far as the defense of faith is concerned. There were many heresies attacked the Church and the Church strongly defended its true faith through her faithful believers. The heroic children of the Church fought against the opponents of the Church through their teachings and literary works. We can say, without any doubt, these significant personalities are really heroes, the champions of Orthodoxy. The Church cherishes them in her heart as sources and models for Spirit inspired life.
                  </p>

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">PAMPHILUS OF CAESAREA (+ ca AD. 309)</h3>
                  <p className="text-justify">
                    Pamphilus was born at Berytus in Phoenicia. After the primary education in his native place, he went to Alexandria for higher studies. He then reached Caesarea and read books on Theology and Philosophy from the library of Origen. He became a priest and votary of Origen. He took copies of many important works and added them to Origen&apos;s collection of books. Maximinus had started his persecutions and had imprisoned many Christians including Pamaphilus. While imprisoned in the persecution of Maximinus, he wrote an Apology for Origen, highlighting the greatness of Origen&apos;s theology. He made many copies of the Greek Bible, which later led to the propagation of the Bible. Pamphilus&apos; Chief contribution was that he shaped Eusabius into a student of history who later became the father of Church history. Pamphilus suffered martyrdom by 309.
                  </p>

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">EUSEBIUS PAMPHILUS OF CAESAREA (ca.AD 263-340)</h3>
                  <p className="text-justify">
                    Eusebius, the Father of Ecclesiastical History, was born at Caesarea in Palestine about the year 263 AD. Eusebius grew up as the disciple and spiritual son of Pamphilus and he got good education and training in research. In gratitude to Pamphilus, Eusebius took his name and called himself Eusebius Pamphili implying Eusebius, son of Pamphilus. When Pamphilus died, he fled to Tyre, then to Egypt and at the end, he returned to Caesarea in 313, and there he became a bishop. It was at this time that the disputes about Arius&apos; heresy rocked the whole Church of the Roman Empire. Eusebius also participated in some discussions. He put forward a proposal to solve the problem. Unfortunately, it created three groups in the Church: 1) those who favoured Arius, 2) those who favoured Athanasius and 3) those who favoured Eusebius, the mediator. He enjoyed the Emperor Constantine&apos;s friendship and it was a very influential one. He died around 340 AD.
                  </p>
                  <h4 className="font-heading font-medium text-base text-foreground mt-6 mb-2">LITERARY CONTRIBUTIONS OF EUSEBIUS OF CAESAREA</h4>
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

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">ATHANASIUS OF ALEXANDRIA</h3>
                  <p className="text-justify">
                    Athanasius was the great soldier of faith who fought bravely for truth. St. Basil describes him as the Divine doctor given to the Church. St. Gregory of Nazianzus depicts him as the Pillar of the Church. His life was eventful and he became famous as the fighter against Arius&apos; heresy.
                  </p>
                  <p className="text-justify">
                    Athanasius was born in Alexandria around AD.295. In those days, Alexandria was a great centre of learning and Athanasius was able to become familiar with the various branches of learning. He had heard a great deal about Christian heroes who had faced persecution with unflinching courage. He had also heard about the Saints who spent their lives in contact with God in the deserts and forests of Africa. Therefore, he decided to become a Christian full of saintliness, knowledge and faith. When he was boy, he once told his friends about Christian faith. The force of his words made them accept baptism. Alexander, the Metropolitan of Alexandria was surprised at this Thereafter; Athanasius studies and training were perused directly under his supervision.
                  </p>
                  <p className="text-justify">
                    Alexander, Bishop of Alexandria made Athanasius stay with him, taught him theology, logic, and physical sciences, and gave him training in spiritual life. Subsequently, Athanasius decided to have first-hand knowledge of the ascetic life of African forests and deserts. He went in search of St. Anthony with the blessings of Alexander of Alexandria. He met him and stayed with him for some time as his disciple and helper. This contact with the saint helped him produce the work Life of Anthony. Then, Athanasius returned to Alexandria. Bishop Alexander made him a deacon in 319 and appointed him as his secretary. It was at this time that he produced the works Against Pagans (Oratio Contra Gentes) and On the Incarnation.
                  </p>
                  <p className="text-justify">
                    Those were the days when Arius&apos; heresies were rocking the Church Athanasius realized that Arius&apos; denial of Christ&apos;s divinity would ruin the basis of Christian faith. Immediately he started using his tongue and pen against Arius. He argued that the basis of Christian faith is that God saved man by incarnation, and that if Jesus Christ is not God, we had not been saved. In the end, Emperor Constantine convened the synod of Nice to resolve the issues including this.
                  </p>
                  <p className="text-justify">
                    Athanasius attended the synod as the Secretary of Bishop Alexander. The synod lasted for three months and Athanasius&apos; voice reverberated in it. It was very difficult to take decisions against Arius. Athanasius stood firmly for the phrase ὁμοουσιον τω πατρι (of the same substance with the Father) to qualify the Son. He was not ready to accept even the phrase ὁμοιουσιον τω πατρι (of the similar substance with the Father) suggested by moderates like Eusebius of Caesarea. The essential part of the Creed about faith in the Son of God was written in the Nicene Synod under the leadership of Athanasius.
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
                  <p className="text-justify">
                    The Father, The Son and The Holy Spirit are of the same substance (ὁμοουσιος). Jesus Christ is perfect God and perfect Man. Athanasius&apos; main teaching on Christ is contained in the phrase ὁμοουσιος (consubstantial) and in this statement: He became man so that we might be made God; and He manifested Himself in the flesh, so that we might grasp the idea of the unseen father; and he endured the insolence of men, so that we might receive the inheritance of immortality (On Incarnation 54:3). The doctrine of salvation would have been in danger, if the heresy of Arius had gained momentum. Athanasius found in the Incarnation and Crucifixion a single act of God in His attempt to redeem humanity. He refused to see them as two different actions. Athanasius taught about the Divinity of the Holy Spirit and His emanation from God.
                  </p>

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">4. BASIL THE GREAT OF CAESAREA</h3>
                  <p className="text-justify">
                    The three great lights who are so often referred to as the Three Cappadocians are Basil the Great of Caesarea, his friend Gregory of Nazianzus, and his own brother, Gregory of Nyssa. Basil the Great is the senior venerable member among them. He was the first ascetic leader of the Eastern (Greek) Church tradition. Also called Second Athanasius, he proved his personality not only in the ascetic movement but also in the realms of Church administration and theology.
                  </p>
                  <p className="text-justify">
                    Basil was one among the ten children of a rich family of Caesarea in Cappadocia around AD 330. His father, Baselius, was known, as a scholar and eminent writer throughout Cappadocea. His mother Emmelia was the daughter of a martyr. Of the ten children in the family, three became bishops: Basil himself, made bishop of Caesarea in 370, Gregory, bishop of Nyssa, and Peter, bishop of Sebasty. The eldest sister Macarena became a nun and started a nunnery.
                  </p>
                  <p className="text-justify">
                    As a student in Athens, Basil first met Gregory of Nazianzus, joining with him in a friendship so close that in his eulogy to basil in 381 AD, Gregory could say that they were one soul with two bodies. In 359, he became a monk. He traveled through Syria and Egypt to study the life of monks. He came back, sold his property and other belongings and gave the money to the poor. He started a hermitage on the bank of the river Iris. The number of hermits gradually increased and Basil formulated a few rules for them. During this time, Gregory of Nazianzus visited him and together they codified Origen&apos;s Spiritual exhortations under the title Philokalia. Eusebius of Caesarea heard about Basil and invited him to be his assistant. Basil agreed. Eusebius ordained him a priest and gave him the responsibility of the diocesan administration.
                  </p>
                  <p className="text-justify">
                    After the death of Eusebius, Basil became the bishop of Caesarea. As the Metropolitan, he assumed the charge of administration of Caesarea and the whole of Pontus. Basil emphasized two things in administration: protection of true faith and social activities. He fought against Arius&apos; heresy, Macedonianism and Apollinarianism. He found many abuses to be corrected including the simony and the laxity ordination, and faced a good deal of opposition. Finally, he brought the clergy of Caesarea into a high standard of life. He undertook great social relief works. Among the Church Fathers, there seems to be none who gave more importance to social activities than Basil did. He established hospitals, Rest houses and centre to give training in jobs. He also started institution to help those who suffer from famine and poverty. After a life of hard works, he died on 1 January 379.
                  </p>
                  <p className="text-justify font-semibold">Literary Contributions of Basil the Great</p>
                  <p className="text-justify">
                    Basil&apos;s works may be classified as Books supporting faith (dogmatic works), Works about the Bible, those related to ascetic life and homilies, letters etc. Dogmatic: Against Eunomius; De Spiritu Sancto. Exegetical: homilies on Genesis, Psalms, Isaiah. Ascetical: Moralia, Monastic rules. The Holy Trinity is the main subject of his dogmatic writings. He opposed all those who regarded the Holy Spirit as subordinate to the Son. His teachings insist that the Father, the Son and the Holy Spirit are of the same essence. He used Ousia and Hypostasis to explain the unity and Trinity of God.
                  </p>

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">5. GREGORY OF NAZIANZUS</h3>
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

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">6. GREGORY OF NYSSA</h3>
                  <p className="text-justify">
                    Gregory of Nyssa is the younger brother of Basil of Caesarea, born about the year 335 AD., and the third of the Three Cappadocians. He was known as the star of the Nyssa. He was a devotee who became eloquent in silence and a spiritual spark burning in devotional ascents. He was an extraordinary gifted man as mystic, theologian and writer.
                  </p>
                  <p className="text-justify">
                    Gregory was educated under the guidance of his father and the elder brother, Basil. After his education, he became a rhetoric literaryast. Persuaded by Basil, he became a deacon. Basil appointed Gregory as the Bishop of the small town of Nyssa. Since he had no experience or skill he was not successful in administration. However, he tried his best to confirm the believers in the true Nicene faith. Hence, the followers of Arius deposed him once. On the death of the Arian Emperor Valencius in 373, Gregory returned in triumph to his see in 379. He played a significant role in the Synod of Constantinople in 381. He died in 394.
                  </p>
                  <p className="text-justify font-semibold">Works and Contributions</p>
                  <p className="text-justify">
                    Works are classified into: exegetical, dogmatic, ascetical, discourses, letters. Main teachings: Men must be regarded as many because each of them acts independently; the Godhead is one because Father never acts independently of the Son or the Holy Spirit. The Divine action begins from the Father, proceeds through the Son and is completed in the Holy Spirit. About incarnation, Gregory taught that God came to be in human nature, but the manner of the union is as mysterious and inexplicable as the union between body and soul in man.
                  </p>

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">7. JOHN CHRYSOSTOM</h3>
                  <p className="text-justify">
                    John Chrysostom succeeded Gregory of Nazianzus as the Patriarch of Constantinople. Both had brilliant personality. Nevertheless, both failed to please the envious and those in authority; hence, they had to give up their positions. The life history of John Chrysostom is the history of his unflinching fight against injustice.
                  </p>
                  <p className="text-justify">
                    John Chrysostom was born at Antioch, the capital of Syria in AD 344 or 347. His parents were Christians. He studied philosophy and rhetoric. When John was about eighteen years of age, he met Meletius, the Bishop of Antioch. He learned Christian faith from Miletius and received baptism in 369. After his education John lived an ascetical life. After his mother&apos;s death in 370, he went to a mountain near Antioch and he spent four years there and two years in cave in ascetic practices and study. In 381 AD he was ordained a deacon by Miletius, and in 386 AD a priest by Flavian. Under Flavian John was assigned for twelve years as preacher in the main church of Antioch. It is to his preaching and because of his eloquence that he is called Chrysostom, which means golden mouthed.
                  </p>
                  <p className="text-justify">
                    When Nectarios, the Patriarch of Constantinople died in 397, Emperor Arcadius elected John Chrysostom as the Patriarch of Constantinople. After his consecration, John Chrysostom began to reform the Church and aroused a great opposition. Theophilus of Alexandria objected but he himself gave leadership to the consecration ceremony. Enemies falsified his sermons and spread the news that he had slandered the empress. He was exiled. Worn out with hardship and fever he died en rout at Comana in the Pontus, uttering the words Glory to God for all things, on September 14, 407 AD. Later his mortal remains were brought to Constantinople during the rule of Theodocius II and buried in the church of the Apostles.
                  </p>
                  <p className="text-justify font-semibold">Literary contributions of John Chrysostom</p>
                  <p className="text-justify">
                    No one else among the Greek Fathers has so large a body of extant writings as has John Chrysostom. Exegetical: Homilies on Genesis, on the Gospel of John, on the Gospel of Mathew, on the Epistle to the Romans, on First Corinthians, on Galatians, on Philippians, on Second Timothy, Explanations of the Psalms, on Hebrews, on Thessalonians. Discourses: Homilies on the Incident of the Statues, The Proof that Christ is God, Homilies against the Anomians. Moral and Ascetical Treatises, Letters. Main teachings: The essence of the Father and the Son is same. The Word become flesh without having any change or mixing in their natures, and there is no separation. He applied the term mystery to the sacraments, to Incarnation and Crucifixion. The essence of Holy Eucharist is the uniting of the communicants with Christ. About priesthood, though the service of a priest takes place on earth it should be considered as taking place in heaven.
                  </p>

                  <h3 className="font-heading font-medium text-lg text-foreground mt-8 mb-2">8. CYRIL OF JERUSALEM</h3>
                  <p className="text-justify">
                    Cyril was born in Palestine around AD 313. He must have completed his education in Jerusalem and Caesarea. In 335, he was ordained deacon and in 345 Maximus II of Jerusalem ordained him priest. He became the bishop of Jerusalem when Maximus died. He did not engaged in any doctrinal controversies but he opposed Arianism in his writings, and thus, the Arians later troubled him. He was a scapegoat of many wrong notions and so he was exiled three times. It was during his time that a great famine occurred in Jerusalem and its suburbs. Cyril had to sell even the things of the Church to support the helpless that came to him. He attended the Synod at Constantinople in 381 and signed the final decision against Arius and Macedonius. He died in 18 March 386.
                  </p>
                  <p className="text-justify font-semibold">Literary contributions of Cyril of Jerusalem</p>
                  <p className="text-justify">
                    Catechetical Lectures: The lectures are twenty-four in number. Of these, nineteen are pre-baptismal discourses delivered to the candidates during Lent. The last five, delivered to the newly baptized Christians during the Easter Vigil. These lectures give us an idea about the order of sacraments and worship that existed in the fourth century.
                  </p>
                  <p className="text-justify font-semibold">Teachings of Cyril of Jerusalem</p>
                  <p className="text-justify">
                    The main aim of Cyril was to make the Christians and catechumens to know the mysteries of the Church. He gave them the complete instruction on Baptism, Chrismation and Eucharist. He insisted the Church to administer the baptism and the Chrismation together with the Eucharist. According to him, once the Trinity has been invoked, the baptismal water possesses sanctifying power. Baptism conveys remission of sins, sanctification, illumination and deification, the indwelling of the Holy Spirit, the putting on of the new man, spiritual rebirth and salvation, adoption as God&apos;s son by grace. About Chrismation, Cyril says that after you had come up from the pool of the sacred streams, there was given chrism, and this is the Holy Spirit. He professed the real presence of Christ in the Holy Eucharist. By partaking of the Body and Blood of Christ, you might become united in Body and Blood with Him.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Saints Categories</h3>
                <nav className="space-y-2">
                  {SAINTS_SIDEBAR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2 rounded-md font-body text-sm reverent-transition ${
                        link.href === currentSlug
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-primary hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Quick Links</h3>
                <nav className="space-y-2">
                  <Link href="/mosc-old/the-church" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition">The Church</Link>
                  <Link href="/mosc-old/holy-synod" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition">Holy Synod</Link>
                  <Link href="/mosc-old/dioceses" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition">Dioceses</Link>
                  <Link href="/mosc-old/ecumenical" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition">Ecumenical Relations</Link>
                  <Link href="/mosc-old/institutions" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition">Institutions</Link>
                  <Link href="/mosc-old/gallery" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition">Gallery</Link>
                  <Link href="/mosc-old/contact-info" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition">Contact Info</Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
